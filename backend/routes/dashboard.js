const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Get comprehensive dashboard data
router.get('/', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const userId = req.user.id;

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

    // Get all accounts summary
    const accounts = await db('accounts')
      .where('user_id', userId)
      .where('is_active', true)
      .select('*');

    // Calculate total balances by account type
    const accountSummary = {
      total_balance: accounts.reduce(
        (sum, acc) => sum + parseFloat(acc.current_balance || 0),
        0
      ),
      checking_balance: accounts
        .filter(acc => acc.account_type === 'checking')
        .reduce((sum, acc) => sum + parseFloat(acc.current_balance || 0), 0),
      savings_balance: accounts
        .filter(acc => acc.account_type === 'savings')
        .reduce((sum, acc) => sum + parseFloat(acc.current_balance || 0), 0),
      investment_balance: accounts
        .filter(acc => acc.account_type === 'investment')
        .reduce((sum, acc) => sum + parseFloat(acc.current_balance || 0), 0),
      credit_balance: accounts
        .filter(acc => acc.account_type === 'credit')
        .reduce((sum, acc) => sum + parseFloat(acc.current_balance || 0), 0),
    };

    // Get recent transactions summary
    const transactionSummary = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', userId)
      .where('transactions.date', '>=', dateFilter)
      .select(
        db.raw(
          'SUM(CASE WHEN transactions.amount > 0 THEN transactions.amount ELSE 0 END) as total_income'
        ),
        db.raw(
          'SUM(CASE WHEN transactions.amount < 0 THEN ABS(transactions.amount) ELSE 0 END) as total_expenses'
        ),
        db.raw('COUNT(*) as total_transactions')
      )
      .first();

    // Get previous period data for percentage calculations
    const previousPeriodStart = new Date(dateFilter);
    const daysDiff = Math.floor(
      (new Date() - dateFilter) / (1000 * 60 * 60 * 24)
    );
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff);

    const previousTransactionSummary = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', userId)
      .where('transactions.date', '>=', previousPeriodStart)
      .where('transactions.date', '<', dateFilter)
      .select(
        db.raw(
          'SUM(CASE WHEN transactions.amount > 0 THEN transactions.amount ELSE 0 END) as total_income'
        ),
        db.raw(
          'SUM(CASE WHEN transactions.amount < 0 THEN ABS(transactions.amount) ELSE 0 END) as total_expenses'
        )
      )
      .first();

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (!previous || previous === 0) {
        return 0;
      }
      return ((current - previous) / previous) * 100;
    };

    const incomeChange = calculatePercentageChange(
      parseFloat(transactionSummary.total_income) || 0,
      parseFloat(previousTransactionSummary.total_income) || 0
    );

    const expenseChange = calculatePercentageChange(
      parseFloat(transactionSummary.total_expenses) || 0,
      parseFloat(previousTransactionSummary.total_expenses) || 0
    );

    // Calculate investment accounts first for later use
    const investmentAccounts = accounts.filter(
      acc => acc.account_type === 'investment'
    );

    // Calculate real investment change based on transaction data
    let investmentChange = 0;
    if (investmentAccounts.length > 0) {
      const investmentAccountIds = investmentAccounts.map(acc => acc.id);
      const currentInvestmentValue = await db('transactions')
        .whereIn('account_id', investmentAccountIds)
        .where('date', '>=', dateFilter)
        .sum('amount as current_change')
        .first();

      const previousInvestmentValue = await db('transactions')
        .whereIn('account_id', investmentAccountIds)
        .where('date', '>=', previousPeriodStart)
        .where('date', '<', dateFilter)
        .sum('amount as previous_change')
        .first();

      investmentChange = calculatePercentageChange(
        parseFloat(currentInvestmentValue.current_change) || 0,
        parseFloat(previousInvestmentValue.previous_change) || 0
      );
    }

    // Get balance changes for the timeframe
    const balanceChanges = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', userId)
      .where('transactions.date', '>=', dateFilter)
      .sum('transactions.amount as net_change')
      .first();

    // Get recent transactions (last 10)
    const recentTransactions = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', userId)
      .select(
        'transactions.id',
        'transactions.name',
        'transactions.amount',
        'transactions.date',
        'transactions.category_primary',
        'transactions.merchant_name',
        'accounts.account_name',
        'accounts.account_type'
      )
      .orderBy('transactions.date', 'desc')
      .limit(10);

    // Get spending by category
    const spendingByCategory = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', userId)
      .where('transactions.date', '>=', dateFilter)
      .where('transactions.amount', '<', 0)
      .select('transactions.category_primary as name')
      .select(db.raw('SUM(ABS(transactions.amount)) as value'))
      .groupBy('transactions.category_primary')
      .orderBy('value', 'desc')
      .limit(6);

    // Add colors to spending categories
    const colors = [
      '#4F46E5',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#6B7280',
    ];
    const categoriesWithColors = spendingByCategory.map((category, index) => ({
      ...category,
      value: parseFloat(category.value),
      color: colors[index % colors.length],
    }));

    // Get monthly income vs expenses (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', userId)
      .where('transactions.date', '>=', sixMonthsAgo)
      .select(db.raw("DATE_TRUNC('month', transactions.date) as month"))
      .select(
        db.raw(
          'SUM(CASE WHEN transactions.amount > 0 THEN transactions.amount ELSE 0 END) as income'
        )
      )
      .select(
        db.raw(
          'SUM(CASE WHEN transactions.amount < 0 THEN ABS(transactions.amount) ELSE 0 END) as expense'
        )
      )
      .groupBy(db.raw("DATE_TRUNC('month', transactions.date)"))
      .orderBy('month', 'asc');

    const formattedMonthlyData = monthlyData.map(month => ({
      name: new Date(month.month).toLocaleDateString('en-US', {
        month: 'short',
      }),
      income: parseFloat(month.income) || 0,
      expense: parseFloat(month.expense) || 0,
    }));

    // Get net worth data - fix calculation to include all asset types
    const netWorthData = [];

    if (accounts.length > 0) {
      // Calculate current total assets and liabilities properly
      const totalAssets = accounts
        .filter(acc => {
          // Include all account types that represent assets
          const assetTypes = [
            'checking',
            'savings',
            'investment',
            'depository',
          ];
          const liabilitySubtypes = [
            'credit card',
            'line of credit',
            'mortgage',
            'auto',
            'student',
            'home equity',
          ];

          // Include if it's an asset type, or if it's a loan but not a liability
          return (
            assetTypes.includes(acc.account_type) ||
            (acc.account_type === 'loan' &&
              !liabilitySubtypes.includes(acc.account_subtype))
          );
        })
        .reduce((sum, acc) => sum + parseFloat(acc.current_balance || 0), 0);

      const totalLiabilities = Math.abs(
        accounts
          .filter(acc => {
            // Include credit accounts and liability loans
            const liabilitySubtypes = [
              'credit card',
              'line of credit',
              'mortgage',
              'auto',
              'student',
              'home equity',
            ];
            return (
              acc.account_type === 'credit' ||
              (acc.account_type === 'loan' &&
                liabilitySubtypes.includes(acc.account_subtype))
            );
          })
          .reduce(
            (sum, acc) => sum + Math.abs(parseFloat(acc.current_balance || 0)),
            0
          )
      );

      const currentNetWorth = totalAssets - totalLiabilities;

      // Create a more comprehensive net worth tracking
      // For now, we'll show current data point but structure for future historical data
      const currentDate = new Date();
      const timePoints = [];

      if (timeframe === '7d') {
        // For 7 days, show daily points (simplified - in real implementation you'd store historical data)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - i);
          timePoints.push({
            name: date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            date: date.toISOString().split('T')[0],
            netWorth: Math.round(currentNetWorth), // Simplified - use current value
            assets: Math.round(totalAssets),
            liabilities: Math.round(totalLiabilities),
          });
        }
      } else if (timeframe === '30d') {
        // For 30 days, show weekly points
        for (let i = 3; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - i * 7);
          timePoints.push({
            name: date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            date: date.toISOString().split('T')[0],
            netWorth: Math.round(currentNetWorth),
            assets: Math.round(totalAssets),
            liabilities: Math.round(totalLiabilities),
          });
        }
      } else if (timeframe === '90d') {
        // For 90 days, show monthly points
        for (let i = 2; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setMonth(date.getMonth() - i);
          timePoints.push({
            name: date.toLocaleDateString('en-US', { month: 'short' }),
            date: date.toISOString().split('T')[0],
            netWorth: Math.round(currentNetWorth),
            assets: Math.round(totalAssets),
            liabilities: Math.round(totalLiabilities),
          });
        }
      } else {
        // 1y
        // For 1 year, show quarterly points
        for (let i = 3; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setMonth(date.getMonth() - i * 3);
          timePoints.push({
            name: date.toLocaleDateString('en-US', { month: 'short' }),
            date: date.toISOString().split('T')[0],
            netWorth: Math.round(currentNetWorth),
            assets: Math.round(totalAssets),
            liabilities: Math.round(totalLiabilities),
          });
        }
      }

      netWorthData.push(...timePoints);
    }

    // Calculate actual investment returns from transaction data
    let investmentReturns = 0;
    if (investmentAccounts.length > 0) {
      const investmentAccountIds = investmentAccounts.map(acc => acc.id);
      const investmentTransactions = await db('transactions')
        .whereIn('account_id', investmentAccountIds)
        .where('date', '>=', dateFilter)
        .where('amount', '>', 0) // Only gains/dividends
        .sum('amount as total_returns')
        .first();

      investmentReturns = parseFloat(investmentTransactions.total_returns) || 0;
    }

    // Format final response
    const dashboardData = {
      // Summary cards data
      summary: {
        total_balance: accountSummary.total_balance,
        balance_change: parseFloat(balanceChanges.net_change) || 0,
        monthly_income: parseFloat(transactionSummary.total_income) || 0,
        monthly_income_change: incomeChange,
        monthly_expenses: parseFloat(transactionSummary.total_expenses) || 0,
        monthly_expenses_change: expenseChange,
        net_growth:
          (parseFloat(transactionSummary.total_income) || 0) -
          (parseFloat(transactionSummary.total_expenses) || 0),
        investment_returns: investmentReturns,
        investment_returns_change: investmentChange,
      },

      // Account breakdown
      accounts: await Promise.all(
        accounts.map(async acc => {
          // Calculate real balance change for this account in the timeframe
          const accountChange = await db('transactions')
            .where('account_id', acc.id)
            .where('date', '>=', dateFilter)
            .sum('amount as change')
            .first();

          return {
            id: acc.id,
            name: acc.account_name,
            type: acc.account_type,
            balance: parseFloat(acc.current_balance || 0),
            change: parseFloat(accountChange.change) || 0,
          };
        })
      ),

      // Recent transactions
      transactions: recentTransactions.map(tx => ({
        id: tx.id,
        description: tx.name,
        category: tx.category_primary || 'Other',
        amount: parseFloat(tx.amount),
        date: tx.date,
        type: parseFloat(tx.amount) >= 0 ? 'income' : 'expense',
        merchant: tx.merchant_name,
        account: tx.account_name,
      })),

      // Spending breakdown
      spending_by_category: categoriesWithColors,

      // Charts data
      monthly_data: formattedMonthlyData,
      net_worth_data: netWorthData,

      // Metadata
      timeframe,
      last_updated: new Date().toISOString(),
    };

    res.json(dashboardData);
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get financial insights for the dashboard
router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get spending insights
    const spendingInsights = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', userId)
      .where('transactions.date', '>=', thirtyDaysAgo)
      .where('transactions.amount', '<', 0)
      .select(
        db.raw('AVG(ABS(transactions.amount)) as avg_transaction'),
        db.raw('MAX(ABS(transactions.amount)) as largest_transaction'),
        db.raw('COUNT(*) as transaction_count')
      )
      .first();

    // Get category with highest spending
    const topCategory = await db('transactions')
      .join('accounts', 'transactions.account_id', 'accounts.id')
      .where('accounts.user_id', userId)
      .where('transactions.date', '>=', thirtyDaysAgo)
      .where('transactions.amount', '<', 0)
      .select('transactions.category_primary')
      .select(db.raw('SUM(ABS(transactions.amount)) as total'))
      .groupBy('transactions.category_primary')
      .orderBy('total', 'desc')
      .first();

    const insights = {
      avg_transaction: parseFloat(spendingInsights.avg_transaction) || 0,
      largest_transaction:
        parseFloat(spendingInsights.largest_transaction) || 0,
      transaction_count: parseInt(spendingInsights.transaction_count) || 0,
      top_spending_category: topCategory
        ? topCategory.category_primary
        : 'Other',
      top_category_amount: topCategory ? parseFloat(topCategory.total) : 0,
    };

    res.json({ insights });
  } catch (error) {
    logger.error('Error fetching dashboard insights:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
