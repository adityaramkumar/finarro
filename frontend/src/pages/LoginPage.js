import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Lock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Logo from '../components/Logo';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Clear any existing tokens when login page loads to prevent 401 interference
  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    setValue,
  } = useForm({
    shouldFocusError: false,
    shouldUnregister: false,
  });

  const email = watch('email');
  const password = watch('password');

  // Clear field-specific errors when user starts typing
  // TEMPORARILY DISABLED to test if they're interfering with password reset
  // useEffect(() => {
  //   if (errors.email && email) {
  //     console.log('Clearing email error due to typing');
  //     clearErrors('email');
  //   }
  // }, [email, errors.email, clearErrors]);

  // useEffect(() => {
  //   if (errors.password && password) {
  //     console.log('Clearing password error due to typing');
  //     clearErrors('password');
  //   }
  // }, [password, errors.password, clearErrors]);

  // Real-time email validation
  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getErrorMessage = error => {
    if (error.includes('Invalid credentials')) {
      return 'Login failed. Please check your credentials and try again.';
    }
    if (error.includes('User already exists')) {
      return 'An account with this email already exists. Try logging in instead.';
    }
    if (error.includes('Network Error') || error.includes('500')) {
      return 'Server is currently unavailable. Please try again in a few moments.';
    }
    if (error.includes('timeout')) {
      return 'Request timed out. Please check your internet connection and try again.';
    }
    if (error.includes('User not found')) {
      return 'No account found with this email address.';
    }
    return error || 'An unexpected error occurred. Please try again.';
  };

  const handleLogin = async data => {
    setIsLoading(true);
    setServerError('');

    // Since AuthContext login() already handles all errors and returns { success, error, details },
    // we don't need a try/catch here - just handle the result to avoid double triggers
    const result = await login(data);

    if (result.success) {
      toast.success(
        <div className="flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
          Welcome back! Redirecting to dashboard...
        </div>,
        { duration: 2000 }
      );
      navigate('/dashboard');
    } else {
      // Handle login failure - use detailed error message if available
      const errorMessage = result.details || getErrorMessage(result.error);

      // Determine error type based on backend response to provide better UX
      if (
        result.details?.includes('No account found with this email address')
      ) {
        // Email not found - show error on email field, keep password
        clearErrors('password');
        setError('email', {
          type: 'server',
          message:
            'No account found with this email address. Please check your email or create a new account.',
        });
        setServerError('');
      } else if (
        result.details?.includes('The password you entered is incorrect') ||
        result.error?.includes('Invalid credentials')
      ) {
        // Password incorrect - clear only password field, preserve email
        clearErrors('email');
        setValue('password', '', { shouldValidate: false });
        setError('password', {
          type: 'server',
          message:
            'The password you entered is incorrect. Please try again or reset your password.',
        });
        setServerError('');
      } else {
        // Generic error - show in server error section
        clearErrors();
        setServerError(errorMessage);
      }

      // Show toast notification after a brief delay
      setTimeout(() => {
        toast.error(errorMessage);
      }, 100);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center mb-8 group">
              <Logo
                className="h-8 w-8"
                showText={true}
                textClassName="text-xl font-bold text-white ml-3 group-hover:text-gray-300 transition-colors"
              />
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Server Error Display */}
          {serverError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                <p className="text-red-200 text-sm">{serverError}</p>
              </div>
            </div>
          )}

          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit(handleLogin)}
            noValidate
          >
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-20 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address',
                      },
                    })}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-400 text-white focus:outline-none focus:z-10 sm:text-sm bg-gray-800/50 backdrop-blur transition-all duration-200 ${
                      errors.email
                        ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                        : email && validateEmail(email)
                          ? 'border-green-500 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                          : 'border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-500'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {email && validateEmail(email) && !errors.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-30">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <div className="mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-400">
                      {errors.email.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-20 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters long',
                      },
                    })}
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border rounded-xl placeholder-gray-400 text-white focus:outline-none focus:z-10 sm:text-sm bg-gray-800/50 backdrop-blur transition-all duration-200 ${
                      errors.password
                        ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                        : password && password.length >= 8
                          ? 'border-green-500 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                          : 'border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-500'
                    }`}
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-30">
                    {password && password.length >= 8 && !errors.password && (
                      <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
                    )}
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-300 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <div className="mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-400">
                      {errors.password.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Forgot your password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className={`group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 ${
                  isLoading || !email || !password
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Form validation feedback */}
              {(!email || !password) && !isLoading && (
                <p className="mt-2 text-xs text-gray-400 text-center">
                  Please fill in all fields to continue
                </p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                By signing in, you agree to our{' '}
                <Link
                  to="/terms"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
