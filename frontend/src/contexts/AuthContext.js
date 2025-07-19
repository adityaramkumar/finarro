import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authApi } from '../services/api';

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        loading: false
      };
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        loading: false
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch({ type: 'SET_TOKEN', payload: token });
      checkAuthStatus();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const response = await authApi.me();
      dispatch({ type: 'SET_USER', payload: response.data.user });
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authApi.login(credentials);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_USER', payload: user });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      const errorDetails = error.response?.data?.details || null;
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage, details: errorDetails };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authApi.signup(userData);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_USER', payload: user });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Signup failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (state.token) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      await authApi.forgotPassword(email);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send reset email';
      return { success: false, error: errorMessage };
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    try {
      await authApi.resetPassword(token, password);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to reset password';
      return { success: false, error: errorMessage };
    }
  };

  // Verify email function
  const verifyEmail = async (token) => {
    try {
      await authApi.verifyEmail(token);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Email verification failed';
      return { success: false, error: errorMessage };
    }
  };

  // Context value
  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 