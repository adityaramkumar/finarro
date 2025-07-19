const express = require('express');
const { PlaidApi, Configuration, PlaidEnvironments } = require('plaid');
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Configure Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

// Create link token
router.post('/link/token/create', auth, async (req, res) => {
  try {
    const request = {
      user: {
        client_user_id: req.user.id.toString(),
      },
      client_name: 'Financier',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    };

    const response = await client.linkTokenCreate(request);
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    logger.error('Error creating link token:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Exchange public token for access token
router.post('/link/token/exchange', auth, async (req, res) => {
  try {
    const { public_token } = req.body;

    const response = await client.linkTokenExchange({
      public_token,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get account info
    const accountsResponse = await client.accountsGet({
      access_token: accessToken,
    });

    // Store accounts in database
    for (const account of accountsResponse.data.accounts) {
      await db('accounts').insert({
        user_id: req.user.id,
        plaid_account_id: account.account_id,
        plaid_item_id: itemId,
        plaid_access_token: accessToken,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        balance: account.balances.current || 0,
        currency: account.balances.iso_currency_code || 'USD',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    res.json({ 
      success: true, 
      accounts: accountsResponse.data.accounts.length 
    });
  } catch (error) {
    logger.error('Error exchanging token:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sync transactions
router.post('/sync/transactions', auth, async (req, res) => {
  try {
    const accounts = await db('accounts')
      .where('user_id', req.user.id)
      .whereNotNull('plaid_access_token');

    let totalTransactions = 0;

    for (const account of accounts) {
      try {
        const request = {
          access_token: account.plaid_access_token,
          start_date: '2023-01-01',
          end_date: new Date().toISOString().split('T')[0],
          account_ids: [account.plaid_account_id],
        };

        const response = await client.transactionsGet(request);
        const transactions = response.data.transactions;

        // Store transactions in database
        for (const transaction of transactions) {
          // Check if transaction already exists
          const existingTransaction = await db('transactions')
            .where('plaid_transaction_id', transaction.transaction_id)
            .first();

          if (!existingTransaction) {
            await db('transactions').insert({
              account_id: account.id,
              plaid_transaction_id: transaction.transaction_id,
              amount: -transaction.amount, // Plaid uses negative for outflow
              description: transaction.name,
              merchant: transaction.merchant_name,
              category: transaction.category ? transaction.category[0] : 'Other',
              date: transaction.date,
              created_at: new Date(),
              updated_at: new Date()
            });
            totalTransactions++;
          }
        }
      } catch (accountError) {
        logger.error(`Error syncing transactions for account ${account.id}:`, accountError);
        continue;
      }
    }

    res.json({ 
      success: true, 
      transactions_synced: totalTransactions 
    });
  } catch (error) {
    logger.error('Error syncing transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get account balances
router.get('/accounts/balances', auth, async (req, res) => {
  try {
    const accounts = await db('accounts')
      .where('user_id', req.user.id)
      .whereNotNull('plaid_access_token');

    const balances = [];

    for (const account of accounts) {
      try {
        const response = await client.accountsBalanceGet({
          access_token: account.plaid_access_token,
        });

        const plaidAccount = response.data.accounts.find(
          acc => acc.account_id === account.plaid_account_id
        );

        if (plaidAccount) {
          // Update balance in database
          await db('accounts')
            .where('id', account.id)
            .update({
              balance: plaidAccount.balances.current,
              updatedAt: new Date()
            });

          balances.push({
            account_id: account.id,
            name: account.name,
            balance: plaidAccount.balances.current,
            currency: plaidAccount.balances.iso_currency_code
          });
        }
      } catch (accountError) {
        logger.error(`Error fetching balance for account ${account.id}:`, accountError);
        continue;
      }
    }

    res.json(balances);
  } catch (error) {
    logger.error('Error fetching account balances:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove account
router.delete('/accounts/:id', auth, async (req, res) => {
  try {
    const account = await db('accounts')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.plaid_access_token) {
      try {
        // Remove item from Plaid
        await client.itemRemove({
          access_token: account.plaid_access_token,
        });
      } catch (plaidError) {
        logger.error('Error removing item from Plaid:', plaidError);
        // Continue with database deletion even if Plaid removal fails
      }
    }

    // Delete account from database
    await db('accounts').where('id', req.params.id).del();

    res.json({ message: 'Account removed successfully' });
  } catch (error) {
    logger.error('Error removing account:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Webhook endpoint for Plaid
router.post('/webhook', async (req, res) => {
  try {
    const { webhook_type, webhook_code, item_id } = req.body;

    logger.info('Received Plaid webhook:', {
      webhook_type,
      webhook_code,
      item_id
    });

    switch (webhook_type) {
      case 'TRANSACTIONS':
        if (webhook_code === 'DEFAULT_UPDATE') {
          // Handle transaction updates
          // In a real implementation, you would sync the updated transactions
          logger.info('Transaction update received for item:', item_id);
        }
        break;
      case 'ITEM':
        if (webhook_code === 'ERROR') {
          // Handle item errors
          logger.error('Item error received for item:', item_id);
        }
        break;
      default:
        logger.info('Unhandled webhook type:', webhook_type);
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 