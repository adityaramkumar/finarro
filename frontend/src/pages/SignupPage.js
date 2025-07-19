import React, { useState } from 'react';
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
  User,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Logo from '../components/Logo';
import SEO, { SEOConfigs } from '../components/SEO';

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useForm();

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const email = watch('email');
  const firstName = watch('firstName');
  const lastName = watch('lastName');

  // Real-time validation functions
  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = password => {
    if (!password) return { score: 0, text: '', color: 'gray' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { score, text: 'Weak', color: 'red' };
    if (score === 3) return { score, text: 'Fair', color: 'yellow' };
    if (score === 4) return { score, text: 'Good', color: 'blue' };
    return { score, text: 'Strong', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(password);

  const getErrorMessage = error => {
    if (error.includes('User already exists')) {
      return 'An account with this email already exists. Please try logging in instead.';
    }
    if (error.includes('Network Error') || error.includes('500')) {
      return 'Server is currently unavailable. Please try again in a few moments.';
    }
    if (error.includes('timeout')) {
      return 'Request timed out. Please check your internet connection and try again.';
    }
    if (error.includes('validation')) {
      return 'Please check your information and try again.';
    }
    return error || 'An unexpected error occurred. Please try again.';
  };

  const onSubmit = async data => {
    setIsLoading(true);
    setServerError('');
    clearErrors();

    try {
      const result = await signup({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (result.success) {
        toast.success(
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            Account created successfully! Welcome to finarro!
          </div>,
          { duration: 3000 }
        );
        navigate('/dashboard');
      } else {
        // Use detailed error message if available, otherwise use the main error
        const errorMessage = result.details || getErrorMessage(result.error);
        setServerError(errorMessage);

        // Set field-specific errors if applicable
        if (result.error?.includes('email')) {
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

  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-6 lg:px-8">
      <SEO {...SEOConfigs.signup} />
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
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Sign in here
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

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-20 pointer-events-none" />
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    {...register('firstName', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'Must be at least 2 characters',
                      },
                      maxLength: {
                        value: 50,
                        message: 'Must be less than 50 characters',
                      },
                    })}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-400 text-white focus:outline-none focus:z-10 sm:text-sm bg-gray-800/50 backdrop-blur transition-all duration-200 ${
                      errors.firstName
                        ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                        : firstName && firstName.length >= 2
                          ? 'border-green-500 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                          : 'border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-500'
                    }`}
                    placeholder="Enter first name"
                  />
                  {firstName && firstName.length >= 2 && !errors.firstName && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-30">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </div>
                  )}
                </div>
                {errors.firstName && (
                  <div className="mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-400">
                      {errors.firstName.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-20 pointer-events-none" />
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    {...register('lastName', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Must be at least 2 characters',
                      },
                      maxLength: {
                        value: 50,
                        message: 'Must be less than 50 characters',
                      },
                    })}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-400 text-white focus:outline-none focus:z-10 sm:text-sm bg-gray-800/50 backdrop-blur transition-all duration-200 ${
                      errors.lastName
                        ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                        : lastName && lastName.length >= 2
                          ? 'border-green-500 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                          : 'border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-500'
                    }`}
                    placeholder="Enter last name"
                  />
                  {lastName && lastName.length >= 2 && !errors.lastName && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-30">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </div>
                  )}
                </div>
                {errors.lastName && (
                  <div className="mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-400">
                      {errors.lastName.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Email */}
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

              {/* Password */}
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
                    autoComplete="new-password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border rounded-xl placeholder-gray-400 text-white focus:outline-none focus:z-10 sm:text-sm bg-gray-800/50 backdrop-blur transition-all duration-200 ${
                      errors.password
                        ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                        : passwordStrength.score >= 3
                          ? 'border-green-500 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                          : 'border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-500'
                    }`}
                    placeholder="Create a secure password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-30">
                    {passwordStrength.score >= 3 && !errors.password && (
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

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">
                        Password strength:
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength.color === 'red'
                            ? 'text-red-400'
                            : passwordStrength.color === 'yellow'
                              ? 'text-yellow-400'
                              : passwordStrength.color === 'blue'
                                ? 'text-blue-400'
                                : passwordStrength.color === 'green'
                                  ? 'text-green-400'
                                  : 'text-gray-400'
                        }`}
                      >
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.color === 'red'
                            ? 'bg-red-500'
                            : passwordStrength.color === 'yellow'
                              ? 'bg-yellow-500'
                              : passwordStrength.color === 'blue'
                                ? 'bg-blue-500'
                                : passwordStrength.color === 'green'
                                  ? 'bg-green-500'
                                  : 'bg-gray-500'
                        }`}
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <div className="mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-400">
                      {errors.password.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-20 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value =>
                        value === password || 'Passwords do not match',
                    })}
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border rounded-xl placeholder-gray-400 text-white focus:outline-none focus:z-10 sm:text-sm bg-gray-800/50 backdrop-blur transition-all duration-200 ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                        : confirmPassword && confirmPassword === password
                          ? 'border-green-500 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                          : 'border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-500'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-30">
                    {confirmPassword &&
                      confirmPassword === password &&
                      !errors.confirmPassword && (
                        <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
                      )}
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-300 focus:outline-none"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <div className="mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  !email ||
                  !password ||
                  !confirmPassword ||
                  !firstName ||
                  !lastName ||
                  passwordStrength.score < 3
                }
                className={`group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 ${
                  isLoading ||
                  !email ||
                  !password ||
                  !confirmPassword ||
                  !firstName ||
                  !lastName ||
                  passwordStrength.score < 3
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Form validation feedback */}
              {(!email ||
                !password ||
                !confirmPassword ||
                !firstName ||
                !lastName) &&
                !isLoading && (
                  <p className="mt-2 text-xs text-gray-400 text-center">
                    Please fill in all fields to continue
                  </p>
                )}
              {passwordStrength.score < 3 && password && !isLoading && (
                <p className="mt-2 text-xs text-yellow-400 text-center">
                  Password needs to be stronger to create account
                </p>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                By creating an account, you agree to our{' '}
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

export default SignupPage;
