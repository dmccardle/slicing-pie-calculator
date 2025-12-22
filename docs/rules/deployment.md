# Deployment & CI/CD Rules

## Overview

All deployments must be automated and connected to GitHub branches. We aim for fully automated CI/CD pipelines with minimal manual intervention.

## Core Principles

1. **Automated deployments** - No manual deployment steps
2. **Branch-based deployment** - Each environment has a corresponding branch
3. **Automated testing** - All tests run before deployment
4. **Fast feedback** - Developers know within minutes if deployment succeeds
5. **Easy rollback** - One-click rollback to previous version

---

## Deployment Platform

### Primary: Railway

We currently use **Railway** for deployments.

**Why Railway**:
- Simple configuration
- Supports multiple technologies (Next.js, Node.js, Python, etc.)
- Automatic HTTPS
- Easy environment variable management
- Good performance and reliability
- Reasonable pricing with our subscription

**Alternative platforms** (if needed):
- Vercel (for Next.js)
- Heroku
- AWS/GCP/Azure (for complex needs)

---

## Branch → Environment Mapping

| Branch | Environment | URL Pattern | Auto-Deploy |
|--------|-------------|-------------|-------------|
| `dev` | DEV | `https://dev.example.com` | Yes |
| `sit` | SIT | `https://sit.example.com` | Yes |
| `uat` | UAT | `https://uat.example.com` | Yes |
| `prod` | PROD | `https://app.example.com` | Yes (with approval) |

---

## Railway Configuration

### Setup

1. **Connect GitHub Repository** to Railway
2. **Create Services** for each environment
3. **Configure Branch Deployments**:
   - DEV service → `dev` branch
   - SIT service → `sit` branch
   - UAT service → `uat` branch
   - PROD service → `prod` branch

4. **Set Environment Variables** per service

### railway.json (Optional)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  pull_request:
  push:
    branches:
      - dev
      - sit
      - uat
      - prod

env:
  NODE_VERSION: '20'

jobs:
  # Job 1: Lint and Type Check
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npx tsc --noEmit

      - name: Check formatting
        run: npm run format:check

  # Job 2: Unit Tests
  test-unit:
    name: Unit Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  # Job 3: Build
  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next/
          retention-days: 1

  # Job 4: Integration Tests (only on sit/uat/prod branches)
  test-integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    if: contains(fromJSON('["sit", "uat", "prod"]'), github.ref_name)

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: npm run db:migrate

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: npm run test:integration

  # Job 5: E2E Tests (only on uat/prod branches)
  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    if: contains(fromJSON('["uat", "prod"]'), github.ref_name)

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  # Job 6: Security Scan
  security:
    name: Security Scan
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=moderate

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

---

## Deployment Process

### Automatic Deployment Flow

```
1. Developer pushes to branch
   ↓
2. GitHub Actions runs CI pipeline
   ↓
3. All checks must pass:
   - Linting 
   - Type checking 
   - Unit tests 
   - Build 
   - Integration tests (for sit/uat/prod)
   - E2E tests (for uat/prod)
   - Security scan 
   ↓
4. Railway automatically deploys
   ↓
5. Health check passes
   ↓
6. Deployment complete
   ↓
7. Notifications sent (Slack/email)
```

### Manual Approval (PROD only)

For production deployments:

```yaml
# Add to .github/workflows/ci.yml for prod branch
deploy-prod:
  name: Deploy to Production
  needs: [lint, test-unit, build, test-integration, test-e2e, security]
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/prod'
  environment:
    name: production
    url: https://app.example.com

  steps:
    - name: Wait for approval
      uses: trstringer/manual-approval@v1
      with:
        approvers: tech-lead,product-owner
        minimum-approvals: 2

    - name: Deploy to Railway
      # Railway deploys automatically on push
      # This step is just for notification
      run: echo "Deploying to production..."
```

---

## Environment Variables

### Managing Secrets

**In Railway**:
1. Go to project settings
2. Navigate to "Variables"
3. Add environment variables per service

**Never commit secrets**:
```bash
# BAD
DATABASE_URL=postgresql://user:password@host/db

# GOOD - In Railway dashboard
# Set via UI, not in code
```

### Required Variables

```bash
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=${{Railway.POSTGRES_CONNECTION_STRING}}

# Authentication
JWT_SECRET=${{secrets.JWT_SECRET}}
NEXTAUTH_SECRET=${{secrets.NEXTAUTH_SECRET}}

# External Services
STRIPE_SECRET_KEY=${{secrets.STRIPE_SECRET_KEY}}
SENDGRID_API_KEY=${{secrets.SENDGRID_API_KEY}}

# Public Variables
NEXT_PUBLIC_APP_URL=https://app.example.com
NEXT_PUBLIC_API_URL=https://app.example.com/api
```

---

## Health Checks

### Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;

    // Check critical services
    const checks = {
      database: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || 'unknown'
    };

    return Response.json({
      status: 'healthy',
      checks
    }, { status: 200 });

  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 503 });
  }
}
```

### Railway Health Check Configuration

```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100
  }
}
```

---

## Rollback Procedures

### Railway Rollback

1. Go to Railway dashboard
2. Select the service
3. Go to "Deployments"
4. Click "Rollback" on the previous stable deployment

### Git Rollback

```bash
# Option 1: Revert the commit
git revert HEAD
git push origin prod

# Option 2: Reset to previous tag
git reset --hard v1.2.2
git push origin prod --force-with-lease

# Option 3: Redeploy previous version
git checkout v1.2.2
git push origin prod --force-with-lease
```

### Database Rollback

```bash
# Rollback migrations
npm run db:migrate:rollback

# Or rollback to specific version
npm run db:migrate:rollback --to=20240101000000
```

---

## Monitoring & Alerts

### Application Monitoring

**Options**:
- Sentry (error tracking)
- LogRocket (session replay)
- Datadog (APM)
- New Relic (APM)

### Infrastructure Monitoring

**Railway provides**:
- CPU usage
- Memory usage
- Network usage
- Deployment logs

### Custom Alerts

```typescript
// lib/monitoring.ts
export async function trackError(error: Error, context: any) {
  // Send to Sentry
  Sentry.captureException(error, { extra: context });

  // Log for Railway
  console.error('Error:', error.message, context);

  // Alert if critical
  if (context.severity === 'critical') {
    await notifyTeam(error, context);
  }
}
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All CI checks pass
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Feature flags configured (if applicable)
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

### During Deployment

- [ ] Monitor deployment logs
- [ ] Watch error rates
- [ ] Check health endpoint
- [ ] Verify critical functionality

### Post-Deployment

- [ ] Run smoke tests
- [ ] Check monitoring dashboards
- [ ] Verify no spike in errors
- [ ] Test critical user flows
- [ ] Notify team of successful deployment

---

## Performance Optimization

### Build Optimization

```json
// next.config.js
module.exports = {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp']
  },

  // Enable compression
  compress: true,

  // Production source maps (smaller)
  productionBrowserSourceMaps: false
};
```

### Caching Strategy

```typescript
// Railway automatically provides:
// - CDN caching for static assets
// - Gzip compression
// - HTTP/2

// In your code:
export async function GET(request: Request) {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  });
}
```

---

## Database Migrations

### Running Migrations

```bash
# In package.json
{
  "scripts": {
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:rollback": "prisma migrate resolve --rolled-back"
  }
}
```

### Railway Migration Hook

```json
// railway.json
{
  "build": {
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run db:migrate && npm start"
  }
}
```

---

## Disaster Recovery

### Backup Strategy

**Database backups**:
- Automatic daily backups (Railway Postgres)
- Retention: 7 days (adjust as needed)
- Test restore process monthly

**Code backups**:
- Git repository (GitHub)
- Tagged releases
- Docker images (if applicable)

### Recovery Process

1. **Identify issue**: What failed?
2. **Assess impact**: How many users affected?
3. **Immediate action**: Rollback or hotfix?
4. **Communication**: Notify users if needed
5. **Post-mortem**: Document what happened and how to prevent

---

## Deployment Schedule

### Recommended Schedule

- **DEV**: Continuous deployment (multiple times per day)
- **SIT**: Daily (morning, after dev stabilizes)
- **UAT**: Weekly (Monday/Tuesday for stakeholder review)
- **PROD**: Weekly (Thursday/Friday after UAT approval)

### Deployment Windows

- **Best time**: Tuesday-Thursday, 10am-2pm (local time)
- **Avoid**: Mondays, Fridays after 3pm, weekends
- **Never**: Major holidays, peak business hours

---

## Troubleshooting

### Build Failures

```bash
# Check Railway logs
railway logs

# Test build locally
npm run build

# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Deployment Stuck

```bash
# Check Railway status
# Visit: https://status.railway.app/

# Trigger manual redeploy in Railway dashboard

# Or force redeploy via git
git commit --allow-empty -m "chore: trigger redeploy"
git push origin prod
```

### Environment Variable Issues

```bash
# Verify in Railway dashboard
# Settings → Variables

# Test locally
cp .env.example .env.local
# Fill in values
npm run dev
```

---

## Resources

- [Railway Documentation](https://docs.railway.app/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Deployment](https://vercel.com/docs)
- See `docs/rules/environments.md` for environment-specific details

---

## Related Documentation

**All Rules**:
- [API Design](./api-design.md) - API standards and versioning
- [UI Standards](./ui-standards.md) - Responsive design requirements
- [Security & Privacy](./security-privacy.md) - Security and GDPR compliance
- [Accessibility](./accessibility.md) - WCAG 2.2 Level AA
- [Testing](./testing.md) - Testing pyramid and coverage
- [Code Standards](./code-standards.md) - Linting and formatting
- [Clean Code](./clean-code.md) - Code quality principles
- [Git Workflow](./git-workflow.md) - Git-flow branching
- [Git Commits](./git-commits.md) - Conventional commits
- [Semantic Versioning](./semantic-versioning.md) - Version bumping
- [Technology Stack](./technology-stack.md) - Approved tools
- [Deployment](./deployment.md) - CI/CD pipelines
- [Environments](./environments.md) - Dev, staging, production

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Rules](./)

