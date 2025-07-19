import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  ArrowLeft,
  TrendingUp,
  Calendar,
  Eye,
  ExternalLink,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { sharesApi } from '../services/api';
import Logo from '../components/Logo';

const SharedChartPage = () => {
  const { token } = useParams();
  const [chartData, setChartData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent double API calls in React StrictMode
    if (hasLoadedRef.current) return;

    const loadSharedChart = async () => {
      try {
        setLoading(true);
        hasLoadedRef.current = true; // Mark as loaded to prevent duplicate calls

        const response = await sharesApi.getSharedChart(token);

        if (response.data.success) {
          setChartData(response.data);
          // Set default timeframe from settings
          if (
            response.data.settings &&
            response.data.settings.defaultTimeframe
          ) {
            setSelectedTimeframe(response.data.settings.defaultTimeframe);
          }
        } else {
          setError('Chart not found');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError(
            'This shared chart was not found or is no longer available.'
          );
        } else if (err.response?.status === 410) {
          setError('This shared chart has expired.');
        } else {
          setError('Failed to load the shared chart. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadSharedChart();
    } else {
      setError('Invalid share link');
      setLoading(false);
    }
  }, [token]);

  // Helper function for currency formatting
  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading shared chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="p-4 bg-red-900/20 rounded-full inline-block mb-6">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Chart Not Available
          </h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  // Get data for selected timeframe
  const data =
    chartData && chartData.chartData && chartData.chartData[selectedTimeframe]
      ? chartData.chartData[selectedTimeframe]
      : [];
  const currentNetWorth = data.length > 0 ? data[data.length - 1].netWorth : 0;
  const firstNetWorth = data.length > 0 ? data[0].netWorth : 0;
  const totalGrowth = currentNetWorth - firstNetWorth;
  const growthPercentage =
    firstNetWorth !== 0 ? (totalGrowth / Math.abs(firstNetWorth)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-950/50 backdrop-blur border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Logo />
              <div className="hidden sm:block">
                <span className="text-gray-400 text-sm">Shared Chart</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Eye className="h-4 w-4" />
                <span>{chartData.viewCount} views</span>
              </div>
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Visit finarro</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Chart Title and Summary */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            {(() => {
              const title = chartData.title || 'Net Worth Growth';
              // Extract name from title (e.g., "John Net Worth Growth" -> "John")
              const namePart = title.replace(' Net Worth Growth', '').trim();

              if (namePart && namePart !== 'My') {
                return (
                  <>
                    <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                      {namePart}
                    </span>
                    's Net Worth
                  </>
                );
              }
              return 'Net Worth Growth';
            })()}
          </h1>

          {/* Timeframe Selector */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-1 border border-gray-700/50">
              {['7d', '30d', '90d', '1y'].map(timeframe => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTimeframe === timeframe
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {timeframe === '7d'
                    ? 'Last 7 days'
                    : timeframe === '30d'
                      ? 'Last 30 days'
                      : timeframe === '90d'
                        ? 'Last 90 days'
                        : 'Last year'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 text-center">
            <div>
              <p className="text-gray-400 text-sm mb-1">Current Net Worth</p>
              <p className="text-3xl font-bold text-green-400">
                {formatCurrency(currentNetWorth)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Period Growth</p>
              <p
                className={`text-3xl font-bold ${totalGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {totalGrowth >= 0 ? '+' : ''}
                {formatCurrency(totalGrowth)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Growth Rate</p>
              <p
                className={`text-3xl font-bold ${growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {growthPercentage >= 0 ? '+' : ''}
                {growthPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-8 mb-8">
          <div className="h-96">
            {!data || data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 bg-gray-800/30 rounded-full mb-4">
                  <BarChart3 className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Data Available
                </h3>
                <p className="text-gray-400">
                  This chart doesn't contain data for the selected timeframe.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
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

        {/* Legend */}
        <div className="flex items-center justify-center space-x-8 mb-8">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-3"></div>
            <span className="text-sm text-gray-300 font-medium">Net Worth</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-indigo-400 rounded-full mr-3"></div>
            <span className="text-sm text-gray-400">Assets</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-1 bg-red-400 rounded-full mr-3"></div>
            <span className="text-sm text-gray-400">Liabilities</span>
          </div>
        </div>

        {/* Privacy Notice & CTA */}
        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Lock className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            Your Financial Privacy Matters
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            This chart shows only high-level net worth data. No personal
            information, bank details, or transaction data is shared. Ready to
            track your own financial growth?
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95"
          >
            <TrendingUp className="h-5 w-5" />
            <span>Start Your Financial Journey</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-800/50">
          <p className="text-gray-500 text-sm">
            Shared via{' '}
            <Link
              to="/"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              finarro
            </Link>
          </p>
          <div className="flex items-center justify-center space-x-1 mt-2">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span className="text-gray-500 text-sm">
              Created {new Date(chartData.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedChartPage;
