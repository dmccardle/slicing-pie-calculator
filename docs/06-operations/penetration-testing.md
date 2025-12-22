# Penetration Testing

## Overview

Penetration testing (pen testing) simulates real attacks to find security vulnerabilities before hackers do. This document defines when and how to conduct pen tests.

**Rule**: Test your defenses before attackers do.

---

## What is Penetration Testing?

**Penetration testing** = Authorized simulated cyber attack to find vulnerabilities

**Types**:

1. **Black Box**: Tester has no insider knowledge (simulates external hacker)
2. **White Box**: Tester has full knowledge (code, infrastructure)
3. **Gray Box**: Tester has partial knowledge (API docs, user account)

**What pen testers look for**:
- SQL injection
- Cross-site scripting (XSS)
- Authentication bypass
- API vulnerabilities
- Misconfigurations
- Privilege escalation

---

## When to Do Penetration Testing

### Do pen testing when:

1. **Before major launch**
   - Going from beta to public launch
   - Raising Series A+ (investors ask for it)
   - Selling to enterprise (customers require it)

2. **After significant changes**
   - New payment processing system
   - New authentication system
   - Major architecture change

3. **Annually (if handling sensitive data)**
   - Healthcare (HIPAA)
   - Finance (PCI DSS)
   - Large user base (> 100K users)

4. **After a security incident**
   - To find other vulnerabilities
   - To verify remediation

### Don't pen test when:

- You're pre-launch with no users (waste of money)
- You haven't fixed basic security issues (see `docs/06-operations/security-testing.md` first)
- You have < 1,000 users (SAST/DAST tools are enough)

**Typical timeline**:
- Pre-launch: Skip (too early)
- 0-1K users: Use Semgrep SAST (automated)
- 1K-10K users: Use OWASP ZAP (automated DAST)
- 10K+ users OR enterprise customers: Hire pen tester

---

## DIY Penetration Testing (Free)

**For startups on a budget, use automated tools first:**

### 1. OWASP ZAP (Free DAST Tool)

**DAST** = Dynamic Application Security Testing (test running app)

**Install**:

```bash
# Install OWASP ZAP
brew install owasp-zap  # macOS

# Or download from https://www.zaproxy.org/download/
```

**Run automated scan**:

```bash
# Start ZAP in daemon mode
zap.sh -daemon -port 8080 -config api.disablekey=true

# Run scan against your app (use staging, not production!)
zap-cli quick-scan --self-contained \
  --start-options '-config api.disablekey=true' \
  https://staging.yourapp.com

# Generate report
zap-cli report -o zap-report.html -f html
```

**What ZAP tests**:
- SQL injection
- XSS (cross-site scripting)
- CSRF (cross-site request forgery)
- Insecure cookies
- Missing security headers
- Path traversal

**Example findings**:

```markdown
# OWASP ZAP Scan Report

## High Risk Issues (Fix Immediately)

### 1. SQL Injection in /api/v1/search
- Endpoint: /api/v1/search?q=[PAYLOAD]
- Payload: ' OR 1=1--
- Risk: Attacker can read/modify database

Fix:
- Use parameterized queries (Prisma does this automatically)
- Add input validation

### 2. Missing Content-Security-Policy Header
- Risk: XSS attacks possible
- Fix: Add CSP header in next.config.js

## Medium Risk Issues

### 3. Session Cookie Missing HttpOnly Flag
- Risk: XSS can steal session cookies
- Fix: Set HttpOnly flag on session cookies
```

**Run ZAP monthly** (schedule in CI/CD or run manually)

### 2. Nuclei (Free Vulnerability Scanner)

**Nuclei** = Fast vulnerability scanner with 1,000+ templates

**Install**:

```bash
# Install Nuclei
brew install nuclei  # macOS

# Update templates
nuclei -update-templates
```

**Run scan**:

```bash
# Scan for common vulnerabilities
nuclei -u https://staging.yourapp.com

# Scan with specific templates
nuclei -u https://staging.yourapp.com \
  -t exposures/ \
  -t vulnerabilities/ \
  -t misconfiguration/

# Output to file
nuclei -u https://staging.yourapp.com -o nuclei-report.txt
```

**What Nuclei tests**:
- Exposed .env files
- Exposed .git directory
- Default credentials
- Known CVEs
- Misconfigurations

**Run Nuclei weekly** (quick, can run in CI/CD)

### 3. Nikto (Web Server Scanner)

**Nikto** = Tests web server configuration

**Install**:

```bash
brew install nikto  # macOS
```

**Run scan**:

```bash
nikto -h https://staging.yourapp.com -o nikto-report.html -Format html
```

**What Nikto tests**:
- Outdated server versions
- Dangerous files/programs
- Server misconfigurations
- SSL/TLS issues

---

## Professional Penetration Testing (Paid)

**When automated tools aren't enough, hire professionals.**

### When to Hire Pen Testers

1. **Enterprise customers require it** (RFPs ask for pen test reports)
2. **Handling sensitive data** (healthcare, finance)
3. **Passed automated scans** (want deeper testing)
4. **Pre-IPO security audit**

**Cost**:
- Small scope (web app only): $5,000-$15,000
- Medium scope (web + API + mobile): $15,000-$40,000
- Large scope (full infrastructure): $40,000-$100,000

**Duration**: 1-3 weeks

### How to Hire Pen Testers

**Options**:

#### Option A: Freelance Pen Tester

**Where to find**:
- [HackerOne Hackers](https://www.hackerone.com/product/professional-services)
- [Bugcrowd](https://www.bugcrowd.com/)
- Upwork (search "penetration testing")

**Pros**: Cheaper ($3,000-$10,000)
**Cons**: Quality varies, no insurance

#### Option B: Pen Testing Firm

**Recommended firms**:
- [Cure53](https://cure53.de/) (top-tier, expensive)
- [NCC Group](https://www.nccgroup.com/)
- [Bishop Fox](https://bishopfox.com/)
- [Cobalt](https://www.cobalt.io/) (crowdsourced, cheaper)

**Pros**: Reputable, insured, detailed reports
**Cons**: Expensive ($15,000-$100,000)

#### Option C: Bug Bounty Program

**Ongoing pen testing by crowd**:

**Platforms**:
- [HackerOne](https://www.hackerone.com/)
- [Bugcrowd](https://www.bugcrowd.com/)
- [Intigriti](https://www.intigriti.com/)

**How it works**:
1. Set up bug bounty program
2. Define scope (what can be tested)
3. Set rewards ($100-$10,000 per bug)
4. Hackers find bugs, you pay bounties
5. Platform handles triage and validation

**Cost**:
- Setup fee: $0-$3,000
- Platform fee: 20% of bounties paid
- Bounties: $100-$10,000 per bug (you set amounts)

**Pros**: Ongoing testing, pay per bug
**Cons**: Can be expensive if many bugs found

**When to start bug bounty**:
- You've fixed all Semgrep/ZAP findings
- You have budget ($5,000-$20,000/year)
- You have team to triage reports

**Bounty Amounts (Example)**:

| Severity | Example | Bounty |
|----------|---------|--------|
| Critical | SQL injection, RCE | $2,000-$10,000 |
| High | Authentication bypass, XSS | $500-$2,000 |
| Medium | CSRF, information disclosure | $100-$500 |
| Low | Missing security headers | $50-$100 |

---

## Conducting Pen Test

### Pre-Test Preparation

**Before hiring pen tester**:

1. **Define scope** (what should be tested):
   ```markdown
   ## In Scope
   - Web app: https://app.yourapp.com
   - API: https://api.yourapp.com
   - Mobile app: iOS + Android
   - Admin panel: https://admin.yourapp.com

   ## Out of Scope
   - Marketing website (static, no user data)
   - Third-party services (Stripe, Railway)
   - Physical security (office access)
   - Social engineering (phishing employees)

   ## Test Accounts
   - Standard user: test@example.com / [password]
   - Admin user: admin@example.com / [password]
   ```

2. **Set rules of engagement**:
   ```markdown
   ## Rules
   - Test on staging environment only (not production)
   - No denial-of-service attacks
   - No testing outside business hours (9 AM - 5 PM PT)
   - Report critical vulnerabilities immediately (don't wait for final report)
   - Do not exfiltrate real user data
   ```

3. **Get authorization in writing**:
   ```markdown
   # Penetration Testing Authorization

   [Company Name] authorizes [Pen Tester Name] to conduct penetration testing on the following systems:

   - https://staging.yourapp.com
   - https://api-staging.yourapp.com

   Testing period: January 20 - January 31, 2025

   Signed: [Your Name, CEO]
   Date: January 15, 2025
   ```

   **Why**: Without written authorization, pen testing is illegal (Computer Fraud and Abuse Act)

### During Test

**Communication**:
- Daily check-ins (Slack channel)
- Immediate notification of critical findings
- Answer questions about architecture

**Monitor**:
- Better Stack logs (watch for unusual activity)
- Error rates (pen testing will trigger errors)
- Performance (some tests are resource-intensive)

### Post-Test Report

**Pen tester delivers report**:

```markdown
# Penetration Test Report

## Executive Summary
We tested [Company] web application from January 20-31, 2025.
Found 3 critical, 5 high, 8 medium, 12 low severity issues.

## Methodology
- Black box testing (simulated external attacker)
- OWASP Top 10 methodology
- Tools: Burp Suite, SQLMap, Metasploit

## Findings

### Critical: SQL Injection in Search API
- Severity: Critical (10.0 CVSS)
- Endpoint: /api/v1/search?q=[PAYLOAD]
- Impact: Full database compromise (read/write/delete)
- Proof of Concept:
  ```
  GET /api/v1/search?q=' OR 1=1--
  Result: Returned all users from database
  ```
- Recommendation:
  - Use parameterized queries (Prisma)
  - Add input validation (reject SQL keywords)
  - Add WAF rules

### High: Broken Authentication
- Severity: High (8.5 CVSS)
- Endpoint: /api/v1/auth/reset-password
- Impact: Account takeover via predictable password reset tokens
- Proof of Concept:
  ```
  Token format: user-id + timestamp (predictable)
  Attacker can guess valid tokens for any user
  ```
- Recommendation:
  - Use cryptographically secure random tokens (crypto.randomUUID())
  - Set short expiration (15 minutes)
  - One-time use only

## Remediation Priorities
1. Fix critical (SQL injection) - ASAP
2. Fix high (broken auth) - Within 1 week
3. Fix medium - Within 1 month
4. Fix low - Backlog

## Retest
We recommend retest after critical/high issues fixed (2-4 weeks).
```

### Remediation

**Fix vulnerabilities by severity**:

1. **Critical**: Fix immediately (same day)
2. **High**: Fix within 1 week
3. **Medium**: Fix within 1 month
4. **Low**: Backlog (fix when convenient)

**Track in issue tracker**:

```markdown
# [SECURITY] SQL Injection in Search API

Severity: Critical
Found by: Pen test (Jan 2025)
CVSS: 10.0

## Vulnerability
SQL injection in /api/v1/search endpoint allows attacker to read/modify database.

## Fix
- [ ] Replace raw SQL with Prisma parameterized query
- [ ] Add input validation (zod schema)
- [ ] Add WAF rule to block SQL injection attempts
- [ ] Deploy fix to production
- [ ] Verify fix (retest with pen tester)

## Timeline
- Fix deployed: [Date]
- Retest scheduled: [Date]
- Verified fixed: [Date]
```

### Retest

**After fixing critical/high issues, request retest**:
- Pen tester verifies fixes
- Issues "Retest Report" confirming vulnerabilities are fixed
- Keep report for compliance (SOC 2, enterprise customers)

---

## Penetration Testing Checklist

Before pen test:

### Preparation
- [ ] Define scope (in-scope systems, out-of-scope)
- [ ] Set rules of engagement (no DoS, staging only, etc.)
- [ ] Get written authorization (signed document)
- [ ] Create test accounts (standard user, admin)
- [ ] Set up staging environment (mirror of production)

### During Test
- [ ] Daily check-ins with pen tester
- [ ] Monitor logs (Better Stack)
- [ ] Respond to questions
- [ ] Critical findings reported immediately

### After Test
- [ ] Receive pen test report
- [ ] Triage findings by severity
- [ ] Create tickets for all vulnerabilities
- [ ] Fix critical/high within 1-2 weeks
- [ ] Schedule retest
- [ ] Keep report for compliance

---

## Summary

**DIY pen testing** (free, for startups):
- OWASP ZAP (automated DAST)
- Nuclei (vulnerability scanner)
- Nikto (web server scanner)
- Run monthly

**Professional pen testing** ($5K-$100K):
- Hire when enterprise customers require it
- Hire when handling sensitive data
- Hire annually (if > 100K users)

**Bug bounty** ($5K-$20K/year):
- Ongoing pen testing by crowd
- Pay per bug found
- Start when you've fixed all automated scan findings

**Remediation timeline**:
- Critical: Same day
- High: Within 1 week
- Medium: Within 1 month
- Low: Backlog

**See Also**:
- `docs/06-operations/security-testing.md` - Automated security testing (Semgrep, Dependabot)
- `docs/rules/security-privacy.md` - Security best practices
- `docs/06-operations/incident-management.md` - Respond to security incidents

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

