# UX Research

## Overview

UX research validates your assumptions before you build. This document defines practical research methods to understand users and make better product decisions.

**Rule**: Test with users before building, not after.

---

## Why UX Research Matters

**Without research**:
- You build features nobody wants
- You waste months on the wrong solution
- You guess at what users need
- You launch and crickets

**With research**:
- You validate ideas before building
- You understand real user problems
- You ship features people love
- You reduce risk and waste

**Research is not optional. It's how you avoid building the wrong thing.**

---

## When to Do UX Research

### 1. Discovery Phase (Before You Build Anything)

**Goal**: Understand the problem

**Methods**:
- User interviews (talk to 5-10 potential users)
- Competitive analysis (what exists already?)
- Jobs-to-be-Done interviews (what are users trying to accomplish?)

**Output**: Problem statement, user personas, opportunity areas

### 2. Validation Phase (Before You Build Features)

**Goal**: Test if your solution will work

**Methods**:
- Prototype testing (show mockups, get feedback)
- A/B testing (test variations)
- First-click tests (can users find it?)

**Output**: Validated designs ready to build

### 3. Optimization Phase (After Launch)

**Goal**: Improve what you built

**Methods**:
- Usability testing (watch users struggle)
- Session replays (see what's confusing)
- Analytics (where do users drop off?)

**Output**: Prioritized improvements

---

## Research Methods (Startup-Friendly)

### 1. User Interviews

**Best for**: Understanding problems deeply

**Cost**: Free (your time)

**How to do it**:

**Step 1: Recruit 5-10 Users**

Where to find them:
- Your waitlist/early signups
- Twitter/LinkedIn (DM potential users)
- Reddit communities (offer $25-50 gift card)
- Friends in target industry (start here)

**Step 2: Create Interview Script**

```markdown
# User Interview Script (30 minutes)

## Intro (5 min)
Hi [Name], thanks for joining!

I'm building [Product] to help [Target Users] with [Problem].
I want to understand how you currently handle this.

No right or wrong answers. Be brutally honest.
Recording for notes (is that OK?).

## Current Behavior (15 min)
1. Tell me about your role and typical day
2. How do you currently handle [Problem]?
3. Walk me through the last time you did [Task]
4. What's frustrating about the current solution?
5. What have you tried to solve this?
6. What would "ideal" look like?

## Solution Test (5 min)
[Show prototype/mockup]

7. What do you think this does?
8. How would you use this?
9. Would this solve your problem? Why/why not?
10. What's missing?

## Wrap-up (5 min)
11. Anything else I should know?
12. Can I follow up in a few weeks?
13. Know anyone else I should talk to?

Thanks! [Send gift card]
```

**Step 3: Run Interviews**

- Use Zoom (free tier)
- Record (with permission)
- Take notes (or use Otter.ai for transcription)
- Don't pitch, just listen

**Step 4: Analyze**

Look for patterns:
- What problems did 3+ people mention?
- What words/phrases do they use?
- What workarounds do they have now?
- What features would they pay for?

**Example Analysis**:

```markdown
# Interview Insights (n=7 interviews)

## Key Problems
1. "Onboarding new clients takes 2-3 weeks" (mentioned by 6/7)
2. "Can't track who's blocked on what" (mentioned by 5/7)
3. "Too many tools, context switching" (mentioned by 4/7)

## Current Solutions
- Excel spreadsheets (5/7)
- Trello boards (3/7)
- Email threads (all)

## Willingness to Pay
- $50-100/month: 4/7 said yes
- $100-200/month: 2/7 said yes
- Features they'd pay for: Automation, client portal

## Quotes
"If you could cut onboarding from 2 weeks to 2 days, I'd pay $200/month easy"
"I hate switching between 5 tools"
```

---

### 2. Prototype Testing

**Best for**: Validating designs before building

**Cost**: Free (Figma free tier)

**How to do it**:

**Step 1: Create Low-Fidelity Prototype**

- Sketch on paper
- Or use Figma (create clickable prototype)
- Don't make it pixel-perfect (wastes time)
- Focus on flows, not visuals

**Step 2: Test with 5 Users**

Give them tasks:
```markdown
# Prototype Test Script

## Task 1: Sign Up
"You want to create an account. Show me how you'd do that."

Observe:
- Do they find the sign-up button?
- Do they understand what info is needed?
- Do they get stuck anywhere?

## Task 2: Create First Project
"You want to start a new project called 'Website Redesign'. Walk me through it."

Observe:
- Can they find where to create projects?
- Is the flow intuitive?
- What do they expect to see next?

## Task 3: Invite Team Member
"You want to invite your colleague Sarah to this project. How would you do that?"

Observe:
- Do they look in the right place?
- Is the button labeled clearly?
- Do they understand what happens next?
```

**Step 3: Watch for Struggles**

Signs of confusion:
- Pausing for > 5 seconds
- Clicking wrong buttons
- Saying "I'm not sure..."
- Asking "Where do I...?"

**If 3+ users struggle with the same thing, redesign it.**

**Step 4: Iterate and Retest**

- Fix issues
- Test again with new users
- Repeat until 4/5 users succeed

---

### 3. First-Click Test

**Best for**: Testing if buttons/links are findable

**Cost**: Free

**How to do it**:

Show a screenshot of your design and ask:
- "Where would you click to create a new project?"
- "Where would you click to upgrade your plan?"
- "Where would you click to invite a team member?"

**If < 70% click the right place, your design is confusing.**

**Tools**:
- **UsabilityHub** (Free-$89/month): First-click tests, 5-second tests
- **DIY**: Send screenshot via email, ask "where would you click?"

**Example**:

```
Question: "Where would you click to export data?"

Results:
- 65% clicked "Export" button (correct )
- 20% clicked "Download" in settings (wrong )
- 15% clicked "More" menu (wrong )

Action: Make "Export" button more prominent
```

---

### 4. A/B Testing

**Best for**: Choosing between two designs

**Cost**: Free (use feature flags)

**How to do it**:

**Step 1: Create Two Versions**

Example: Test button colors

- Version A: Blue button "Get Started"
- Version B: Green button "Start Free Trial"

**Step 2: Split Traffic**

```typescript
// Use feature flags (PostHog)
import { useFeatureFlagEnabled } from 'posthog-js/react';

export function CTAButton() {
  const isVariantB = useFeatureFlagEnabled('cta-button-test');

  if (isVariantB) {
    return <button className="bg-green-600">Start Free Trial</button>;
  }

  return <button className="bg-blue-600">Get Started</button>;
}
```

**Step 3: Track Conversions**

```typescript
// Track which variant converted
posthog.capture('cta_clicked', {
  variant: isVariantB ? 'B' : 'A',
});
```

**Step 4: Analyze Results**

After 100-500 conversions:
- Variant A: 5% conversion rate (50/1000 clicks)
- Variant B: 7% conversion rate (70/1000 clicks)
- Winner: Variant B (+40% lift)

**Statistical significance calculator**: [AB Test Calculator](https://www.abtestcalculator.com/)

**See `docs/08-analytics/analytics.md` for PostHog A/B testing setup**

---

### 5. Usability Testing

**Best for**: Finding why users struggle

**Cost**: Free (your time)

**How to do it**:

**Step 1: Recruit 5 Users**

- Current users (best)
- Or potential users
- Pay $50 gift card

**Step 2: Give Them Tasks (on Live Site)**

```markdown
# Usability Test Script

## Task 1: Find Pricing
"You want to know how much this costs. Show me how you'd find out."

## Task 2: Upgrade to Pro
"You decide you want to upgrade to Pro. Walk me through it."

## Task 3: Invite a Team Member
"You want to invite your colleague to your workspace. How would you do that?"

## Task 4: Export Data
"You want to export all your data to CSV. Show me how."
```

**Step 3: Observe Without Helping**

- Don't give hints
- Don't answer questions (ask "what do you think?")
- Take notes on:
  - Where they struggle
  - What they say out loud
  - Where they click
  - How long tasks take

**Step 4: Fix Top Issues**

If 3+ users struggle:
- Unclear button labels → Rename them
- Can't find feature → Move it to main nav
- Confused by form → Add help text

---

### 6. Session Replays

**Best for**: Watching real users in the wild

**Cost**: Free (PostHog free tier)

**How to do it**:

**Set up PostHog session replay** (see `docs/08-analytics/analytics.md`)

**Watch for**:
- **Rage clicks**: User clicking same button 5+ times (it's broken or unclear)
- **Dead clicks**: Clicking something that's not clickable (they expect it to work)
- **Confusion**: Mouse moving randomly, long pauses
- **Drop-offs**: Where users leave without completing flow

**Example findings**:

```markdown
# Session Replay Insights

## Issue 1: Rage Clicking "Save" Button
- 12 users clicked "Save" 5+ times
- Root cause: No loading state, looks broken
- Fix: Add spinner + "Saving..." text

## Issue 2: Dead Clicks on Logo
- 8 users clicked logo expecting to go home
- Root cause: Logo not clickable
- Fix: Make logo clickable (link to dashboard)

## Issue 3: Drop-Off at Onboarding Step 3
- 40% of users abandon onboarding at step 3 (team invite)
- Root cause: Users want to skip and invite later
- Fix: Add "Skip for now" button
```

---

## Research on a Budget (Startup Mode)

**You have no money but need to validate ideas fast. Here's what to do:**

### Week 1: Discovery (Free)

**Monday**: Post on Twitter/LinkedIn asking for user interviews
**Tuesday-Friday**: Interview 5-10 potential users (30 min each, Zoom)
**Weekend**: Analyze notes, identify patterns

**Cost**: $0 (or $250 if offering $50 gift cards)

### Week 2: Validation (Free)

**Monday-Tuesday**: Create low-fi Figma prototype
**Wednesday-Friday**: Test prototype with 5 users
**Weekend**: Iterate based on feedback

**Cost**: $0

### Week 3: Build (Free)

**Monday-Friday**: Build MVP based on research
**Weekend**: Soft launch to test users

**Cost**: $0 (just your time)

### Week 4: Optimize (Free)

**Monday**: Set up PostHog session replays
**Tuesday-Friday**: Watch replays, fix top issues
**Weekend**: Measure improvement

**Cost**: $0 (PostHog free tier)

**Total budget**: $0-250 (if you pay for interviews)

---

## Research Deliverables

### User Personas

**Template**:

```markdown
# Persona: Startup Founder Sarah

## Demographics
- Age: 32
- Role: CEO/Founder
- Company: 5-person SaaS startup
- Location: San Francisco

## Goals
- Ship product fast
- Stay under budget
- Prove product-market fit

## Frustrations
- Too many tools ($500/month in subscriptions)
- Slow onboarding (loses customers)
- No time for complex setups

## Motivations
- Get to profitability
- Impress investors
- Build something users love

## Quote
"I don't have time for complicated tools. I need something that works out of the box."

## How We Help
- Simple setup (< 10 minutes)
- All-in-one platform (no tool switching)
- Affordable ($50/month)
```

### Problem Statement

**Template**:

```markdown
# Problem Statement

**Who**: Startup founders with 5-20 employees

**Problem**: Onboarding new customers takes 2-3 weeks, causing 30% to churn before going live

**Why it matters**: Lost revenue ($10K/month per churned customer), bad reputation

**Current solutions**: Manual email onboarding (slow, error-prone), hiring onboarding specialists (expensive)

**Our solution**: Automated onboarding platform that cuts time from 2 weeks to 2 days
```

### Journey Map

**Template**:

```markdown
# Customer Journey Map: Signing Up for SaaS

## Stage 1: Awareness
- User hears about product on Twitter
- Visits website, reads headline
- Clicks "Start Free Trial"

**Pain points**: Unclear value prop, too much text

## Stage 2: Sign-Up
- Enters email, password
- Verifies email
- Fills out onboarding form

**Pain points**: Form too long (7 fields), email verification takes 5 minutes

## Stage 3: First Use
- Creates first project
- Invites team member
- Explores features

**Pain points**: Empty state confusing, no guidance on what to do first

## Stage 4: Aha Moment
- Completes first workflow
- Sees value (saved 2 hours)

**Pain points**: Takes too long to reach aha moment (30 minutes)

## Opportunities
1. Simplify sign-up form (7 fields → 2 fields)
2. Skip email verification (verify later)
3. Add guided tour for first use
4. Reduce time-to-aha from 30 min → 5 min
```

---

## UX Research Checklist

Before building new features:

### Discovery
- [ ] Talk to 5-10 potential users
- [ ] Identify top 3 problems
- [ ] Validate willingness to pay
- [ ] Create user personas

### Validation
- [ ] Create low-fi prototype
- [ ] Test with 5 users
- [ ] Iterate based on feedback
- [ ] Run first-click tests

### Build
- [ ] Set up analytics tracking
- [ ] Set up session replays
- [ ] Set up A/B testing (if needed)

### Post-Launch
- [ ] Watch session replays (first 50 users)
- [ ] Run usability tests (5 users)
- [ ] Analyze drop-off points
- [ ] Prioritize improvements

---

## Tools

### Free Tier (Recommended for Startups)

- **Zoom** (Free): User interviews
- **Otter.ai** (Free): Transcribe interviews
- **Figma** (Free): Prototypes
- **PostHog** (Free): Session replays, A/B testing
- **Google Forms** (Free): Surveys
- **Notion** (Free): Organize research notes

### Paid (If You Have Budget)

- **UsabilityHub** ($89/month): First-click tests, 5-second tests
- **UserTesting** ($199/month): Recruit + run usability tests
- **Hotjar** ($80/month): Session replays + surveys
- **Optimal Workshop** ($166/month): Card sorting, tree testing

**Start with free tools. Upgrade only when you need scale.**

---

## Common Mistakes

### Mistake 1: Skipping Research
"We don't have time, just build it"
**Result**: Build wrong thing, waste 3 months

**Fix**: Spend 1 week on research, save 3 months

### Mistake 2: Only Talking to Existing Users
Your current users love you (survivorship bias)
**Result**: Miss why others churned or didn't sign up

**Fix**: Talk to churned users and non-customers

### Mistake 3: Leading Questions
"Would you like a feature that saves you time?" (Everyone says yes)
**Result**: False validation

**Fix**: Ask about current behavior, not hypotheticals
- Bad: "Would you use dark mode?"
- Good: "Do you use dark mode in other apps? Which ones?"

### Mistake 4: Asking What Users Want
Users don't know what they want
**Result**: Build features nobody uses

**Fix**: Observe behavior, identify problems
- Bad: "What features do you want?"
- Good: "Show me how you currently do [task]"

### Mistake 5: Testing with 1-2 Users
Not enough to find patterns
**Result**: Optimize for one person's preference

**Fix**: Test with 5+ users minimum

---

## Summary

**UX research validates ideas before you build**:
- User interviews (understand problems)
- Prototype testing (validate solutions)
- Usability testing (find issues)
- Session replays (watch real usage)

**Minimum viable research** (1 week, $0):
1. Interview 5-10 users
2. Test prototype with 5 users
3. Watch session replays post-launch
4. Fix top 3 issues

**Key principle**: Test with users before building, not after.

**See Also**:
- `docs/04-frontend/user-feedback.md` - Collect ongoing feedback
- `docs/08-analytics/analytics.md` - Track user behavior
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

