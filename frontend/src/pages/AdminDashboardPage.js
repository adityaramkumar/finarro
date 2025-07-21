import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Activity,
  DollarSign,
  Globe,
  Eye,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

const AdminDashboardPage = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Check admin authentication
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAuthenticated(true);
    }
  }, []);

  // Admin login
  const handleLogin = async e => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await api.post('/admin/auth/login', loginForm);
      localStorage.setItem('adminToken', response.data.token);
      setIsAuthenticated(true);
    } catch (error) {
      setLoginError(error.response?.data?.error || 'Login failed');
    }
  };

  // Admin logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  // Set up API headers for admin requests
  const adminApi = {
    get: (url, config = {}) => {
      const token = localStorage.getItem('adminToken');
      return api.get(`/admin${url}`, {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    },
  };

  // Analytics queries
  const {
    data: overview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useQuery(
    ['admin-overview', timeframe],
    () =>
      adminApi
        .get(`/analytics/overview?timeframe=${timeframe}`)
        .then(res => res.data),
    { enabled: isAuthenticated, staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  const { data: visitAnalytics, isLoading: visitsLoading } = useQuery(
    ['admin-visits', timeframe],
    () =>
      adminApi
        .get(`/analytics/visits?timeframe=${timeframe}&groupBy=day`)
        .then(res => res.data),
    { enabled: isAuthenticated, staleTime: 5 * 60 * 1000 }
  );

  const { data: userAnalytics, isLoading: usersLoading } = useQuery(
    ['admin-users'],
    () => adminApi.get('/analytics/users?limit=10').then(res => res.data),
    { enabled: isAuthenticated, staleTime: 5 * 60 * 1000 }
  );

  // Revenue analytics query - not currently displayed in dashboard
  // const { data: revenueAnalytics, isLoading: revenueLoading } = useQuery(
  //   ['admin-revenue', timeframe],
  //   () =>
  //     adminApi
  //       .get(`/analytics/revenue?timeframe=${timeframe}`)
  //       .then(res => res.data),
  //   { enabled: isAuthenticated, staleTime: 5 * 60 * 1000 }
  // );

  const { data: geoAnalytics, isLoading: geoLoading } = useQuery(
    ['admin-geography', timeframe],
    () =>
      adminApi
        .get(`/analytics/geography?timeframe=${timeframe}`)
        .then(res => res.data),
    { enabled: isAuthenticated, staleTime: 5 * 60 * 1000 }
  );

  // Login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Sign in to access analytics</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={e =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={e =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const formatNumber = num => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Analytics and Business Intelligence</p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <button
              onClick={() => {
                refetchOverview();
                // Refetch other queries too
              }}
              className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <span className="text-xs text-gray-500">
                +{overview?.users?.new || 0} new
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {overviewLoading ? '...' : formatNumber(overview?.users?.total)}
              </p>
              <p className="text-gray-400 text-sm">Total Users</p>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Activity className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {overviewLoading
                  ? '...'
                  : formatNumber(overview?.users?.active)}
              </p>
              <p className="text-gray-400 text-sm">Active Users</p>
            </div>
          </div>

          {/* Total Visits */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Eye className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-xs text-gray-500">
                {formatNumber(overview?.visits?.unique)} unique
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {overviewLoading
                  ? '...'
                  : formatNumber(overview?.visits?.total)}
              </p>
              <p className="text-gray-400 text-sm">Total Visits</p>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {overviewLoading
                  ? '...'
                  : formatCurrency(
                      overview?.subscriptions?.monthlyRecurringRevenue
                    )}
              </p>
              <p className="text-gray-400 text-sm">Monthly Revenue</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visit Trends */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Visit Trends</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Visits</span>
                <div className="w-3 h-3 bg-green-400 rounded-full ml-4"></div>
                <span>Unique</span>
              </div>
            </div>

            <div className="h-80">
              {visitsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-800 border-t-indigo-500"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={visitAnalytics?.trends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="period" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="unique_visitors"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">
              Device Breakdown
            </h3>

            <div className="h-80">
              {overviewLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-800 border-t-indigo-500"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview?.traffic?.deviceBreakdown || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="visits"
                      nameKey="device_type"
                    >
                      {(overview?.traffic?.deviceBreakdown || []).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F3F4F6',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Countries */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Top Countries</h3>

            <div className="space-y-3">
              {geoLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-800 border-t-indigo-500"></div>
                </div>
              ) : (
                (geoAnalytics?.countries?.slice(0, 5) || []).map(
                  (country, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                          <Globe className="h-4 w-4 text-indigo-400" />
                        </div>
                        <span className="text-white font-medium">
                          {country.country}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {formatNumber(country.visits)}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {formatNumber(country.unique_visitors)} unique
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Recent Users</h3>

            <div className="space-y-3">
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-800 border-t-indigo-500"></div>
                </div>
              ) : (
                (userAnalytics?.users?.slice(0, 5) || []).map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Users className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          user.subscription_tier === 'pro'
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : user.subscription_tier === 'enterprise'
                              ? 'bg-purple-500/10 text-purple-400'
                              : 'bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {user.subscription_tier}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Top Pages</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overviewLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-800 border-t-indigo-500"></div>
              </div>
            ) : (
              (overview?.traffic?.topPages || []).map((page, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-400 font-mono text-sm">
                      #{index + 1}
                    </div>
                    <div className="text-white font-medium truncate">
                      {page.page_path}
                    </div>
                  </div>
                  <div className="text-indigo-400 font-bold">
                    {formatNumber(page.visits)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
