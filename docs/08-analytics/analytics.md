# Analytics and Product Insights

## Overview

This document defines analytics standards for both **marketing websites** and **SaaS product applications**. We use two specialized tools:

- **Plausible.io** - Privacy-first web analytics for marketing sites
- **PostHog** - Product analytics, feature flags, and session replay for SaaS apps

---

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **Two tools, two purposes**: Plausible for marketing site, PostHog for SaaS app (see [Tool Selection](#tool-selection))
- **Privacy-first**: GDPR compliant, cookieless analytics (see [Plausible](#plausible))
- **Track SaaS events**: User actions, feature usage, conversion funnels (see [PostHog](#posthog))
- **Session replay**: Record user sessions for debugging and UX improvement (see [PostHog](#posthog))
- **Feature flags**: A/B testing and gradual rollouts (see [PostHog](#posthog))

**Quick Example:**
```typescript
// GOOD - Track SaaS product events with PostHog
posthog.capture('project_created', {
  plan: user.subscription.plan,
  project_count: user.projects.length,
  team_size: user.team.members.length
});

// GOOD - Marketing site with Plausible (auto-tracks page views)
<Script src="https://plausible.io/js/script.js" data-domain="yourapp.com" />
```

**Tool Comparison:**
| Feature | Plausible | PostHog |
|---------|-----------|---------|
| **Use Case** | Marketing site | SaaS product |
| **Page views** | | |
| **Custom events** | Limited | Unlimited |
| **Session replay** | | |
| **Feature flags** | | |
| **A/B testing** | | |
| **Cost** | $9-19/mo | Free tier → $450/mo |

**Key Sections:**
- [Plausible Setup](#plausible) - Marketing site analytics implementation
- [PostHog Setup](#posthog) - SaaS product analytics, events, session replay
- [SaaS Analytics Patterns](#saas-patterns) - Onboarding, retention, churn tracking
- [Common Patterns](#common-patterns) - Dashboard widgets, custom reports

---

## Tool Selection: Plausible vs PostHog {#tool-selection}

### When to Use Plausible (Marketing Site Analytics)

**Use for**: Public marketing website (`yourapp.com`)

**Tracks**:
- Page views, visitors, bounce rate
- Traffic sources (Google, Twitter, referrals)
- Geographic distribution
- Device types (mobile, desktop, tablet)
- Landing page performance

**Example questions**:
- "How many people visited our pricing page?"
- "Which blog posts get the most traffic?"
- "Where do our visitors come from?"

**Cost**: $9-19/month (cloud)
**Privacy**: GDPR compliant, no cookies, EU-hosted option

### When to Use PostHog (SaaS Product Analytics)

**Use for**: SaaS application (`app.yourapp.com`)

**Tracks**:
- Feature usage and adoption
- User behavior funnels
- Conversion rates
- Custom events ("User exported report", "Team invited")
- Session replays
- A/B test results

**Example questions**:
- "What % of users complete onboarding?"
- "Which features do power users use most?"
- "Why did this user cancel?" (watch session replay)
- "Should we roll out this feature to everyone?" (A/B test)

**Cost**: Free tier (1M events/month - covers most startups), then $200-400/month
**Privacy**: Self-host option for complete data control

---

## Part 1: Plausible.io (Marketing Site Analytics) {#plausible}

### Overview

**Plausible** is a lightweight, privacy-first alternative to Google Analytics.

**Key Features**:
- GDPR compliant (no cookie banner needed)
- Open source (can self-host)
- Simple, fast, lightweight (<  1KB script)
- Real-time dashboard
- EU data hosting available

### Setup

#### 1. Create Account

1. Sign up at https://plausible.io/
2. Choose plan:
   - **Starter** ($9/month): 10K visitors/month
   - **Growth** ($19/month): 100K visitors/month
3. Add your domain (e.g., `yourapp.com`)

#### 2. Install Tracking Script

**Next.js 15 (App Router)**:

```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === 'production' && (
          <Script
            defer
            data-domain="yourapp.com"
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Alternative - Self-hosted script**:
```typescript
<Script
  defer
  data-domain="yourapp.com"
  src="https://analytics.yourapp.com/js/script.js"
/>
```

#### 3. Track Custom Events (Optional)

Track specific actions like "Sign Up Clicked" or "Pricing Viewed":

```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, props?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props });
  }
};

// components/PricingButton.tsx
'use client';

import { trackEvent } from '@/lib/analytics';

export function PricingButton() {
  const handleClick = () => {
    trackEvent('Pricing CTA Clicked', {
      location: 'homepage',
      plan: 'pro'
    });
  };

  return <button onClick={handleClick}>View Pricing</button>;
}
```

**TypeScript types**:
```typescript
// types/plausible.d.ts
interface Window {
  plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
}
```

### Key Metrics to Track

**Traffic Metrics**:
- Unique visitors
- Total page views
- Bounce rate
- Visit duration

**Acquisition**:
- Traffic sources (Direct, Google, Twitter, etc.)
- Referrers
- UTM campaigns

**Engagement**:
- Top pages
- Entry pages
- Exit pages

**Audience**:
- Countries/regions
- Device types (mobile, desktop, tablet)
- Browser/OS

### Custom Goals

Configure goals in Plausible dashboard:

1. **Pageview Goals**:
   - `/pricing` visited
   - `/signup` visited
   - `/blog/*` visited

2. **Custom Event Goals**:
   - `Sign Up Clicked`
   - `Demo Requested`
   - `Pricing CTA Clicked`

### Privacy & GDPR Compliance

Plausible is GDPR compliant by design:

- No cookies used
- No personal data collected
- Anonymous metrics only
- EU hosting available
- No cookie banner needed

**Data retention**: 2 years by default

---

## Part 2: PostHog (SaaS Product Analytics) {#posthog}

### Overview

**PostHog** is an all-in-one platform for product analytics, feature flags, session replay, and A/B testing.

**Key Features**:
- Product analytics (events, funnels, cohorts)
- Feature flags
- Session replay
- A/B testing
- Self-hosting option (complete data control)
- Open source

### Setup

#### 1. Create Account

1. Sign up at https://posthog.com/
2. Choose deployment:
   - **PostHog Cloud** (recommended): Hosted by PostHog
   - **Self-hosted**: Deploy to your infrastructure (privacy-first)

3. Free tier: 1M events/month (sufficient for most early-stage startups)

#### 2. Install SDKs

**Next.js (Web App)**:

```bash
npm install posthog-js
```

```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
    capture_pageview: false, // We'll capture manually
  });
}

export { posthog };
```

```typescript
// app/providers.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { posthog } from '@/lib/posthog';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

// app/layout.tsx
import { PostHogProvider } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
```

**NestJS (Backend)**:

```bash
npm install posthog-node
```

```typescript
// src/analytics/posthog.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PostHog } from 'posthog-node';

@Injectable()
export class PostHogService implements OnModuleInit {
  private client: PostHog;

  onModuleInit() {
    this.client = new PostHog(
      process.env.POSTHOG_API_KEY!,
      { host: process.env.POSTHOG_HOST || 'https://app.posthog.com' }
    );
  }

  capture(userId: string, event: string, properties?: Record<string, any>) {
    this.client.capture({
      distinctId: userId,
      event,
      properties,
    });
  }

  identify(userId: string, properties?: Record<string, any>) {
    this.client.identify({
      distinctId: userId,
      properties,
    });
  }

  async shutdown() {
    await this.client.shutdown();
  }
}
```

**React Native/Expo**:

```bash
npm install posthog-react-native expo-file-system expo-application expo-device expo-localization
```

```typescript
// lib/posthog.ts
import PostHog from 'posthog-react-native';

export const posthog = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_KEY!,
  {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  }
);

// App.tsx
import { posthog } from './lib/posthog';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    posthog.screen('HomeScreen');
  }, []);

  return <YourApp />;
}
```

#### 3. Identify Users

When a user signs in, identify them:

```typescript
// After successful login
import { posthog } from '@/lib/posthog';

posthog.identify(
  user.id, // Unique user ID
  {
    email: user.email,
    name: user.name,
    plan: user.plan,
    created_at: user.createdAt,
  }
);
```

#### 4. Track Custom Events

Track important user actions:

```typescript
// Export feature
posthog.capture('Report Exported', {
  reportType: 'sales',
  format: 'pdf',
  dateRange: '30days',
});

// Invite team member
posthog.capture('Team Member Invited', {
  role: 'admin',
  method: 'email',
});

// Feature adopted
posthog.capture('Feature Used', {
  featureName: 'advanced-filters',
  firstTime: true,
});
```

### Key Metrics to Track

**Activation Metrics**:
- User signed up
- Email verified
- Onboarding completed
- First project created
- First action taken

**Engagement Metrics**:
- Daily active users (DAU)
- Weekly active users (WAU)
- Feature usage by type
- Session duration
- Actions per session

**Retention Metrics**:
- Day 1, 7, 30 retention
- Cohort analysis
- Churn rate

**Conversion Metrics**:
- Free to paid conversion
- Trial to paid conversion
- Upgrade rate
- Funnel completion

### Creating Funnels

Track multi-step processes:

```typescript
// Example: Onboarding funnel
// Step 1: User signs up
posthog.capture('User Signed Up', {
  method: 'email',
  plan: 'trial',
});

// Step 2: Email verified
posthog.capture('Email Verified');

// Step 3: Profile completed
posthog.capture('Profile Completed', {
  hasAvatar: true,
  hasCompany: true,
});

// Step 4: First project created
posthog.capture('First Project Created');
```

In PostHog dashboard:
1. Go to Insights → Funnels
2. Add steps: "User Signed Up" → "Email Verified" → "Profile Completed" → "First Project Created"
3. See conversion rate at each step

### Session Replay

Enable session replay to watch user sessions:

```typescript
// Enable in posthog.init()
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: 'https://app.posthog.com',
  session_recording: {
    recordCrossOriginIframes: true,
    // Mask sensitive data
    maskAllInputs: true,
    maskTextSelector: '[data-sensitive]',
  },
});
```

**When to watch replays**:
- User reported a bug (find their session, watch what happened)
- User churned (see their last session, what went wrong)
- Low conversion (watch users who drop off in funnel)

**Privacy**: Mask sensitive data with `data-sensitive` attribute:
```tsx
<input type="email" data-sensitive />
<div data-sensitive>{user.creditCard}</div>
```

### Feature Flags

Roll out features gradually:

```typescript
// Check if feature is enabled for user
const showNewDashboard = posthog.isFeatureEnabled('new-dashboard');

if (showNewDashboard) {
  return <NewDashboard />;
} else {
  return <OldDashboard />;
}
```

**In PostHog dashboard**:
1. Go to Feature Flags
2. Create flag: `new-dashboard`
3. Roll out:
   - 10% of users (canary)
   - Specific users (beta testers)
   - Specific cohorts (power users)
   - 100% (full launch)

### A/B Testing

Test variants:

```typescript
const variant = posthog.getFeatureFlag('pricing-test');

if (variant === 'monthly-first') {
  return <PricingMonthlyFirst />;
} else if (variant === 'annual-first') {
  return <PricingAnnualFirst />;
} else {
  return <PricingDefault />;
}
```

Track conversion:
```typescript
posthog.capture('Pricing Plan Selected', {
  variant: variant,
  plan: 'pro',
  billing: 'annual',
});
```

Analyze in PostHog → Experiments.

### Privacy & GDPR Compliance

**PostHog Cloud**:
- Data stored in US (default) or EU (optional)
- GDPR compliant
- Cookie consent may be required (check local laws)

**PostHog Self-Hosted** (recommended for maximum privacy):
- Complete data control
- Host on your infrastructure
- No data sent to third parties
- GDPR compliant by design

**User data deletion**:
```typescript
// Delete all data for a user
posthog.capture('$delete_user', {
  distinctId: user.id,
});
```

---

## Integration: Plausible + PostHog

For a complete SaaS product:

| Site | Tool | Purpose | Cost |
|------|------|---------|------|
| `yourapp.com` (Marketing) | Plausible | Web analytics, traffic sources | $9-19/month |
| `app.yourapp.com` (SaaS) | PostHog | Product analytics, feature flags, session replay | Free (< 1M events) |
| **Total** | | | **$9-19/month** |

---

## Common Patterns {#common-patterns}

### Pattern 1: Track User Lifecycle

```typescript
// 1. User signs up
posthog.capture('User Signed Up', { method: 'google' });
posthog.identify(user.id, {
  email: user.email,
  createdAt: user.createdAt,
  plan: 'trial',
});

// 2. User verifies email
posthog.capture('Email Verified');

// 3. User completes onboarding
posthog.capture('Onboarding Completed', {
  steps_completed: 5,
  time_taken: 120, // seconds
});

// 4. User performs first action
posthog.capture('First Action Taken', {
  action_type: 'create_project',
});

// 5. User upgrades to paid
posthog.capture('Converted to Paid', {
  from_plan: 'trial',
  to_plan: 'pro',
  billing: 'annual',
});
```

### Pattern 2: Track Feature Adoption

```typescript
// When user first uses a feature
const useFeature = (featureName: string) => {
  const hasUsedBefore = checkLocalStorage(featureName);

  if (!hasUsedBefore) {
    posthog.capture('Feature First Used', {
      feature: featureName,
      daysAfterSignup: getDaysSinceSignup(),
    });
    saveToLocalStorage(featureName);
  }

  posthog.capture('Feature Used', {
    feature: featureName,
  });
};
```

### Pattern 3: Error Tracking in Analytics

```typescript
// Track errors that don't crash the app
try {
  await exportReport();
} catch (error) {
  posthog.capture('Export Failed', {
    error_message: error.message,
    report_type: 'sales',
    user_plan: user.plan,
  });

  // Also log to Better Stack
  logger.error('Export failed', { ... });
}
```

---

## SaaS-Specific Analytics Patterns {#saas-patterns}

### Event Taxonomy for SaaS

**CRITICAL:** Use standardized event names across your application for consistency.

#### Authentication & Account Events

```typescript
// User signup
posthog.capture('User Signed Up', {
  method: 'email' | 'google' | 'github',
  plan: 'starter' | 'pro' | 'enterprise',
  trial_days: 14,
});

// User login
posthog.capture('User Logged In', {
  method: 'email' | 'sso' | 'magic_link',
});

// Email verification
posthog.capture('Email Verified', {
  time_to_verify: 300, // seconds
});

// Password reset
posthog.capture('Password Reset Requested');
posthog.capture('Password Reset Completed');
```

#### Subscription & Billing Events

```typescript
// Trial started (automatic on signup)
posthog.capture('Trial Started', {
  plan: 'pro',
  trial_days: 14,
  trial_end_date: '2025-02-01',
});

// Trial ending soon (triggered by cron)
posthog.capture('Trial Ending Soon', {
  days_remaining: 3,
  has_payment_method: false,
});

// Subscription created
posthog.capture('Subscription Created', {
  plan: 'pro',
  billing_interval: 'monthly' | 'annual',
  amount: 99,
  currency: 'usd',
  stripe_subscription_id: 'sub_...',
});

// Plan upgraded
posthog.capture('Plan Upgraded', {
  from_plan: 'starter',
  to_plan: 'pro',
  prorated_amount: 50,
});

// Plan downgraded
posthog.capture('Plan Downgraded', {
  from_plan: 'pro',
  to_plan: 'starter',
  effective_date: '2025-02-01', // end of period
});

// Subscription canceled
posthog.capture('Subscription Canceled', {
  plan: 'pro',
  reason: 'too_expensive' | 'not_using' | 'switching_competitor' | 'other',
  cancellation_type: 'immediate' | 'end_of_period',
  had_subscription_for_days: 45,
});

// Payment failed
posthog.capture('Payment Failed', {
  plan: 'pro',
  amount: 99,
  failure_reason: 'insufficient_funds',
  retry_count: 1,
});

// Payment succeeded
posthog.capture('Payment Succeeded', {
  plan: 'pro',
  amount: 99,
  is_first_payment: false,
});
```

#### Multi-Tenant Events

```typescript
// Tenant (organization) created
posthog.capture('Tenant Created', {
  tenant_id: 'tenant_123',
  tenant_name: 'Acme Corp',
  plan: 'pro',
  created_by_user_id: 'user_456',
});

// User invited to tenant
posthog.capture('User Invited to Tenant', {
  tenant_id: 'tenant_123',
  tenant_name: 'Acme Corp',
  invited_user_email: 'newuser@example.com',
  role: 'member',
  invited_by_user_id: 'user_456',
});

// Invitation accepted
posthog.capture('Invitation Accepted', {
  tenant_id: 'tenant_123',
  role: 'member',
  time_to_accept: 3600, // seconds
});

// User role changed
posthog.capture('User Role Changed', {
  tenant_id: 'tenant_123',
  user_id: 'user_789',
  from_role: 'member',
  to_role: 'manager',
  changed_by: 'user_456',
});
```

#### Feature Usage Events

```typescript
// Feature first used
posthog.capture('Feature First Used', {
  feature: 'advanced_filters',
  days_since_signup: 7,
  user_plan: 'pro',
});

// Feature used
posthog.capture('Feature Used', {
  feature: 'export_report',
  export_format: 'pdf',
  report_type: 'sales',
});

// Feature limit reached
posthog.capture('Feature Limit Reached', {
  feature: 'projects',
  limit: 5,
  current_count: 5,
  plan: 'starter',
  upgrade_prompt_shown: true,
});

// Feature unavailable (plan restriction)
posthog.capture('Feature Unavailable', {
  feature: 'api_access',
  required_plan: 'enterprise',
  current_plan: 'pro',
  upgrade_prompt_shown: true,
});
```

#### Onboarding Events

```typescript
// Onboarding started
posthog.capture('Onboarding Started');

// Onboarding step completed
posthog.capture('Onboarding Step Completed', {
  step: 'profile_setup',
  step_number: 1,
  total_steps: 5,
});

// Onboarding completed
posthog.capture('Onboarding Completed', {
  total_steps: 5,
  time_taken: 300, // seconds
  skipped_steps: ['team_invite'], // optional steps skipped
});

// Onboarding abandoned
posthog.capture('Onboarding Abandoned', {
  last_step_completed: 'profile_setup',
  steps_remaining: 4,
});
```

### Tenant-Level vs User-Level Analytics

**CRITICAL:** Track both individual user actions AND tenant-level aggregates for multi-tenant SaaS.

#### User-Level Tracking

```typescript
// Identify individual user
posthog.identify(user.id, {
  email: user.email,
  name: user.name,
  created_at: user.createdAt,

  // Current tenant context
  current_tenant_id: tenant.id,
  current_tenant_name: tenant.name,
  current_role: membership.role,

  // User-level attributes
  total_tenants: 3, // user is member of 3 organizations
  primary_tenant_id: 'tenant_123',
});

// Track user action with tenant context
posthog.capture('Report Created', {
  // User context (automatic)
  user_id: user.id,

  // Tenant context (CRITICAL for multi-tenant analytics)
  tenant_id: tenant.id,
  tenant_name: tenant.name,
  tenant_plan: tenant.plan,

  // Action details
  report_type: 'sales',
  report_name: 'Q1 Sales',
});
```

#### Tenant-Level Tracking

```typescript
// Identify tenant as a "group" in PostHog
posthog.group('tenant', tenant.id, {
  name: tenant.name,
  plan: tenant.plan,
  mrr: 99, // monthly recurring revenue
  seats_used: 5,
  seats_limit: 10,
  storage_used_gb: 25,
  storage_limit_gb: 100,
  created_at: tenant.createdAt,
  subscription_status: 'active',
});

// Track tenant-level events
posthog.capture('Tenant Upgraded', {
  $groups: { tenant: tenant.id },
  from_plan: 'starter',
  to_plan: 'pro',
  seat_increase: 5,
});

// Query tenant metrics in PostHog
// Go to Insights → Filter by group "tenant" → See aggregate metrics
```

#### Tracking Both Levels Simultaneously

```typescript
// src/lib/analytics.ts
export function trackEvent(
  eventName: string,
  properties: Record<string, any> = {}
) {
  const user = getCurrentUser();
  const tenant = getCurrentTenant();

  posthog.capture(eventName, {
    ...properties,

    // Always include tenant context
    tenant_id: tenant?.id,
    tenant_name: tenant?.name,
    tenant_plan: tenant?.plan,

    // Always include user role
    user_role: user?.role,

    // PostHog groups for tenant-level aggregation
    $groups: tenant ? { tenant: tenant.id } : undefined,
  });
}

// Usage
trackEvent('Report Exported', {
  report_type: 'sales',
  export_format: 'pdf',
});
// This automatically includes tenant_id, tenant_plan, user_role
```

### Subscription Analytics

**Track SaaS metrics critical for business health.**

#### MRR (Monthly Recurring Revenue) Tracking

```typescript
// Track when MRR changes
export async function trackMRRChange(
  tenantId: string,
  oldMRR: number,
  newMRR: number,
  reason: string
) {
  const change = newMRR - oldMRR;

  posthog.capture('MRR Changed', {
    $groups: { tenant: tenantId },
    old_mrr: oldMRR,
    new_mrr: newMRR,
    mrr_change: change,
    reason, // 'upgrade' | 'downgrade' | 'churn' | 'new_subscription'
  });

  // Update tenant group properties
  posthog.group('tenant', tenantId, {
    mrr: newMRR,
  });
}

// Call this on subscription changes
// Upgrade: trackMRRChange(tenantId, 29, 99, 'upgrade')
// Downgrade: trackMRRChange(tenantId, 99, 29, 'downgrade')
// Churn: trackMRRChange(tenantId, 99, 0, 'churn')
```

#### Churn Tracking

```typescript
// When subscription is canceled
posthog.capture('Customer Churned', {
  $groups: { tenant: tenantId },
  tenant_id: tenantId,
  plan: 'pro',
  mrr_lost: 99,
  lifetime_value: 450, // total revenue from this customer
  customer_lifetime_days: 150,
  churn_reason: 'too_expensive',
  had_active_users_last_30_days: 2,
});

// Track churn signals BEFORE they churn
posthog.capture('Churn Signal Detected', {
  $groups: { tenant: tenantId },
  signal_type: 'low_engagement', // or 'payment_failed', 'support_ticket'
  last_active_days_ago: 14,
  feature_usage_decline: 60, // percentage
});
```

#### Lifetime Value (LTV) Tracking

```typescript
// Update LTV whenever payment succeeds
export async function updateCustomerLTV(tenantId: string, payment: number) {
  const tenant = await getTenant(tenantId);
  const newLTV = (tenant.lifetimeValue || 0) + payment;

  await updateTenant(tenantId, { lifetimeValue: newLTV });

  posthog.group('tenant', tenantId, {
    lifetime_value: newLTV,
    total_payments: tenant.totalPayments + 1,
  });
}
```

### Product Analytics Patterns for SaaS

#### Activation Metrics

```typescript
// Define activation milestone
const ACTIVATION_CRITERIA = {
  email_verified: true,
  profile_completed: true,
  first_project_created: true,
  invited_team_member: true,
};

// Track activation milestone reached
export async function checkActivation(userId: string) {
  const user = await getUser(userId);
  const criteria = ACTIVATION_CRITERIA;

  const activated = Object.entries(criteria).every(([key, required]) => {
    return !required || user[key];
  });

  if (activated && !user.activatedAt) {
    posthog.capture('User Activated', {
      days_to_activation: getDaysSince(user.createdAt),
      activation_criteria: Object.keys(criteria),
    });

    await updateUser(userId, { activatedAt: new Date() });
  }
}
```

#### Retention Cohorts

```typescript
// Create cohorts in PostHog dashboard:
// - Cohort "Activated Users": Users who triggered "User Activated" event
// - Cohort "Power Users": Users with "Feature Used" count > 50 in last 30 days
// - Cohort "Trial Users": Users with property "plan" = "trial"
// - Cohort "At Risk": Users with "last_active" > 14 days ago

// Track retention by cohort
// In PostHog → Insights → Retention
// Select cohort → See day 1, 7, 30 retention rates
```

#### Feature Adoption Funnel

```typescript
// Track feature discovery → try → adopt funnel
posthog.capture('Feature Discovered', {
  feature: 'advanced_filters',
  discovered_via: 'tooltip' | 'onboarding' | 'menu',
});

posthog.capture('Feature Attempted', {
  feature: 'advanced_filters',
  successful: true,
});

posthog.capture('Feature Adopted', {
  feature: 'advanced_filters',
  usage_count: 10, // After 10 uses, consider "adopted"
  days_since_discovery: 7,
});

// In PostHog → Create funnel:
// "Feature Discovered" → "Feature Attempted" → "Feature Adopted"
// See conversion rate at each step
```

### Dashboard Examples

#### Executive Dashboard (PostHog)

Create insights for:
```typescript
// 1. MRR Trend (over time)
// Event: "Payment Succeeded" → Sum of "amount" → Trend over 12 months

// 2. Churn Rate
// Event: "Customer Churned" → Count unique tenants → Percentage of active tenants

// 3. Trial → Paid Conversion
// Funnel: "Trial Started" → "Subscription Created" → Conversion rate

// 4. New Signups (by plan)
// Event: "User Signed Up" → Count → Breakdown by "plan"

// 5. Feature Adoption
// Event: "Feature First Used" → Count unique users → Breakdown by "feature"
```

#### Product Dashboard

```typescript
// 1. Daily Active Users (DAU)
// Event: Any event → Count unique users → Last 30 days

// 2. Activation Rate
// Event: "User Activated" → Count → Divided by "User Signed Up" count

// 3. Top Features (by usage)
// Event: "Feature Used" → Count → Breakdown by "feature" → Last 7 days

// 4. Onboarding Completion Rate
// Funnel: "Onboarding Started" → "Onboarding Completed" → Conversion rate

// 5. Session Duration (avg)
// Event: "$pageview" → Session duration → Average → Last 7 days
```

### Privacy Considerations for SaaS

#### PII Masking

```typescript
// DON'T track PII in event properties
posthog.capture('User Updated Email', {
  email: user.email, // BAD - exposes PII
});

// DO use hashed IDs or boolean flags
posthog.capture('User Updated Email', {
  email_domain: extractDomain(user.email), // GOOD - "gmail.com"
  changed_email: true,
});
```

#### Tenant Data Isolation

```typescript
// Ensure tenant context is ALWAYS included
export function trackEvent(event: string, props: Record<string, any>) {
  const tenantId = getCurrentTenantId();

  if (!tenantId) {
    console.error('Cannot track event without tenant context');
    return;
  }

  posthog.capture(event, {
    ...props,
    tenant_id: tenantId, // CRITICAL: Always include
    $groups: { tenant: tenantId },
  });
}

// This prevents cross-tenant data leakage in analytics
```

#### GDPR Compliance

```typescript
// When user requests data deletion
export async function deleteUserData(userId: string) {
  // Delete from PostHog
  posthog.capture('$delete_user', {
    distinctId: userId,
  });

  // Delete from database
  await deleteUserFromDatabase(userId);

  // Log for audit trail
  console.log(`User ${userId} data deleted (GDPR request)`);
}

// When tenant is deleted
export async function deleteTenantData(tenantId: string) {
  // Delete all tenant members
  const members = await getTenantMembers(tenantId);
  for (const member of members) {
    await deleteUserData(member.userId);
  }

  // Delete tenant group from PostHog
  // (PostHog will automatically delete group data after 30 days)

  await deleteTenantFromDatabase(tenantId);
}
```

---

## Analytics Checklist

Before production:

### Plausible (Marketing Site)
- [ ] Plausible account created
- [ ] Tracking script installed on all marketing pages
- [ ] Custom events configured for key actions (CTAs, form submissions)
- [ ] Goals configured in dashboard
- [ ] Team members have dashboard access

### PostHog (SaaS App)
- [ ] PostHog account created (Cloud or self-hosted)
- [ ] SDK installed in web, backend, mobile apps
- [ ] User identification implemented (on login)
- [ ] Tenant groups configured (for tenant-level analytics)
- [ ] Key events tracked (signup, onboarding, feature usage, conversion)
- [ ] **SaaS event taxonomy implemented** (subscription, billing, multi-tenant events)
- [ ] Tenant context included in ALL events (`tenant_id`, `$groups`)
- [ ] MRR tracking configured (on subscription changes)
- [ ] Churn tracking configured (with churn signals)
- [ ] Activation criteria defined and tracked
- [ ] Funnels created for important flows (onboarding, trial→paid, feature adoption)
- [ ] Cohorts created (activated users, power users, trial users, at-risk users)
- [ ] Session replay enabled (with sensitive data masked)
- [ ] Feature flags configured
- [ ] Dashboard created (Executive: MRR, churn, conversions; Product: DAU, activation, features)
- [ ] PII masking verified (no emails, names in event properties)
- [ ] GDPR data deletion flow implemented
- [ ] Team members have dashboard access

---

## Cost Summary

| Tool | Plan | Cost | What You Get |
|------|------|------|--------------|
| **Plausible** | Growth | $19/month | 100K visitors/month, unlimited sites |
| **PostHog** | Free tier | $0/month | 1M events/month (covers 90% of startups) |
| **PostHog** | Paid | $200-400/month | 5-10M events/month, unlimited replays |

**Recommended starting budget**: $19/month (Plausible) + $0/month (PostHog free tier) = **$19/month**

---

## Summary

Use **two specialized tools** for comprehensive analytics:

1. **Plausible** (Marketing site):
   - Privacy-first web analytics
   - GDPR compliant, no cookies
   - Track traffic, sources, engagement
   - Cost: $9-19/month

2. **PostHog** (SaaS product):
   - Product analytics, feature flags, session replay
   - Self-hosting option for privacy
   - Track user behavior, funnels, retention
   - Cost: Free tier (1M events/month), then $200-400/month

**Total cost**: $9-19/month to start (90% use PostHog free tier)

---

## Related Documentation

**Prerequisites:**
- `docs/09-saas-specific/saas-architecture.md` - Multi-tenancy context for analytics
- `docs/09-saas-specific/subscription-billing.md` - Subscription events to track

**Related Topics:**
- `docs/04-frontend/user-feedback.md` - Collecting qualitative feedback
- `docs/04-frontend/ux-research.md` - UX research methods
- `docs/rules/security-privacy.md` - GDPR compliance, PII handling

**Next Steps:**
- Implement event tracking in subscription billing flows
- Set up tenant-level analytics dashboards
- Configure churn detection alerts

---

**Last Updated:** 2025-12-22
**Estimated Read Time:** 35 minutes
**Complexity:** Intermediate
