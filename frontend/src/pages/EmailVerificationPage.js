import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Check, X, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [isLoading, setIsLoading] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      toast.error('Invalid verification link');
      return;
    }

    const performVerification = async () => {
      try {
        const result = await verifyEmail(token);

        if (result.success) {
          setVerificationStatus('success');
          toast.success('Email verified successfully!');
          setTimeout(() => navigate('/dashboard'), 3000);
        } else {
          setVerificationStatus('error');
          toast.error(result.error || 'Email verification failed');
        }
      } catch (error) {
        setVerificationStatus('error');
        toast.error('Something went wrong during verification');
      }
    };

    performVerification();
  }, [token, verifyEmail, navigate]);

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call an API to resend verification email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Verification email resent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <Loader className="h-6 w-6 text-white animate-spin" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-white">
              Verifying your email
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-white">
              Email verified successfully!
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Your email has been verified. You can now access all features of
              your account.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Redirecting to dashboard in 3 seconds...
            </p>
            <Link
              to="/dashboard"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-12 bg-red-600 rounded-full flex items-center justify-center">
            <X className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Verification failed
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            The verification link is invalid or has expired. Please request a
            new verification email.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Sending...' : 'Resend verification email'}
          </button>

          <div className="text-center space-y-2">
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 text-sm block"
            >
              Back to login
            </Link>
            <Link
              to="/signup"
              className="text-gray-400 hover:text-white text-sm block"
            >
              Create new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
