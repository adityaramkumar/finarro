const express = require('express');
const crypto = require('crypto');
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Generate a short URL-safe unique token
const generateShareToken = () => {
  // Use 6 random bytes and encode as base64url for a ~8 character string
  return crypto
    .randomBytes(6)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, ''); // Remove padding
};

// Helper function to generate net worth data for different timeframes
const generateNetWorthDataForTimeframes = async userId => {
  const timeframes = ['7d', '30d', '90d', '1y'];
  const allData = {};

  for (const timeframe of timeframes) {
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

    // Get all accounts for this user
    const accounts = await db('accounts')
      .where('user_id', userId)
      .where('is_active', true)
      .select('*');

    const netWorthData = [];

    if (accounts.length > 0) {
      // Calculate current total assets and liabilities
      const totalAssets = accounts
        .filter(acc =>
          ['checking', 'savings', 'investment'].includes(acc.account_type)
        )
        .reduce((sum, acc) => sum + parseFloat(acc.current_balance || 0), 0);

      const totalLiabilities = Math.abs(
        accounts
          .filter(acc => acc.account_type === 'credit')
          .reduce((sum, acc) => sum + parseFloat(acc.current_balance || 0), 0)
      );

      const currentNetWorth = totalAssets - totalLiabilities;

      // Only show current net worth data point - no synthetic historical data
      netWorthData.push({
        name: new Date().toLocaleDateString('en-US', { month: 'short' }),
        netWorth: Math.round(currentNetWorth),
        assets: Math.round(totalAssets),
        liabilities: Math.round(totalLiabilities),
      });
    }

    allData[timeframe] = netWorthData;
  }

  return allData;
};

// Create a shareable chart (or return existing one)
router.post('/charts', auth, async (req, res) => {
  try {
    const {
      title = 'My Net Worth Growth',
      timeframe = '30d',
      expiresInDays = null,
    } = req.body;

    // Generate data for all timeframes
    const allTimeframeData = await generateNetWorthDataForTimeframes(
      req.user.id
    );

    // Check if user already has an active net worth share
    const existingShare = await db('shared_charts')
      .where('user_id', req.user.id)
      .where('chart_type', 'net_worth')
      .where('is_active', true)
      .first();

    if (existingShare) {
      // Update existing share with new data and title
      await db('shared_charts')
        .where('id', existingShare.id)
        .update({
          title: title,
          chart_data: JSON.stringify(allTimeframeData),
          settings: JSON.stringify({ defaultTimeframe: timeframe }),
          updated_at: new Date(),
        });

      // Return existing share URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const shareUrl = `${frontendUrl}/share/${existingShare.share_token}`;

      return res.json({
        success: true,
        shareToken: existingShare.share_token,
        shareUrl,
        title,
        expiresAt: existingShare.expires_at,
        message: 'Share link updated with latest data',
        isExisting: true,
      });
    }

    // Generate unique share token for new share
    const shareToken = generateShareToken();

    // Calculate expiration date if specified
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Store in database
    await db('shared_charts')
      .insert({
        user_id: req.user.id,
        share_token: shareToken,
        chart_type: 'net_worth',
        title: title,
        chart_data: JSON.stringify(allTimeframeData),
        settings: JSON.stringify({ defaultTimeframe: timeframe }),
        expires_at: expiresAt,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('id');

    // Create the shareable URL - point to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareUrl = `${frontendUrl}/share/${shareToken}`;

    res.status(201).json({
      success: true,
      shareToken,
      shareUrl,
      title,
      expiresAt,
      message: 'Shareable chart created successfully',
      isExisting: false,
    });
  } catch (error) {
    logger.error('Error creating shared chart:', error);
    res.status(500).json({ error: 'Failed to create shareable chart' });
  }
});

// Get shared chart data (public route - no auth required)
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find the shared chart
    const sharedChart = await db('shared_charts')
      .where('share_token', token)
      .where('is_active', true)
      .first();

    if (!sharedChart) {
      return res
        .status(404)
        .json({ error: 'Shared chart not found or no longer available' });
    }

    // Check if expired
    if (
      sharedChart.expires_at &&
      new Date() > new Date(sharedChart.expires_at)
    ) {
      return res.status(410).json({ error: 'This shared chart has expired' });
    }

    // Increment view count
    await db('shared_charts')
      .where('id', sharedChart.id)
      .increment('view_count', 1);

    // Parse the chart data (handle both string and object cases)
    const chartData =
      typeof sharedChart.chart_data === 'string'
        ? JSON.parse(sharedChart.chart_data)
        : sharedChart.chart_data;
    const settings = sharedChart.settings
      ? typeof sharedChart.settings === 'string'
        ? JSON.parse(sharedChart.settings)
        : sharedChart.settings
      : {};

    // Return the public chart data
    res.json({
      success: true,
      title: sharedChart.title,
      chartType: sharedChart.chart_type,
      chartData,
      settings,
      createdAt: sharedChart.created_at,
      viewCount: sharedChart.view_count + 1, // Include the current view
    });
  } catch (error) {
    logger.error('Error fetching shared chart:', error);
    res.status(500).json({ error: 'Failed to load shared chart' });
  }
});

// Get user's shared charts (auth required)
router.get('/user/charts', auth, async (req, res) => {
  try {
    const sharedCharts = await db('shared_charts')
      .where('user_id', req.user.id)
      .where('is_active', true)
      .select(
        'id',
        'share_token',
        'title',
        'view_count',
        'expires_at',
        'created_at'
      )
      .orderBy('created_at', 'desc');

    // Add full URLs - point to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const chartsWithUrls = sharedCharts.map(chart => ({
      ...chart,
      shareUrl: `${frontendUrl}/share/${chart.share_token}`,
      isExpired: chart.expires_at
        ? new Date() > new Date(chart.expires_at)
        : false,
    }));

    res.json({
      success: true,
      sharedCharts: chartsWithUrls,
    });
  } catch (error) {
    logger.error('Error fetching user shared charts:', error);
    res.status(500).json({ error: 'Failed to load shared charts' });
  }
});

// Delete/deactivate a shared chart
router.delete('/:token', auth, async (req, res) => {
  try {
    const { token } = req.params;

    // Verify ownership and deactivate
    const updated = await db('shared_charts')
      .where('share_token', token)
      .where('user_id', req.user.id)
      .update({
        is_active: false,
        updated_at: new Date(),
      });

    if (updated === 0) {
      return res.status(404).json({
        error:
          'Shared chart not found or you do not have permission to delete it',
      });
    }

    res.json({
      success: true,
      message: 'Shared chart deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting shared chart:', error);
    res.status(500).json({ error: 'Failed to delete shared chart' });
  }
});

module.exports = router;
