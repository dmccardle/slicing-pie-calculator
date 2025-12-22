# Security Testing and Vulnerability Scanning

## Overview

Security testing prevents vulnerabilities before they reach production. This document defines security testing standards using **free, open-source tools** that integrate into your development workflow.

**Tools**:
- **Dependabot** - Automated dependency updates (free, built into GitHub)
- **Semgrep** - Static application security testing / SAST (free, open source)
- **npm audit** - Dependency vulnerability scanner (free, built into npm)

**Cost**: $0 (all free)

---

## Security Testing Types

### SAST (Static Application Security Testing)
- Scans code for vulnerabilities **before runtime**
- Finds: SQL injection, XSS, insecure configs
- Tool: **Semgrep**

### SCA (Software Composition Analysis)
- Scans dependencies for known vulnerabilities
- Finds: Vulnerable packages (CVEs)
- Tools: **Dependabot**, **npm audit**

### DAST (Dynamic Application Security Testing)
- Tests running application
- Finds: Runtime vulnerabilities, misconfigurations
- Tool: **OWASP ZAP** (optional, manual testing)

**This guide focuses on SAST + SCA (automated, run in CI/CD)**

---

## Part 1: Dependabot (Dependency Scanning)

### What is Dependabot?

Dependabot automatically:
- Scans dependencies for known vulnerabilities
- Creates pull requests to update vulnerable packages
- Runs daily (or weekly)
- **Built into GitHub** (no setup needed)

### Enable Dependabot

**1. Enable Dependabot Alerts**:
1. Go to GitHub repository → Settings → Security
2. Enable "Dependabot alerts"
3. Enable "Dependabot security updates"

**2. Configure Dependabot** (`.github/dependabot.yml`):

```yaml
version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"  # Check for updates weekly
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    reviewers:
      - "your-username"
    assignees:
      - "your-username"
    labels:
      - "dependencies"
      - "security"

    # Group non-security updates
    groups:
      production-dependencies:
        dependency-type: "production"
      development-dependencies:
        dependency-type: "development"

    # Auto-merge minor and patch updates
    allow:
      - dependency-type: "all"

  # Enable version updates for GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

**3. Review Dependabot PRs**:

Dependabot creates PRs like:
```
Bump next from 15.0.1 to 15.0.3
Security: Fixes CVE-2024-12345 (high severity)

- Fixes XSS vulnerability in server components
- Release notes: https://github.com/vercel/next.js/releases/tag/v15.0.3
```

**How to handle**:
- Security updates: **Merge immediately**
- Minor/patch updates: Review + merge
- ⏸️ Major updates: Test thoroughly before merging

### Auto-Merge Dependabot PRs (Optional)

For low-risk updates (patch versions):

**GitHub Actions** (`.github/workflows/dependabot-auto-merge.yml`):

```yaml
name: Dependabot Auto-Merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v2

      - name: Auto-merge patch updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{github.event.pull_request.html_url}}
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

**Only auto-merges**:
- Patch updates (1.2.3 → 1.2.4)
- After CI passes (tests, linting)

**Security note**: Never auto-merge major updates without review.

---

## Part 2: Semgrep (SAST - Code Scanning)

### What is Semgrep?

Semgrep scans your code for security vulnerabilities and anti-patterns:
- SQL injection
- XSS (Cross-Site Scripting)
- Hardcoded secrets
- Insecure authentication
- SSRF (Server-Side Request Forgery)
- And 1000+ more rules

**Free for open source and commercial use.**

### Setup Semgrep

**1. Install Semgrep locally**:

```bash
# macOS
brew install semgrep

# Or via pip
pip install semgrep
```

**2. Run Semgrep locally**:

```bash
# Scan with auto-detected rules
semgrep scan --config=auto

# Scan with specific ruleset
semgrep scan --config=p/security-audit

# Scan only changed files (fast)
semgrep scan --config=auto --baseline-commit=main
```

**3. GitHub Actions Integration** (`.github/workflows/semgrep.yml`):

```yaml
name: Semgrep Security Scan

on:
  pull_request: {}
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  semgrep:
    name: Scan with Semgrep
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/secrets
            p/owasp-top-ten
            p/typescript
          generateSarif: true

      # Upload results to GitHub Security tab
      - name: Upload SARIF file
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: semgrep.sarif
        if: always()
```

**4. Configure Semgrep** (`.semgrepignore`):

```
# Ignore test files
__tests__/
*.test.ts
*.test.tsx
*.spec.ts

# Ignore build output
.next/
dist/
build/

# Ignore dependencies
node_modules/

# Ignore config files
*.config.js
*.config.ts
```

### Semgrep Rulesets

**Recommended rulesets**:

| Ruleset | Purpose |
|---------|---------|
| `p/security-audit` | General security issues |
| `p/owasp-top-ten` | OWASP Top 10 vulnerabilities |
| `p/secrets` | Hardcoded secrets, API keys |
| `p/typescript` | TypeScript-specific issues |
| `p/react` | React security issues (XSS, etc.) |
| `p/nextjs` | Next.js specific issues |

**Run specific ruleset**:
```bash
semgrep scan --config=p/owasp-top-ten
```

### Custom Semgrep Rules

Create custom rules for your codebase:

**`.semgrep/rules/no-hardcoded-secrets.yml`**:
```yaml
rules:
  - id: hardcoded-database-password
    pattern: |
      const password = "..."
    message: "Hardcoded password detected. Use environment variables."
    severity: ERROR
    languages: [typescript, javascript]

  - id: hardcoded-api-key
    patterns:
      - pattern: |
          const apiKey = "..."
      - pattern-not: |
          const apiKey = process.env.API_KEY
    message: "Hardcoded API key. Use environment variables."
    severity: ERROR
    languages: [typescript, javascript]
```

**Run custom rules**:
```bash
semgrep scan --config=.semgrep/rules/
```

---

## Part 3: npm audit (Dependency Vulnerabilities)

### What is npm audit?

Built into npm, scans `package-lock.json` for vulnerabilities.

### Run npm audit

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (updates package-lock.json)
npm audit fix

# Fix including breaking changes
npm audit fix --force
```

**Example output**:
```
found 3 vulnerabilities (1 moderate, 2 high)

┌───────────────┬────────────────────────────────────────────┐
│ moderate      │ Prototype Pollution in minimist            │
├───────────────┼────────────────────────────────────────────┤
│ Package       │ minimist                                   │
├───────────────┼────────────────────────────────────────────┤
│ Patched in    │ >=1.2.6                                    │
├───────────────┼────────────────────────────────────────────┤
│ Dependency of │ mkdirp                                     │
├───────────────┼────────────────────────────────────────────┤
│ Path          │ mkdirp > minimist                          │
├───────────────┼────────────────────────────────────────────┤
│ More info     │ https://github.com/advisories/GHSA-xvch-5 │
└───────────────┴────────────────────────────────────────────┘
```

### GitHub Actions Integration

**`.github/workflows/npm-audit.yml`**:
```yaml
name: npm audit

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Auto-fix vulnerabilities
        if: failure()
        run: |
          npm audit fix
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add package-lock.json
          git commit -m "fix: npm audit auto-fix"
          git push
```

**Fails build if**:
- Moderate or higher vulnerabilities found
- Auto-fixes and commits if possible

---

## Common Vulnerabilities and How to Prevent

### 1. SQL Injection

**Bad **:
```typescript
// NEVER concatenate user input into SQL
const query = `SELECT * FROM users WHERE email = '${email}'`;
await db.execute(query);
```

**Good **:
```typescript
// Use parameterized queries (Prisma does this automatically)
const user = await prisma.user.findUnique({
  where: { email },  // Safe - parameterized
});

// Or use raw queries with parameters
await prisma.$executeRaw`
  SELECT * FROM users WHERE email = ${email}
`;  // Safe - parameterized
```

**Semgrep detects**: SQL injection patterns

### 2. XSS (Cross-Site Scripting)

**Bad **:
```tsx
// NEVER use dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Good **:
```tsx
// React escapes by default
<div>{userInput}</div>  // Safe - automatically escaped

// If you must use HTML, sanitize it first
import DOMPurify from 'isomorphic-dompurify';

<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />
```

**Semgrep detects**: Unsafe `dangerouslySetInnerHTML` usage

### 3. Hardcoded Secrets

**Bad **:
```typescript
const API_KEY = "sk-1234567890abcdef";  // Exposed in git
const DB_PASSWORD = "mypassword123";
```

**Good **:
```typescript
const API_KEY = process.env.API_KEY;  // From environment
const DB_PASSWORD = process.env.DATABASE_PASSWORD;

if (!API_KEY) {
  throw new Error('API_KEY not set');
}
```

**Semgrep detects**: Hardcoded secrets

**Also use**: `.gitignore` to exclude `.env` files

### 4. Insecure Direct Object References (IDOR)

**Bad **:
```typescript
// User can access any order by changing ID in URL
export async function GET(request: Request, { params }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
  });

  return Response.json(order);  // No authorization check!
}
```

**Good **:
```typescript
export async function GET(request: Request, { params }) {
  const userId = await getUserId(request);  // Get authenticated user

  const order = await prisma.order.findUnique({
    where: {
      id: params.id,
      userId,  // Ensure user owns this order
    },
  });

  if (!order) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json(order);
}
```

**Semgrep can detect**: Missing authorization checks (with custom rules)

### 5. Server-Side Request Forgery (SSRF)

**Bad **:
```typescript
// User controls URL - can access internal services
export async function POST(request: Request) {
  const { url } = await request.json();
  const response = await fetch(url);  // Dangerous!
  return response;
}
```

**Good **:
```typescript
export async function POST(request: Request) {
  const { url } = await request.json();

  // Whitelist allowed domains
  const allowedDomains = ['api.stripe.com', 'api.github.com'];
  const urlObj = new URL(url);

  if (!allowedDomains.includes(urlObj.hostname)) {
    return Response.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const response = await fetch(url);
  return response;
}
```

**Semgrep detects**: Unsafe fetch with user-controlled URLs

---

## Security in CI/CD Pipeline

### Complete Security Workflow

**`.github/workflows/security.yml`**:
```yaml
name: Security Checks

on:
  pull_request:
  push:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      # 1. Dependency vulnerabilities
      - name: npm audit
        run: npm audit --audit-level=high

      # 2. SAST (code scanning)
      - name: Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/owasp-top-ten
            p/secrets

      # 3. Linting (catches some security issues)
      - name: ESLint
        run: npm run lint

      # 4. Type checking (prevents type-related bugs)
      - name: TypeScript
        run: npm run type-check

      # All must pass before merge allowed
```

**Prevents merging if**:
- High/critical vulnerabilities in dependencies
- Security issues found by Semgrep
- Linting errors
- Type errors

---

## Security Checklist

Before production:

### Code Security
- [ ] Semgrep scanning enabled in GitHub Actions
- [ ] No hardcoded secrets (all in environment variables)
- [ ] All database queries parameterized (no SQL injection)
- [ ] User input sanitized (XSS prevention)
- [ ] Authorization checks on all API routes
- [ ] CORS configured properly
- [ ] Rate limiting implemented

### Dependency Security
- [ ] Dependabot enabled (alerts + security updates)
- [ ] npm audit runs in CI/CD
- [ ] Dependencies regularly updated
- [ ] No high/critical vulnerabilities

### Configuration Security
- [ ] `.env` files in `.gitignore`
- [ ] Secrets in environment variables (not code)
- [ ] HTTPS enforced in production
- [ ] Security headers configured

### Monitoring
- [ ] Security alerts enabled (Dependabot, Semgrep)
- [ ] Failed login attempts logged
- [ ] Suspicious activity monitored (Better Stack)

---

## Responding to Security Issues

### High-Severity Vulnerability Found

**1. Assess severity**:
- Critical: Allows unauthorized access, data breach
- High: Exploitable but limited impact
- Medium: Requires specific conditions
- Low: Minimal impact

**2. Fix immediately** (critical/high):
```bash
# Update vulnerable package
npm update <package-name>

# Or if breaking change required
npm install <package-name>@latest

# Test application
npm test

# Commit and deploy
git add package.json package-lock.json
git commit -m "fix(security): update vulnerable package"
git push

# Deploy to production immediately
railway up
```

**3. Document in changelog**:
```markdown
## [1.2.3] - 2025-01-21

### Security
- Fixed SQL injection vulnerability in user search (CVE-2024-12345)
- Updated `next` to 15.0.3 (XSS fix)
```

**4. Notify users** (if data breach):
- Email affected users
- Post on status page
- Follow breach notification laws

---

## Cost Summary

**All tools are FREE**:
- Dependabot - Free (built into GitHub)
- Semgrep - Free (open source)
- npm audit - Free (built into npm)
- GitHub Actions - Free (2000 minutes/month)

**Total cost**: $0/month

**Optional paid upgrades**:
- Semgrep Team ($1000/year) - Advanced rules, team features
- Snyk ($98/dev/month) - More comprehensive scanning

**Recommendation**: Start with free tools, upgrade only if needed.

---

## Summary

**Security testing strategy**:
1. **Dependabot**: Auto-update vulnerable dependencies
2. **Semgrep**: Scan code for security issues (SAST)
3. **npm audit**: Check dependencies for CVEs
4. **CI/CD**: Block merges if security issues found

**Automated checks on every PR**:
- Dependency vulnerabilities
- Code security issues
- Secrets in code
- OWASP Top 10 vulnerabilities

**Cost**: $0 (all free tools)

**See Also**:
- `docs/rules/security-privacy.md` - Security best practices
- `docs/06-operations/incident-response.md` - Security incident response
- `docs/06-operations/monitoring.md` - Security monitoring

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

