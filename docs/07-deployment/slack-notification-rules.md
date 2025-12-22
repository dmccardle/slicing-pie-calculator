# Slack Notification Rules (Human-Intervention-Only)

This document explains **when you will and won't** receive Slack notifications.

---

## Philosophy

**Only notify when human intervention is actually required.**

**Don't** spam with every event
**Do** alert when you need to make a decision or take action

---

## You WILL Be Notified For

### 1. Review Requested (Always Requires Human)
**Trigger:** Someone specifically requests your review on a PR

**Why:** You must review the code - no automation can do this

**Example Slack Message:**
```
Your Review is Requested

PR: #123
Requested by: developer
Action: Review Required

[Review Now]
```

**Frequency:** Immediately when review requested

---

### 2. Merge Conflicts (Always Requires Human)
**Trigger:** PR has conflicts with main branch

**Why:** Only a human can resolve merge conflicts

**Example Slack Message:**
```
Merge Conflict - Manual Resolution Required

PR: #123
Author: developer
Action: Resolve Conflicts

[Resolve Conflicts]
```

**Frequency:** Once when conflict detected (not on every push)

---

### 3. Repeated Failures (Likely Stuck)
**Trigger:** PR fails quality gates **3+ times in a row**

**Why:** One failure might be transient (network issue, flaky test), but 3+ failures means something is genuinely broken

**Example Slack Message:**
```
Repeated Failures - Investigation Needed

PR: #123
Consecutive Failures: 3
Title: Add new feature

This PR has failed quality gates 3 times in a row.
This likely requires human investigation.

[Investigate Failures]
```

**Frequency:** Once when 3rd consecutive failure occurs (not on 1st or 2nd)

---

### 4. Stuck PRs (Daily Digest)
**Trigger:** PRs that are:
- Open for **3+ days**
- Have **3+ failures** during that time
- Still failing

**Why:** Long-running failing PRs need human decision: close it or fix it

**Example Slack Message:**
```
Stuck PRs Need Attention

The following PRs have been failing for 3+ days:
• PR #123: Add authentication (7 days old, 5 failures)
• PR #124: Fix bug (4 days old, 4 failures)

Summary:
• Total stuck PRs: 2
• Action: Review and close or fix
```

**Frequency:** Daily at 9 AM UTC (batch notification)

---

## You Will NOT Be Notified For

### 1. First-Time Failures
**Why:** Might be transient (network timeout, service blip, flaky test)

**Logic:** Wait for 3 consecutive failures before alerting

### 2. Every PR Opened
**Why:** Creates noise, you don't need to review every PR immediately

**Alternative:** Only notified when specifically requested to review

### 3. Successful Merges
**Why:** No action needed, everything worked

**Alternative:** GitHub notifications or activity feed shows this

### 4. Transient Issues
**Why:** Auto-retries or developer push might fix it

**Examples:**
- Network timeout (retry usually works)
- Flaky test (re-run might pass)
- Temporary service outage (resolves itself)

---

## Smart Detection Logic

### Consecutive Failure Counter
```javascript
// Counts failures in a row, resets on success
let consecutiveFailures = 0;
for (const run of workflowRuns) {
  if (run.conclusion === 'failure') {
    consecutiveFailures++;
  } else if (run.conclusion === 'success') {
    break; // Reset counter
  }
}

// Only notify if 3+
if (consecutiveFailures >= 3) {
  sendSlackNotification();
}
```

### PR Age Detection
```javascript
// Only flag old + failing PRs
const prAge = (now - createdAt) / (1000 * 60 * 60 * 24);
const hasFailures = failedChecks.length > 0;
const isStale = prAge > 3;

if (hasFailures && isStale && recentFailures >= 3) {
  markAsStuck();
}
```

---

## Notification Frequency

| Event | Frequency | Example |
|-------|-----------|---------|
| Review Requested | Immediate | 1 notification per request |
| Merge Conflict | Once on detection | Not repeated on every push |
| Repeated Failures | Once at 3rd failure | Not on 4th, 5th, etc. |
| Stuck PRs | Daily digest | Batched at 9 AM UTC |

---

## Customization

### Change the "3+ failures" threshold

Edit `.github/workflows/pr-notifications.yml`:

```yaml
# Change from 3 to 5 consecutive failures
if (consecutiveFailures >= 5) {  # Was: >= 3
  sendSlackNotification();
}
```

### Change the "3+ days old" threshold

```yaml
# Change from 3 days to 7 days
const isStale = prAge > 7;  # Was: > 3
```

### Change daily digest time

```yaml
schedule:
  # Change from 9 AM to 5 PM UTC
  - cron: '0 17 * * *'  # Was: '0 9 * * *'
```

### Disable specific notifications

Comment out the job you don't want:

```yaml
# jobs:
#   notify-stuck-prs:  # Disable daily digest
#     ...
```

---

## Examples

### Scenario 1: Flaky Test (No Notification)
```
Commit 1: Test fails (network timeout)
Developer: Re-runs workflow
Commit 1 retry: Test passes

Result: No notification (resolved itself)
```

### Scenario 2: Genuine Issue (Notification)
```
Commit 1: Lint fails (unused variable)
Developer: Pushes commit 2 (tries to fix)
Commit 2: Lint fails (still broken)
Developer: Pushes commit 3 (another attempt)
Commit 3: Lint fails (still broken)

Result: Slack notification on 3rd failure
```

### Scenario 3: Old PR (Daily Digest)
```
Monday: PR opened, fails
Tuesday: Still failing
Wednesday: Still failing
Thursday: Still failing
Friday: Still failing

Result: Included in Friday's 9 AM digest
```

---

## Related Documentation

**Setup:**
- [Quality Gates Setup](./quality-gates-setup.md) - How to set up Slack webhook

**Workflows:**
- `.github/workflows/pr-notifications.yml` - Notification logic
- `.github/workflows/quality-gates.yml` - Quality check definitions

**Quick Links:**
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Deployment Docs](./)

---

**Last Updated**: 2025-12-22
**Smart Notifications Since**: v1.1.9
