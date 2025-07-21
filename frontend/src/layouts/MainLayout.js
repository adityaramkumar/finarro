import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  FileText,
  Settings,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { subscriptionApi } from '../services/api';
import Logo from '../components/Logo';
import SubscriptionUpgrade from '../components/SubscriptionUpgrade';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mock notifications data - replace with API call later
  const [notifications] = useState([
    // Example notifications - remove or replace with real data
    // {
    //   id: 1,
    //   title: 'Account Connected',
    //   message: 'Successfully linked your Chase checking account',
    //   time: '2 hours ago',
    //   read: false,
    // },
    // {
    //   id: 2,
    //   title: 'Monthly Report Ready',
    //   message: 'Your financial report for January is now available',
    //   time: '1 day ago',
    //   read: true,
    // },
  ]);

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
      }
    };

    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  // Handle subscription upgrade success
  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    // Reload subscription data
    loadSubscriptionData();
    toast.success('Successfully upgraded to Pro plan!');
  };

  // Helper function to reload subscription data
  const loadSubscriptionData = async () => {
    try {
      const response = await subscriptionApi.getStatus();
      setSubscriptionData(response.data);
    } catch (error) {
      // Error loading subscription data
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Chat', href: '/chat', icon: MessageSquare },
    { name: 'Reports', href: '/reports', icon: BarChart2 },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for: ${searchQuery}`);
      setShowMobileSearch(false);
    } else {
      toast.error('Please enter a search term');
    }
  };

  // Add keyboard shortcuts and click outside handlers
  React.useEffect(() => {
    const handleKeyDown = e => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[placeholder*="Search"]')?.focus();
      }
      // Escape to close dropdowns
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
        setNotificationDropdownOpen(false);
        setShowMobileSearch(false);
        setSearchQuery('');
      }
    };

    const handleClickOutside = e => {
      // Close dropdowns when clicking outside
      if (!e.target.closest('[data-dropdown="profile"]')) {
        setProfileDropdownOpen(false);
      }
      if (!e.target.closest('[data-dropdown="notifications"]')) {
        setNotificationDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 bg-gray-950 border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-800">
          <Logo showText={true} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3 sm:px-4">
          <ul className="space-y-1">
            {navigation.map(item => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`
                      flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors touch-manipulation
                      ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Upgrade card - only show for free tier users */}
        {(!subscriptionData || subscriptionData?.tier === 'free') && (
          <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 text-white">
              <h3 className="font-semibold text-sm mb-1">Upgrade to Pro</h3>
              <p className="text-xs opacity-90 mb-3 leading-relaxed">
                Get unlimited AI insights and advanced features
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full bg-white text-indigo-600 text-sm font-medium py-2.5 px-4 rounded-md hover:bg-gray-100 transition-colors touch-manipulation"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-950 border-b border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors touch-manipulation"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Desktop Search */}
              <div className="hidden md:flex">
                <form onSubmit={handleSearch} className="relative group">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search transactions & accounts"
                      className="bg-gray-800/50 backdrop-blur text-white placeholder-gray-400 pl-10 pr-12 py-2.5 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-gray-800 transition-all w-80 hover:bg-gray-800/70"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => setShowMobileSearch(true)}
                className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors touch-manipulation"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notifications */}
              <div className="relative" data-dropdown="notifications">
                <button
                  onClick={() =>
                    setNotificationDropdownOpen(!notificationDropdownOpen)
                  }
                  className="relative text-gray-400 hover:text-white transition-colors group p-2 rounded-lg hover:bg-gray-800 touch-manipulation"
                >
                  <Bell className="h-5 w-5 group-hover:animate-pulse" />
                  {notifications.some(n => !n.read) && (
                    <>
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                    </>
                  )}
                </button>

                {/* Notifications dropdown */}
                {notificationDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-700/50 rounded-xl shadow-xl z-50 backdrop-blur">
                    <div className="p-4 border-b border-gray-700/50">
                      <h3 className="text-lg font-semibold text-white">
                        Notifications
                      </h3>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                        <h4 className="text-white font-medium mb-1">
                          No notifications
                        </h4>
                        <p className="text-gray-400 text-sm">
                          You're all caught up! Check back later for updates.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-700/30 hover:bg-gray-800/50 transition-colors ${
                              !notification.read ? 'bg-gray-800/30' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium text-sm mb-1">
                                  {notification.title}
                                </h4>
                                <p className="text-gray-400 text-sm mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {notifications.length > 0 && (
                      <div className="p-4 border-t border-gray-700/50">
                        <button className="w-full text-center text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative" data-dropdown="profile">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 sm:space-x-3 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors touch-manipulation"
                >
                  <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block font-medium truncate max-w-32">
                    {user?.first_name} {user?.last_name}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50">
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors touch-manipulation"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors touch-manipulation"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Overlay */}
          {showMobileSearch && (
            <div className="md:hidden mt-4 animate-in slide-in-from-top-2 duration-200">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search transactions & accounts"
                  className="w-full bg-gray-800/50 backdrop-blur text-white placeholder-gray-400 pl-10 pr-12 py-3 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-gray-800 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowMobileSearch(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
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

export default MainLayout;
