import Stripe from "stripe";
import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { getAllTierConfigs } from "./airtable";
import type { Currency } from "@shared/currency";

const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);

export const stripe = hasStripe
  ? new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2025-09-30.clover" as any,
    })
  : (null as any);

// Stripe pricing tiers - will be fetched from Airtable dynamically
// These are fallback values if Airtable is unavailable
const FALLBACK_TIER_PRICES = {
  trial: { gbp: 0, eur: 0, usd: 0 },
  basic: { gbp: 8.99, eur: 10.99, usd: 12.99 },
  pro: { gbp: 16.99, eur: 19.99, usd: 23.99 },
};

export async function registerStripeRoutes(app: Express) {
  // In local/dev without Stripe configured, register no-op endpoints
  if (!hasStripe) {
    console.warn("Stripe credentials not configured. Registering stub routes.");

    app.post("/api/stripe/create-customer", async (_req, res) => {
      res.status(200).json({ customerId: "stub_customer" });
    });

    app.post("/api/stripe/create-checkout-session", async (_req, res) => {
      res.status(200).json({ sessionId: "stub_session", url: null });
    });

    app.post("/api/stripe/checkout-success", async (_req, res) => {
      res.json({ success: true });
    });

    app.post("/api/stripe/cancel-subscription", async (_req, res) => {
      res.json({ success: true });
    });

    app.post("/api/stripe/reactivate-subscription", async (_req, res) => {
      res.json({ success: true });
    });

    app.get("/api/stripe/subscription/:userId", async (_req, res) => {
      res.json({ subscription: null });
    });

    app.post("/api/stripe/webhook", async (_req: Request, res: Response) => {
      res.json({ received: true });
    });

    return;
  }
  
  // Create or retrieve Stripe customer
  app.post("/api/stripe/create-customer", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user already has a Stripe customer
      const subscription = await storage.getUserSubscription(userId);
      if (subscription?.stripeCustomerId) {
        return res.json({ customerId: subscription.stripeCustomerId });
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.businessName || user.ownerName || user.username,
        metadata: {
          userId: user.id,
          businessType: user.businessType || 'unknown',
        },
      });

      // Update user subscription with Stripe customer ID
      await storage.updateUserSubscription(userId, {
        stripeCustomerId: customer.id,
      });

      res.json({ customerId: customer.id });
    } catch (error: any) {
      console.error("Error creating Stripe customer:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create subscription checkout session or upgrade existing
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    try {
      const { userId, tier, billingCycle = 'monthly' } = req.body;

      if (!userId || !tier) {
        return res.status(400).json({ error: "userId and tier are required" });
      }

      if (!['basic', 'pro'].includes(tier)) {
        return res.status(400).json({ error: "Invalid tier - must be 'basic' or 'pro'" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get existing subscription
      let subscription = await storage.getUserSubscription(userId);
      
      // Check if trying to change to current tier
      if (subscription?.subscriptionTier === tier) {
        return res.status(400).json({ error: "You are already on this plan" });
      }
      
      // If user has existing Stripe subscription (any status except canceled), upgrade/downgrade immediately
      if (subscription?.stripeSubscriptionId) {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
        
        // If subscription is canceled, create new one instead of updating
        if (stripeSubscription.status === 'canceled') {
          // Clear the subscription ID so we create a new one
          subscription.stripeSubscriptionId = null as any;
        } else {
        
        // Get pricing from Airtable config
        const tierConfigs = await getAllTierConfigs();
        const tierConfig = tierConfigs.find(t => t.tierName === tier);
        if (!tierConfig) {
          return res.status(400).json({ error: "Invalid tier configuration" });
        }

        // Get user's preferred currency
        const currency = (user.preferredCurrency || 'GBP').toLowerCase() as 'gbp' | 'eur' | 'usd';
        const basePrice = tierConfig.pricing[currency];
        const amount = billingCycle === 'annual' 
          ? Math.round(basePrice * 12 * 0.85) 
          : basePrice;

        // Create or get the price
        const price = await stripe.prices.create({
          currency: currency,
          unit_amount: Math.round(amount * 100),
          recurring: {
            interval: billingCycle === 'annual' ? 'year' : 'month',
          },
          product_data: {
            name: `TrackD ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
          },
        });

        // Update subscription with new price
        const updatedSubscription = await stripe.subscriptions.update(
          subscription.stripeSubscriptionId,
          {
            items: [{
              id: stripeSubscription.items.data[0].id,
              price: price.id,
            }],
            proration_behavior: 'always_invoice',
            metadata: {
              userId,
              tier,
              billingCycle,
            },
          }
        );

        // Update database
        await storage.updateUserSubscription(userId, {
          subscriptionTier: tier,
          monthlyPriceGbp: basePrice.toString(),
          billingCycle: billingCycle,
          currentPeriodStart: new Date((updatedSubscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((updatedSubscription as any).current_period_end * 1000),
        });

        return res.json({ success: true, message: 'Subscription updated' });
        }
      }

      // Get or create Stripe customer for new subscription
      let customerId = subscription?.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: user.businessName || user.ownerName || user.username,
          metadata: { userId: user.id },
        });
        customerId = customer.id;
        await storage.updateUserSubscription(userId, {
          stripeCustomerId: customerId,
        });
      }

      // Get pricing from Airtable config for new subscription
      const tierConfigs = await getAllTierConfigs();
      const tierConfig = tierConfigs.find(t => t.tierName === tier);
      if (!tierConfig) {
        return res.status(400).json({ error: "Invalid tier configuration" });
      }

      // Get user's preferred currency
      const currency = (user.preferredCurrency || 'GBP').toLowerCase() as 'gbp' | 'eur' | 'usd';
      const basePrice = tierConfig.pricing[currency];
      const amount = billingCycle === 'annual' 
        ? Math.round(basePrice * 12 * 0.85)
        : basePrice;

      // Create Checkout Session for new subscription
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: `TrackD ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
                description: `${billingCycle === 'annual' ? 'Annual' : 'Monthly'} subscription`,
              },
              unit_amount: Math.round(amount * 100),
              recurring: {
                interval: billingCycle === 'annual' ? 'year' : 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin || 'http://localhost:5000'}/subscription?success=true`,
        cancel_url: `${req.headers.origin || 'http://localhost:5000'}/subscription?canceled=true`,
        metadata: {
          userId,
          tier,
          billingCycle,
        },
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error("Error creating/updating subscription:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Handle successful checkout
  app.post("/api/stripe/checkout-success", async (req, res) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'],
      });

      if (!session.metadata?.userId) {
        return res.status(400).json({ error: "Invalid session" });
      }

      const userId = session.metadata.userId;
      const tier = session.metadata.tier as string;
      const billingCycle = session.metadata.billingCycle as string;
      const subscription = session.subscription as Stripe.Subscription;

      // Get the price from the subscription
      const priceAmount = subscription.items.data[0].price.unit_amount || 0;
      const monthlyPrice = billingCycle === 'annual' 
        ? (priceAmount / 100 / 12 / 0.85).toFixed(2)  // Reverse annual discount
        : (priceAmount / 100).toFixed(2);

      // Update user subscription in database
      await storage.updateUserSubscription(userId, {
        stripeSubscriptionId: subscription.id,
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        monthlyPriceGbp: monthlyPrice,
        billingCycle: billingCycle,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        subscriptionStartDate: new Date(),
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error processing checkout success:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel subscription
  app.post("/api/stripe/cancel-subscription", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const subscription = await storage.getUserSubscription(userId);
      if (!subscription?.stripeSubscriptionId) {
        return res.status(404).json({ error: "No active subscription found" });
      }

      // Cancel at period end
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      // Update database
      await storage.updateUserSubscription(userId, {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      });

      res.json({ success: true, cancelAt: new Date(stripeSubscription.cancel_at! * 1000) });
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Reactivate canceled subscription
  app.post("/api/stripe/reactivate-subscription", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const subscription = await storage.getUserSubscription(userId);
      if (!subscription?.stripeSubscriptionId) {
        return res.status(404).json({ error: "No subscription found" });
      }

      // Remove cancellation
      await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: false,
        }
      );

      // Update database
      await storage.updateUserSubscription(userId, {
        cancelAtPeriodEnd: false,
        canceledAt: null,
        subscriptionStatus: 'active',
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error reactivating subscription:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get subscription details
  app.get("/api/stripe/subscription/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const subscription = await storage.getUserSubscription(userId);
      if (!subscription) {
        return res.json({ subscription: null });
      }

      // If there's a Stripe subscription, fetch latest data
      if (subscription.stripeSubscriptionId) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            subscription.stripeSubscriptionId
          );

          // Return combined data
          res.json({
            subscription: {
              ...subscription,
              stripeStatus: stripeSubscription.status,
              currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
            },
          });
        } catch (error) {
          // Stripe subscription not found, return database data only
          res.json({ subscription });
        }
      } else {
        res.json({ subscription });
      }
    } catch (error: any) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe webhook handler
  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).send('No signature');
    }

    let event: Stripe.Event;

    try {
      // In production, you should set STRIPE_WEBHOOK_SECRET
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } else {
        // For development/testing without webhook secret
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.created': {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata?.userId;

          if (userId) {
            await storage.updateUserSubscription(userId, {
              subscriptionStatus: subscription.status as any,
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            });
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata?.userId;

          if (userId) {
            await storage.updateUserSubscription(userId, {
              subscriptionStatus: 'canceled',
              subscriptionTier: 'free',
            });
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          const userId = (invoice as any).metadata?.userId;

          if (userId) {
            await storage.updateUserSubscription(userId, {
              lastPaymentDate: new Date(),
              lastPaymentAmountGbp: ((invoice.amount_paid || 0) / 100).toString(),
            });
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const userId = (invoice as any).metadata?.userId;

          if (userId) {
            await storage.updateUserSubscription(userId, {
              subscriptionStatus: 'past_due',
            });
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: error.message });
    }
  });
}
