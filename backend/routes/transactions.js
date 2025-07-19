const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Get all transactions for user with filtering and search
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      category,
      account_id,
      timeframe = '30d',
      search,
      type, // income, expense, all
    } = req.query;

    const offset = (page - 1) * limit;

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

    let query = db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', req.user.id)
      .where('transactions.date', '>=', dateFilter)
      .select(
        'transactions.*',
        'accounts.account_name',
        'accounts.account_type',
        'accounts.institution_name'
      )
      .orderBy('transactions.date', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Apply filters
    if (category && category !== 'all') {
      query = query.where('transactions.category_primary', category);
    }

    if (account_id) {
      query = query.where('transactions.account_id', account_id);
    }

    if (type === 'income') {
      query = query.where('transactions.amount', '>', 0);
    } else if (type === 'expense') {
      query = query.where('transactions.amount', '<', 0);
    }

    if (search) {
      query = query.where(function () {
        this.where('transactions.name', 'ilike', `%${search}%`)
          .orWhere('transactions.merchant_name', 'ilike', `%${search}%`)
          .orWhere('transactions.category_primary', 'ilike', `%${search}%`);
      });
    }

    const transactions = await query;

    // Get total count for pagination
    const countQuery = db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', req.user.id)
      .where('transactions.date', '>=', dateFilter);

    if (category && category !== 'all') {
      countQuery.where('transactions.category_primary', category);
    }
    if (account_id) {
      countQuery.where('transactions.account_id', account_id);
    }
    if (type === 'income') {
      countQuery.where('transactions.amount', '>', 0);
    } else if (type === 'expense') {
      countQuery.where('transactions.amount', '<', 0);
    }
    if (search) {
      countQuery.where(function () {
        this.where('transactions.name', 'ilike', `%${search}%`)
          .orWhere('transactions.merchant_name', 'ilike', `%${search}%`)
          .orWhere('transactions.category_primary', 'ilike', `%${search}%`);
      });
    }

    const totalResult = await countQuery.count('* as total').first();
    const total = parseInt(totalResult.total);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasMore: transactions.length === parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transaction by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('transactions.id', req.params.id)
      .where('accounts.user_id', req.user.id)
      .select(
        'transactions.*',
        'accounts.name as account_name',
        'accounts.type as account_type'
      )
      .first();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update transaction category
router.put('/:id/category', auth, async (req, res) => {
  try {
    const { category } = req.body;

    const transaction = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('transactions.id', req.params.id)
      .where('accounts.user_id', req.user.id)
      .select('transactions.id')
      .first();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await db('transactions').where('id', req.params.id).update({ category });

    res.json({ message: 'Transaction category updated successfully' });
  } catch (error) {
    logger.error('Error updating transaction category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get spending by category
router.get('/categories', auth, async (req, res) => {
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

    const categorySpending = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', req.user.id)
      .where('transactions.date', '>=', dateFilter)
      .where('transactions.amount', '<', 0) // Only expenses
      .select('transactions.category_primary as category')
      .select(db.raw('SUM(ABS(transactions.amount)) as total'))
      .select(db.raw('COUNT(*) as transaction_count'))
      .select(db.raw('AVG(ABS(transactions.amount)) as average'))
      .groupBy('transactions.category_primary')
      .orderBy('total', 'desc');

    // Add percentage of total spending
    const totalSpending = categorySpending.reduce(
      (sum, cat) => sum + parseFloat(cat.total),
      0
    );
    const categoriesWithPercentage = categorySpending.map(cat => ({
      ...cat,
      total: parseFloat(cat.total),
      average: parseFloat(cat.average),
      percentage:
        totalSpending > 0 ? (parseFloat(cat.total) / totalSpending) * 100 : 0,
    }));

    res.json({
      categories: categoriesWithPercentage,
      total_spending: totalSpending,
      timeframe,
    });
  } catch (error) {
    logger.error('Error fetching category spending:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get monthly spending trends
router.get('/trends', auth, async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

    const monthlyData = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', req.user.id)
      .where('transactions.date', '>=', monthsAgo)
      .select(db.raw("DATE_TRUNC('month', transactions.date) as month"))
      .select(
        db.raw(
          'SUM(CASE WHEN transactions.amount > 0 THEN transactions.amount ELSE 0 END) as income'
        )
      )
      .select(
        db.raw(
          'SUM(CASE WHEN transactions.amount < 0 THEN ABS(transactions.amount) ELSE 0 END) as expenses'
        )
      )
      .select(db.raw('COUNT(*) as transaction_count'))
      .groupBy(db.raw("DATE_TRUNC('month', transactions.date)"))
      .orderBy('month', 'asc');

    const formattedData = monthlyData.map(month => ({
      month: month.month,
      income: parseFloat(month.income) || 0,
      expenses: parseFloat(month.expenses) || 0,
      net: (parseFloat(month.income) || 0) - (parseFloat(month.expenses) || 0),
      transaction_count: parseInt(month.transaction_count),
    }));

    res.json({
      monthly_data: formattedData,
      months: parseInt(months),
    });
  } catch (error) {
    logger.error('Error fetching spending trends:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get financial insights and summary
router.get('/insights', auth, async (req, res) => {
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

    // Get basic financial summary
    const summary = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', req.user.id)
      .where('transactions.date', '>=', dateFilter)
      .select(
        db.raw(
          'SUM(CASE WHEN transactions.amount > 0 THEN transactions.amount ELSE 0 END) as total_income'
        ),
        db.raw(
          'SUM(CASE WHEN transactions.amount < 0 THEN ABS(transactions.amount) ELSE 0 END) as total_expenses'
        ),
        db.raw('COUNT(*) as total_transactions'),
        db.raw(
          'COUNT(DISTINCT transactions.category_primary) as unique_categories'
        ),
        db.raw(
          'AVG(CASE WHEN transactions.amount < 0 THEN ABS(transactions.amount) END) as avg_expense'
        ),
        db.raw(
          'MAX(CASE WHEN transactions.amount < 0 THEN ABS(transactions.amount) END) as largest_expense'
        )
      )
      .first();

    // Get top merchants
    const topMerchants = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', req.user.id)
      .where('transactions.date', '>=', dateFilter)
      .where('transactions.amount', '<', 0)
      .whereNotNull('transactions.merchant_name')
      .select('transactions.merchant_name')
      .select(db.raw('SUM(ABS(transactions.amount)) as total'))
      .select(db.raw('COUNT(*) as transaction_count'))
      .groupBy('transactions.merchant_name')
      .orderBy('total', 'desc')
      .limit(10);

    const formattedSummary = {
      total_income: parseFloat(summary.total_income) || 0,
      total_expenses: parseFloat(summary.total_expenses) || 0,
      net_income:
        (parseFloat(summary.total_income) || 0) -
        (parseFloat(summary.total_expenses) || 0),
      total_transactions: parseInt(summary.total_transactions),
      unique_categories: parseInt(summary.unique_categories),
      avg_expense: parseFloat(summary.avg_expense) || 0,
      largest_expense: parseFloat(summary.largest_expense) || 0,
      top_merchants: topMerchants.map(m => ({
        name: m.merchant_name,
        total: parseFloat(m.total),
        transaction_count: parseInt(m.transaction_count),
      })),
    };

    res.json({
      insights: formattedSummary,
      timeframe,
    });
  } catch (error) {
    logger.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create manual transaction
router.post('/', auth, async (req, res) => {
  try {
    const {
      account_id,
      name,
      amount,
      date,
      category_primary = 'Other',
      merchant_name = null,
      description = null,
    } = req.body;

    if (!account_id || !name || !amount || !date) {
      return res
        .status(400)
        .json({ error: 'Account ID, name, amount, and date are required' });
    }

    // Verify account belongs to user
    const account = await db('accounts')
      .where('id', account_id)
      .where('user_id', req.user.id)
      .first();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const [transactionId] = await db('transactions')
      .insert({
        user_id: req.user.id,
        account_id,
        plaid_transaction_id: `manual_${Date.now()}`,
        name,
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        category_primary,
        merchant_name,
        pending: false,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('id');

    const transaction = await db('transactions')
      .where('id', transactionId)
      .first();

    // Update account balance
    const newBalance = parseFloat(account.current_balance) + parseFloat(amount);
    await db('accounts').where('id', account_id).update({
      current_balance: newBalance,
      available_balance: newBalance,
      updated_at: new Date(),
    });

    logger.info(`Manual transaction created: ${name} for user ${req.user.id}`);
    res.status(201).json(transaction);
  } catch (error) {
    logger.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
