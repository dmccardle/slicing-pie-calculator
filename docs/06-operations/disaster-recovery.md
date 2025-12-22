# Disaster Recovery

## Overview

Disaster recovery (DR) ensures business continuity when catastrophic failures occur. This document defines procedures to recover from worst-case scenarios: complete data loss, infrastructure failure, or security breaches.

**Goal**: Minimize data loss and downtime during disasters

**Cost**: $0-20/month (using existing backups + Railway infrastructure)

---

## Disaster vs Incident

**Incident** (covered in `incident-management.md`):
- Temporary service degradation
- Fixable with rollback, restart, or quick patch
- Example: API down due to bad deployment

**Disaster** (this document):
- Catastrophic, non-recoverable failure
- Requires full system rebuild or restore
- Example: Entire Railway project deleted, ransomware encrypts database

**If you can fix it in < 1 hour with a restart/rollback, it's an incident.**
**If you need to rebuild from backups, it's a disaster.**

---

## Recovery Objectives

### RTO (Recovery Time Objective)

**How long can you be down?**

**Target RTOs by severity**:
- **Critical systems** (API, database): 4 hours
- **Non-critical systems** (analytics, admin tools): 24 hours

**Example**:
- Disaster: Database completely destroyed at 2 PM
- RTO: 4 hours
- Must be back online by: 6 PM

### RPO (Recovery Point Objective)

**How much data can you afford to lose?**

**Target RPOs**:
- **Transactional data** (orders, payments): 15 minutes (point-in-time recovery)
- **User data** (profiles, settings): 1 hour (hourly backups)
- **Analytics data**: 24 hours (daily backups)

**Example**:
- Disaster: Database corrupted at 2 PM
- RPO: 1 hour
- Restore from: 1 PM backup
- Data lost: Anything between 1 PM - 2 PM (1 hour)

---

## Disaster Scenarios and Recovery

### Scenario 1: Database Completely Destroyed

**Cause**: Accidental deletion, ransomware, hardware failure

**Detection**:
```bash
# Database connection fails
psql $DATABASE_URL
# Error: could not connect to server
```

**Recovery Procedure**:

**Step 1: Assess Damage (5 minutes)**
```bash
# Try to connect
psql $DATABASE_URL

# Check Railway dashboard
railway db status

# Check if it's truly destroyed or just down
railway restart database
```

**Step 2: Create New Database (5 minutes)**
```bash
# In Railway dashboard
# 1. Delete corrupted database
# 2. Create new PostgreSQL database
# 3. Copy new DATABASE_URL

# Or via CLI
railway db create --name production-db-new
NEW_DB_URL=$(railway db url production-db-new)
```

**Step 3: Restore Latest Backup (30-60 minutes)**
```bash
# Option A: Restore from Railway backup (if available)
# Railway dashboard → Backups → Restore

# Option B: Restore from self-hosted backup
LATEST_BACKUP=$(ssh backup-server "ls -t /mnt/backups/postgresql/*.sql.gz | head -1")

ssh backup-server "cat $LATEST_BACKUP" | gunzip | psql $NEW_DB_URL

# Verify restore
psql $NEW_DB_URL -c "SELECT COUNT(*) FROM users;"
psql $NEW_DB_URL -c "SELECT COUNT(*) FROM orders;"
```

**Step 4: Update Application (10 minutes)**
```bash
# Update DATABASE_URL environment variable
railway variables set DATABASE_URL=$NEW_DB_URL

# Restart all services
railway restart

# Verify application is working
curl https://api.yourapp.com/health
```

**Step 5: Verify Recovery (15 minutes)**
```bash
# Smoke test critical flows
# 1. Can users sign up?
# 2. Can users log in?
# 3. Can users create data?
# 4. Are all features working?

# Check error logs
# Better Stack → Logs → Filter last 10 minutes
# Should be minimal errors

# Monitor for 30 minutes
# Watch for unusual behavior
```

**Total Recovery Time**: ~1-2 hours (within 4-hour RTO)
**Data Loss**: Up to 1 hour (latest backup)

---

### Scenario 2: Entire Railway Project Deleted

**Cause**: Accidental deletion, account compromise

**Recovery Procedure**:

**Step 1: Create New Railway Project (10 minutes)**
```bash
# 1. Log into Railway
# 2. Create new project
# 3. Create PostgreSQL database
# 4. Create Redis cache (if using)
```

**Step 2: Restore Database (30-60 minutes)**
```bash
# Same as Scenario 1
# Restore from latest backup to new database
```

**Step 3: Redeploy Application (15-30 minutes)**
```bash
# Clone repository
git clone https://github.com/your-org/your-app.git
cd your-app

# Connect to Railway
railway login
railway link  # Select new project

# Set environment variables
railway variables set \
  DATABASE_URL=$NEW_DB_URL \
  REDIS_URL=$NEW_REDIS_URL \
  NEXT_PUBLIC_API_URL=$NEW_API_URL \
  # ... all other env vars

# Deploy
railway up

# Verify deployment
railway logs --tail 100
```

**Step 4: Update DNS (5-60 minutes)**
```bash
# Update DNS to point to new Railway URL
# If using custom domain:

# 1. Railway dashboard → Settings → Domains
# 2. Add custom domain (api.yourapp.com)
# 3. Update DNS CNAME record
#    Name: api
#    Value: <new-railway-url>.up.railway.app
#    TTL: 300 (5 minutes)

# DNS propagation: 5-60 minutes
```

**Step 5: Verify Recovery (30 minutes)**
```bash
# Test all critical flows
# Monitor for issues
# Check user reports
```

**Total Recovery Time**: ~2-4 hours (within 4-hour RTO)
**Data Loss**: Up to 1 hour

---

### Scenario 3: Ransomware Attack

**Cause**: Malicious actor encrypts database or backups

**Detection**:
- Database queries returning encrypted data
- Ransom note in database
- Backup files encrypted

**Recovery Procedure**:

**Step 1: Isolate Immediately (5 minutes)**
```bash
# DO NOT pay ransom

# 1. Disconnect compromised systems
railway down  # Stop all services

# 2. Revoke all API keys and access tokens
# Railway dashboard → Settings → API Tokens → Revoke all

# 3. Change all passwords immediately
# Railway, GitHub, database, etc.

# 4. Enable 2FA on all accounts
```

**Step 2: Assess Damage (15 minutes)**
```bash
# Check which backups are encrypted
ssh backup-server "ls -lh /mnt/backups/postgresql/"

# Find oldest clean backup
# (Ransomware may have encrypted recent backups too)

# Verify backup integrity
ssh backup-server "gunzip -t /mnt/backups/postgresql/backup-20250115.sql.gz"
# If no errors, backup is clean
```

**Step 3: Restore from Clean Backup (60 minutes)**
```bash
# Use oldest clean backup (may be days old)
CLEAN_BACKUP="/mnt/backups/postgresql/backup-20250115.sql.gz"

# Create new database
railway db create --name production-db-restored

# Restore
ssh backup-server "cat $CLEAN_BACKUP" | gunzip | psql $NEW_DB_URL
```

**Step 4: Rebuild Application (30 minutes)**
```bash
# Fresh deployment with new credentials
railway up

# New API keys for all third-party services
# Stripe, SendGrid, etc.
```

**Step 5: Security Audit (2-4 hours)**
```bash
# 1. Scan for malware
npm audit fix --force
semgrep scan --config=auto

# 2. Review access logs
# Who had access? How did ransomware get in?

# 3. Patch vulnerabilities
# Update all dependencies
# Fix security issues found by Semgrep

# 4. Notify users (if PII was accessed)
# Email all users about security incident
```

**Total Recovery Time**: ~4-8 hours
**Data Loss**: Could be days (depending on oldest clean backup)

**Prevention**:
- Offline backups (air-gapped, not connected to network)
- Immutable backups (cannot be deleted/encrypted)
- Regular security scans (Semgrep, Dependabot)
- Principle of least privilege (minimal access rights)

---

### Scenario 4: Data Breach (User Data Compromised)

**Cause**: SQL injection, insecure API, stolen credentials

**Recovery Procedure**:

**Step 1: Contain Breach (15 minutes)**
```bash
# 1. Identify affected systems
# Review access logs, Better Stack logs

# 2. Revoke compromised credentials
# Database passwords, API keys, user sessions

# 3. Patch vulnerability
# Fix SQL injection, update dependencies, etc.

# 4. Deploy fix immediately
git commit -m "fix(security): patch data breach vulnerability"
git push
railway up
```

**Step 2: Assess Impact (30 minutes)**
```bash
# What data was accessed?
# Query audit logs:

SELECT *
FROM audit_logs
WHERE created_at > '2025-01-20 14:00:00'
AND action IN ('read', 'export', 'download')
ORDER BY created_at DESC;

# Which users affected?
# Create list of compromised user IDs
```

**Step 3: Notify Users (1-24 hours)**
```typescript
// Email all affected users
const affectedUsers = await prisma.user.findMany({
  where: { id: { in: compromisedUserIds } },
});

for (const user of affectedUsers) {
  await sendEmail(user.email, {
    subject: 'Important Security Notice',
    body: `
      We detected unauthorized access to your account on [date].

      Data potentially accessed:
      - Name, email address
      - Account settings
      - [List what was compromised]

      Actions we've taken:
      - Fixed the vulnerability
      - Reset your password (check your email)
      - Enabled additional security monitoring

      Actions you should take:
      - Change your password immediately
      - Review recent account activity
      - Enable two-factor authentication

      We sincerely apologize for this incident.
    `,
  });
}
```

**Step 4: Regulatory Compliance (24-72 hours)**
```bash
# GDPR: Notify within 72 hours
# Report to supervisory authority
# https://ec.europa.eu/justice/article-29/structure/data-protection-authorities/index_en.htm

# CCPA: Notify California residents
# https://oag.ca.gov/privacy/databreach/reporting

# Document everything:
# - What data was breached
# - How many users affected
# - When breach occurred
# - How it was discovered
# - What steps were taken
```

**Step 5: Post-Incident Hardening (1 week)**
```bash
# 1. Security audit
semgrep scan --config=p/security-audit

# 2. Penetration testing
# Hire security firm or use OWASP ZAP

# 3. Implement additional security
# - Two-factor authentication
# - Rate limiting
# - Web Application Firewall (Cloudflare)
# - Intrusion detection

# 4. Employee training
# Security awareness training
```

**Total Recovery Time**: 1-3 days
**Data Loss**: None (data was leaked, not lost)

---

## Disaster Recovery Testing

**Test DR procedures annually** (or after major infrastructure changes)

### DR Test Plan

**Schedule**: Once per year (or quarterly for critical systems)

**Test Procedure**:

**Week 1: Plan Test**
```bash
# 1. Pick date/time (non-business hours, low traffic)
# 2. Notify team
# 3. Create test plan
# 4. Assign roles (who does what)
```

**Week 2: Execute Test**
```bash
# 1. Take production snapshot (just in case)
railway db backup --manual

# 2. Simulate disaster in staging environment
railway down --environment staging

# 3. Execute recovery procedures
# Follow disaster recovery playbook step-by-step

# 4. Time each step
# Are we within RTO targets?

# 5. Document issues
# What didn't work? What was unclear?
```

**Week 3: Review and Improve**
```bash
# 1. Review test results
# - Actual recovery time vs target RTO
# - Data loss vs target RPO
# - Issues encountered

# 2. Update documentation
# - Fix incorrect procedures
# - Clarify ambiguous steps
# - Add missing steps

# 3. Implement improvements
# - Automate manual steps
# - Improve backup frequency
# - Add missing monitoring
```

**Example Test Report**:
```markdown
# DR Test Report - Jan 2025

## Test Scenario
Simulated complete database failure in staging environment.

## Results
- **RTO Target**: 4 hours
- **Actual Recovery Time**: 2 hours 15 minutes 
- **RPO Target**: 1 hour
- **Actual Data Loss**: 0 minutes (restored from latest backup) 

## Issues Found
1. Backup restore took longer than expected (60 min vs 30 min estimate)
   - Root cause: Large database size (10GB)
   - Fix: Implement faster restore method (parallel restore)

2. Some environment variables not documented
   - Root cause: Missing from docs
   - Fix: Update environment variable checklist

3. DNS update unclear
   - Root cause: Procedure assumed knowledge
   - Fix: Add detailed DNS update steps

## Action Items
- [ ] Document all environment variables - @engineer1 - Feb 1
- [ ] Add DNS update procedure - @engineer2 - Feb 1
- [ ] Research parallel restore - @engineer3 - Feb 15
- [ ] Schedule next DR test - @manager - July 2025
```

---

## Disaster Recovery Checklist

Before production:

### Documentation
- [ ] Disaster recovery procedures documented
- [ ] Recovery playbooks created for each scenario
- [ ] RTO/RPO targets defined
- [ ] Contact list created (who to call during disaster)

### Backups
- [ ] Automated daily backups enabled (Railway)
- [ ] Offsite backups configured (self-hosted Linux server - optional)
- [ ] Backup retention policy defined (30-90 days)
- [ ] Backup restoration tested (quarterly)

### Infrastructure
- [ ] Railway project documented (services, databases, config)
- [ ] Environment variables documented
- [ ] DNS configuration documented
- [ ] Third-party integrations documented

### Testing
- [ ] DR test scheduled (annually)
- [ ] DR test plan created
- [ ] Team trained on DR procedures

### Communication
- [ ] Incident notification templates created
- [ ] User notification templates created (data breach)
- [ ] Regulatory compliance procedures documented (GDPR, CCPA)

---

## Disaster Recovery Runbook

**Quick reference for common disasters**

### Runbook: Database Destroyed

```bash
# 1. Create new database
railway db create

# 2. Get latest backup
BACKUP=$(ssh backup-server "ls -t /mnt/backups/*.sql.gz | head -1")

# 3. Restore
ssh backup-server "cat $BACKUP" | gunzip | psql $NEW_DB_URL

# 4. Update app
railway variables set DATABASE_URL=$NEW_DB_URL
railway restart

# 5. Verify
curl https://api.yourapp.com/health
```

### Runbook: Entire Project Deleted

```bash
# 1. Create new Railway project
railway login
railway init

# 2. Create resources
railway db create
railway redis create  # if using Redis

# 3. Restore database (see above)

# 4. Deploy app
railway up

# 5. Update DNS
# Railway dashboard → Domains → Add custom domain
# Update DNS CNAME to new Railway URL

# 6. Verify
curl https://api.yourapp.com/health
```

### Runbook: Security Breach

```bash
# 1. CONTAIN
railway down  # Stop all services immediately

# 2. REVOKE ACCESS
# Revoke all API keys, change all passwords

# 3. PATCH
# Fix vulnerability, deploy fix

# 4. ASSESS
# Query audit logs, identify affected data/users

# 5. NOTIFY
# Email affected users, report to regulators (GDPR 72h)

# 6. HARDEN
# Security audit, pen test, implement additional security
```

---

## Recovery Priority Order

**If multiple systems fail, recover in this order**:

1. **Database** (highest priority)
   - All data lives here
   - Without it, nothing works

2. **API** (second priority)
   - Users can't access app without API
   - Mobile apps depend on it

3. **Web Frontend** (third priority)
   - Users can use mobile app while web is down
   - Can rebuild quickly from git

4. **Background Workers** (fourth priority)
   - Non-critical, can tolerate delay
   - Emails, exports, etc. can wait

5. **Admin Tools** (lowest priority)
   - Internal only, not user-facing
   - Can wait 24 hours

---

## Summary

**Disaster recovery strategy**:
1. **Prevent**: Backups (3-2-1 rule), security hardening
2. **Detect**: Monitoring, alerts
3. **Respond**: Follow runbooks, prioritize recovery
4. **Restore**: Latest backup, rebuild infrastructure
5. **Verify**: Test everything, monitor closely
6. **Learn**: Post-mortem, improve procedures

**Key metrics**:
- **RTO**: 4 hours (API, database)
- **RPO**: 1 hour (maximum data loss)

**Critical procedures**:
- Restore database from backup
- Rebuild Railway project
- Respond to security breach
- Test DR annually

**Cost**: $0-20/month (backups + existing infrastructure)

**See Also**:
- `docs/06-operations/backups.md` - Backup strategies (3-2-1 rule)
- `docs/06-operations/incident-management.md` - Respond to non-disaster incidents
- `docs/06-operations/monitoring.md` - Detect disasters early
- `docs/rules/security-privacy.md` - Prevent security disasters

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

