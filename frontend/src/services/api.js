import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear invalid token
      localStorage.removeItem('token');

      // Only redirect if not already on login page to prevent form clearing
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  signup: userData => api.post('/auth/signup', userData),
  login: credentials => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: email => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),
  verifyEmail: token => api.post('/auth/verify-email', { token }),
};

// User API
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: userData => api.put('/users/profile', userData),
  deleteAccount: () => api.delete('/users/account'),
  updatePassword: passwordData => api.put('/users/password', passwordData),
};

// Accounts API
export const accountsApi = {
  getAccounts: () => api.get('/accounts'),
  syncAccounts: () => api.post('/accounts/sync'),
  deleteAccount: accountId => api.delete(`/accounts/${accountId}`),
};

// Transactions API
export const transactionsApi = {
  getTransactions: params => api.get('/transactions', { params }),
  getTransactionsByCategory: params =>
    api.get('/transactions/categories', { params }),
  getTransactionInsights: params =>
    api.get('/transactions/insights', { params }),
  searchTransactions: query =>
    api.get('/transactions/search', { params: { q: query } }),
};

// AI API
export const aiApi = {
  chat: (message, conversationId) =>
    api.post('/ai/chat', { message, conversationId }),
  getConversations: params => api.get('/ai/conversations', { params }),
  getConversation: conversationId =>
    api.get(`/ai/conversations/${conversationId}`),
  generateInsights: timeframe => api.post('/ai/insights', { timeframe }),
};

// Documents API
export const documentsApi = {
  uploadDocument: formData =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDocuments: params => api.get('/documents', { params }),
  analyzeDocument: documentId => api.post(`/documents/${documentId}/analyze`),
  deleteDocument: documentId => api.delete(`/documents/${documentId}`),
};

// Plaid API
export const plaidApi = {
  createLinkToken: () => api.post('/plaid/create-link-token'),
  exchangePublicToken: publicToken =>
    api.post('/plaid/exchange-public-token', { publicToken }),
  getAccounts: () => api.get('/plaid/accounts'),
  getTransactions: params => api.get('/plaid/transactions', { params }),
};

// Subscription API
export const subscriptionApi = {
  createSetupIntent: () => api.post('/subscriptions/create-setup-intent'),
  createSubscription: paymentMethodId =>
    api.post('/subscriptions/create', { payment_method_id: paymentMethodId }),
  getStatus: () => api.get('/subscriptions/status'),
  cancel: () => api.post('/subscriptions/cancel'),
  reactivate: () => api.post('/subscriptions/reactivate'),
};

// Dashboard API
export const dashboardApi = {
  getDashboardData: params => api.get('/dashboard', { params }),
  getInsights: () => api.get('/dashboard/insights'),
};

// Shares API
export const sharesApi = {
  createShare: (options = {}) => api.post('/shares/charts', options),
  getSharedChart: token => api.get(`/shares/${token}`),
  getUserShares: () => api.get('/shares/user/charts'),
  deleteShare: token => api.delete(`/shares/${token}`),
};

// Export default api instance
export default api;
