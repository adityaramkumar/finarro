import React, { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { plaidApi } from '../services/api';

const PlaidLink = ({ onSuccess, onError, disabled = false, children }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch link token on component mount
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await plaidApi.createLinkToken();
        setLinkToken(response.data.link_token);
      } catch (err) {
        setError('Failed to initialize bank connection. Please try again.');
        onError?.(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkToken();
  }, [onError]);

  // Handle successful Plaid Link flow
  const handleOnSuccess = useCallback(
    async (public_token, metadata) => {
      try {
        setIsLoading(true);

        // Exchange public token for access token and store accounts
        const response = await plaidApi.exchangePublicToken(public_token);

        if (response.data.success) {
          toast.success(
            `Successfully connected ${response.data.accounts} account(s)!`,
            { icon: '🏦', duration: 4000 }
          );

          // Trigger sync of transactions
          setTimeout(async () => {
            try {
              await plaidApi.syncTransactions();
              toast.success('Transaction sync completed!', {
                icon: '💳',
                duration: 3000,
              });
            } catch (syncError) {
              toast.error(
                'Account connected but transaction sync failed. You can try syncing manually later.'
              );
            }
          }, 2000);

          onSuccess?.(response.data, metadata);
        } else {
          throw new Error('Failed to connect account');
        }
      } catch (err) {
        toast.error('Failed to connect account. Please try again.');
        onError?.(err);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  // Handle Plaid Link errors
  const handleOnExit = useCallback(
    (err, metadata) => {
      if (err != null) {
        toast.error('Bank connection was cancelled or failed.');
        onError?.(err, metadata);
      }
    },
    [onError]
  );

  // Initialize Plaid Link
  const config = {
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
  };

  const { open, ready } = usePlaidLink(config);

  // Handle click to open Plaid Link
  const handleClick = useCallback(() => {
    if (ready && !isLoading && !disabled) {
      open();
    }
  }, [ready, open, isLoading, disabled]);

  // Show error state
  if (error) {
    return (
      <button
        onClick={() => window.location.reload()}
        className="flex items-center space-x-2 bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-600/30 transition-colors"
      >
        <AlertCircle className="h-4 w-4" />
        <span>Retry Connection</span>
      </button>
    );
  }

  // Render custom children or default button
  if (children) {
    return (
      <div
        onClick={handleClick}
        className={`${
          !ready || isLoading || disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'
        }`}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={!ready || isLoading || disabled}
      className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 font-medium"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <CreditCard className="h-5 w-5" />
          <span>Connect Bank Account</span>
        </>
      )}
    </button>
  );
};

export default PlaidLink;
