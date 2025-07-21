const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../config/logger');

// Simple user agent parser
function parseUserAgent(userAgent) {
  if (!userAgent) {
    return {
      browser: 'Unknown',
      operating_system: 'Unknown',
      device_type: 'Unknown',
    };
  }

  const ua = userAgent.toLowerCase();

  // Browser detection
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opera')) {
    browser = 'Opera';
  }

  // OS detection
  let operating_system = 'Unknown';
  if (ua.includes('windows')) {
    operating_system = 'Windows';
  } else if (ua.includes('mac')) {
    operating_system = 'macOS';
  } else if (ua.includes('linux')) {
    operating_system = 'Linux';
  } else if (ua.includes('android')) {
    operating_system = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    operating_system = 'iOS';
  }

  // Device type detection
  let device_type = 'Desktop';
  if (ua.includes('mobile') || ua.includes('android')) {
    device_type = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device_type = 'Tablet';
  }

  return { browser, operating_system, device_type };
}

// Get real IP address (handles proxies and load balancers)
function getRealIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  );
}

// Analytics tracking middleware
const trackVisit = async (req, res, next) => {
  try {
    // Skip tracking for API routes, assets, and health checks
    const skipPaths = [
      '/api/',
      '/static/',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
      '/health',
    ];
    const shouldSkip = skipPaths.some(path => req.path.startsWith(path));

    if (shouldSkip) {
      return next();
    }

    const ip = getRealIP(req);
    const userAgent = req.headers['user-agent'];
    const { browser, operating_system, device_type } =
      parseUserAgent(userAgent);

    // Get or create session ID
    let sessionId = req.session?.analyticsSessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      if (req.session) {
        req.session.analyticsSessionId = sessionId;
      }
    }

    // Extract UTM parameters
    const utmSource = req.query.utm_source || null;
    const utmMedium = req.query.utm_medium || null;
    const utmCampaign = req.query.utm_campaign || null;

    // Check if returning visitor
    const lastVisit = await db('site_visits')
      .where('ip_address', ip)
      .where('visit_timestamp', '>', db.raw("NOW() - INTERVAL '30 days'"))
      .first();

    const isNewVisitor = !lastVisit;

    // Get user ID if authenticated
    let userId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db('users')
          .where({ id: decoded.id, is_active: true })
          .first();
        if (user) {
          userId = user.id;
        }
      } catch (error) {
        // Ignore token errors for analytics
      }
    }

    // Record the visit (async, don't block the request)
    setImmediate(async () => {
      try {
        await db('site_visits').insert({
          user_id: userId,
          ip_address: ip,
          user_agent: userAgent,
          browser,
          operating_system,
          device_type,
          page_path: req.path,
          referrer: req.headers.referer || null,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          is_new_visitor: isNewVisitor,
          session_id: sessionId,
          visit_timestamp: new Date(),
        });
      } catch (error) {
        logger.error('Error recording site visit:', error);
      }
    });

    // Add geolocation data if IP lookup service is available
    if (process.env.IPAPI_KEY) {
      setImmediate(async () => {
        try {
          const axios = require('axios');
          const response = await axios.get(
            `http://api.ipapi.com/${ip}?access_key=${process.env.IPAPI_KEY}&format=1`
          );

          if (response.data && response.data.country_name) {
            await db('site_visits')
              .where('ip_address', ip)
              .where(
                'visit_timestamp',
                '>',
                db.raw("NOW() - INTERVAL '1 minute'")
              )
              .update({
                country: response.data.country_name,
                region: response.data.region_name,
                city: response.data.city,
                timezone: response.data.timezone,
                latitude: response.data.latitude,
                longitude: response.data.longitude,
              });
          }
        } catch (error) {
          logger.error('Error fetching geolocation data:', error);
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Analytics middleware error:', error);
    next(); // Don't break the request if analytics fails
  }
};

// Track user actions (login, signup, subscription, etc.)
const trackUserAction = async (userId, action, metadata = {}) => {
  try {
    await db('user_actions').insert({
      user_id: userId,
      action,
      metadata,
      action_timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error tracking user action:', error);
  }
};

// Calculate session duration when user leaves
const updateSessionDuration = async (sessionId, duration) => {
  try {
    await db('site_visits')
      .where('session_id', sessionId)
      .whereNull('session_duration')
      .update('session_duration', duration);
  } catch (error) {
    logger.error('Error updating session duration:', error);
  }
};

module.exports = {
  trackVisit,
  trackUserAction,
  updateSessionDuration,
  parseUserAgent,
  getRealIP,
};
