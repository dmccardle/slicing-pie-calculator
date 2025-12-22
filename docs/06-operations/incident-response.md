# Incident Response

## Overview

Incident response defines how to detect, respond to, and recover from security incidents. This document provides procedures for handling security breaches, data leaks, and cyber attacks.

**Rule**: Hope for the best, prepare for the worst.

---

## What is a Security Incident?

**Security incident** = Event that compromises confidentiality, integrity, or availability of data/systems

**Examples**:
- Unauthorized access to user accounts
- Data breach (user data leaked)
- Malware/ransomware infection
- DDoS attack
- Compromised employee account
- Insider threat (malicious employee)

**Not every issue is a security incident**:
- Bug causing incorrect data (bug, not security incident)
- Server crash (operational incident, see `docs/06-operations/incident-management.md`)
- Attacker exploiting bug to steal data (security incident)

---

## Incident Severity Levels

### SEV 1: Critical (Respond Immediately)

**Examples**:
- Active data breach (attacker currently accessing data)
- Ransomware encryption in progress
- Root access compromised
- Mass account takeover

**Response time**: Immediate (< 15 minutes)
**Who responds**: All hands on deck
**Escalation**: CEO, legal, PR

### SEV 2: High (Respond Within 1 Hour)

**Examples**:
- Unauthorized access discovered (attacker no longer active)
- Vulnerability actively being exploited
- Insider threat detected

**Response time**: < 1 hour
**Who responds**: Security team + on-call engineer
**Escalation**: CTO

### SEV 3: Medium (Respond Within 4 Hours)

**Examples**:
- Suspicious login attempts (potential brute force)
- Misconfiguration exposing data (not yet exploited)
- Phishing email sent to employees

**Response time**: < 4 hours
**Who responds**: Security team
**Escalation**: Security lead

### SEV 4: Low (Respond Within 24 Hours)

**Examples**:
- Vulnerability reported (not yet exploited)
- Security scan finding (no active threat)
- Lost/stolen employee laptop (encrypted)

**Response time**: < 24 hours
**Who responds**: Security team (async)
**Escalation**: None

---

## Incident Response Phases

### Phase 1: Detection

**How incidents are detected**:

1. **Automated alerts** (Better Stack, see `docs/06-operations/monitoring.md`)
   - Unusual error rates
   - Failed login attempts spike
   - Suspicious database queries

2. **Security tools** (Semgrep, OWASP ZAP, see `docs/06-operations/security-testing.md`)
   - Vulnerability scanner findings
   - Intrusion detection alerts

3. **User reports**
   - "I can see another user's data"
   - "Someone logged into my account"

4. **Bug bounty reports** (HackerOne, see `docs/06-operations/penetration-testing.md`)
   - Researcher reports vulnerability

**Alert example**:

```
SECURITY ALERT - SEV 1

Title: Unusual database access pattern detected
Time: 2025-01-20 14:35 UTC
Details:
- User ID: user_abc123
- Action: SELECT * FROM users (accessed all user records)
- IP: 192.168.1.1 (Russia)
- User agent: sqlmap/1.7 (automated SQL injection tool)

Action required: Investigate immediately
```

### Phase 2: Containment

**Goal**: Stop the attack, prevent further damage

**Actions**:

1. **Isolate compromised systems**
   ```bash
   # Stop affected services
   railway down  # Stop all services

   # Revoke all sessions
   redis-cli FLUSHDB  # Clear all sessions

   # Disable compromised accounts
   prisma user update --where id=user_abc123 --data disabled=true
   ```

2. **Block attacker**
   ```bash
   # Add IP to blocklist (Cloudflare WAF)
   # Cloudflare dashboard → Security → WAF → IP Access Rules
   # Block: 192.168.1.1

   # Or via API
   curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/firewall/access_rules/rules" \
     -H "Authorization: Bearer {api_token}" \
     -d '{
       "mode": "block",
       "configuration": {"target": "ip", "value": "192.168.1.1"},
       "notes": "SQL injection attack - 2025-01-20"
     }'
   ```

3. **Preserve evidence**
   ```bash
   # Capture logs before they rotate/expire
   railway logs --tail 10000 > incident-logs-$(date +%Y%m%d).txt

   # Database snapshot
   railway db backup --manual --name "incident-backup-$(date +%Y%m%d)"

   # Better Stack: Export logs
   # Better Stack → Logs → Export (last 24 hours)
   ```

4. **Change credentials**
   ```bash
   # Rotate all API keys
   # Railway dashboard → Variables → Update all secrets
   # - DATABASE_URL (regenerate)
   # - STRIPE_SECRET_KEY (regenerate in Stripe dashboard)
   # - JWT_SECRET (update in Railway)

   # Force password reset for affected users
   UPDATE users SET password_reset_required = TRUE WHERE id IN (...);
   ```

**Containment checklist**:
- [ ] Compromised services stopped
- [ ] Attacker IP blocked
- [ ] Logs and evidence preserved
- [ ] All credentials rotated
- [ ] Affected users' sessions revoked

### Phase 3: Investigation

**Goal**: Understand what happened, how, and impact

**Questions to answer**:

1. **How did attacker get in?**
   - SQL injection? XSS? Stolen credentials?
   - Which endpoint was vulnerable?

2. **What data was accessed?**
   - Query database audit logs
   - Check Better Stack logs for suspicious activity
   - Review session replays (PostHog)

3. **When did breach occur?**
   - First suspicious activity timestamp
   - Duration of breach

4. **How many users affected?**
   - Which user IDs/emails were accessed?

**Investigation tools**:

```bash
# Search Better Stack logs for suspicious queries
# Better Stack → Logs → Search

# Look for:
# - "SELECT * FROM users" (mass data access)
# - "DROP TABLE" (destructive commands)
# - "UNION SELECT" (SQL injection)
# - Unusual IP addresses (geolocate)
# - Failed authentication attempts

# Check database for unauthorized changes
SELECT *
FROM audit_logs
WHERE created_at > '2025-01-20 14:00:00'
AND (
  action = 'read' OR
  action = 'update' OR
  action = 'delete'
)
ORDER BY created_at DESC;

# Identify affected users
SELECT DISTINCT user_id
FROM audit_logs
WHERE created_at BETWEEN '2025-01-20 14:00:00' AND '2025-01-20 15:00:00'
AND ip_address = '192.168.1.1';
```

**Document findings**:

```markdown
# Security Incident Report - 2025-01-20

## Summary
SQL injection vulnerability in /api/v1/search endpoint exploited by attacker to access user data.

## Timeline
- 14:35 UTC: First suspicious query detected
- 14:37 UTC: Attacker accessed all user records (SELECT * FROM users)
- 14:40 UTC: Alert triggered (Better Stack)
- 14:42 UTC: Services stopped, attacker blocked
- 14:50 UTC: Investigation began

## Attack Vector
SQL injection in search endpoint:
```
GET /api/v1/search?q=' OR 1=1--
```

Vulnerable code (app/api/v1/search/route.ts:15):
```typescript
const results = await db.query(`SELECT * FROM posts WHERE title LIKE '%${query}%'`);
```

## Impact
- Data accessed: User IDs, names, email addresses (1,245 users)
- Data modified: None
- Data deleted: None
- Sensitive data: No passwords (hashed), no payment data (stored by Stripe)

## Affected Users
1,245 users (see attached CSV)

## Root Cause
Raw SQL query with unsanitized user input (not using Prisma parameterized queries)

## Remediation
- Fixed vulnerability (deploy at 15:30 UTC)
- Rotated all API keys
- Blocked attacker IP
- Forced password reset for affected users
```

### Phase 4: Remediation

**Goal**: Fix vulnerability, restore service

**Actions**:

1. **Patch vulnerability**
   ```typescript
   // BEFORE (vulnerable)
   const query = request.nextUrl.searchParams.get('q');
   const results = await db.query(`SELECT * FROM posts WHERE title LIKE '%${query}%'`);

   // AFTER (fixed)
   const query = request.nextUrl.searchParams.get('q');
   const results = await prisma.post.findMany({
     where: {
       title: { contains: query, mode: 'insensitive' },
     },
   });
   ```

2. **Deploy fix**
   ```bash
   git add .
   git commit -m "fix(security): patch SQL injection in search endpoint"
   git push origin main

   railway up  # Deploy fix
   ```

3. **Verify fix**
   ```bash
   # Test that SQL injection no longer works
   curl "https://api.yourapp.com/api/v1/search?q=' OR 1=1--"
   # Should return error or empty results, not all posts

   # Run security scan
   semgrep scan --config=auto
   # Should not flag the fixed code
   ```

4. **Add security controls**
   ```typescript
   // Add input validation
   import { z } from 'zod';

   const searchSchema = z.object({
     q: z.string().max(100).regex(/^[a-zA-Z0-9\s]+$/), // Only alphanumeric
   });

   export async function GET(request: Request) {
     const query = request.nextUrl.searchParams.get('q');

     // Validate input
     const validated = searchSchema.safeParse({ q: query });
     if (!validated.success) {
       return Response.json({ error: 'Invalid search query' }, { status: 400 });
     }

     // Safe query
     const results = await prisma.post.findMany({
       where: { title: { contains: validated.data.q } },
     });

     return Response.json(results);
   }
   ```

5. **Add WAF rules**
   ```bash
   # Cloudflare → Security → WAF

   # Block SQL injection attempts
   Rule: (http.request.uri.query contains "OR 1=1" or http.request.uri.query contains "UNION SELECT")
   Action: Block
   ```

**Remediation checklist**:
- [ ] Vulnerability patched
- [ ] Fix deployed to production
- [ ] Fix verified (no longer exploitable)
- [ ] Additional security controls added (input validation, WAF)
- [ ] Security scan passed (Semgrep, OWASP ZAP)

### Phase 5: Recovery

**Goal**: Restore normal operations, notify affected parties

**Actions**:

1. **Restart services**
   ```bash
   railway up  # Start services with fix deployed
   ```

2. **Notify affected users** (GDPR: within 72 hours)
   ```typescript
   // Email all affected users
   const affectedUsers = await prisma.user.findMany({
     where: { id: { in: affectedUserIds } },
   });

   for (const user of affectedUsers) {
     await sendEmail(user.email, {
       subject: 'Important Security Notice',
       body: `
         We detected unauthorized access to your account on January 20, 2025.

         Data accessed:
         - Name, email address
         - Account creation date
         - No passwords or payment information was accessed

         Actions we've taken:
         - Fixed the vulnerability
         - Reset your password (check your email)
         - Added additional security monitoring

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

3. **Notify authorities** (if required)
   - **GDPR**: Report to supervisory authority within 72 hours
   - **CCPA**: Report to California AG (if > 500 CA residents affected)

   See `docs/06-operations/compliance.md` for details

4. **Public disclosure** (optional, recommended for transparency)
   ```markdown
   # Security Incident Disclosure - January 20, 2025

   ## What Happened
   On January 20, 2025, we discovered a SQL injection vulnerability in our search feature. An attacker exploited this vulnerability to access user data between 2:35 PM - 2:42 PM UTC.

   ## What Data Was Accessed
   - 1,245 user accounts affected
   - Data accessed: Names, email addresses, account creation dates
   - No passwords, payment information, or private messages were accessed

   ## What We've Done
   - Fixed the vulnerability (deployed at 3:30 PM UTC)
   - Blocked the attacker
   - Rotated all system credentials
   - Reset passwords for affected users
   - Implemented additional security controls (input validation, WAF rules)
   - Notified affected users
   - Reported to authorities (as required by GDPR)

   ## What You Should Do
   If you received an email from us, please:
   - Change your password immediately
   - Enable two-factor authentication
   - Review recent account activity

   ## Our Commitment
   We take security seriously. We've hired a third-party security firm to conduct a full audit and are implementing additional safeguards to prevent future incidents.

   Questions? Email security@yourapp.com

   [Your Name, CEO]
   ```

5. **Monitor for recurrence**
   ```typescript
   // Add alert for suspicious search queries
   import { logtail } from '@logtail/node';

   export async function GET(request: Request) {
     const query = request.nextUrl.searchParams.get('q');

     // Alert on suspicious queries
     if (query?.includes('OR 1=1') || query?.includes('UNION SELECT')) {
       logtail.error('Potential SQL injection attempt', {
         query,
         ip: request.headers.get('x-forwarded-for'),
         userAgent: request.headers.get('user-agent'),
       });
     }

     // Rest of handler...
   }
   ```

**Recovery checklist**:
- [ ] Services restored
- [ ] Affected users notified
- [ ] Authorities notified (if required)
- [ ] Public disclosure published
- [ ] Monitoring in place to detect recurrence

### Phase 6: Post-Incident Review

**Goal**: Learn from incident, prevent future occurrences

**Post-mortem meeting** (within 1 week of incident):

**Attendees**: Engineering team, security lead, CTO

**Agenda**:

```markdown
# Post-Incident Review - 2025-01-20 SQL Injection

## What Happened (Blameless)
- SQL injection vulnerability in search endpoint
- Attacker exploited vulnerability to access user data
- 1,245 users affected

## Timeline
- 14:35 UTC: Attack began
- 14:40 UTC: Alert triggered
- 14:42 UTC: Services stopped, attacker blocked
- 14:50 UTC: Investigation began
- 15:30 UTC: Fix deployed
- 16:00 UTC: Users notified

## What Went Well
- Alert triggered quickly (5 minutes)
- Fast containment (7 minutes from alert to services stopped)
- Clear incident response process
- Good communication with users

## What Didn't Go Well
- Vulnerability existed in production (not caught by code review)
- No automated security scanning in CI/CD
- Raw SQL queries still used (should use Prisma everywhere)

## Root Cause
Developer used raw SQL query with unsanitized user input (violates security guidelines).

## Why Wasn't This Caught?
- Code review missed it (reviewer didn't check for SQL injection)
- No Semgrep in CI/CD (would have flagged raw SQL)
- No security training for developers

## Action Items
- [ ] Add Semgrep to CI/CD (block raw SQL queries) - @engineer1 - Jan 25
- [ ] Security training for all engineers - @security - Feb 1
- [ ] Audit all endpoints for raw SQL - @engineer2 - Jan 30
- [ ] Update code review checklist (security section) - @engineering-manager - Jan 22
- [ ] Hire pen tester for full security audit - @cto - Feb 15

## Preventative Measures
1. Enforce Semgrep in CI/CD (fail builds on security issues)
2. Update linting rules to disallow raw SQL
3. Security training (quarterly)
4. Annual pen testing
```

**Follow up**: Ensure all action items are completed (track in issue tracker)

---

## Incident Response Team

### Roles and Responsibilities

**Incident Commander** (on-call engineer):
- Leads response
- Makes decisions
- Coordinates team
- Communicates with stakeholders

**Technical Lead** (senior engineer):
- Investigates root cause
- Implements fixes
- Verifies remediation

**Communications Lead** (PR/marketing):
- Drafts user notifications
- Handles press inquiries
- Publishes public disclosure

**Legal/Compliance Lead** (legal team):
- Determines regulatory requirements
- Drafts authority notifications
- Reviews public disclosure

### On-Call Rotation

**Set up on-call schedule** (Better Stack On-Call, see `docs/06-operations/incident-management.md`):

```
Week 1: Engineer A (primary), Engineer B (backup)
Week 2: Engineer C (primary), Engineer A (backup)
Week 3: Engineer B (primary), Engineer C (backup)
```

**On-call responsibilities**:
- Respond to security alerts within 15 minutes
- Triage severity (SEV 1-4)
- Execute incident response playbook
- Escalate to CTO if SEV 1 or SEV 2

---

## Incident Response Checklist

When security incident occurs:

### Immediate (< 15 minutes)
- [ ] Confirm incident (is this real?)
- [ ] Assign severity (SEV 1-4)
- [ ] Alert incident response team (Slack: @security-team)
- [ ] Begin containment (stop services, block attacker)

### Containment (< 1 hour)
- [ ] Isolate compromised systems
- [ ] Block attacker (IP, accounts)
- [ ] Preserve evidence (logs, database snapshots)
- [ ] Rotate credentials (API keys, passwords)
- [ ] Revoke sessions

### Investigation (< 4 hours)
- [ ] Determine attack vector (how they got in)
- [ ] Assess impact (what data accessed, modified, deleted)
- [ ] Identify affected users
- [ ] Document timeline
- [ ] Write incident report

### Remediation (< 24 hours)
- [ ] Patch vulnerability
- [ ] Deploy fix to production
- [ ] Verify fix (test that exploit no longer works)
- [ ] Add security controls (WAF, input validation)
- [ ] Run security scan (Semgrep, OWASP ZAP)

### Recovery (< 72 hours)
- [ ] Restart services
- [ ] Notify affected users
- [ ] Notify authorities (GDPR, CCPA if required)
- [ ] Publish public disclosure (optional)
- [ ] Monitor for recurrence

### Post-Incident (< 1 week)
- [ ] Schedule post-mortem meeting
- [ ] Document lessons learned
- [ ] Create action items (prevent future incidents)
- [ ] Update incident response playbook
- [ ] Security training for team

---

## Summary

**Incident response phases**:
1. **Detection**: Automated alerts, user reports, bug bounties
2. **Containment**: Stop attack, block attacker, preserve evidence
3. **Investigation**: Understand what happened, assess impact
4. **Remediation**: Fix vulnerability, deploy patch
5. **Recovery**: Restore service, notify users/authorities
6. **Post-incident**: Learn from incident, prevent recurrence

**Severity levels**:
- SEV 1 (Critical): Active breach → Respond immediately
- SEV 2 (High): Past breach → Respond within 1 hour
- SEV 3 (Medium): Potential threat → Respond within 4 hours
- SEV 4 (Low): Low risk → Respond within 24 hours

**Key actions**:
- Set up on-call rotation (Better Stack)
- Document incident response playbook
- Train team on response procedures
- Run incident drills (quarterly)
- Post-mortem after every incident

**See Also**:
- `docs/06-operations/incident-management.md` - Operational incident response
- `docs/06-operations/disaster-recovery.md` - Disaster recovery procedures
- `docs/06-operations/compliance.md` - Data breach notification requirements
- `docs/06-operations/security-testing.md` - Prevent incidents with security testing

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

