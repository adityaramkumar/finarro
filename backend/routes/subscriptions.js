const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Create Stripe customer and setup intent for subscription
router.post('/create-setup-intent', auth, async (req, res) => {
  try {
    const user = req.user;

    // Check if user already has a Stripe customer
    const subscription = await db('subscriptions')
      .where('user_id', user.id)
      .first();
    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Store customer ID in database
      if (subscription) {
        await db('subscriptions').where('id', subscription.id).update({
          stripe_customer_id: customerId,
          updated_at: new Date(),
        });
      } else {
        await db('subscriptions').insert({
          user_id: user.id,
          stripe_customer_id: customerId,
        });
      }
    }

    // Create setup intent for future payments
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    res.json({
      client_secret: setupIntent.client_secret,
      customer_id: customerId,
    });
  } catch (error) {
    logger.error('Error creating setup intent:', error);
    res.status(500).json({ error: 'Failed to create setup intent' });
  }
});

// Create subscription
router.post('/create', auth, async (req, res) => {
  try {
    const user = req.user;
    const { payment_method_id } = req.body;

    // Get user's subscription record
    const subscription = await db('subscriptions')
      .where('user_id', user.id)
      .first();

    if (!subscription || !subscription.stripe_customer_id) {
      return res.status(400).json({ error: 'No customer found' });
    }

    // Check if user already has an active subscription
    if (
      subscription.stripe_subscription_id &&
      subscription.status === 'active'
    ) {
      return res
        .status(400)
        .json({ error: 'User already has an active subscription' });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: subscription.stripe_customer_id,
    });

    // Set as default payment method
    await stripe.customers.update(subscription.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    });

    // Create subscription (You'll need to create this price in your Stripe dashboard)
    const stripeSubscription = await stripe.subscriptions.create({
      customer: subscription.stripe_customer_id,
      items: [
        {
          price: process.env.STRIPE_PRICE_ID_PRO, // You'll need to set this in your .env
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update subscription in database
    await db('subscriptions')
      .where('id', subscription.id)
      .update({
        stripe_subscription_id: stripeSubscription.id,
        stripe_price_id: process.env.STRIPE_PRICE_ID_PRO,
        status: stripeSubscription.status,
        current_period_start: new Date(
          stripeSubscription.current_period_start * 1000
        ),
        current_period_end: new Date(
          stripeSubscription.current_period_end * 1000
        ),
        updated_at: new Date(),
      });

    // Update user subscription tier
    await db('users').where('id', user.id).update({
      subscription_tier: 'pro',
      updated_at: new Date(),
    });

    res.json({
      subscription_id: stripeSubscription.id,
      client_secret:
        stripeSubscription.latest_invoice.payment_intent.client_secret,
      status: stripeSubscription.status,
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Get subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const user = req.user;

    const subscription = await db('subscriptions')
      .where('user_id', user.id)
      .first();

    if (!subscription) {
      return res.json({
        has_subscription: false,
        tier: 'free',
        status: null,
      });
    }

    let stripeSubscription = null;
    if (subscription.stripe_subscription_id) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );
      } catch (error) {
        logger.error('Error retrieving Stripe subscription:', error);
      }
    }

    res.json({
      has_subscription: !!subscription.stripe_subscription_id,
      tier: user.subscription_tier,
      status: subscription.status,
      current_period_end: subscription.current_period_end,
      stripe_subscription: stripeSubscription
        ? {
            id: stripeSubscription.id,
            status: stripeSubscription.status,
            current_period_start: stripeSubscription.current_period_start,
            current_period_end: stripeSubscription.current_period_end,
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          }
        : null,
    });
  } catch (error) {
    logger.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const user = req.user;

    const subscription = await db('subscriptions')
      .where('user_id', user.id)
      .first();

    if (!subscription || !subscription.stripe_subscription_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel at period end (don't cancel immediately)
    const canceledSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    // Update database
    await db('subscriptions').where('id', subscription.id).update({
      status: canceledSubscription.status,
      updated_at: new Date(),
    });

    res.json({
      message: 'Subscription will be canceled at the end of the current period',
      cancel_at_period_end: true,
      current_period_end: canceledSubscription.current_period_end,
    });
  } catch (error) {
    logger.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Reactivate subscription
router.post('/reactivate', auth, async (req, res) => {
  try {
    const user = req.user;

    const subscription = await db('subscriptions')
      .where('user_id', user.id)
      .first();

    if (!subscription || !subscription.stripe_subscription_id) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    // Reactivate subscription
    const reactivatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      }
    );

    // Update database
    await db('subscriptions').where('id', subscription.id).update({
      status: reactivatedSubscription.status,
      updated_at: new Date(),
    });

    res.json({
      message: 'Subscription reactivated',
      status: reactivatedSubscription.status,
    });
  } catch (error) {
    logger.error('Error reactivating subscription:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// Stripe webhook handler
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        logger.info('Unhandled event type:', event.type);
    }

    res.json({ received: true });
  }
);

// Helper function to handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  try {
    const dbSubscription = await db('subscriptions')
      .where('stripe_subscription_id', subscription.id)
      .first();

    if (dbSubscription) {
      await db('subscriptions')
        .where('id', dbSubscription.id)
        .update({
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ),
          current_period_end: new Date(subscription.current_period_end * 1000),
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
          updated_at: new Date(),
        });

      // Update user subscription tier based on status
      const tier = subscription.status === 'active' ? 'pro' : 'free';
      await db('users').where('id', dbSubscription.user_id).update({
        subscription_tier: tier,
        updated_at: new Date(),
      });
    }
  } catch (error) {
    logger.error('Error handling subscription update:', error);
  }
}

// Helper function to handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  try {
    const dbSubscription = await db('subscriptions')
      .where('stripe_subscription_id', subscription.id)
      .first();

    if (dbSubscription) {
      await db('subscriptions').where('id', dbSubscription.id).update({
        status: 'canceled',
        canceled_at: new Date(),
        updated_at: new Date(),
      });

      // Downgrade user to free tier
      await db('users').where('id', dbSubscription.user_id).update({
        subscription_tier: 'free',
        updated_at: new Date(),
      });
    }
  } catch (error) {
    logger.error('Error handling subscription deletion:', error);
  }
}

// Helper function to handle successful payments
async function handlePaymentSucceeded(invoice) {
  try {
    if (invoice.subscription) {
      logger.info('Payment succeeded for subscription:', invoice.subscription);
      // You can add any additional logic here, like sending confirmation emails
    }
  } catch (error) {
    logger.error('Error handling payment success:', error);
  }
}

// Helper function to handle failed payments
async function handlePaymentFailed(invoice) {
  try {
    if (invoice.subscription) {
      logger.error('Payment failed for subscription:', invoice.subscription);
      // You can add logic here to handle failed payments, like sending notifications
    }
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
}

module.exports = router;
