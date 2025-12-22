# Subscription & Billing

## Overview

This document defines how we handle subscriptions, payments, and billing in our SaaS product. We use **Stripe** as our payment processor and implement subscription lifecycle management, feature gating, and usage-based billing patterns.

**CRITICAL:** All billing code MUST handle edge cases (failed payments, cancellations, refunds) and maintain audit trails for compliance.

---

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **Stripe Integration**: Use Stripe SDK with webhook verification (see [Stripe Setup](#stripe-setup))
- **Subscription Plans**: Define plans in code with feature limits (see [Subscription Plans](#subscription-plans))
- **Webhook Handling**: MUST verify webhook signatures and handle all event types (see [Webhook Handling](#webhook-handling))
- **Feature Gating**: Enforce plan limits server-side (see [Feature Gating](#feature-gating))
- **Edge Cases**: Handle payment failures, cancellations, downgrades gracefully (see [Edge Cases](#edge-cases))

**Quick Example:**
```typescript
// GOOD - Feature gating with subscription check
if (user.subscription.plan !== 'ENTERPRISE' && projectCount >= planLimits.projects) {
  throw new Error('Upgrade to create more projects');
}

// BAD - No subscription check
await createProject(); // Allows unlimited projects
```

**Key Sections:**
- [Customer & Subscription Creation](#customer-subscription-creation) - How to create Stripe customers and subscriptions
- [Plan Management](#plan-management) - Upgrades, downgrades, and prorations
- [Usage-Based Billing](#usage-based-billing) - Metered billing for API calls, storage
- [Customer Portal](#customer-portal) - Self-service billing management

---

## Stripe Setup {#stripe-setup}

### Environment Configuration

```typescript
// .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

// For production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Client Initialization

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
```

---

## Subscription Plans {#subscription-plans}

### Plan Definition

Define your plans in code for consistency:

```typescript
// src/lib/plans.ts
export const PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    stripePriceId: process.env.STRIPE_PRICE_STARTER!,
    amount: 29,
    currency: 'usd',
    interval: 'month',
    features: {
      projects: 5,
      users: 3,
      storage: 10, // GB
      api_calls: 10000,
    },
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    stripePriceId: process.env.STRIPE_PRICE_PRO!,
    amount: 99,
    currency: 'usd',
    interval: 'month',
    features: {
      projects: 25,
      users: 10,
      storage: 100,
      api_calls: 100000,
    },
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    amount: 299,
    currency: 'usd',
    interval: 'month',
    features: {
      projects: -1, // unlimited
      users: -1,
      storage: 1000,
      api_calls: 1000000,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;
```

### Database Schema

```typescript
// prisma/schema.prisma
model Tenant {
  id                String   @id @default(cuid())
  name              String

  // Stripe fields
  stripeCustomerId      String?  @unique
  stripeSubscriptionId  String?  @unique
  stripePriceId         String?
  stripeCurrentPeriodEnd DateTime?

  // Subscription status
  subscriptionStatus    SubscriptionStatus @default(TRIALING)
  planId                String   @default("starter")

  // Trial
  trialEndsAt       DateTime?

  // Usage tracking
  usageThisMonth    Json?    // { api_calls: 5000, storage: 5.2 }

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

enum SubscriptionStatus {
  TRIALING          // Free trial active
  ACTIVE            // Paid and current
  PAST_DUE          // Payment failed, in grace period
  CANCELED          // Canceled, active until period end
  INCOMPLETE        // Initial payment failed
  INCOMPLETE_EXPIRED // Initial payment never completed
  UNPAID            // Multiple failed payments
  PAUSED            // Subscription paused
}
```

---

## Customer & Subscription Creation {#customer-subscription-creation}

### Creating Stripe Customer

**CRITICAL:** Always create Stripe customer when tenant is created, even during trial.

```typescript
// src/services/stripe/customer.service.ts
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function createStripeCustomer(
  tenantId: string,
  email: string,
  name: string
): Promise<string> {
  // Create customer in Stripe
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      tenantId,
    },
  });

  // Save customer ID to database
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}
```

### Creating Subscription

```typescript
// src/services/stripe/subscription.service.ts
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/plans';

export async function createSubscription(
  tenantId: string,
  planId: PlanId,
  trialDays: number = 14
) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant?.stripeCustomerId) {
    throw new Error('Tenant must have Stripe customer ID');
  }

  const plan = PLANS[planId];

  // Create subscription in Stripe
  const subscription = await stripe.subscriptions.create({
    customer: tenant.stripeCustomerId,
    items: [{ price: plan.stripePriceId }],
    trial_period_days: trialDays,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      tenantId,
      planId,
    },
  });

  // Update tenant with subscription details
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: plan.stripePriceId,
      planId,
      subscriptionStatus: 'TRIALING',
      trialEndsAt: new Date(subscription.trial_end! * 1000),
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  return subscription;
}
```

### Checkout Session (for self-service signup)

```typescript
// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';

export async function POST(req: NextRequest) {
  const { tenantId, planId } = await req.json();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant?.stripeCustomerId) {
    return NextResponse.json(
      { error: 'Customer not found' },
      { status: 400 }
    );
  }

  const plan = PLANS[planId];

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    customer: tenant.stripeCustomerId,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?checkout=canceled`,
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        tenantId,
        planId,
      },
    },
    metadata: {
      tenantId,
      planId,
    },
  });

  return NextResponse.json({ url: session.url });
}
```

---

## Webhook Handling {#webhook-handling}

**CRITICAL:** ALL subscription state changes MUST be processed via webhooks, not client-side callbacks.

### Webhook Endpoint Setup

```typescript
// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Webhook handler failed: ${err.message}`);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
```

### Webhook Handlers

```typescript
// src/services/stripe/webhook-handlers.ts
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
) {
  const tenantId = subscription.metadata.tenantId;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      subscriptionStatus: subscription.status.toUpperCase() as any,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`Subscription created for tenant ${tenantId}`);
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const tenantId = subscription.metadata.tenantId;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      stripePriceId: subscription.items.data[0].price.id,
      subscriptionStatus: subscription.status.toUpperCase() as any,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`Subscription updated for tenant ${tenantId}`);
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const tenantId = subscription.metadata.tenantId;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      stripeSubscriptionId: null,
      subscriptionStatus: 'CANCELED',
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`Subscription canceled for tenant ${tenantId}`);
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!tenant) return;

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionStatus: 'ACTIVE',
    },
  });

  // Reset usage counters at start of new billing period
  if (invoice.billing_reason === 'subscription_cycle') {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        usageThisMonth: {},
      },
    });
  }

  console.log(`Invoice paid for tenant ${tenant.id}`);
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  const tenant = await prisma.tenant.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!tenant) return;

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionStatus: 'PAST_DUE',
    },
  });

  // TODO: Send payment failed email
  console.error(`Payment failed for tenant ${tenant.id}`);
}

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  const tenantId = session.metadata?.tenantId;
  const subscriptionId = session.subscription as string;

  if (!tenantId || !subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      subscriptionStatus: subscription.status.toUpperCase() as any,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`Checkout completed for tenant ${tenantId}`);
}
```

---

## Plan Management {#plan-management}

### Upgrade Plan

```typescript
// src/services/stripe/upgrade.service.ts
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { PLANS, PlanId } from '@/lib/plans';

export async function upgradePlan(tenantId: string, newPlanId: PlanId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant?.stripeSubscriptionId) {
    throw new Error('No active subscription');
  }

  const subscription = await stripe.subscriptions.retrieve(
    tenant.stripeSubscriptionId
  );

  const newPlan = PLANS[newPlanId];

  // Update subscription with proration
  const updatedSubscription = await stripe.subscriptions.update(
    tenant.stripeSubscriptionId,
    {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPlan.stripePriceId,
        },
      ],
      proration_behavior: 'always_invoice', // Charge immediately
      metadata: {
        tenantId,
        planId: newPlanId,
      },
    }
  );

  // Update tenant (webhook will also update, but we update immediately for UX)
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      planId: newPlanId,
      stripePriceId: newPlan.stripePriceId,
    },
  });

  return updatedSubscription;
}
```

### Downgrade Plan

```typescript
// src/services/stripe/downgrade.service.ts
export async function downgradePlan(tenantId: string, newPlanId: PlanId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant?.stripeSubscriptionId) {
    throw new Error('No active subscription');
  }

  const subscription = await stripe.subscriptions.retrieve(
    tenant.stripeSubscriptionId
  );

  const newPlan = PLANS[newPlanId];

  // Schedule downgrade for end of billing period
  const updatedSubscription = await stripe.subscriptions.update(
    tenant.stripeSubscriptionId,
    {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPlan.stripePriceId,
        },
      ],
      proration_behavior: 'none', // No proration on downgrade
      billing_cycle_anchor: 'unchanged', // Apply at end of period
      metadata: {
        tenantId,
        planId: newPlanId,
        downgradedAt: new Date().toISOString(),
      },
    }
  );

  // Note: Don't update tenant.planId yet - wait for webhook at period end

  return updatedSubscription;
}
```

---

## Feature Gating by Subscription {#feature-gating}

**CRITICAL:** Always check subscription status before allowing feature access.

### Backend Middleware

```typescript
// src/middleware/subscription.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function requireActiveSubscription(req: NextRequest) {
  const tenantId = req.headers.get('x-tenant-id');

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID required' }, { status: 401 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Allow trial and active subscriptions
  if (!['TRIALING', 'ACTIVE'].includes(tenant.subscriptionStatus)) {
    return NextResponse.json(
      {
        error: 'Subscription required',
        status: tenant.subscriptionStatus,
        subscriptionUrl: '/billing',
      },
      { status: 402 } // Payment Required
    );
  }

  // Check if subscription expired
  if (
    tenant.stripeCurrentPeriodEnd &&
    tenant.stripeCurrentPeriodEnd < new Date()
  ) {
    return NextResponse.json(
      { error: 'Subscription expired', subscriptionUrl: '/billing' },
      { status: 402 }
    );
  }

  return NextResponse.next();
}
```

### Feature Limit Checks

```typescript
// src/services/billing/limits.service.ts
import { prisma } from '@/lib/prisma';
import { PLANS, PlanId } from '@/lib/plans';

export async function checkFeatureLimit(
  tenantId: string,
  feature: keyof (typeof PLANS)['STARTER']['features']
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const plan = PLANS[tenant.planId as PlanId];
  const limit = plan.features[feature];

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1, current: 0 };
  }

  // Get current usage
  let current: number;

  switch (feature) {
    case 'projects':
      current = await prisma.project.count({
        where: { tenantId },
      });
      break;

    case 'users':
      current = await prisma.user.count({
        where: { tenantId },
      });
      break;

    case 'storage':
      // Assume stored in GB in usageThisMonth
      current = (tenant.usageThisMonth as any)?.storage || 0;
      break;

    case 'api_calls':
      current = (tenant.usageThisMonth as any)?.api_calls || 0;
      break;

    default:
      current = 0;
  }

  return {
    allowed: current < limit,
    limit,
    current,
  };
}

// Example usage in API endpoint
export async function createProject(tenantId: string, data: any) {
  const { allowed, limit, current } = await checkFeatureLimit(
    tenantId,
    'projects'
  );

  if (!allowed) {
    throw new Error(
      `Project limit reached. You have ${current}/${limit} projects. Upgrade your plan to create more.`
    );
  }

  // Create project...
}
```

### Frontend Hook

```typescript
// src/hooks/useSubscription.ts
import { useQuery } from '@tanstack/react-query';

export function useSubscription(tenantId: string) {
  return useQuery({
    queryKey: ['subscription', tenantId],
    queryFn: async () => {
      const res = await fetch(`/api/tenants/${tenantId}/subscription`);
      if (!res.ok) throw new Error('Failed to fetch subscription');
      return res.json();
    },
  });
}

export function useFeatureLimit(
  tenantId: string,
  feature: 'projects' | 'users' | 'storage' | 'api_calls'
) {
  return useQuery({
    queryKey: ['feature-limit', tenantId, feature],
    queryFn: async () => {
      const res = await fetch(
        `/api/tenants/${tenantId}/limits?feature=${feature}`
      );
      if (!res.ok) throw new Error('Failed to check limit');
      return res.json() as Promise<{
        allowed: boolean;
        limit: number;
        current: number;
      }>;
    },
  });
}

// Usage in component
function CreateProjectButton() {
  const { data: limit } = useFeatureLimit(tenantId, 'projects');

  if (!limit?.allowed) {
    return (
      <Button disabled>
        Project limit reached ({limit?.current}/{limit?.limit})
      </Button>
    );
  }

  return <Button onClick={createProject}>Create Project</Button>;
}
```

---

## Cancellation {#cancellation}

### Cancel at Period End

```typescript
// src/services/stripe/cancel.service.ts
export async function cancelSubscription(
  tenantId: string,
  immediate: boolean = false
) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant?.stripeSubscriptionId) {
    throw new Error('No active subscription');
  }

  if (immediate) {
    // Cancel immediately
    await stripe.subscriptions.cancel(tenant.stripeSubscriptionId);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: 'CANCELED',
      },
    });
  } else {
    // Cancel at end of period
    await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: 'CANCELED', // Will remain active until period end
      },
    });
  }
}
```

---

## Usage-Based Billing {#usage-based-billing}

### Metered Billing Setup

```typescript
// Create metered price in Stripe Dashboard or via API:
const meteredPrice = await stripe.prices.create({
  currency: 'usd',
  unit_amount: 10, // $0.10 per API call
  recurring: {
    interval: 'month',
    usage_type: 'metered',
  },
  product: 'prod_...', // Your product ID
});
```

### Track Usage

```typescript
// src/services/billing/usage.service.ts
export async function trackApiCall(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant?.stripeSubscriptionId) return;

  // Increment local counter
  const usage = (tenant.usageThisMonth as any) || {};
  usage.api_calls = (usage.api_calls || 0) + 1;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      usageThisMonth: usage,
    },
  });

  // Report to Stripe (batch these in production!)
  const subscription = await stripe.subscriptions.retrieve(
    tenant.stripeSubscriptionId
  );

  const meteredItem = subscription.items.data.find(
    (item) => item.price.recurring?.usage_type === 'metered'
  );

  if (meteredItem) {
    await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
      quantity: 1,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    });
  }
}
```

---

## Customer Portal {#customer-portal}

Stripe provides a hosted portal for customers to manage subscriptions:

```typescript
// src/app/api/billing-portal/route.ts
export async function POST(req: NextRequest) {
  const { tenantId } = await req.json();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant?.stripeCustomerId) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
```

---

## Edge Cases {#edge-cases}

### Failed Payments & Dunning

```typescript
// Stripe automatically retries failed payments (Smart Retries)
// Configure in Stripe Dashboard: Settings > Billing > Subscriptions and emails

// Listen to webhook events:
// - invoice.payment_failed (first failure)
// - customer.subscription.updated (status changes to past_due)
// - customer.subscription.deleted (after max retries)

// Send reminder emails on payment failure
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // ... existing code ...

  // Send email to customer
  await sendEmail({
    to: tenant.email,
    subject: 'Payment Failed - Action Required',
    template: 'payment-failed',
    data: {
      amount: invoice.amount_due / 100,
      retryDate: new Date(invoice.next_payment_attempt! * 1000),
      updatePaymentUrl: `${process.env.NEXT_PUBLIC_URL}/billing`,
    },
  });
}
```

### Refunds

```typescript
// src/services/stripe/refund.service.ts
export async function refundPayment(paymentIntentId: string, reason?: string) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason: reason as any, // 'duplicate' | 'fraudulent' | 'requested_by_customer'
  });

  // Log refund for audit trail
  await prisma.auditLog.create({
    data: {
      action: 'REFUND_CREATED',
      resourceType: 'PAYMENT',
      resourceId: paymentIntentId,
      metadata: {
        refundId: refund.id,
        amount: refund.amount,
        reason,
      },
    },
  });

  return refund;
}
```

### Tax Handling (Stripe Tax)

```typescript
// Enable Stripe Tax in Stripe Dashboard

// Update subscription creation
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  automatic_tax: {
    enabled: true,
  },
});

// Stripe automatically calculates tax based on customer location
```

### Proration

Stripe handles proration automatically:
- **Upgrade**: Charges prorated amount immediately
- **Downgrade**: Credits prorated amount, applies at next billing cycle

```typescript
// Upgrade (immediate proration charge)
proration_behavior: 'always_invoice'

// Downgrade (credit, no charge)
proration_behavior: 'none'
```

---

## Testing

### Test Mode

Use Stripe test mode for development:

```typescript
// .env.development
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Test Cards

```typescript
// Successful payment
4242 4242 4242 4242

// Payment fails
4000 0000 0000 0002

// Requires authentication (3D Secure)
4000 0025 0000 3155

// Insufficient funds
4000 0000 0000 9995
```

### Testing Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

### Integration Tests

```typescript
// tests/billing/subscription.test.ts
import { stripe } from '@/lib/stripe';
import { createSubscription } from '@/services/stripe/subscription.service';

describe('Subscription Creation', () => {
  it('should create subscription and update tenant', async () => {
    const tenantId = 'test_tenant';
    const planId = 'PRO';

    const subscription = await createSubscription(tenantId, planId, 0); // No trial

    expect(subscription.status).toBe('active');

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    expect(tenant?.stripeSubscriptionId).toBe(subscription.id);
    expect(tenant?.planId).toBe(planId);
  });
});
```

---

## Checklist

Before going live with billing:

- [ ] Stripe account activated (moved from test to live mode)
- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Webhook secret added to environment variables
- [ ] All subscription statuses handled (trialing, active, past_due, canceled)
- [ ] Email notifications configured (payment failed, trial ending, etc.)
- [ ] Customer portal link available in UI
- [ ] Feature limits enforced for all plans
- [ ] Proration working correctly (test upgrade/downgrade)
- [ ] Tax collection configured (Stripe Tax or manual)
- [ ] Refund process documented
- [ ] Invoice PDF generation working
- [ ] Audit logging enabled for all billing events
- [ ] Tested with all test cards
- [ ] Webhook event handling tested locally
- [ ] Integration tests passing

---

## Related Documentation

**Prerequisites:**
- `docs/09-saas-specific/saas-architecture.md` - Multi-tenancy patterns
- `docs/rules/security-privacy.md` - PII handling, GDPR compliance

**Related Topics:**
- `docs/09-saas-specific/user-management-rbac.md` - Plan-based permissions
- `docs/08-analytics/analytics.md` - Tracking subscription events
- `docs/rules/api-design.md` - Billing API endpoints

**Next Steps:**
- Set up billing dashboard UI
- Implement usage tracking for metered billing
- Configure email notifications for payment events

---

**Last Updated:** 2025-12-22
**Estimated Read Time:** 30 minutes
**Complexity:** Advanced
