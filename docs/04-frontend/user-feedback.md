# User Feedback Collection

## Overview

User feedback tells you what's working and what's broken. This document defines how to collect, analyze, and act on feedback to improve your product.

**Rule**: Build feedback loops into your product from Day 1.

---

## Why User Feedback Matters

**Without feedback, you're flying blind**:
- You don't know what users love (do more of it)
- You don't know what users hate (fix it)
- You waste time building features nobody wants
- You miss critical bugs

**With feedback**:
- Ship features users actually want
- Fix the most painful bugs first
- Understand why users churn
- Improve retention and growth

---

## Types of Feedback

### 1. Active Feedback (Users Tell You)

**Methods**:
- In-app feedback widgets
- Support tickets
- Feature requests
- Bug reports
- Surveys (NPS, CSAT, exit surveys)
- User interviews
- Social media comments

**Pros**: Detailed, specific issues
**Cons**: Only captures vocal minority

### 2. Passive Feedback (You Observe)

**Methods**:
- Session replays (PostHog)
- Analytics (page views, feature usage)
- Error tracking (Better Stack)
- Churn analysis (who left and when)
- A/B test results

**Pros**: Captures everyone's behavior
**Cons**: Doesn't tell you "why"

**Best approach**: Use both. Combine what users say with what users do.

---

## Feedback Collection Methods

### 1. In-App Feedback Widget

**Use for**: Quick feedback without leaving the app

**Implementation**:

**Option A: Simple Feedback Button (Free)**

```tsx
// components/FeedbackButton.tsx
'use client';

import { useState } from 'react';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    await fetch('/api/v1/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedback,
        email,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });
    setSubmitted(true);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700"
      >
        Feedback
      </button>
    );
  }

  if (submitted) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md">
        <p className="font-semibold">Thanks for your feedback!</p>
        <button onClick={() => setIsOpen(false)} className="mt-2 text-blue-600">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md">
      <h3 className="font-semibold mb-2">Send Feedback</h3>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full border rounded p-2 mb-2"
        rows={4}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email (optional)"
        className="w-full border rounded p-2 mb-2"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
```

**Backend**:

```typescript
// app/api/v1/feedback/route.ts
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { feedback, email, url, userAgent } = await request.json();

  // Save to database
  await prisma.feedback.create({
    data: {
      feedback,
      email,
      url,
      userAgent,
      createdAt: new Date(),
    },
  });

  // Send email notification
  await sendEmail({
    to: 'team@yourapp.com',
    subject: 'New Feedback',
    body: `
      Feedback: ${feedback}
      Email: ${email || 'Anonymous'}
      URL: ${url}
    `,
  });

  return Response.json({ success: true });
}
```

**Database Schema**:

```prisma
model Feedback {
  id        String   @id @default(cuid())
  feedback  String
  email     String?
  url       String
  userAgent String
  createdAt DateTime @default(now())
}
```

**Option B: Third-Party Widgets** (if you need more features)

- **Canny** ($50-400/month): Feedback boards, roadmap, changelogs
- **UserVoice** ($699+/month): Enterprise feedback management
- **Hotjar** ($0-80/month): Feedback + session replays

**Recommendation**: Start with Option A (free, simple). Upgrade to Canny when you have 100+ users.

---

### 2. Feature Request Board

**Use for**: Collecting and prioritizing feature ideas

**Implementation**:

**Option A: Simple Airtable/Notion (Free)**

1. Create Airtable base with columns:
   - Feature name
   - Description
   - Status (Requested → Planned → In Progress → Shipped)
   - Votes (number of users who want it)
   - Priority (High/Medium/Low)

2. Embed public view in your app:
   ```tsx
   <iframe
     src="https://airtable.com/embed/[YOUR_SHARED_VIEW_ID]"
     width="100%"
     height="600px"
   />
   ```

**Option B: Canny (Paid, $50+/month)**

- Public roadmap
- User voting
- Changelog
- Admin dashboard

**Option C: Build Your Own**

```tsx
// app/features/page.tsx
export default async function FeaturesPage() {
  const features = await prisma.featureRequest.findMany({
    orderBy: { votes: 'desc' },
  });

  return (
    <div>
      <h1>Feature Requests</h1>
      {features.map((feature) => (
        <div key={feature.id} className="border p-4 mb-4 rounded">
          <h3>{feature.name}</h3>
          <p>{feature.description}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => vote(feature.id)}>
              ⬆ Upvote ({feature.votes})
            </button>
            <span className={`badge ${feature.status}`}>{feature.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### 3. Surveys (NPS, CSAT, Exit Surveys)

**NPS (Net Promoter Score)**: "How likely are you to recommend us?"

**When to ask**: After 30 days of usage

**Implementation**:

```tsx
// components/NPSSurvey.tsx
'use client';

import { useState } from 'react';

export function NPSSurvey() {
  const [score, setScore] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    await fetch('/api/v1/nps', {
      method: 'POST',
      body: JSON.stringify({ score, reason }),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return <p>Thanks for your feedback!</p>;
  }

  return (
    <div className="bg-blue-50 p-6 rounded-lg">
      <h3 className="font-semibold mb-4">
        How likely are you to recommend us to a friend? (0-10)
      </h3>
      <div className="flex gap-2 mb-4">
        {[...Array(11)].map((_, i) => (
          <button
            key={i}
            onClick={() => setScore(i)}
            className={`px-3 py-2 border rounded ${
              score === i ? 'bg-blue-600 text-white' : 'bg-white'
            }`}
          >
            {i}
          </button>
        ))}
      </div>
      {score !== null && (
        <>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="What's the main reason for your score?"
            className="w-full border rounded p-2 mb-2"
            rows={3}
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
}
```

**When to show**:

```typescript
// Show NPS survey after 30 days of usage
const user = await prisma.user.findUnique({ where: { id } });
const daysSinceSignup = Math.floor(
  (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
);

if (daysSinceSignup === 30 && !user.npsSubmitted) {
  return <NPSSurvey />;
}
```

**Exit Survey**: Ask when user cancels subscription

```tsx
// In your cancellation flow
<ExitSurvey
  question="Why are you canceling?"
  options={[
    'Too expensive',
    'Missing features',
    'Not using it enough',
    'Found a better alternative',
    'Other',
  ]}
/>
```

---

### 4. User Interviews

**Use for**: Deep understanding of problems

**When to do**:
- Before building new features (validate ideas)
- After launch (understand usage patterns)
- When churn is high (why are users leaving?)

**How to recruit**:

```tsx
// In-app recruitment
<div className="bg-green-50 p-4 rounded">
  <p className="font-semibold">Help shape the future of [Product]</p>
  <p>We'd love to chat for 30 minutes about your experience.</p>
  <p className="text-sm text-gray-600">$50 Amazon gift card as thanks</p>
  <button className="bg-green-600 text-white px-4 py-2 rounded mt-2">
    I'm interested
  </button>
</div>
```

**Interview Script Template**:

```markdown
# User Interview Script

## Intro (5 min)
- Thanks for joining!
- We're trying to understand how people use [Product]
- No right or wrong answers, be honest
- Recording for notes (OK?)

## Background (5 min)
- What's your role?
- How did you find [Product]?
- What problem were you trying to solve?

## Usage (10 min)
- Walk me through how you use [Product]
- What do you use most?
- What's frustrating?
- What's missing?

## Future (5 min)
- If you had a magic wand, what would you change?
- What would make you recommend us to a colleague?

## Wrap-up (5 min)
- Anything else we should know?
- Thanks! $50 gift card sent to your email
```

**Tools**:
- **Calendly** (Free-$15/month): Schedule interviews
- **Zoom** (Free-$15/month): Video calls
- **Otter.ai** (Free-$17/month): Transcribe recordings
- **Notion** (Free): Organize notes

---

## Analyzing Feedback

### 1. Categorize Feedback

**Use tags/labels**:
- Type: Bug, Feature Request, Improvement, Complaint, Praise
- Area: Dashboard, Billing, Mobile App, API, etc.
- Priority: Critical, High, Medium, Low
- Status: New, Acknowledged, Planned, In Progress, Shipped, Won't Fix

**Example in Airtable/Notion**:

| Feedback | Type | Area | Priority | Votes | Status |
|----------|------|------|----------|-------|--------|
| Dark mode | Feature | UI | Medium | 45 | Planned |
| Export to CSV broken | Bug | Dashboard | Critical | 12 | In Progress |

### 2. Identify Patterns

**Look for**:
- **Most requested features** (high votes)
- **Common complaints** (mentioned 3+ times)
- **Critical bugs** (blocks core functionality)
- **Quick wins** (high impact, low effort)

**Example**:
```
Top 5 Feature Requests:
1. Dark mode (45 votes)
2. Mobile app (38 votes)
3. Slack integration (27 votes)
4. Custom branding (19 votes)
5. Two-factor auth (15 votes)

Top 5 Bugs:
1. Export broken (12 reports)
2. Slow dashboard load (8 reports)
3. Email notifications not working (6 reports)
```

### 3. Prioritize Using RICE Framework

**RICE = Reach × Impact × Confidence / Effort**

- **Reach**: How many users affected? (1-100)
- **Impact**: How much will it help? (1-10)
- **Confidence**: How sure are you? (0-100%)
- **Effort**: How long to build? (1-10 weeks)

**Example**:

| Feature | Reach | Impact | Confidence | Effort | RICE Score |
|---------|-------|--------|------------|--------|------------|
| Dark mode | 50 | 7 | 80% | 2 | 140 |
| Mobile app | 80 | 9 | 70% | 10 | 50.4 |
| CSV export fix | 30 | 10 | 100% | 1 | 300 |

**Result**: Fix CSV export first (highest RICE), then dark mode, then mobile app.

---

## Acting on Feedback

### 1. Close the Feedback Loop

**Always respond to feedback**:

```typescript
// When you ship a requested feature
const featureRequest = await prisma.featureRequest.findUnique({
  where: { id },
  include: { votes: { include: { user: true } } },
});

// Email everyone who upvoted
for (const vote of featureRequest.votes) {
  await sendEmail(vote.user.email, {
    subject: `${featureRequest.name} is now live!`,
    body: `
      You asked for ${featureRequest.name}, we built it!

      ${featureRequest.description}

      Try it now: ${featureRequest.url}

      Thanks for helping us improve!
    `,
  });
}
```

**For bug reports**:
```
1. User reports bug
2. You acknowledge: "Thanks! Looking into it"
3. You fix bug
4. You notify user: "Fixed in v1.2.3!"
5. User feels heard → becomes loyal customer
```

### 2. Publish a Changelog

**Keep users informed**:

```markdown
# Changelog

## [1.2.0] - 2025-01-20

### Added
- Dark mode (requested by 45 users)
- Export to PDF

### Fixed
- CSV export now works (reported by @user123)
- Dashboard loading 3x faster

### Coming Soon
- Mobile app (in development)
- Slack integration (next quarter)
```

**Tools**:
- **Canny Changelog** (Paid)
- **Headway** ($0-29/month): In-app changelog widget
- **Simple blog post** (Free)

### 3. Build a Public Roadmap

**Show users what's coming**:

```markdown
# Roadmap

## Now (This Month)
- Dark mode
- Two-factor authentication

## Next (Next 3 Months)
- Mobile app (iOS + Android)
- Slack integration
- Custom branding

## Later (6+ Months)
- API webhooks
- Advanced analytics
```

**Publish on**:
- Your website (`/roadmap`)
- Canny
- GitHub Projects (if open source)

---

## Feedback Collection Checklist

Before launch:

### In-App
- [ ] Feedback button on every page
- [ ] Bug report form
- [ ] Feature request board

### Email
- [ ] NPS survey (after 30 days)
- [ ] Exit survey (on cancellation)
- [ ] Onboarding survey (after 7 days)

### Passive
- [ ] Session replays enabled (PostHog)
- [ ] Error tracking enabled (Better Stack)
- [ ] Analytics tracking key events

### Process
- [ ] Weekly feedback review meeting
- [ ] Feedback categorization system (tags/labels)
- [ ] Prioritization framework (RICE)
- [ ] Changelog published on every release
- [ ] Public roadmap

---

## Summary

**Collect feedback from Day 1**:
- In-app feedback widget (free, simple)
- Feature request board (Airtable → Canny later)
- NPS survey after 30 days
- Exit survey on cancellation

**Analyze feedback**:
- Tag by type, area, priority
- Identify patterns (common requests, bugs)
- Prioritize with RICE framework

**Act on feedback**:
- Close the loop (notify users when shipped)
- Publish changelog
- Build public roadmap

**Key principle**: Users who feel heard become loyal customers.

**See Also**:
- `docs/04-frontend/ux-research.md` - UX research methodologies
- `docs/08-analytics/analytics.md` - Track what users do
- `docs/rules/ui-standards.md` - UI/UX best practices

---

## Related Documentation

**Frontend Topics**:
- [User Feedback](./user-feedback.md) - Collecting and managing user feedback
- [UX Research](./ux-research.md) - User research methodologies

**Core Rules**:
- [UI Standards](../rules/ui-standards.md) - Responsive design, mobile-first
- [Accessibility](../rules/accessibility.md) - WCAG 2.2 Level AA compliance

**SaaS Features**:
- [User Onboarding](../09-saas-specific/user-onboarding.md) - Wizard patterns, tutorials
- [Analytics](../08-analytics/analytics.md) - Event tracking, user behavior

**Practical Resources**:
- [React Component Template](../templates/react-component-template.tsx) - Component boilerplate

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)

