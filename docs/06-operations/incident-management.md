# Incident Management and On-Call

## Overview

Incidents happen. This document defines how to detect, respond to, and learn from production incidents to minimize downtime and user impact.

**Tool**: Better Stack On-Call (included with Better Stack)
**Cost**: Included in Better Stack ($78-117/month for 2-3 users)

---

## What is an Incident?

**Incident**: Any event that disrupts or degrades service quality for users.

**Examples**:
- API is down (500 errors)
- Database is unavailable
- Payment processing failing
- Slow response times (> 5s)
- Data breach or security incident
- Single user having an issue (support ticket, not incident)
- Staging environment down (not affecting users)

**If users are affected, it's an incident.**

---

## Incident Severity Levels

### SEV 1 (Critical) - Page Immediately

**Impact**: Service down or critical functionality broken for all/most users

**Examples**:
- API completely down (all requests failing)
- Database unavailable
- Payment processing failing (can't purchase)
- Data breach in progress
- Authentication system down (can't log in)

**Response Time**: 5 minutes
**Notification**: Phone call + SMS + Slack
**Who responds**: On-call engineer + backup

### SEV 2 (High) - Alert Immediately

**Impact**: Major functionality degraded or broken for some users

**Examples**:
- API slow (> 5s response time)
- Partial outage (one region down)
- Elevated error rate (5-10%)
- Third-party integration down (email, analytics)

**Response Time**: 15 minutes
**Notification**: SMS + Slack
**Who responds**: On-call engineer

### SEV 3 (Medium) - Notify During Business Hours

**Impact**: Minor functionality broken or performance degraded

**Examples**:
- Non-critical feature broken (export, sharing)
- Slow background jobs
- Error rate slightly elevated (1-2%)

**Response Time**: 1 hour (business hours) or next business day
**Notification**: Slack
**Who responds**: On-call engineer (business hours)

### SEV 4 (Low) - Fix in Next Sprint

**Impact**: Cosmetic issues, no user impact

**Examples**:
- UI alignment issues
- Typos
- Non-critical warnings in logs

**Response Time**: Next sprint
**Notification**: Create ticket
**Who responds**: Development team

---

## Better Stack On-Call Setup

### 1. Create On-Call Schedule

**In Better Stack**:
1. Go to Better Stack → On-Call → Schedules
2. Click "New Schedule"
3. Configure:

```yaml
Schedule Name: Primary On-Call
Timezone: America/New_York (or your timezone)
Rotation:
  Type: Weekly
  Start: Monday 9:00 AM
  Handoff: Next Monday 9:00 AM

Members:
  - Engineer 1
  - Engineer 2
  - Engineer 3

Rotation Order: Rotate weekly
```

### 2. Set Up Escalation Policy

**Escalation path**:
1. **Primary**: On-call engineer (page immediately)
2. **Secondary**: Backup engineer (after 10 minutes no response)
3. **Manager**: Engineering lead (after 20 minutes no response)

**In Better Stack**:
```yaml
Escalation Policy: Production Incidents

Level 1 (Immediate):
  - Notify: Current on-call (Primary schedule)
  - Via: Phone call + SMS + Slack
  - Timeout: 10 minutes

Level 2 (If no response):
  - Notify: Backup on-call
  - Via: Phone call + SMS
  - Timeout: 10 minutes

Level 3 (If still no response):
  - Notify: Engineering Lead
  - Via: Phone call + Email
```

### 3. Configure Alert Routing

**Route alerts by severity**:

**SEV 1** (Critical):
- Trigger: Service down, error rate > 10%, database unavailable
- Route to: Primary on-call + Backup on-call (both paged)
- Channels: Phone + SMS + Slack

**SEV 2** (High):
- Trigger: Error rate 1-10%, slow response time, partial outage
- Route to: Primary on-call
- Channels: SMS + Slack

**SEV 3** (Medium):
- Trigger: Minor issues, non-critical errors
- Route to: Slack only (business hours)
- Channels: Slack

**In Better Stack**:
```yaml
Alert Routing Rules:

# SEV 1 - Service Down
- Name: API Down
  Condition: uptime_monitor.status == "down"
  Severity: critical
  Escalation Policy: Production Incidents
  Channels: [phone, sms, slack]

# SEV 1 - High Error Rate
- Name: High Error Rate
  Condition: error_rate > 0.1
  Duration: 1 minute
  Severity: critical
  Escalation Policy: Production Incidents
  Channels: [phone, sms, slack]

# SEV 2 - Slow Response
- Name: Slow API
  Condition: p95_latency > 5000
  Duration: 5 minutes
  Severity: high
  Escalation Policy: Production Incidents
  Channels: [sms, slack]

# SEV 3 - Minor Issues
- Name: Elevated Errors
  Condition: error_rate > 0.01 AND error_rate < 0.1
  Duration: 10 minutes
  Severity: medium
  Channels: [slack]
```

### 4. Test the On-Call System

**Before going live, test**:

```bash
# Trigger test alert from Better Stack dashboard
# Or manually trigger:
curl -X POST https://betterstack.com/api/v1/incidents \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "title": "Test Incident - Please Acknowledge",
    "severity": "critical",
    "description": "Testing on-call rotation. Please acknowledge this incident."
  }'
```

**Verify**:
- On-call engineer receives phone call
- SMS arrives within 30 seconds
- Slack notification posted
- Escalation triggers if no acknowledgment

---

## Incident Response Workflow

### Phase 1: Detection and Alert (Auto)

**Better Stack detects issue**:
- Uptime monitor fails
- Error rate spikes
- Latency exceeds threshold
- Manual incident created

**Alert sent**:
- Phone call to on-call
- SMS with incident link
- Slack message in #incidents

### Phase 2: Acknowledgment (< 5 minutes)

**On-call engineer**:
1. Acknowledge incident (click link in SMS or Slack)
2. Join incident war room (Slack thread)
3. Announce taking ownership

```
[On-Call] I'm responding to this incident.
Investigating now. ETA for update: 10 minutes.
```

**If no acknowledgment in 10 minutes**: Escalate to backup

### Phase 3: Investigation (< 15 minutes)

**Triage checklist**:
```bash
# 1. Verify the issue
curl https://api.yourapp.com/health
# Is API responding?

# 2. Check recent deployments
railway logs --tail 100
# Any recent deploys?

# 3. Check error logs
# Better Stack → Logs → Filter by last 30 minutes
# What errors are occurring?

# 4. Check dependencies
# Database: pg_isready
# Redis: redis-cli ping
# Third-party APIs: Status pages

# 5. Check metrics
# Better Stack → Dashboards
# CPU, memory, disk usage
```

**Communicate findings** (every 10-15 minutes):
```
[Update 10 min] Root cause identified: Database connection pool exhausted.
Working on fix: Restarting API service to reset connections.
ETA for resolution: 5 minutes.
```

### Phase 4: Mitigation (< 30 minutes)

**Goal**: Restore service ASAP (fix properly later)

**Common mitigations**:

**Rollback bad deployment**:
```bash
# Rollback to previous version
railway rollback

# Or deploy last known good commit
git revert HEAD
git push
railway up
```

**Restart service** (connection pool exhausted, memory leak):
```bash
railway restart api
```

**Scale up** (traffic spike):
```bash
railway scale api --replicas 3
```

**Failover to backup** (database failure):
```bash
# Point to read replica temporarily
railway variables set DATABASE_URL=$REPLICA_URL
railway restart
```

**Kill problematic process** (runaway query):
```sql
-- Find long-running queries
SELECT pid, query, now() - query_start AS duration
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;

-- Kill it
SELECT pg_terminate_backend(12345);  -- PID from above
```

### Phase 5: Verification (< 5 minutes)

**Confirm resolution**:
```bash
# 1. Check health endpoint
curl https://api.yourapp.com/health
# Should return 200

# 2. Check error rate in Better Stack
# Should drop to < 0.1%

# 3. Check user-reported issues
# Slack, support tickets - are users still complaining?

# 4. Smoke test critical flows
# Can users: Sign up? Log in? Make purchases?
```

**Communicate resolution**:
```
[RESOLVED] Service restored.
Root cause: Database connection pool exhausted due to traffic spike.
Mitigation: Restarted API service, increased pool size.
No data loss. All services operating normally.

Post-mortem will be shared within 24 hours.
```

### Phase 6: Post-Mortem (Within 24 hours)

**See Post-Mortem Template below**

---

## Incident Communication

### Internal Communication (Slack #incidents)

**Initial message** (on acknowledgment):
```
SEV 1 INCIDENT: API Down
Status: Investigating
On-call: @engineer-name
Started: 2025-01-21 14:32 UTC
Last update: Just now

I'm investigating. Will update in 10 minutes.
```

**Progress updates** (every 10-15 minutes):
```
[Update 10 min] Root cause identified: Database connection pool exhausted.
[Update 20 min] Fix deployed. Monitoring recovery.
[Update 25 min] Service restored. Error rate back to normal.
[RESOLVED] Incident closed. Post-mortem coming.
```

### External Communication (Status Page)

**Create status page** (Better Stack):
1. Better Stack → Status Pages
2. Create public status page (status.yourapp.com)
3. Update during incidents

**Example status update**:
```
[2025-01-21 14:35 UTC] Investigating
We are investigating reports of API errors and slow response times.
Estimated resolution: 30 minutes.

[2025-01-21 14:50 UTC] Identified
The issue has been identified. Database connection pool was exhausted
due to traffic spike. Fix is being deployed.

[2025-01-21 15:00 UTC] Resolved
Service has been fully restored. All systems operating normally.
We apologize for the disruption.
```

---

## Post-Mortem Template

**Create post-mortem within 24 hours of every SEV 1/2 incident**

```markdown
# Post-Mortem: API Outage - Jan 21, 2025

## Incident Summary
- **Severity**: SEV 1
- **Duration**: 28 minutes (14:32 - 15:00 UTC)
- **Impact**: 100% of users unable to access API
- **Root Cause**: Database connection pool exhausted

## Timeline (All times UTC)
- **14:30** - Traffic spike begins (5x normal)
- **14:32** - Better Stack detects elevated error rate (5%)
- **14:33** - Error rate hits 50%, uptime monitor fails
- **14:33** - On-call paged, acknowledged immediately
- **14:38** - Root cause identified (connection pool exhausted)
- **14:42** - Mitigation deployed (API restart + pool size increase)
- **14:50** - Error rate drops to 1%
- **15:00** - Error rate normal (<0.1%), incident resolved

## Root Cause
Database connection pool configured for 10 connections. Traffic spike
from viral social media post caused 50 concurrent requests, exhausting
the pool. New requests waited indefinitely for available connections.

## What Went Well
- Monitoring detected issue within 2 minutes
- On-call responded immediately (acknowledged in 1 minute)
- Root cause identified quickly (5 minutes)
- Mitigation deployed rapidly (10 minutes)
- Communication clear and frequent

## What Went Poorly
- Connection pool too small (should scale with traffic)
- No alerts for connection pool saturation (would have warned earlier)
- No load testing done before launch (would have caught this)

## Action Items
- [ ] **P0** - Increase connection pool size (10 → 50) - @engineer1 - Jan 22
- [ ] **P0** - Add connection pool monitoring/alerts - @engineer1 - Jan 22
- [ ] **P1** - Implement auto-scaling based on traffic - @engineer2 - Jan 28
- [ ] **P2** - Run load tests quarterly - @engineer3 - Feb 15

## Lessons Learned
1. Always load test before launch
2. Monitor resource saturation (connections, memory, CPU)
3. Plan for 5-10x traffic spikes (viral posts, press coverage)

## Prevention
This specific incident will not recur because:
- Connection pool increased to 50 (handles 5x normal traffic)
- Monitoring added to alert before exhaustion
- Auto-scaling will handle future spikes
```

---

## On-Call Runbooks

**Create runbooks for common incidents**

### Runbook 1: API Down

```markdown
# Runbook: API Down

## Detection
- Better Stack uptime monitor fails
- Error rate > 50%

## Investigation Steps
1. Check if API is responding:
   curl https://api.yourapp.com/health

2. Check recent deployments:
   railway logs --tail 100
   gh pr list --state merged --limit 5

3. Check database:
   psql $DATABASE_URL -c "SELECT 1"

4. Check Redis:
   redis-cli -u $REDIS_URL ping

## Common Causes & Fixes

### Cause 1: Bad Deployment
Fix: Rollback
```bash
railway rollback
# Or
git revert HEAD && git push && railway up
```

### Cause 2: Database Down
Fix: Restart database or failover
```bash
railway restart database
# Or switch to replica
railway variables set DATABASE_URL=$REPLICA_URL
```

### Cause 3: Out of Memory
Fix: Restart API service
```bash
railway restart api
```

### Cause 4: Rate Limited by Third Party
Fix: Disable feature temporarily
```bash
railway variables set FEATURE_ENABLED=false
railway restart
```

## Escalation
If not resolved in 30 minutes, escalate to CTO.
```

### Runbook 2: Slow API

```markdown
# Runbook: Slow API (p95 > 5s)

## Detection
- Better Stack alerts on high latency
- User reports of slowness

## Investigation Steps
1. Check database query times:
   ```sql
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC LIMIT 10;
   ```

2. Check slow queries in Better Stack logs:
   Filter: duration > 1000

3. Check CPU/Memory:
   Railway Dashboard → Metrics

## Common Causes & Fixes

### Cause 1: Slow Database Query
Fix: Add index or optimize query
```sql
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

### Cause 2: N+1 Queries
Fix: Add Prisma include
```typescript
// Before (N+1)
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { authorId: user.id } });
}

// After (single query)
const users = await prisma.user.findMany({ include: { posts: true } });
```

### Cause 3: High Traffic
Fix: Scale up temporarily
```bash
railway scale api --replicas 3
```

## Escalation
If not resolved in 1 hour, escalate to backend team lead.
```

---

## On-Call Best Practices

### For On-Call Engineers

**Before Your Shift**:
- Test phone alerts (make sure volume is on!)
- Review runbooks
- Ensure laptop is charged and accessible
- Know who your backup is
- Review recent deployments

**During Your Shift**:
- Keep phone nearby (even while sleeping)
- Respond to pages within 5 minutes
- Communicate frequently (every 10-15 min during incidents)
- Ask for help if stuck (don't hero it alone)
- Document everything (helps with post-mortem)

**After Your Shift**:
- Hand off any ongoing issues
- Update runbooks with lessons learned
- Debrief with next on-call

### For Engineering Managers

**Support On-Call Engineers**:
- Rotate on-call fairly (weekly or bi-weekly)
- Compensate for on-call duty (time off or bonus)
- Don't blame for incidents (blameless post-mortems)
- Improve runbooks after each incident
- Reduce alert fatigue (tune alerts to reduce false positives)

**Reduce Incidents**:
- Invest in testing (catch issues before production)
- Use feature flags (gradual rollouts)
- Monitor proactively (alerts before users complain)
- Learn from post-mortems (implement action items)

---

## Incident Metrics

**Track these metrics monthly**:

| Metric | Target | Meaning |
|--------|--------|---------|
| **MTBF** (Mean Time Between Failures) | > 720 hours (30 days) | How often incidents occur |
| **MTTD** (Mean Time To Detect) | < 5 minutes | How fast we detect issues |
| **MTTA** (Mean Time To Acknowledge) | < 5 minutes | How fast on-call responds |
| **MTTR** (Mean Time To Resolve) | < 30 minutes (SEV 1) | How fast we fix issues |
| **False Positive Rate** | < 10% | How many alerts are false alarms |

**Example**:
```
January 2025:
- Incidents: 3 (2 SEV 2, 1 SEV 3)
- MTBF: 240 hours (10 days)
- MTTD: 3 minutes avg
- MTTA: 2 minutes avg
- MTTR: 18 minutes avg (SEV 2)
- False Positives: 2 (6%)

All metrics within targets except MTBF (goal: 30 days)
Action: Focus on incident prevention (more testing, gradual rollouts)
```

---

## Incident Management Checklist

Before production:

### Setup
- [ ] Better Stack On-Call configured
- [ ] On-call schedule created (weekly rotation)
- [ ] Escalation policy defined
- [ ] Alert routing configured (SEV 1, 2, 3)
- [ ] Phone alerts tested (verify all engineers receive calls)
- [ ] Status page created (status.yourapp.com)

### Runbooks
- [ ] Runbook created for "API Down"
- [ ] Runbook created for "Database Issues"
- [ ] Runbook created for "Slow Performance"
- [ ] Runbook created for "Payment Failures"
- [ ] All runbooks tested (verify steps work)

### Communication
- [ ] Slack #incidents channel created
- [ ] Incident notification template created
- [ ] Post-mortem template created
- [ ] External communication plan defined

### Metrics
- [ ] Incident tracking started (MTBF, MTTD, MTTA, MTTR)
- [ ] Monthly incident review scheduled

---

## Summary

**Incident management flow**:
1. **Detect** - Better Stack monitors and alerts (< 5 min)
2. **Acknowledge** - On-call responds (< 5 min)
3. **Investigate** - Find root cause (< 15 min)
4. **Mitigate** - Restore service (< 30 min)
5. **Verify** - Confirm resolution (< 5 min)
6. **Post-mortem** - Learn and improve (< 24 hours)

**Key practices**:
- Respond quickly (acknowledge in 5 minutes)
- Communicate frequently (every 10-15 minutes)
- Restore first, fix properly later
- Blameless post-mortems (focus on systems, not people)
- Implement action items (prevent recurrence)

**Cost**: Included in Better Stack ($78-117/month)

**See Also**:
- `docs/06-operations/monitoring.md` - Detect incidents early
- `docs/06-operations/disaster-recovery.md` - Recover from catastrophic failures
- `docs/06-operations/backups.md` - Restore from backups if needed

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

