import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Logo from '../components/Logo';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const { forgotPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    getValues
  } = useForm();

  const email = watch('email');

  // Real-time email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getErrorMessage = (error) => {
    if (error.includes('User not found') || error.includes('No user found')) {
      return 'No account found with this email address. Please check your email or sign up for a new account.';
    }
    if (error.includes('Rate limit') || error.includes('Too many requests')) {
      return 'Too many password reset requests. Please wait a few minutes before trying again.';
    }
    if (error.includes('Network Error') || error.includes('500')) {
      return 'Server is currently unavailable. Please try again in a few moments.';
    }
    if (error.includes('timeout')) {
      return 'Request timed out. Please check your internet connection and try again.';
    }
    return error || 'An unexpected error occurred. Please try again.';
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    clearErrors();

    try {
      const result = await forgotPassword(data.email);
      
      if (result.success) {
        setIsSuccess(true);
        toast.success(
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            Reset email sent! Check your inbox.
          </div>,
          { duration: 4000 }
        );
      } else {
        const errorMessage = getErrorMessage(result.error);
        setServerError(errorMessage);
        
        // Set field-specific errors if applicable
        if (result.error?.includes('email') || result.error?.includes('User not found')) {
          setError('email', { type: 'server', message: errorMessage });
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error.message);
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    setServerError('');
    clearErrors();
  };

  if (isSuccess) {
    const submittedEmail = getValues('email');
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
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="text-center">
              <Link to="/" className="inline-flex items-center mb-8 group">
                <Logo className="h-8 w-8" showText={true} textClassName="text-xl font-bold text-white ml-3 group-hover:text-gray-300 transition-colors" />
              </Link>
              <div className="mx-auto h-16 w-16 bg-green-600/20 border border-green-500/30 rounded-full flex items-center justify-center mb-6">
                <Mail className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-4">
                Check your email
              </h2>
              <p className="text-gray-400 mb-2">
                We've sent a password reset link to:
              </p>
              <p className="font-semibold text-white text-lg mb-6">{submittedEmail}</p>
              <p className="text-sm text-gray-400 mb-8">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleTryAgain}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                Try again
              </button>
              <Link
                to="/login"
                className="w-full bg-gray-800/50 backdrop-blur border border-gray-600 hover:border-gray-500 hover:bg-gray-800/80 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center group"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Logo className="h-8 w-8" showText={true} textClassName="text-xl font-bold text-white ml-3 group-hover:text-gray-300 transition-colors" />
            </Link>
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Forgot your password?
            </h2>
            <p className="text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Server Error Display */}
          {serverError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                <p className="text-red-200 text-sm">{serverError}</p>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
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
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className={`appearance-none relative block w-full pl-10 pr-10 py-3 border rounded-xl placeholder-gray-400 text-white focus:outline-none focus:z-10 sm:text-sm bg-gray-800/50 backdrop-blur transition-all duration-200 ${
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
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !email || !validateEmail(email)}
                className={`group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 ${
                  isLoading || !email || !validateEmail(email)
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending email...
                  </>
                ) : (
                  <>
                    Send reset email
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              {/* Form validation feedback */}
              {(!email || !validateEmail(email)) && !isLoading && (
                <p className="mt-2 text-xs text-gray-400 text-center">
                  Please enter a valid email address to continue
                </p>
              )}
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center justify-center group"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 