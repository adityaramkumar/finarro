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

const DashboardPage = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('30d');
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

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
  const accounts = data.accounts || [];
  const transactions = data.transactions || [];
  const spendingByCategory = data.spending_by_category || [];
  const netWorthData = data.net_worth_data || [];

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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Welcome back,{' '}
            <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
              {user?.first_name}
            </span>
            !
          </h1>
          <p className="text-gray-400 mt-3 text-xl">
            Here's your financial overview for today
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={e => {
              setTimeframe(e.target.value);
            }}
            className="bg-gray-800/50 backdrop-blur text-white border border-gray-600/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-gray-800/70 cursor-pointer"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-105 active:scale-95">
            <Plus className="h-4 w-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 2xl:gap-6">
        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-4 hover:bg-gray-950/50 hover:border-gray-700/50 transition-all duration-300 group hover:shadow-lg hover:shadow-green-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors group-hover:scale-110 duration-300">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1 group-hover:text-gray-300 transition-colors">
                  Total Balance
                </p>
                <p className="text-xl font-bold text-white">
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse"></div>
                  ) : (
                    formatCurrency(summary.total_balance || 0)
                  )}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center space-x-1 text-xs font-medium ${(summary.balance_change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {(summary.balance_change || 0) >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>
                {isLoading ? (
                  <div className="h-4 w-12 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  formatCurrency(Math.abs(summary.balance_change || 0))
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-4 hover:bg-gray-950/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Monthly Income</p>
                <p className="text-xl font-bold text-white">
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse"></div>
                  ) : (
                    formatCurrency(summary.monthly_income || 0)
                  )}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center space-x-1 text-xs font-medium ${(summary.monthly_income_change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {(summary.monthly_income_change || 0) >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>
                {isLoading ? (
                  <div className="h-4 w-12 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  `${(summary.monthly_income_change || 0) >= 0 ? '+' : ''}${formatPercentage(summary.monthly_income_change || 0)}`
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-4 hover:bg-gray-950/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Monthly Expenses</p>
                <p className="text-xl font-bold text-white">
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse"></div>
                  ) : (
                    formatCurrency(summary.monthly_expenses || 0)
                  )}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center space-x-1 text-xs font-medium ${(summary.monthly_expenses_change || 0) >= 0 ? 'text-red-400' : 'text-green-400'}`}
            >
              {(summary.monthly_expenses_change || 0) >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>
                {isLoading ? (
                  <div className="h-4 w-12 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  `${(summary.monthly_expenses_change || 0) >= 0 ? '+' : ''}${formatPercentage(summary.monthly_expenses_change || 0)}`
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-4 hover:bg-gray-950/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                <PiggyBank className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Investment Returns</p>
                <p className="text-xl font-bold text-white">
                  {isLoading ? (
                    <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse"></div>
                  ) : (
                    formatCurrency(summary.investment_returns || 0)
                  )}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center space-x-1 text-xs font-medium ${(summary.investment_returns_change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {(summary.investment_returns_change || 0) >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>
                {isLoading ? (
                  <div className="h-4 w-12 bg-gray-700/50 rounded animate-pulse"></div>
                ) : (
                  `${(summary.investment_returns_change || 0) >= 0 ? '+' : ''}${formatPercentage(summary.investment_returns_change || 0)}`
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-4 hover:bg-gray-950/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-colors">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Net Growth</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(summary.net_growth || 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs font-medium text-green-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>This period</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-8 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Net Worth Over Time
            </h2>
            <p className="text-gray-400 mt-2">
              Track your financial growth and overall wealth progression
            </p>
          </div>
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-300 font-medium">
                Net Worth
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-1 bg-indigo-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-400">Assets</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-1 bg-red-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-400">Liabilities</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Current Net Worth</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(
                  netWorthData.length > 0
                    ? netWorthData[netWorthData.length - 1].netWorth
                    : 0
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : netWorthData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 bg-gray-800/30 rounded-full mb-4">
                <BarChart3 className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Financial Data Available
              </h3>
              <p className="text-gray-400 max-w-md">
                Connect your bank accounts and add transactions to see your net
                worth trends and financial growth over time.
              </p>
              <div className="mt-6 flex space-x-4">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                  Connect Account
                </button>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Add Transaction
                </button>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={netWorthData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  strokeOpacity={0.2}
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#F3F4F6',
                    boxShadow:
                      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
                  stroke="url(#netWorthGradient)"
                  strokeWidth={4}
                  dot={{ fill: '#10B981', strokeWidth: 3, r: 5 }}
                  activeDot={{
                    r: 8,
                    stroke: '#10B981',
                    strokeWidth: 3,
                    fill: '#ffffff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="assets"
                  stroke="#6366F1"
                  strokeWidth={2}
                  strokeDasharray="8 8"
                  dot={false}
                  activeDot={{
                    r: 6,
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
                  strokeDasharray="8 8"
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: '#EF4444',
                    strokeWidth: 2,
                    fill: '#ffffff',
                  }}
                />
                <defs>
                  <linearGradient
                    id="netWorthGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Share Chart Section */}
      <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Share Your Progress
            </h3>
            <p className="text-gray-400 text-sm">
              Create a shareable link to show your net worth growth. Only
              high-level chart data is shared - no sensitive information.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleShareChart}
              disabled={isSharing || netWorthData.length === 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 font-medium"
            >
              <Share2 className="h-5 w-5" />
              <span>
                {isSharing ? 'Creating Link...' : 'Generate Share Link'}
              </span>
            </button>
          </div>
        </div>

        {shareUrl && (
          <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-green-400 font-medium text-sm mb-2">
                  ✅ Share link ready!
                </p>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-gray-900/50 text-gray-300 text-sm px-4 py-2 rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    onClick={copyShareUrl}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              Anyone with this link can view your net worth chart without
              logging in. No personal or account information is shared.
            </p>
          </div>
        )}
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Breakdown */}
        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Financial Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-green-500/10">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-300">Total Assets</span>
              </div>
              <span className="text-lg font-semibold text-white">
                {formatCurrency(
                  netWorthData.length > 0
                    ? netWorthData[netWorthData.length - 1].assets
                    : 0
                )}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-800/20 rounded-xl border border-red-500/10">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                <span className="text-sm text-gray-300">Total Liabilities</span>
              </div>
              <span className="text-lg font-semibold text-white">
                {formatCurrency(
                  netWorthData.length > 0
                    ? netWorthData[netWorthData.length - 1].liabilities
                    : 0
                )}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-3"></div>
                <span className="text-sm font-semibold text-green-400">
                  Net Worth
                </span>
              </div>
              <span className="text-lg font-bold text-green-400">
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
        <div className="lg:col-span-2 bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Monthly Spending Breakdown
          </h3>
          {spendingByCategory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center">
              <div className="p-4 bg-gray-800/30 rounded-full mb-4">
                <PiggyBank className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Spending Data
              </h3>
              <p className="text-gray-400 max-w-md">
                Start making transactions to see your spending patterns and
                category breakdowns.
              </p>
              <div className="mt-6">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                  Add Transaction
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-80 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={140}
                      paddingAngle={1}
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
                        borderRadius: '12px',
                        color: '#F3F4F6',
                        boxShadow:
                          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      }}
                      formatter={(value, name) => [
                        `${formatCurrency(value)}`,
                        name,
                      ]}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 ml-8">
                <div className="grid grid-cols-2 gap-4">
                  {spendingByCategory.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/20 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm text-gray-300">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-white">
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

      {/* Bottom Section: Accounts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts */}
        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Your Accounts</h3>
            <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors hover:underline">
              View All
            </button>
          </div>
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="p-4 bg-gray-800/30 rounded-full mb-4">
                <CreditCard className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Accounts Connected
              </h3>
              <p className="text-gray-400 max-w-md">
                Connect your bank accounts to track balances and see your
                complete financial picture.
              </p>
              <div className="mt-6">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                  Connect Account
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map(account => (
                <div
                  key={account.id}
                  className="group flex items-center justify-between p-5 bg-gray-800/20 rounded-xl hover:bg-gray-800/40 transition-all duration-300 border border-gray-700/20 hover:border-gray-600/40"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                      <CreditCard className="h-7 w-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate text-base">
                        {account.name}
                      </p>
                      <p className="text-sm text-gray-400 capitalize mt-1">
                        {account.type} account
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-lg">
                      {formatCurrency(account.balance)}
                    </p>
                    <p
                      className={`text-sm font-medium mt-1 ${account.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
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
        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Recent Transactions
            </h3>
            <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors hover:underline">
              View All
            </button>
          </div>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="p-4 bg-gray-800/30 rounded-full mb-4">
                <TrendingUp className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Transactions Yet
              </h3>
              <p className="text-gray-400 max-w-md">
                Start tracking your financial activity by adding transactions or
                connecting accounts.
              </p>
              <div className="mt-6">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                  Add Transaction
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="group flex items-center justify-between p-5 bg-gray-800/20 rounded-xl hover:bg-gray-800/40 transition-all duration-300 border border-gray-700/20 hover:border-gray-600/40"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-14 w-14 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow ${
                        transaction.type === 'income'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                          : 'bg-gradient-to-br from-red-500 to-rose-600'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-7 w-7 text-white" />
                      ) : (
                        <ArrowDownRight className="h-7 w-7 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate text-base">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {transaction.category} • {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}
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
  );
};

export default DashboardPage;
