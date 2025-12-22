# Compliance and Regulations

## Overview

Compliance means following laws and regulations for data privacy, security, and user rights. This document defines which regulations apply and how to comply.

**Rule**: Compliance is not optional. Fines are expensive. Privacy is a right.

---

## Which Regulations Apply to You?

### GDPR (General Data Protection Regulation)

**Applies if**:
- You have users in EU (European Union)
- You store data of EU citizens

**Cost of non-compliance**: Up to €20M or 4% of global revenue (whichever is higher)

### CCPA (California Consumer Privacy Act)

**Applies if**:
- You have users in California
- Your business has revenue > $25M/year
- OR you process data of 50,000+ California residents

**Cost of non-compliance**: $2,500-$7,500 per violation

### HIPAA (Health Insurance Portability and Accountability Act)

**Applies if**:
- You handle health/medical data
- You're a healthcare provider or work with one

**Cost of non-compliance**: $100-$50,000 per violation

### PCI DSS (Payment Card Industry Data Security Standard)

**Applies if**:
- You store, process, or transmit credit card data

**Cost of non-compliance**: $5,000-$100,000 per month + card network fines

### SOC 2 (Service Organization Control 2)

**Applies if**:
- You're a B2B SaaS selling to enterprises
- Customers ask for SOC 2 certification

**Cost**: $15,000-$50,000 (audit fees)

---

## Compliance Checklist by Regulation

### GDPR Compliance

**Required**:

#### 1. Privacy Policy

**Must include**:
- What data you collect (email, name, IP address, etc.)
- Why you collect it (provide service, analytics, marketing)
- How long you keep it (retention policy)
- Who has access (your team, third-party processors)
- User rights (access, delete, port data)
- Contact info for data protection officer (DPO)

**Template**:

```markdown
# Privacy Policy

## What Data We Collect
- Account info: Email, name, password (hashed)
- Usage data: Pages visited, features used
- Technical data: IP address, browser, device type

## Why We Collect It
- Provide service (account management, authentication)
- Improve product (analytics, bug tracking)
- Marketing (email newsletters - opt-in only)

## How Long We Keep It
- Active accounts: Until you delete your account
- Deleted accounts: 30 days (then permanently deleted)
- Logs: 90 days

## Who Has Access
- Our team (employees with legitimate need)
- Third-party processors: Railway (hosting), Better Stack (logging), PostHog (analytics)

## Your Rights (GDPR)
- Access: Request copy of your data (email privacy@yourapp.com)
- Delete: Request deletion of your data
- Port: Download your data in machine-readable format
- Object: Opt-out of marketing emails

## Contact
Data Protection Officer: privacy@yourapp.com

Last updated: 2025-01-20
```

**Required location**: `/privacy` page on your website

#### 2. Cookie Consent Banner

**Required if**: You use cookies (analytics, ads, session management)

**Implementation**:

```tsx
// components/CookieConsent.tsx
'use client';

import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
    // Enable analytics
    window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) };
  };

  const reject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShow(false);
    // Don't enable analytics
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          We use cookies to improve your experience. Read our{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
        <div className="flex gap-2">
          <button
            onClick={reject}
            className="px-4 py-2 border border-white rounded text-sm"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 bg-blue-600 rounded text-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Only enable analytics AFTER user accepts cookies.**

#### 3. Data Access Request (Subject Access Request)

**Users can request copy of their data**:

```typescript
// app/api/v1/data-export/route.ts
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all user data
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      posts: true,
      comments: true,
      sessions: true,
    },
  });

  // Remove sensitive data (password hash)
  const { passwordHash, ...userData } = user;

  // Return as JSON
  return Response.json(userData, {
    headers: {
      'Content-Disposition': 'attachment; filename="my-data.json"',
    },
  });
}
```

**UI**:

```tsx
// app/settings/privacy/page.tsx
export default function PrivacySettings() {
  const exportData = async () => {
    const response = await fetch('/api/v1/data-export');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-data.json';
    a.click();
  };

  return (
    <div>
      <h1>Privacy Settings</h1>
      <button onClick={exportData}>Download My Data</button>
    </div>
  );
}
```

**Required response time**: Within 30 days of request

#### 4. Right to Be Forgotten (Data Deletion)

**Users can request deletion of their data**:

```typescript
// app/api/v1/account/delete/route.ts
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Soft delete (mark as deleted, actually delete after 30 days)
  await prisma.user.update({
    where: { id: session.userId },
    data: {
      deletedAt: new Date(),
      email: `deleted-${session.userId}@deleted.com`, // Anonymize
      name: 'Deleted User',
    },
  });

  // Schedule hard delete in 30 days (cron job)
  // This gives users time to recover account if they change their mind

  return Response.json({ success: true });
}
```

**Cron job (hard delete after 30 days)**:

```typescript
// cron/cleanup-deleted-users.ts
import { prisma } from '@/lib/prisma';

export async function cleanupDeletedUsers() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Find users deleted > 30 days ago
  const usersToDelete = await prisma.user.findMany({
    where: {
      deletedAt: { lt: thirtyDaysAgo },
    },
  });

  // Permanently delete
  for (const user of usersToDelete) {
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`Permanently deleted user ${user.id}`);
  }
}

// Run daily via Railway cron
```

**Required response time**: Within 30 days of request

#### 5. Data Processing Agreement (DPA)

**Required with third-party services** (Railway, Better Stack, PostHog):

- Ensure they have DPA in place
- Check they're GDPR-compliant
- Use EU servers if possible (Railway EU region, Better Stack EU)

**Services we use**:
- Railway: GDPR-compliant, EU region available
- Better Stack: GDPR-compliant, EU servers
- PostHog: GDPR-compliant, EU Cloud available
- Plausible: GDPR-compliant by design (no cookies, EU servers)

---

### CCPA Compliance

**Required**:

#### 1. "Do Not Sell My Personal Information" Link

**Required on homepage and privacy policy**:

```tsx
// app/page.tsx (footer)
<footer>
  <a href="/privacy">Privacy Policy</a>
  <a href="/ccpa">Do Not Sell My Personal Information</a>
</footer>
```

#### 2. Opt-Out of Data Sale

**Implementation**:

```typescript
// app/api/v1/ccpa-opt-out/route.ts
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { optOutDataSale: true },
  });

  return Response.json({ success: true });
}
```

**Note**: If you don't sell user data (most SaaS don't), just state that in privacy policy:

```markdown
## Do We Sell Your Data?
No. We do not sell your personal information to third parties.
```

---

### PCI DSS Compliance

**Don't store credit card data yourself. Use Stripe.**

**Stripe handles PCI compliance for you**:
- Stripe Checkout: Fully PCI-compliant (Stripe hosts payment form)
- Stripe Elements: PCI-compliant (card data never touches your server)

**Your responsibility**:
- Use HTTPS (required)
- Don't log credit card data
- Don't store CVV codes

**See `docs/09-saas-specific/stripe-integration.md` for Stripe setup**

---

### SOC 2 Compliance

**Required for enterprise SaaS selling to large companies.**

**What SOC 2 audits**:
- Security controls (encryption, access control)
- Availability (uptime, disaster recovery)
- Confidentiality (data protection)
- Privacy (user data handling)

**Cost**: $15,000-$50,000 for initial audit

**When to get SOC 2**:
- Customers explicitly require it (usually enterprise deals > $50K/year)
- You're raising Series A+ funding
- You handle sensitive data (healthcare, financial)

**How to get SOC 2**:
1. Implement security controls (see `docs/rules/security-privacy.md`)
2. Hire SOC 2 auditor (Vanta, Drata automate this)
3. Pass audit (3-6 months)
4. Renew annually

**Tools to automate SOC 2**:
- **Vanta** ($3,000-15,000/year): Automates SOC 2 compliance
- **Drata** ($3,000-15,000/year): Automates SOC 2 compliance

**Recommendation**: Don't get SOC 2 until customers require it.

---

## Data Retention Policy

**How long to keep data**:

| Data Type | Retention | Why |
|-----------|-----------|-----|
| Active accounts | Until deleted | Provide service |
| Deleted accounts | 30 days | Allow recovery |
| Application logs | 90 days | Debugging, security |
| Analytics data | 24 months | Product insights |
| Backups | 90 days | Disaster recovery |
| Financial records | 7 years | Tax compliance |

**Implementation**:

```typescript
// cron/data-retention.ts
import { prisma } from '@/lib/prisma';

export async function enforceDataRetention() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Delete old logs
  await prisma.log.deleteMany({
    where: { createdAt: { lt: ninetyDaysAgo } },
  });

  // Delete old analytics events (24 months)
  const twentyFourMonthsAgo = new Date();
  twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);

  await prisma.analyticsEvent.deleteMany({
    where: { createdAt: { lt: twentyFourMonthsAgo } },
  });

  console.log('Data retention policy enforced');
}

// Run daily via Railway cron
```

---

## Compliance Checklist

Before launching:

### GDPR (if you have EU users)
- [ ] Privacy policy published at `/privacy`
- [ ] Cookie consent banner implemented
- [ ] Data export endpoint (`/api/v1/data-export`)
- [ ] Account deletion endpoint (`/api/v1/account/delete`)
- [ ] DPA with third-party services (Railway, Better Stack, etc.)
- [ ] Data processing logged (who accessed what, when)

### CCPA (if you have California users)
- [ ] "Do Not Sell" link in footer
- [ ] Opt-out mechanism implemented
- [ ] Privacy policy includes CCPA rights

### PCI DSS (if you handle payments)
- [ ] Using Stripe (don't store card data)
- [ ] HTTPS enforced
- [ ] No credit card data in logs

### SOC 2 (if selling to enterprise)
- [ ] Security controls implemented
- [ ] Access control (least privilege)
- [ ] Encryption at rest and in transit
- [ ] Disaster recovery plan
- [ ] Hire SOC 2 auditor (Vanta, Drata)

### General
- [ ] Data retention policy defined
- [ ] Automated data cleanup (cron jobs)
- [ ] Incident response plan (see `docs/06-operations/incident-management.md`)
- [ ] Data breach notification procedure (GDPR: 72 hours)

---

## Handling Data Breaches

**GDPR requires notifying within 72 hours**:

### Step 1: Contain Breach (Immediately)

```bash
# See docs/06-operations/disaster-recovery.md
# 1. Shut down compromised systems
# 2. Revoke credentials
# 3. Patch vulnerability
```

### Step 2: Assess Impact (Within 24 Hours)

```bash
# Determine:
# - What data was accessed? (names, emails, passwords?)
# - How many users affected?
# - When did breach occur?
# - How was it discovered?
```

### Step 3: Notify Authorities (Within 72 Hours)

**GDPR**: Report to supervisory authority
- UK: [ICO](https://ico.org.uk/for-organisations/report-a-breach/)
- EU: [Find your DPA](https://edpb.europa.eu/about-edpb/board/members_en)

**CCPA**: Report to California Attorney General (if > 500 California residents affected)

### Step 4: Notify Users (Within 72 Hours)

```typescript
// Email all affected users
const affectedUsers = await prisma.user.findMany({
  where: { id: { in: compromisedUserIds } },
});

for (const user of affectedUsers) {
  await sendEmail(user.email, {
    subject: 'Important Security Notice',
    body: `
      We detected unauthorized access to your account on ${breachDate}.

      Data potentially accessed:
      - ${dataTypes.join(', ')}

      Actions we've taken:
      - Fixed the vulnerability
      - Reset your password
      - Enabled additional monitoring

      Actions you should take:
      - Change your password immediately
      - Enable two-factor authentication
      - Review recent account activity

      We sincerely apologize for this incident.

      Contact us: security@yourapp.com
    `,
  });
}
```

### Step 5: Document Everything

```markdown
# Data Breach Report - [Date]

## Incident Summary
- Date discovered: [Date]
- Date occurred: [Date]
- Type of breach: Unauthorized access via SQL injection
- Systems affected: Production database

## Data Compromised
- User data: Names, email addresses
- Number of users: 1,245
- Sensitive data: No (passwords were hashed, no payment data stored)

## Root Cause
SQL injection vulnerability in `/api/v1/search` endpoint

## Remediation
- Patched vulnerability (deployed fix at 2:15 PM)
- Forced password reset for all users
- Implemented additional input validation
- Added WAF rules to block SQL injection

## Notifications
- Supervisory authority notified: [Date, Time]
- Users notified: [Date, Time]
- Public disclosure: [URL to blog post]

## Lessons Learned
- Implement Semgrep SAST in CI/CD (prevent SQL injection)
- Add rate limiting to API endpoints
- Increase security audit frequency

## Follow-up Actions
- [ ] Hire penetration tester (by [Date])
- [ ] Implement WAF (Cloudflare) (by [Date])
- [ ] Security training for engineers (by [Date])
```

**See `docs/06-operations/disaster-recovery.md` for full breach response**

---

## Summary

**Compliance requirements**:
- GDPR (EU users): Privacy policy, cookie consent, data export, deletion
- CCPA (California users): "Do Not Sell" opt-out
- PCI DSS (payments): Use Stripe, don't store card data
- SOC 2 (enterprise): Wait until customers require it ($15K-50K cost)

**Key actions**:
1. Publish privacy policy at `/privacy`
2. Implement cookie consent banner
3. Add data export + deletion endpoints
4. Use GDPR-compliant services (Railway EU, Better Stack EU, PostHog EU)
5. Define data retention policy (auto-delete old data)
6. Have data breach response plan (notify within 72 hours)

**Costs**:
- GDPR/CCPA compliance: $0 (DIY with templates above)
- SOC 2 audit: $15,000-$50,000 (only if customers require it)

**See Also**:
- `docs/rules/security-privacy.md` - Security best practices
- `docs/06-operations/disaster-recovery.md` - Data breach response
- `docs/06-operations/incident-management.md` - Incident handling

---

## Related Documentation

**Operations Topics**:
- [Monitoring](./monitoring.md) - Application and infrastructure monitoring
- [Backups](./backups.md) - Backup and recovery strategies
- [Security Testing](./security-testing.md) - Automated security scans
- [Penetration Testing](./penetration-testing.md) - Manual security audits
- [Incident Response](./incident-response.md) - Handling security incidents
- [Incident Management](./incident-management.md) - General incident handling
- [Compliance](./compliance.md) - GDPR, SOC 2, ISO 27001
- [Disaster Recovery](./disaster-recovery.md) - Business continuity planning
- [Cost Optimization](./cost-optimization.md) - Reducing infrastructure costs

**Core Rules**:
- [Security & Privacy](../rules/security-privacy.md) - Security requirements
- [Testing](../rules/testing.md) - Testing strategies

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)

