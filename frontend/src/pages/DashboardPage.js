import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Copy,
  Check,
  Sparkles,
  Activity,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { dashboardApi, sharesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import PlaidLink from '../components/PlaidLink';

const DashboardPage = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('30d');
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAllAccounts, setShowAllAccounts] = useState(false);

  // Fetch dashboard data from API
  const { data: dashboardData, isLoading } = useQuery(
    ['dashboard', timeframe],
    () => dashboardApi.getDashboardData({ timeframe }),
    {
      onError: error => {
        toast.error('Failed to load dashboard data');
      },
    }
  );

  const data = dashboardData?.data || {};
  const summary = data.summary || {};
  const allAccounts = data.accounts || [];
  const transactions = data.transactions || [];
  const spendingByCategory = data.spending_by_category || [];
  const netWorthData = data.net_worth_data || [];

  // Sort accounts by balance (highest first) and show top 5 or all based on toggle
  const sortedAccounts = [...allAccounts].sort(
    (a, b) => (b.balance || 0) - (a.balance || 0)
  );
  const accounts = showAllAccounts
    ? sortedAccounts
    : sortedAccounts.slice(0, 5);
  const hasMoreAccounts = sortedAccounts.length > 5;

  // Handle successful Plaid connection
  const handlePlaidSuccess = () => {
    // Refetch dashboard data to show new accounts
    window.location.reload();
  };

  // Handle Plaid connection error
  const handlePlaidError = error => {
    // Error handling - could show toast notification if needed
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-indigo-500 mx-auto mb-4"></div>
          </div>
          <p className="text-gray-400 text-lg font-medium">
            Loading your financial data...
          </p>
          <p className="text-gray-500 text-sm mt-2">This might take a moment</p>
        </div>
      </div>
    );
  }

  // Helper to check if we have any real data
  const hasData = allAccounts.length > 0;

  // Helper function for currency formatting
  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function for percentage formatting
  const formatPercentage = value => {
    return `${value.toFixed(1)}%`;
  };

  // Share net worth chart
  const handleShareChart = async () => {
    try {
      setIsSharing(true);

      if (!netWorthData || netWorthData.length === 0) {
        toast.error('No data available to share');
        return;
      }

      // Use pseudonymous username if set, otherwise use first name
      const displayName =
        user?.pseudonymous_username || user?.first_name || 'My';

      const response = await sharesApi.createShare({
        title: `${displayName} Net Worth Growth`,
        timeframe: timeframe,
      });

      if (response.data.success) {
        setShareUrl(response.data.shareUrl);

        if (response.data.isExisting) {
          toast.success('Share link updated with latest data!', {
            icon: '🔄',
            duration: 4000,
          });
        } else {
          toast.success('Share link created successfully!', {
            icon: '🔗',
            duration: 4000,
          });
        }
      }
    } catch (error) {
      toast.error('Failed to create share link');
    } finally {
      setIsSharing(false);
    }
  };

  // Copy share URL to clipboard
  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!', {
        icon: '📋',
        duration: 2000,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-none mx-auto px-2 sm:px-3 lg:px-4 py-2 lg:py-3 space-y-3">
        {/* Clean Header Section */}
        <div className="p-4 lg:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {user?.first_name}
                  </span>
                  !
                </h1>
              </div>
              <p className="text-gray-400 text-lg sm:text-xl">
                Here's your financial overview for today
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-3 text-sm text-gray-500">
                <Activity className="h-4 w-4" />
                <span>Real-time financial insights</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={timeframe}
                onChange={e => setTimeframe(e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              <PlaidLink
                onSuccess={handlePlaidSuccess}
                onError={handlePlaidError}
              >
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Account</span>
                </button>
              </PlaidLink>
            </div>
          </div>
        </div>

        {/* Clean Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-3">
          {/* Total Balance Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-green-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div
                className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full ${(summary.balance_change || 0) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
              >
                {(summary.balance_change || 0) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>
                  {formatCurrency(Math.abs(summary.balance_change || 0))}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-medium mb-2">
                Total Balance
              </p>
              <p className="text-xl lg:text-2xl font-bold text-white">
                {isLoading ? (
                  <div className="h-6 w-20 bg-gray-800 rounded animate-pulse"></div>
                ) : hasData ? (
                  formatCurrency(summary.total_balance || 0)
                ) : (
                  '$0.00'
                )}
              </p>
            </div>
          </div>

          {/* Monthly Income Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div
                className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full ${(summary.monthly_income_change || 0) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
              >
                {(summary.monthly_income_change || 0) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>
                  {formatPercentage(summary.monthly_income_change || 0)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-medium mb-2">
                Monthly Income
              </p>
              <p className="text-xl lg:text-2xl font-bold text-white">
                {isLoading ? (
                  <div className="h-6 w-20 bg-gray-800 rounded animate-pulse"></div>
                ) : hasData ? (
                  formatCurrency(summary.monthly_income || 0)
                ) : (
                  '$0.00'
                )}
              </p>
            </div>
          </div>

          {/* Monthly Expenses Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-red-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-red-500/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
              <div
                className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full ${(summary.monthly_expenses_change || 0) >= 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}
              >
                {(summary.monthly_expenses_change || 0) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>
                  {formatPercentage(summary.monthly_expenses_change || 0)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-medium mb-2">
                Monthly Expenses
              </p>
              <p className="text-xl lg:text-2xl font-bold text-white">
                {isLoading ? (
                  <div className="h-6 w-20 bg-gray-800 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(summary.monthly_expenses || 0)
                )}
              </p>
            </div>
          </div>

          {/* Investment Returns Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-orange-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-orange-500/10 rounded-lg">
                <PiggyBank className="h-5 w-5 text-orange-400" />
              </div>
              <div
                className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full ${(summary.investment_returns_change || 0) >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
              >
                {(summary.investment_returns_change || 0) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>
                  {formatPercentage(summary.investment_returns_change || 0)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-medium mb-2">
                Investment Returns
              </p>
              <p className="text-xl lg:text-2xl font-bold text-white">
                {isLoading ? (
                  <div className="h-6 w-20 bg-gray-800 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(summary.investment_returns || 0)
                )}
              </p>
            </div>
          </div>

          {/* Net Growth Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <div className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400">
                <ArrowUpRight className="h-3 w-3" />
                <span>This period</span>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-xs font-medium mb-2">
                Net Growth
              </p>
              <p className="text-xl lg:text-2xl font-bold text-white">
                {formatCurrency(summary.net_growth || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Clean Main Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 lg:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-3">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                Net Worth Over Time
              </h2>
              <p className="text-gray-400 mt-2">
                Track your financial growth and overall wealth progression
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-300 font-medium">
                  Net Worth
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-1 bg-indigo-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-400">Assets</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-1 bg-red-400 rounded-full mr-2"></div>
                <span className="text-sm text-gray-400">Liabilities</span>
              </div>
              <div className="text-right bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 font-medium">
                  Current Net Worth
                </p>
                <p className="text-lg font-bold text-white">
                  {formatCurrency(
                    netWorthData.length > 0
                      ? netWorthData[netWorthData.length - 1].netWorth
                      : 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="h-80 lg:h-96">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-indigo-500"></div>
              </div>
            ) : netWorthData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-6 bg-gray-800 rounded-xl mb-6">
                  <BarChart3 className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  No Financial Data Available
                </h3>
                <p className="text-gray-400 max-w-md leading-relaxed">
                  Connect your bank accounts and add transactions to see your
                  net worth trends and financial growth over time.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <PlaidLink
                    onSuccess={handlePlaidSuccess}
                    onError={handlePlaidError}
                  >
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
                      Connect Account
                    </button>
                  </PlaidLink>
                  <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors">
                    Add Transaction
                  </button>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={netWorthData}
                  margin={{ top: 40, right: 40, left: 40, bottom: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => `$${(value / 1000).toFixed(0)}k`}
                    domain={['dataMin - 20000', 'dataMax + 20000']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6',
                    }}
                    formatter={(value, name) => {
                      if (name === 'netWorth')
                        return [`${formatCurrency(value)}`, 'Net Worth'];
                      if (name === 'assets')
                        return [`${formatCurrency(value)}`, 'Assets'];
                      if (name === 'liabilities')
                        return [`${formatCurrency(value)}`, 'Liabilities'];
                      return [formatCurrency(value), name];
                    }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netWorth"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{
                      r: 6,
                      stroke: '#10B981',
                      strokeWidth: 2,
                      fill: '#ffffff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="assets"
                    stroke="#6366F1"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{
                      r: 4,
                      stroke: '#6366F1',
                      strokeWidth: 2,
                      fill: '#ffffff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="liabilities"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{
                      r: 4,
                      stroke: '#EF4444',
                      strokeWidth: 2,
                      fill: '#ffffff',
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Clean Share Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">
                Share Your Progress
              </h3>
              <p className="text-gray-400 text-sm">
                Create a shareable link to show your net worth growth. Only
                high-level chart data is shared - no sensitive information.
              </p>
            </div>
            <button
              onClick={handleShareChart}
              disabled={isSharing || netWorthData.length === 0}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              <Share2 className="h-5 w-5" />
              <span>
                {isSharing ? 'Creating Link...' : 'Generate Share Link'}
              </span>
            </button>
          </div>

          {shareUrl && (
            <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Share link ready!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={copyShareUrl}
                  className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-3">
                Anyone with this link can view your net worth chart without
                logging in. No personal or account information is shared.
              </p>
            </div>
          )}
        </div>

        {/* Clean Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Financial Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">
              Financial Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-gray-300 font-medium text-sm">
                    Total Assets
                  </span>
                </div>
                <span className="text-base font-bold text-white">
                  {formatCurrency(
                    netWorthData.length > 0
                      ? netWorthData[netWorthData.length - 1].assets
                      : 0
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                  <span className="text-gray-300 font-medium text-sm">
                    Total Liabilities
                  </span>
                </div>
                <span className="text-base font-bold text-white">
                  {formatCurrency(
                    netWorthData.length > 0
                      ? netWorthData[netWorthData.length - 1].liabilities
                      : 0
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg border border-green-500/40">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="font-bold text-green-400 text-sm">
                    Net Worth
                  </span>
                </div>
                <span className="text-base font-bold text-green-400">
                  {formatCurrency(
                    netWorthData.length > 0
                      ? netWorthData[netWorthData.length - 1].netWorth
                      : 0
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Spending */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-bold text-white mb-4">
              Monthly Spending Breakdown
            </h3>
            {spendingByCategory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <div className="p-4 bg-gray-800 rounded-lg mb-4">
                  <PiggyBank className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No Spending Data
                </h3>
                <p className="text-gray-400 max-w-md text-sm">
                  Start making transactions to see your spending patterns and
                  category breakdowns.
                </p>
                <button className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
                  Add Transaction
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-60 h-60 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {spendingByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6',
                        }}
                        formatter={(value, name) => [
                          `${formatCurrency(value)}`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {spendingByCategory.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-gray-300 font-medium text-sm">
                            {category.name}
                          </span>
                        </div>
                        <span className="font-bold text-white text-sm">
                          {formatCurrency(category.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clean Accounts and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Accounts */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Your Accounts</h3>
              {hasMoreAccounts && (
                <button
                  onClick={() => setShowAllAccounts(!showAllAccounts)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
                >
                  {showAllAccounts ? 'Show Less' : 'View All'}
                </button>
              )}
            </div>
            {!hasData ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-4 bg-gray-800 rounded-lg mb-4">
                  <CreditCard className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No Accounts Connected
                </h3>
                <p className="text-gray-400 max-w-md mb-4 text-sm">
                  Connect your bank accounts to see your financial overview and
                  track your spending.
                </p>
                <PlaidLink
                  onSuccess={handlePlaidSuccess}
                  onError={handlePlaidError}
                >
                  <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
                    Connect Your First Account
                  </button>
                </PlaidLink>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map(account => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {account.name}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {account.type} account
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white text-sm">
                        {formatCurrency(account.balance)}
                      </p>
                      <p
                        className={`text-xs font-medium ${account.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {account.change >= 0 ? '+' : ''}
                        {formatCurrency(account.change)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                Recent Transactions
              </h3>
              <button className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
                View All
              </button>
            </div>
            {!hasData ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-4 bg-gray-800 rounded-lg mb-4">
                  <CreditCard className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No Transactions Yet
                </h3>
                <p className="text-gray-400 max-w-md mb-4 text-sm">
                  Connect your bank accounts to see your transactions and get
                  insights into your spending patterns.
                </p>
                <PlaidLink
                  onSuccess={handlePlaidSuccess}
                  onError={handlePlaidError}
                >
                  <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
                    Connect Bank Account
                  </button>
                </PlaidLink>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income'
                            ? 'bg-green-600'
                            : 'bg-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5 text-white" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {transaction.category} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-sm ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
