const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const logger = require('../lib/logger');

const router = express.Router();

// Create checkout session for subscription
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body; // 'PRO' or 'COMPANY'

    if (!['PRO', 'COMPANY'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const priceId = plan === 'PRO' 
      ? process.env.STRIPE_PRO_PRICE_ID 
      : process.env.STRIPE_COMPANY_PRICE_ID;

    if (!priceId) {
      return res.status(500).json({ message: 'Payment configuration error' });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?canceled=true`,
      metadata: {
        userId: req.user.id,
        plan: plan
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    logger.error('Stripe checkout error', { error: error.message });
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;

      if (userId && plan) {
        await prisma.user.update({
          where: { id: userId },
          data: { subscription: plan }
        });
        logger.info('Subscription activated', { userId, plan });
      }
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Handle subscription cancellation
      logger.info('Subscription canceled', { subscriptionId: subscription.id });
      break;

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Get subscription status
router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { subscription: true }
    });

    res.json({ subscription: user.subscription });
  } catch (error) {
    logger.error('Get subscription error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

