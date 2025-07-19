const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Get all accounts for user with calculated data
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await db('accounts')
      .where('user_id', req.user.id)
      .where('is_active', true)
      .select('*')
      .orderBy('created_at', 'desc');

    // Calculate additional data for each account
    const enhancedAccounts = await Promise.all(
      accounts.map(async account => {
        // Get transaction count and recent activity
        const transactionData = await db('transactions')
          .where('account_id', account.id)
          .select(
            db.raw('COUNT(*) as transaction_count'),
            db.raw('MAX(date) as last_transaction_date'),
            db.raw(
              'SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_income'
            ),
            db.raw(
              'SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_expenses'
            )
          )
          .first();

        // Calculate balance change (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentTransactions = await db('transactions')
          .where('account_id', account.id)
          .where('date', '>=', thirtyDaysAgo)
          .sum('amount as balance_change')
          .first();

        return {
          ...account,
          transaction_count: parseInt(transactionData.transaction_count) || 0,
          last_transaction_date: transactionData.last_transaction_date,
          total_income: parseFloat(transactionData.total_income) || 0,
          total_expenses: parseFloat(transactionData.total_expenses) || 0,
          balance_change_30d:
            parseFloat(recentTransactions.balance_change) || 0,
          last_synced: account.last_synced,
        };
      })
    );

    res.json(enhancedAccounts);
  } catch (error) {
    logger.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get account by ID with detailed information
router.get('/:id', auth, async (req, res) => {
  try {
    const account = await db('accounts')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Get transaction summary
    const transactionSummary = await db('transactions')
      .where('account_id', account.id)
      .select(
        db.raw('COUNT(*) as total_transactions'),
        db.raw(
          'SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_income'
        ),
        db.raw(
          'SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_expenses'
        ),
        db.raw('MIN(date) as oldest_transaction'),
        db.raw('MAX(date) as newest_transaction')
      )
      .first();

    // Get recent transactions (last 10)
    const recentTransactions = await db('transactions')
      .where('account_id', account.id)
      .orderBy('date', 'desc')
      .limit(10)
      .select(
        'id',
        'name',
        'amount',
        'date',
        'category_primary',
        'merchant_name'
      );

    res.json({
      ...account,
      summary: transactionSummary,
      recent_transactions: recentTransactions,
    });
  } catch (error) {
    logger.error('Error fetching account details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get account dashboard summary for all accounts
router.get('/summary', auth, async (req, res) => {
  try {
    // Get all accounts summary
    const accountsSummary = await db('accounts')
      .where('user_id', req.user.id)
      .where('is_active', true)
      .select(
        db.raw('COUNT(*) as total_accounts'),
        db.raw('SUM(current_balance) as total_balance'),
        db.raw(
          "SUM(CASE WHEN account_type = 'checking' THEN current_balance ELSE 0 END) as checking_balance"
        ),
        db.raw(
          "SUM(CASE WHEN account_type = 'savings' THEN current_balance ELSE 0 END) as savings_balance"
        ),
        db.raw(
          "SUM(CASE WHEN account_type = 'investment' THEN current_balance ELSE 0 END) as investment_balance"
        ),
        db.raw(
          "SUM(CASE WHEN account_type = 'credit' THEN current_balance ELSE 0 END) as credit_balance"
        )
      )
      .first();

    // Get recent balance changes (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentChanges = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', req.user.id)
      .where('transactions.date', '>=', thirtyDaysAgo)
      .select(
        db.raw('SUM(transactions.amount) as total_change'),
        db.raw(
          'SUM(CASE WHEN transactions.amount > 0 THEN transactions.amount ELSE 0 END) as income'
        ),
        db.raw(
          'SUM(CASE WHEN transactions.amount < 0 THEN ABS(transactions.amount) ELSE 0 END) as expenses'
        )
      )
      .first();

    // Get individual account data for dashboard cards
    const accountsData = await db('accounts')
      .where('user_id', req.user.id)
      .where('is_active', true)
      .select('id', 'account_name', 'account_type', 'current_balance');

    res.json({
      summary: accountsSummary,
      recent_changes: recentChanges,
      accounts: accountsData,
    });
  } catch (error) {
    logger.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new account (manual account)
router.post('/', auth, async (req, res) => {
  try {
    const {
      account_name,
      account_type,
      current_balance = 0,
      institution_name = 'Manual Account',
    } = req.body;

    if (!account_name || !account_type) {
      return res
        .status(400)
        .json({ error: 'Account name and type are required' });
    }

    const [accountId] = await db('accounts')
      .insert({
        user_id: req.user.id,
        account_name,
        account_type,
        institution_name,
        current_balance: parseFloat(current_balance),
        available_balance: parseFloat(current_balance),
        currency: 'USD',
        is_active: true,
        plaid_account_id: `manual_${Date.now()}`, // Temporary ID for manual accounts
        plaid_item_id: `manual_item_${req.user.id}`,
        institution_id: 'manual',
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('id');

    const account = await db('accounts').where('id', accountId).first();

    logger.info(
      `Manual account created: ${account_name} for user ${req.user.id}`
    );
    res.status(201).json(account);
  } catch (error) {
    logger.error('Error creating account:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update account
router.put('/:id', auth, async (req, res) => {
  try {
    const { account_name, current_balance, is_active } = req.body;

    const account = await db('accounts')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const updateData = { updated_at: new Date() };
    if (account_name) {
      updateData.account_name = account_name;
    }
    if (current_balance !== undefined) {
      updateData.current_balance = parseFloat(current_balance);
      updateData.available_balance = parseFloat(current_balance);
    }
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    await db('accounts').where('id', req.params.id).update(updateData);

    const updatedAccount = await db('accounts')
      .where('id', req.params.id)
      .first();

    res.json(updatedAccount);
  } catch (error) {
    logger.error('Error updating account:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete account (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await db('accounts')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Soft delete - mark as inactive
    await db('accounts').where('id', req.params.id).update({
      is_active: false,
      updated_at: new Date(),
    });

    logger.info(
      `Account deleted: ${account.account_name} for user ${req.user.id}`
    );
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    logger.error('Error deleting account:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get account balance history
router.get('/:id/balance-history', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const account = await db('accounts')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    let groupBy;
    switch (period) {
      case 'day':
        groupBy = db.raw("DATE_TRUNC('day', date)");
        break;
      case 'month':
        groupBy = db.raw("DATE_TRUNC('month', date)");
        break;
      case 'year':
        groupBy = db.raw("DATE_TRUNC('year', date)");
        break;
      default:
        groupBy = db.raw("DATE_TRUNC('month', date)");
    }

    const balanceHistory = await db('transactions')
      .where('account_id', req.params.id)
      .select(
        groupBy.as('period'),
        db.raw('SUM(amount) as balance_change'),
        db.raw('COUNT(*) as transaction_count')
      )
      .groupBy(groupBy)
      .orderBy('period', 'desc')
      .limit(12);

    res.json(balanceHistory);
  } catch (error) {
    logger.error('Error fetching balance history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sync account balances (recalculate from transactions)
router.post('/:id/sync', auth, async (req, res) => {
  try {
    const account = await db('accounts')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Calculate balance from transactions
    const balanceResult = await db('transactions')
      .where('account_id', account.id)
      .sum('amount as calculated_balance')
      .first();

    const calculatedBalance = parseFloat(balanceResult.calculated_balance) || 0;
    const startingBalance = parseFloat(account.current_balance) || 0;
    const finalBalance = startingBalance + calculatedBalance;

    // Update account balance
    await db('accounts').where('id', account.id).update({
      current_balance: finalBalance,
      available_balance: finalBalance,
      last_synced: new Date(),
      updated_at: new Date(),
    });

    const updatedAccount = await db('accounts').where('id', account.id).first();

    logger.info(
      `Account synced: ${account.account_name} for user ${req.user.id}`
    );
    res.json(updatedAccount);
  } catch (error) {
    logger.error('Error syncing account:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
