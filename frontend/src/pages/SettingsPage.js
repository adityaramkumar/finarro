import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  CreditCard,
  Shield,
  Trash2,
  Save,
  Link,
  Eye,
  EyeOff,
  Plus,
  CheckCircle,
  Crown,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  subscriptionApi,
  userApi,
  dashboardApi,
  accountsApi,
} from '../services/api';
import SubscriptionUpgrade from '../components/SubscriptionUpgrade';
import PlaidLink from '../components/PlaidLink';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    pseudonymous_username: user?.pseudonymous_username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    dateOfBirth: user?.date_of_birth || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailDigest: true,
    transactionAlerts: true,
    monthlyReports: true,
    securityAlerts: true,
    marketingEmails: false,
  });

  const [linkedAccounts, setLinkedAccounts] = useState([]);

  // Load linked accounts from API
  const loadLinkedAccounts = async () => {
    try {
      // Fetch dashboard data to get connected accounts
      const response = await dashboardApi.getDashboardData({
        timeframe: '30d',
      });
      const accounts = response.data?.accounts || [];

      // Transform accounts to match Settings page format
      const transformedAccounts = accounts.map(account => ({
        id: account.id,
        name: account.name,
        type: account.type,
        last4: account.mask || '••••',
        connected: true,
        institution: account.institution_name,
        balance: account.balance,
      }));

      setLinkedAccounts(transformedAccounts);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load linked accounts:', error);
      setLinkedAccounts([]);
    }
  };

  // Handle successful Plaid connection
  const handlePlaidSuccess = () => {
    // Reload linked accounts
    loadLinkedAccounts();
    toast.success('Account connected successfully!');
  };

  // Handle Plaid connection error
  const handlePlaidError = error => {
    toast.error('Failed to connect account. Please try again.');
  };

  // Handle account removal
  const handleRemoveAccount = async (accountId, accountName) => {
    if (
      // eslint-disable-next-line no-alert
      !window.confirm(
        `Are you sure you want to disconnect "${accountName}"? This will remove all associated data.`
      )
    ) {
      return;
    }

    try {
      // Call API to remove Plaid account
      await accountsApi.removePlaidAccount(accountId);

      // Remove from local state on successful API call
      setLinkedAccounts(prev =>
        prev.filter(account => account.id !== accountId)
      );
      toast.success('Account disconnected successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error removing account:', error);
      toast.error('Failed to disconnect account. Please try again.');
    }
  };

  // Load linked accounts on component mount
  useEffect(() => {
    loadLinkedAccounts();
  }, []);

  // Load subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        const response = await subscriptionApi.getStatus();
        setSubscriptionData(response.data);
      } catch (error) {
        // Set default free tier data on error
        setSubscriptionData({
          has_subscription: false,
          tier: 'free',
          status: null,
        });
      } finally {
        setLoadingSubscription(false);
      }
    };

    loadSubscriptionData();
  }, []);

  // Handle subscription upgrade success
  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    // Reload subscription data
    loadSubscriptionData();
    toast.success('Successfully upgraded to Pro plan!');
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (
      // eslint-disable-next-line no-alert
      !window.confirm(
        'Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.'
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await subscriptionApi.cancel();
      // Reload subscription data
      const response = await subscriptionApi.getStatus();
      setSubscriptionData(response.data);
      toast.success(
        'Subscription cancelled. You will retain access until the end of your current billing period.'
      );
    } catch (error) {
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription reactivation
  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true);
      await subscriptionApi.reactivate();
      // Reload subscription data
      const response = await subscriptionApi.getStatus();
      setSubscriptionData(response.data);
      toast.success('Subscription reactivated!');
    } catch (error) {
      toast.error('Failed to reactivate subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to reload subscription data
  const loadSubscriptionData = async () => {
    try {
      const response = await subscriptionApi.getStatus();
      setSubscriptionData(response.data);
    } catch (error) {}
  };

  // Format date for display
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format phone number as user types
  const formatPhoneNumber = value => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');

    // Limit to 10 digits
    const limitedPhoneNumber = phoneNumber.slice(0, 10);

    // Format as (XXX) XXX-XXXX
    if (limitedPhoneNumber.length === 0) return '';
    if (limitedPhoneNumber.length <= 3) {
      return `(${limitedPhoneNumber}`;
    }
    if (limitedPhoneNumber.length <= 6) {
      return `(${limitedPhoneNumber.slice(0, 3)}) ${limitedPhoneNumber.slice(3)}`;
    }
    return `(${limitedPhoneNumber.slice(0, 3)}) ${limitedPhoneNumber.slice(3, 6)}-${limitedPhoneNumber.slice(6)}`;
  };

  // Handle phone number input
  const handlePhoneChange = e => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setProfileData({ ...profileData, phone: formattedPhone });
  };

  const handleProfileUpdate = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call API to update profile
      await userApi.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        pseudonymous_username: profileData.pseudonymous_username || null,
        phone: profileData.phone || null,
        address: profileData.address || null,
        dateOfBirth: profileData.dateOfBirth || null,
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async e => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Call real API to update password
      await userApi.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      // Handle specific error messages from backend
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));

    try {
      // API call to update notification preferences
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'accounts',
      label: 'Linked Accounts',
      icon: Link,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: CreditCard,
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Modern Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">
          <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
            Settings
          </span>
        </h1>
        <p className="text-gray-400 mt-3 text-xl">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {/* Modern Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6 shadow-lg">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Modern Content Area */}
        <div className="lg:col-span-3 bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-8 shadow-lg">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl mr-3">
                  <User className="h-6 w-6 text-blue-400" />
                </div>
                Profile Information
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={e =>
                        setProfileData({
                          ...profileData,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={e =>
                        setProfileData({
                          ...profileData,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Pseudonymous Username (Optional)
                  </label>
                  <input
                    type="text"
                    value={profileData.pseudonymous_username}
                    onChange={e =>
                      setProfileData({
                        ...profileData,
                        pseudonymous_username: e.target.value,
                      })
                    }
                    placeholder="e.g., InvestorX, WealthBuilder, etc."
                    className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    This name will be shown on your shared net worth charts
                    instead of your real name. Leave blank to use your first
                    name.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    readOnly
                    className="w-full bg-gray-700/50 backdrop-blur border border-gray-600/50 rounded-xl px-4 py-3 text-gray-300 cursor-not-allowed"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Email cannot be changed. Contact support if you need to
                    update your email.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                    maxLength="14"
                    className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    US phone number format. Only digits will be accepted.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Address
                  </label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={e =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                    placeholder="123 Main St, City, State 12345"
                    className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={e =>
                      setProfileData({
                        ...profileData,
                        dateOfBirth: e.target.value,
                      })
                    }
                    className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95"
                >
                  <Save className="h-5 w-5" />
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl mr-3">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                Security Settings
              </h2>

              <div className="space-y-8">
                <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">
                    Change Password
                  </h3>
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={e =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={e =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={e =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25 hover:scale-105 active:scale-95"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6">
                    Two-Factor Authentication
                  </h3>
                  <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                          <Shield className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold">
                            SMS Authentication
                          </p>
                          <p className="text-sm text-gray-400">
                            Receive codes via SMS
                          </p>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl mr-3">
                  <Link className="h-6 w-6 text-purple-400" />
                </div>
                Linked Accounts
              </h2>
              <div className="space-y-4">
                {linkedAccounts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-800/30 rounded-full inline-block mb-4">
                      <Link className="h-12 w-12 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No Linked Accounts
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">
                      Connect your bank accounts to start tracking your finances
                      and get personalized insights.
                    </p>
                  </div>
                ) : (
                  linkedAccounts.map(account => (
                    <div
                      key={account.id}
                      className="bg-gray-800/40 backdrop-blur border border-gray-700/50 p-6 rounded-2xl hover:bg-gray-800/60 transition-all duration-300 hover:shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
                            <CreditCard className="h-6 w-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">
                              {account.institution} - {account.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {account.type} •••• {account.last4}
                            </p>
                            <p className="text-xs text-green-400 mt-1">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              }).format(account.balance || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {account.connected ? (
                            <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 text-sm font-medium">
                                Connected
                              </span>
                            </div>
                          ) : (
                            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95">
                              Connect
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleRemoveAccount(account.id, account.name)
                            }
                            className="text-red-400 hover:text-red-300 p-2 rounded-xl hover:bg-red-500/10 transition-colors"
                            title="Disconnect account"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <PlaidLink
                  onSuccess={handlePlaidSuccess}
                  onError={handlePlaidError}
                >
                  <button className="w-full border-2 border-dashed border-gray-600/50 hover:border-gray-500/50 rounded-2xl p-8 text-center text-gray-400 hover:text-white transition-all duration-300 hover:bg-gray-800/20 group">
                    <div className="p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl inline-block mb-4 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-colors">
                      <Plus className="h-8 w-8 mx-auto text-indigo-400" />
                    </div>
                    <p className="text-lg font-medium">Add New Account</p>
                  </button>
                </PlaidLink>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <div className="p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl mr-3">
                  <Bell className="h-6 w-6 text-yellow-400" />
                </div>
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-800/40 backdrop-blur border border-gray-700/50 p-6 rounded-2xl hover:bg-gray-800/60 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-white text-lg mb-2">
                          {key.charAt(0).toUpperCase() +
                            key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </p>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          {key === 'emailDigest' &&
                            'Weekly summary of your financial activity'}
                          {key === 'transactionAlerts' &&
                            'Real-time alerts for new transactions'}
                          {key === 'monthlyReports' &&
                            'Monthly financial health reports'}
                          {key === 'securityAlerts' &&
                            'Security and login notifications'}
                          {key === 'marketingEmails' &&
                            'Product updates and promotional content'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-6">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={e =>
                            handleNotificationUpdate(key, e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-800 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-orange-500"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <div className="p-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl mr-3">
                  <CreditCard className="h-6 w-6 text-indigo-400" />
                </div>
                Billing & Subscription
              </h2>

              {loadingSubscription ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Plan Section */}
                  <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 p-8 rounded-2xl hover:bg-gray-800/60 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center">
                          {subscriptionData?.tier === 'pro' && (
                            <Crown className="h-5 w-5 text-yellow-400 mr-2" />
                          )}
                          Current Plan
                        </h3>
                        <p className="text-gray-400 text-lg">
                          {subscriptionData?.tier === 'pro'
                            ? 'Pro Plan'
                            : 'Free Plan'}
                        </p>
                        {subscriptionData?.tier === 'pro' &&
                          subscriptionData?.stripe_subscription
                            ?.cancel_at_period_end && (
                            <p className="text-yellow-400 text-sm mt-1">
                              Cancels on{' '}
                              {formatDate(subscriptionData.current_period_end)}
                            </p>
                          )}
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-white">
                          ${subscriptionData?.tier === 'pro' ? '10.00' : '0'}
                        </p>
                        <p className="text-sm text-gray-400">per month</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {subscriptionData?.tier === 'pro' ? (
                        <>
                          <div className="flex items-center text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                            <span>Unlimited AI insights and analysis</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                            <span>Advanced financial reports</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                            <span>Unlimited linked accounts</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                            <span>Priority support</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                            <span>Advanced document analysis</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                            <span>Basic financial tracking</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                            <span>Limited AI insights</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                            <span>Up to 3 linked accounts</span>
                          </div>
                        </>
                      )}
                    </div>

                    {!subscriptionData || subscriptionData?.tier === 'free' ? (
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 font-medium"
                      >
                        Upgrade to Pro
                      </button>
                    ) : (
                      <div className="flex space-x-3">
                        {subscriptionData?.stripe_subscription
                          ?.cancel_at_period_end ? (
                          <button
                            onClick={handleReactivateSubscription}
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25 font-medium disabled:opacity-50"
                          >
                            {isLoading
                              ? 'Processing...'
                              : 'Reactivate Subscription'}
                          </button>
                        ) : (
                          <button
                            onClick={handleCancelSubscription}
                            disabled={isLoading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl transition-all duration-200 font-medium disabled:opacity-50"
                          >
                            {isLoading
                              ? 'Processing...'
                              : 'Cancel Subscription'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Billing Information */}
                  {subscriptionData?.tier === 'pro' && (
                    <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 p-8 rounded-2xl hover:bg-gray-800/60 transition-all duration-300 hover:shadow-lg">
                      <h3 className="text-xl font-bold text-white mb-6">
                        Billing Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Status</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              subscriptionData?.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {subscriptionData?.status?.toUpperCase()}
                          </span>
                        </div>
                        {subscriptionData?.current_period_end && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">
                              {subscriptionData?.stripe_subscription
                                ?.cancel_at_period_end
                                ? 'Access until'
                                : 'Next billing date'}
                            </span>
                            <span className="text-white flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(subscriptionData.current_period_end)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Upgrade Modal */}
      <SubscriptionUpgrade
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={handleUpgradeSuccess}
      />
    </div>
  );
};

export default SettingsPage;
