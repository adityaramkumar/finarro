import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { subscriptionApi } from '../services/api';

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const CheckoutForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create setup intent when component mounts
    const createSetupIntent = async () => {
      try {
        const response = await subscriptionApi.createSetupIntent();
        setClientSecret(response.data.client_secret);
      } catch (error) {
        setError('Failed to initialize payment. Please try again.');
      }
    };

    createSetupIntent();
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      // Confirm the setup intent
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setIsLoading(false);
        return;
      }

      // Create subscription with the payment method
      const subscriptionResponse = await subscriptionApi.createSubscription(
        setupIntent.payment_method
      );

      if (subscriptionResponse.data.client_secret) {
        // If additional authentication is required
        const { error: confirmError } = await stripe.confirmCardPayment(
          subscriptionResponse.data.client_secret
        );

        if (confirmError) {
          setError(confirmError.message);
          setIsLoading(false);
          return;
        }
      }

      toast.success('Successfully upgraded to Pro plan!');
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 p-6 rounded-xl">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Card Information
        </label>
        <div className="bg-gray-900/50 border border-gray-600/50 rounded-lg p-4">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-white py-3 px-6 rounded-xl transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            'Upgrade to Pro - $10/month'
          )}
        </button>
      </div>
    </form>
  );
};

const SubscriptionUpgrade = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  // Check if Stripe is configured
  if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
        <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="text-center">
            <div className="p-3 bg-red-500/20 rounded-xl w-fit mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Configuration Required
            </h2>
            <p className="text-gray-400 mb-6">
              Stripe payment processing is not configured. Please set up your
              Stripe keys to enable subscriptions.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-white py-3 px-6 rounded-xl transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <div className="p-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl w-fit mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
          <p className="text-gray-400">
            Unlock premium features and advanced AI insights
          </p>
        </div>

        <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 p-6 rounded-xl mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Pro Plan Features
          </h3>
          <div className="space-y-3">
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
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 p-4 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Monthly subscription</span>
            <span className="text-2xl font-bold text-white">$10.00</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Cancel anytime • Tax may apply based on location
          </p>
        </div>

        <div className="flex items-center justify-center mb-6">
          <Lock className="h-4 w-4 text-green-400 mr-2" />
          <span className="text-sm text-gray-400">Secured by Stripe</span>
        </div>

        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <CheckoutForm onSuccess={onSuccess} onCancel={onClose} />
          </Elements>
        ) : (
          <div className="text-center">
            <div className="p-3 bg-red-500/20 rounded-xl w-fit mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-gray-400 mb-6">
              Failed to initialize Stripe. Please check your configuration.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-white py-3 px-6 rounded-xl transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50 font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionUpgrade;
