const express = require('express');
const db = require('../../config/database');
const { adminAuth, requirePermission } = require('../../middleware/adminAuth');
const logger = require('../../config/logger');

const router = express.Router();

// Get dashboard overview metrics
router.get(
  '/overview',
  adminAuth,
  requirePermission('read_analytics'),
  async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;

      // Calculate date filter
      const dateFilter = new Date();
      switch (timeframe) {
        case '7d':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case '30d':
          dateFilter.setDate(dateFilter.getDate() - 30);
          break;
        case '90d':
          dateFilter.setDate(dateFilter.getDate() - 90);
          break;
        case '1y':
          dateFilter.setFullYear(dateFilter.getFullYear() - 1);
          break;
        default:
          dateFilter.setDate(dateFilter.getDate() - 30);
      }

      // Get user metrics
      const totalUsers = await db('users').count('id as count').first();
      const newUsers = await db('users')
        .where('created_at', '>=', dateFilter)
        .count('id as count')
        .first();

      const activeUsers = await db('users')
        .where('last_login', '>=', dateFilter)
        .count('id as count')
        .first();

      // Subscription metrics
      const subscriptionMetrics = await db('users')
        .select('subscription_tier')
        .count('id as count')
        .groupBy('subscription_tier');

      // Visit metrics
      const totalVisits = await db('site_visits')
        .where('visit_timestamp', '>=', dateFilter)
        .count('id as count')
        .first();

      const uniqueVisitors = await db('site_visits')
        .where('visit_timestamp', '>=', dateFilter)
        .countDistinct('ip_address as count')
        .first();

      // Revenue metrics (from subscriptions) - calculated below with activeSubscriptions

      // Calculate MRR (Monthly Recurring Revenue)
      const proPriceMonthly = 9.99;
      const enterprisePriceMonthly = 29.99;

      const activeSubscriptions = await db('subscriptions')
        .join('users', 'subscriptions.user_id', 'users.id')
        .where('subscriptions.status', 'active')
        .select('users.subscription_tier')
        .count('subscriptions.id as count')
        .groupBy('users.subscription_tier');

      let monthlyRecurringRevenue = 0;
      activeSubscriptions.forEach(sub => {
        if (sub.subscription_tier === 'pro') {
          monthlyRecurringRevenue += parseInt(sub.count) * proPriceMonthly;
        } else if (sub.subscription_tier === 'enterprise') {
          monthlyRecurringRevenue +=
            parseInt(sub.count) * enterprisePriceMonthly;
        }
      });

      // Get top countries
      const topCountries = await db('site_visits')
        .where('visit_timestamp', '>=', dateFilter)
        .whereNotNull('country')
        .select('country')
        .count('id as visits')
        .groupBy('country')
        .orderBy('visits', 'desc')
        .limit(5);

      // Get top pages
      const topPages = await db('site_visits')
        .where('visit_timestamp', '>=', dateFilter)
        .select('page_path')
        .count('id as visits')
        .groupBy('page_path')
        .orderBy('visits', 'desc')
        .limit(10);

      // Get device breakdown
      const deviceBreakdown = await db('site_visits')
        .where('visit_timestamp', '>=', dateFilter)
        .select('device_type')
        .count('id as visits')
        .groupBy('device_type');

      // Get browser breakdown
      const browserBreakdown = await db('site_visits')
        .where('visit_timestamp', '>=', dateFilter)
        .select('browser')
        .count('id as visits')
        .groupBy('browser')
        .orderBy('visits', 'desc')
        .limit(5);

      res.json({
        timeframe,
        users: {
          total: parseInt(totalUsers.count),
          new: parseInt(newUsers.count),
          active: parseInt(activeUsers.count),
        },
        subscriptions: {
          breakdown: subscriptionMetrics,
          monthlyRecurringRevenue: monthlyRecurringRevenue.toFixed(2),
        },
        visits: {
          total: parseInt(totalVisits.count),
          unique: parseInt(uniqueVisitors.count),
        },
        geography: {
          topCountries,
        },
        traffic: {
          topPages,
          deviceBreakdown,
          browserBreakdown,
        },
      });
    } catch (error) {
      logger.error('Admin analytics overview error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get detailed user analytics
router.get(
  '/users',
  adminAuth,
  requirePermission('read_analytics'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        search,
        subscription_tier,
        date_from,
        date_to,
      } = req.query;
      const offset = (page - 1) * limit;

      let query = db('users').select([
        'id',
        'email',
        'first_name',
        'last_name',
        'subscription_tier',
        'email_verified',
        'created_at',
        'last_login',
      ]);

      // Apply filters
      if (search) {
        query = query.where(builder => {
          builder
            .where('email', 'ilike', `%${search}%`)
            .orWhere('first_name', 'ilike', `%${search}%`)
            .orWhere('last_name', 'ilike', `%${search}%`);
        });
      }

      if (subscription_tier) {
        query = query.where('subscription_tier', subscription_tier);
      }

      if (date_from) {
        query = query.where('created_at', '>=', date_from);
      }

      if (date_to) {
        query = query.where('created_at', '<=', date_to);
      }

      // Get total count for pagination
      const totalQuery = query.clone().count('id as count').first();

      // Apply pagination and ordering
      const users = await query
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const total = await totalQuery;

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total.count),
          pages: Math.ceil(total.count / limit),
        },
      });
    } catch (error) {
      logger.error('Admin user analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get site visit analytics
router.get(
  '/visits',
  adminAuth,
  requirePermission('read_analytics'),
  async (req, res) => {
    try {
      const { timeframe = '7d', groupBy = 'day' } = req.query;

      // Calculate date filter
      const dateFilter = new Date();
      switch (timeframe) {
        case '7d':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case '30d':
          dateFilter.setDate(dateFilter.getDate() - 30);
          break;
        case '90d':
          dateFilter.setDate(dateFilter.getDate() - 90);
          break;
        default:
          dateFilter.setDate(dateFilter.getDate() - 7);
      }

      // Get visit trends
      let dateFormat;
      switch (groupBy) {
        case 'hour':
          dateFormat = 'YYYY-MM-DD HH24:00:00';
          break;
        case 'day':
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          dateFormat = 'YYYY-"W"WW';
          break;
        case 'month':
          dateFormat = 'YYYY-MM';
          break;
        default:
          dateFormat = 'YYYY-MM-DD';
      }

      const visitTrends = await db('site_visits')
        .select(db.raw(`TO_CHAR(visit_timestamp, '${dateFormat}') as period`))
        .count('id as visits')
        .countDistinct('ip_address as unique_visitors')
        .where('visit_timestamp', '>=', dateFilter)
        .groupBy('period')
        .orderBy('period');

      // Get detailed visit data
      const recentVisits = await db('site_visits')
        .select([
          'id',
          'ip_address',
          'country',
          'city',
          'browser',
          'operating_system',
          'device_type',
          'page_path',
          'referrer',
          'visit_timestamp',
        ])
        .where('visit_timestamp', '>=', dateFilter)
        .orderBy('visit_timestamp', 'desc')
        .limit(100);

      res.json({
        timeframe,
        trends: visitTrends,
        recentVisits,
      });
    } catch (error) {
      logger.error('Admin visit analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get revenue analytics
router.get(
  '/revenue',
  adminAuth,
  requirePermission('read_analytics'),
  async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;

      // Calculate date filter
      const dateFilter = new Date();
      switch (timeframe) {
        case '7d':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case '30d':
          dateFilter.setDate(dateFilter.getDate() - 30);
          break;
        case '90d':
          dateFilter.setDate(dateFilter.getDate() - 90);
          break;
        case '1y':
          dateFilter.setFullYear(dateFilter.getFullYear() - 1);
          break;
        default:
          dateFilter.setDate(dateFilter.getDate() - 30);
      }

      // Get subscription trends
      const subscriptionTrends = await db('subscriptions')
        .join('users', 'subscriptions.user_id', 'users.id')
        .select(db.raw(`DATE(subscriptions.created_at) as date`))
        .select('users.subscription_tier')
        .count('subscriptions.id as count')
        .where('subscriptions.created_at', '>=', dateFilter)
        .groupBy('date', 'users.subscription_tier')
        .orderBy('date');

      // Get churn data
      const churnData = await db('subscriptions')
        .join('users', 'subscriptions.user_id', 'users.id')
        .select(db.raw(`DATE(subscriptions.cancelled_at) as date`))
        .select('users.subscription_tier')
        .count('subscriptions.id as count')
        .whereNotNull('subscriptions.cancelled_at')
        .where('subscriptions.cancelled_at', '>=', dateFilter)
        .groupBy('date', 'users.subscription_tier')
        .orderBy('date');

      // Calculate LTV and other metrics
      const averageRevenuePeriod = await db('subscriptions')
        .join('users', 'subscriptions.user_id', 'users.id')
        .where('subscriptions.status', 'active')
        .select('users.subscription_tier')
        .count('subscriptions.id as count')
        .groupBy('users.subscription_tier');

      res.json({
        timeframe,
        subscriptionTrends,
        churnData,
        metrics: {
          averageRevenuePeriod,
        },
      });
    } catch (error) {
      logger.error('Admin revenue analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get geographic analytics
router.get(
  '/geography',
  adminAuth,
  requirePermission('read_analytics'),
  async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;

      // Calculate date filter
      const dateFilter = new Date();
      switch (timeframe) {
        case '7d':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case '30d':
          dateFilter.setDate(dateFilter.getDate() - 30);
          break;
        case '90d':
          dateFilter.setDate(dateFilter.getDate() - 90);
          break;
        default:
          dateFilter.setDate(dateFilter.getDate() - 30);
      }

      // Get country data
      const countryData = await db('site_visits')
        .select('country')
        .count('id as visits')
        .countDistinct('ip_address as unique_visitors')
        .where('visit_timestamp', '>=', dateFilter)
        .whereNotNull('country')
        .groupBy('country')
        .orderBy('visits', 'desc');

      // Get city data for top countries
      const cityData = await db('site_visits')
        .select('country', 'city')
        .count('id as visits')
        .countDistinct('ip_address as unique_visitors')
        .where('visit_timestamp', '>=', dateFilter)
        .whereNotNull('city')
        .groupBy('country', 'city')
        .orderBy('visits', 'desc')
        .limit(20);

      res.json({
        timeframe,
        countries: countryData,
        cities: cityData,
      });
    } catch (error) {
      logger.error('Admin geography analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Export analytics data
router.get(
  '/export',
  adminAuth,
  requirePermission('read_analytics'),
  async (req, res) => {
    try {
      const { type, date_from, date_to, format = 'json' } = req.query;

      if (!type || !['users', 'visits', 'subscriptions'].includes(type)) {
        return res.status(400).json({ error: 'Invalid export type' });
      }

      let query;

      switch (type) {
        case 'users':
          query = db('users').select([
            'id',
            'email',
            'first_name',
            'last_name',
            'subscription_tier',
            'email_verified',
            'created_at',
            'last_login',
          ]);
          break;
        case 'visits':
          query = db('site_visits').select([
            'ip_address',
            'country',
            'city',
            'browser',
            'operating_system',
            'device_type',
            'page_path',
            'referrer',
            'visit_timestamp',
          ]);
          break;
        case 'subscriptions':
          query = db('subscriptions')
            .join('users', 'subscriptions.user_id', 'users.id')
            .select([
              'users.email',
              'users.subscription_tier',
              'subscriptions.status',
              'subscriptions.created_at',
              'subscriptions.cancelled_at',
            ]);
          break;
      }

      // Apply date filters
      if (date_from) {
        const dateField = type === 'visits' ? 'visit_timestamp' : 'created_at';
        query = query.where(dateField, '>=', date_from);
      }
      if (date_to) {
        const dateField = type === 'visits' ? 'visit_timestamp' : 'created_at';
        query = query.where(dateField, '<=', date_to);
      }

      const data = await query.orderBy(
        'created_at' in query ? 'created_at' : 'visit_timestamp',
        'desc'
      );

      if (format === 'csv') {
        // Convert to CSV format
        const fields = Object.keys(data[0] || {});
        const csv = [
          fields.join(','),
          ...data.map(row =>
            fields.map(field => `"${row[field] || ''}"`).join(',')
          ),
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`
        );
        res.send(csv);
      } else {
        res.json({ data, count: data.length });
      }
    } catch (error) {
      logger.error('Admin export analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
