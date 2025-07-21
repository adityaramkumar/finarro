import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Sparkles,
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import { toast } from 'react-hot-toast';
import PlaidLink from '../components/PlaidLink';

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Map period to timeframe for API
  const getTimeframe = period => {
    switch (period) {
      case '3months':
        return '90d';
      case '6months':
        return '180d';
      case '1year':
        return '1y';
      case '2years':
        return '2y';
      default:
        return '180d';
    }
  };

  // Fetch dashboard data from API (same as Dashboard page)
  const { data: dashboardData, isLoading } = useQuery(
    ['dashboard', getTimeframe(selectedPeriod)],
    () =>
      dashboardApi.getDashboardData({
        timeframe: getTimeframe(selectedPeriod),
      }),
    {
      onError: error => {
        toast.error('Failed to load reports data');
      },
    }
  );

  const data = dashboardData?.data || {};
  const summary = data.summary || {};
  const accounts = data.accounts || [];
  const spendingByCategory = data.spending_by_category || [];
  const netWorthData = data.net_worth_data || [];

  // Report data structure populated from API
  const reportData = {
    netWorth: netWorthData,
    cashFlow: [], // TODO: Add cash flow calculation
    categoryTrends: spendingByCategory,
    savingsGoals: [], // TODO: Add savings goals
  };

  // Handle successful Plaid connection
  const handlePlaidSuccess = () => {
    // Refetch reports data to show new accounts
    window.location.reload();
  };

  // Handle Plaid connection error
  const handlePlaidError = error => {
    // Error handling - could show toast notification if needed
  };

  // Empty AI insights - will be populated by API calls later
  const aiInsights = [];

  const getInsightColor = type => {
    switch (type) {
      case 'positive':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'warning':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'neutral':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  // Helper function for currency formatting
  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your financial reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Modern Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Financial{' '}
            <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
              Reports
            </span>
          </h1>
          <p className="text-gray-400 mt-3 text-xl">
            Comprehensive analysis of your financial health
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="bg-gray-800/50 backdrop-blur text-white border border-gray-600/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-gray-800/70 cursor-pointer"
          >
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="1year">Last year</option>
            <option value="2years">Last 2 years</option>
          </select>
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="bg-gray-950/50 backdrop-blur border border-gray-800/50 rounded-2xl p-1.5 shadow-lg">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'cashflow', label: 'Cash Flow' },
            { id: 'spending', label: 'Spending Analysis' },
            { id: 'goals', label: 'Goals Tracking' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id)}
              className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedReport === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modern AI Insights */}
      <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-8 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl mr-3">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            AI Financial Insights
          </h2>
          <button className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-purple-400 hover:text-purple-300 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-purple-500/20">
            Generate New Insights
          </button>
        </div>
        {aiInsights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 bg-gray-800/30 rounded-full mb-4">
              <Sparkles className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No AI Insights Available
            </h3>
            <p className="text-gray-400 max-w-md">
              Connect your accounts and add financial data to receive
              personalized AI insights and recommendations.
            </p>
            <div className="mt-6">
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                Generate Insights
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border backdrop-blur hover:scale-105 transition-all duration-300 ${getInsightColor(insight.type)}`}
              >
                <h3 className="font-bold text-lg mb-3">{insight.title}</h3>
                <p className="text-sm opacity-90 mb-4 leading-relaxed">
                  {insight.description}
                </p>
                <div className="flex items-start space-x-2">
                  <div className="p-1 bg-white/10 rounded-full flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">
                    {insight.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Report Content */}
      {selectedReport === 'cashflow' && (
        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-8">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 bg-gray-800/30 rounded-full mb-4">
              <DollarSign className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Cash Flow Analysis Coming Soon
            </h3>
            <p className="text-gray-400 max-w-md">
              Detailed cash flow analysis will be available once you connect
              your accounts and add transaction data.
            </p>
            <div className="mt-6">
              <PlaidLink
                onSuccess={handlePlaidSuccess}
                onError={handlePlaidError}
              >
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Connect Account
                </button>
              </PlaidLink>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'spending' && (
        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-8">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 bg-gray-800/30 rounded-full mb-4">
              <TrendingDown className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Spending Analysis Coming Soon
            </h3>
            <p className="text-gray-400 max-w-md">
              Comprehensive spending analysis and category breakdowns will be
              available with transaction data.
            </p>
            <div className="mt-6">
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Add Transactions
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Net Worth Chart */}
          <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-8 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl mr-3">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              Net Worth Trend
            </h2>
            <div className="h-80">
              {reportData.netWorth.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-4 bg-gray-800/30 rounded-full mb-4">
                    <TrendingUp className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No Net Worth Data
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    Connect your accounts to track your net worth trends over
                    time.
                  </p>
                  <div className="mt-6">
                    <PlaidLink
                      onSuccess={handlePlaidSuccess}
                      onError={handlePlaidError}
                    >
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                        Connect Account
                      </button>
                    </PlaidLink>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.netWorth}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      strokeOpacity={0.3}
                    />
                    <XAxis
                      dataKey="month"
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
                      tickFormatter={value => `$${value / 1000}k`}
                    />
                    <Tooltip
                      formatter={value => [
                        `$${value.toLocaleString()}`,
                        'Net Worth',
                      ]}
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="url(#greenGradient)"
                      strokeWidth={4}
                      dot={{ fill: '#10B981', strokeWidth: 3, r: 5 }}
                      activeDot={{
                        r: 8,
                        stroke: '#10B981',
                        strokeWidth: 3,
                        fill: '#ffffff',
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="greenGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10B981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10B981"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Monthly Cash Flow */}
          <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-8 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl mr-3">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
              Monthly Cash Flow
            </h2>
            <div className="h-80">
              {reportData.cashFlow.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-4 bg-gray-800/30 rounded-full mb-4">
                    <DollarSign className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No Cash Flow Data
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    Add transactions to see your monthly income vs expenses
                    analysis.
                  </p>
                  <div className="mt-6">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Add Transaction
                    </button>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.cashFlow}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      strokeOpacity={0.3}
                    />
                    <XAxis
                      dataKey="month"
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
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar
                      dataKey="income"
                      fill="#10B981"
                      name="Income"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      fill="#EF4444"
                      name="Expenses"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="net"
                      fill="#6366F1"
                      name="Net"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'goals' && (
        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-8 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
            <div className="p-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl mr-3">
              <Target className="h-6 w-6 text-indigo-400" />
            </div>
            Savings Goals Progress
          </h2>
          {reportData.savingsGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="p-4 bg-gray-800/30 rounded-full mb-4">
                <Target className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No Savings Goals Set
              </h3>
              <p className="text-gray-400 max-w-md">
                Create savings goals to track your progress towards financial
                milestones.
              </p>
              <div className="mt-6">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                  Create Goal
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {reportData.savingsGoals.map((goal, index) => (
                <div
                  key={index}
                  className="bg-gray-800/40 backdrop-blur border border-gray-700/50 p-6 rounded-2xl hover:bg-gray-800/60 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">
                      {goal.goal}
                    </h3>
                    <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                      ${goal.current.toLocaleString()} / $
                      {goal.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3 mb-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">
                      {goal.progress}% complete
                    </span>
                    <span className="text-sm text-indigo-400 font-medium">
                      ${(goal.target - goal.current).toLocaleString()} remaining
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modern Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6 hover:bg-gray-950/50 hover:border-gray-700/50 transition-all duration-300 group hover:shadow-lg hover:shadow-green-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors">
                Average Monthly Income
              </p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(summary.total_income || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-2xl group-hover:bg-green-500/20 transition-colors group-hover:scale-110 duration-300">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm font-medium text-gray-400 mt-3">
            <span>
              {accounts.length > 0 ? 'Last 30 days' : 'No data available'}
            </span>
          </div>
        </div>

        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6 hover:bg-gray-950/50 hover:border-gray-700/50 transition-all duration-300 group hover:shadow-lg hover:shadow-red-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors">
                Average Monthly Expenses
              </p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(summary.total_expenses || 0)}
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-colors group-hover:scale-110 duration-300">
              <TrendingDown className="h-6 w-6 text-red-400" />
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm font-medium text-gray-400 mt-3">
            <span>
              {accounts.length > 0 ? 'Last 30 days' : 'No data available'}
            </span>
          </div>
        </div>

        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6 hover:bg-gray-950/50 hover:border-gray-700/50 transition-all duration-300 group hover:shadow-lg hover:shadow-purple-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors">
                Monthly Savings Rate
              </p>
              <p className="text-2xl font-bold text-white">
                {summary.total_income && summary.total_income > 0
                  ? `${(((summary.total_income - summary.total_expenses) / summary.total_income) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors group-hover:scale-110 duration-300">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm font-medium text-gray-400 mt-3">
            <span>
              {accounts.length > 0 ? 'Last 30 days' : 'No data available'}
            </span>
          </div>
        </div>

        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6 hover:bg-gray-950/50 hover:border-gray-700/50 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors">
                Net Worth Growth
              </p>
              <p className="text-2xl font-bold text-white">
                {netWorthData.length >= 2
                  ? `${(((netWorthData[netWorthData.length - 1].netWorth - netWorthData[0].netWorth) / Math.abs(netWorthData[0].netWorth || 1)) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors group-hover:scale-110 duration-300">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm font-medium text-gray-400 mt-3">
            <span>
              {accounts.length > 0 ? 'Period growth' : 'No data available'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
