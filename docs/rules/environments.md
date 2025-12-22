# Environment Stages & Promotion Checklists

## Overview

We maintain four distinct environments, each with specific testing requirements and promotion criteria.

## Environment Flow

```
Development (DEV) → Testing (SIT) → User Acceptance (UAT) → Production (PROD)
       ↓                ↓                    ↓                    ↓
   Unit Tests    Integration Tests    Acceptance Tests      Smoke Tests
```

---

## CRITICAL: Branch Protection Setup

**When creating environment branches** (`dev`, `sit`, `uat`, `prod`), you **MUST** enable branch protection immediately:

**Required Steps:**
1. Go to GitHub: Settings > Branches > Add branch protection rule
2. Apply protection to: `main`, `dev`, `sit`, `uat`, `prod`
3. Enable for each branch:
   - Require pull request before merging
   - Require status checks to pass
   - Require branches to be up to date before merging
   - Do not allow bypassing the above settings
   - Do not allow force pushes
   - Do not allow deletions

**Why This Matters:**
- Prevents accidental direct pushes to environment branches
- Enforces code review process
- Ensures CI/CD gates are not bypassed
- Protects production and staging environments

**For AI Agents (Claude Code):**
- AI agents MUST NEVER push directly to these protected branches
- All changes MUST go through feature branch → PR → review → merge workflow
- See `docs/rules/git-workflow.md#branch-protection` for complete rules

---

## Environment Details

### DEV - Development

**Purpose**: Active development and unit testing

**Branch**: `dev`

**URL**: `http://localhost:3000` (local) or `https://dev.example.com`

**Database**: Development database (can be reset frequently)

**Testing**:
- Unit tests
- Component tests
- Quick manual testing

**Who has access**: All developers

**Deployment**: Automatic on push to `dev` branch

---

### SIT - System Integration Testing

**Purpose**: Integration testing with real services

**Branch**: `sit`

**URL**: `https://sit.example.com`

**Database**: Test database (more stable than DEV)

**Testing**:
- Integration tests
- API tests
- Database migrations
- Third-party integrations

**Who has access**: Developers, QA team

**Deployment**: Manual promotion from `dev` after passing DEV checklist

---

### UAT - User Acceptance Testing

**Purpose**: Stakeholder validation and end-to-end testing

**Branch**: `uat` (or `staging`)

**URL**: `https://uat.example.com`

**Database**: Mirror of production (anonymized data)

**Testing**:
- User acceptance tests
- End-to-end tests
- Performance testing
- Accessibility testing
- Security testing
- Manual stakeholder review

**Who has access**: Developers, QA, Product team, Stakeholders

**Deployment**: Manual promotion from `sit` after passing SIT checklist

---

### PROD - Production

**Purpose**: Live environment serving real users

**Branch**: `prod` (synced to `main` after deployment)

**URL**: `https://example.com` (or `https://app.example.com`)

**Database**: Production database

**Testing**:
- Smoke tests after deployment
- Real-time monitoring
- Rollback plan ready

**Who has access**: All users (public or authenticated)

**Deployment**: Manual promotion from `uat` after passing UAT checklist and approval

---

## Promotion Checklists

### DEV → SIT Promotion

**Before merging feature branch to `dev`:**

- [ ] **Build**: Project builds successfully
  ```bash
  npm run build
  ```

- [ ] **Linter**: 0 errors, 0 warnings
  ```bash
  npm run lint
  ```

- [ ] **Unit Tests**: All pass
  ```bash
  npm run test
  ```

- [ ] **Code Coverage**: Meets threshold (80%+)
  ```bash
  npm run test:coverage
  ```

- [ ] **Type Checking**: No TypeScript errors
  ```bash
  npx tsc --noEmit
  ```

- [ ] **Code Review**: At least 1 approval

- [ ] **Documentation**: Updated if needed

- [ ] **No Console Errors**: Clean browser console

**After merging to `dev`, before promoting to `sit`:**

- [ ] **Dev Environment**: Deployed and tested manually

- [ ] **Regression**: No existing features broken

- [ ] **Database Migrations**: Run successfully

---

### SIT → UAT Promotion

**Requirements:**

- [ ] **All DEV checklist items** pass

- [ ] **Integration Tests**: All pass
  ```bash
  npm run test:integration
  ```

- [ ] **API Testing**: All endpoints tested and documented

- [ ] **Database Integrity**: Migrations tested, no data loss

- [ ] **External Services**: All integrations working
  - Payment gateway (if applicable)
  - Email service
  - Storage service
  - Analytics
  - Any third-party APIs

- [ ] **Error Handling**: Graceful error handling verified

- [ ] **Logging**: Appropriate logging in place (no PII logged)

- [ ] **Performance**: API response times acceptable
  - < 200ms for simple queries
  - < 1s for complex queries

- [ ] **Security**: No new vulnerabilities introduced
  ```bash
  npm audit
  ```

- [ ] **QA Review**: QA team has tested and approved

---

### UAT → PROD Promotion

**Requirements:**

- [ ] **All SIT checklist items** pass

- [ ] **User Acceptance**: Acceptance criteria met for all user stories

- [ ] **End-to-End Tests**: All pass
  ```bash
  npm run test:e2e
  ```

- [ ] **Cross-Browser Testing**: Tested on:
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)

- [ ] **Mobile Testing**: Tested on:
  - [ ] iOS (Safari)
  - [ ] Android (Chrome)

- [ ] **Accessibility**: WCAG 2.2 Level AA compliance verified
  ```bash
  npm run test:a11y
  ```

- [ ] **Performance**:
  - [ ] Lighthouse score > 90
  - [ ] First Contentful Paint < 1.5s
  - [ ] Time to Interactive < 3s
  - [ ] No memory leaks

- [ ] **Security Review**:
  - [ ] No secrets in code
  - [ ] All inputs validated
  - [ ] Authentication working
  - [ ] Authorization working
  - [ ] HTTPS enforced
  - [ ] Security headers configured

- [ ] **Documentation**:
  - [ ] Release notes prepared
  - [ ] User documentation updated
  - [ ] API documentation updated

- [ ] **Rollback Plan**: Documented and tested

- [ ] **Monitoring**: Alerts configured for critical metrics

- [ ] **Manual Approval**: Product Owner and Tech Lead approval

- [ ] **Communication**: Team notified of deployment window

---

## Environment Variables

### DEV

```bash
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/myapp_dev
API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOG_LEVEL=debug
ENABLE_DEBUG_TOOLS=true
```

### SIT

```bash
NODE_ENV=production
DATABASE_URL=postgresql://sit-db.example.com:5432/myapp_sit
API_URL=https://sit.example.com/api
NEXT_PUBLIC_APP_URL=https://sit.example.com
LOG_LEVEL=info
ENABLE_DEBUG_TOOLS=false
```

### UAT

```bash
NODE_ENV=production
DATABASE_URL=postgresql://uat-db.example.com:5432/myapp_uat
API_URL=https://uat.example.com/api
NEXT_PUBLIC_APP_URL=https://uat.example.com
LOG_LEVEL=info
ENABLE_DEBUG_TOOLS=false
```

### PROD

```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod-db.example.com:5432/myapp_prod
API_URL=https://app.example.com/api
NEXT_PUBLIC_APP_URL=https://app.example.com
LOG_LEVEL=warn
ENABLE_DEBUG_TOOLS=false
```

---

## Database Management

### Database Strategy

| Environment | Database | Reset Frequency | Seed Data |
|-------------|----------|-----------------|-----------|
| **DEV** | Local/Dev DB | Frequently (as needed) | Yes |
| **SIT** | Shared Test DB | Weekly | Yes |
| **UAT** | Staging DB | Rarely | Production-like (anonymized) |
| **PROD** | Production DB | Never (migrations only) | Real data |

### Migration Process

```bash
# DEV - Run migrations
npm run db:migrate

# SIT - Test migrations
npm run db:migrate

# UAT - Validate migrations with production-like data
npm run db:migrate

# PROD - Run migrations during deployment
npm run db:migrate
```

### Rollback Migrations

```bash
# Rollback last migration
npm run db:migrate:rollback

# Rollback to specific version
npm run db:migrate:rollback --to=20240101000000
```

---

## Automated Testing Per Environment

### DEV

```bash
# Pre-commit hooks
- ESLint
- Prettier
- TypeScript check
- Unit tests (affected files)

# On push to dev branch
- Full unit test suite
- Build verification
```

### SIT

```bash
# On promotion to sit
- All unit tests
- Integration tests
- API tests
- Database migration tests
```

### UAT

```bash
# On promotion to uat
- All previous tests
- E2E tests
- Accessibility tests
- Performance tests
- Security scans
```

### PROD

```bash
# After deployment
- Smoke tests
- Health checks
- Monitoring alerts
```

---

## Promotion Commands

### DEV → SIT

```bash
# 1. Ensure dev is tested
git checkout dev
git pull origin dev
npm run lint
npm run test
npm run build

# 2. Merge to sit
git checkout sit
git pull origin sit
git merge dev

# 3. Run integration tests
npm run test:integration

# 4. Push to sit
git push origin sit

# 5. Verify deployment
# Check SIT URL
```

### SIT → UAT

```bash
# 1. Ensure sit is stable
git checkout sit
git pull origin sit

# 2. Merge to uat
git checkout uat
git pull origin uat
git merge sit

# 3. Run acceptance tests
npm run test:e2e

# 4. Push to uat
git push origin uat

# 5. Notify stakeholders for UAT
```

### UAT → PROD

```bash
# 1. Get approvals
# - Product Owner approval
# - Tech Lead approval
# - QA sign-off

# 2. Merge to prod
git checkout uat
git pull origin uat
git checkout prod
git pull origin prod
git merge uat

# 3. Tag release
git tag -a v1.2.3 -m "Release v1.2.3: Feature description"

# 4. Push
git push origin prod
git push origin v1.2.3

# 5. Monitor deployment
# - Watch logs
# - Check error rates
# - Verify metrics

# 6. Sync main branch
git checkout main
git pull origin main
git merge prod
git push origin main
```

---

## Rollback Procedures

### Automatic Rollback Triggers

Automatically rollback if:
- Error rate > 5%
- Response time > 5s
- Health check fails
- Critical functionality broken

### Manual Rollback

```bash
# Option 1: Revert deployment
# On Railway/Vercel, use platform rollback feature

# Option 2: Git revert
git checkout prod
git revert HEAD
git push origin prod

# Option 3: Reset to previous tag
git checkout prod
git reset --hard v1.2.2  # Previous stable version
git push origin prod --force-with-lease

# Important: Also rollback database migrations if needed
npm run db:migrate:rollback
```

---

## Monitoring & Alerts

### Health Checks

```typescript
// API health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database
    await db.$queryRaw`SELECT 1`;

    // Check external services
    const externalHealth = await checkExternalServices();

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: externalHealth
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### Alerts Configuration

**Critical Alerts** (immediate notification):
- API error rate > 5%
- Database connection failure
- Authentication service down
- Payment processing failure

**Warning Alerts** (next business day):
- API response time > 3s
- Memory usage > 80%
- Disk usage > 80%
- High number of 404s

---

## Environment-Specific Features

### Feature Flags

```typescript
// Use feature flags for gradual rollouts
const features = {
  newDashboard: {
    dev: true,
    sit: true,
    uat: true,
    prod: false  // Not yet in production
  },
  betaFeature: {
    dev: true,
    sit: true,
    uat: false,
    prod: false
  }
};

// In code
if (features.newDashboard[process.env.NODE_ENV]) {
  return <NewDashboard />;
}
```

---

## Emergency Procedures

### Production Hotfix

```bash
# 1. Branch from prod (not dev!)
git checkout prod
git pull origin prod
git checkout -b hotfix-critical-issue

# 2. Make minimal fix
# ... make changes ...
git commit -m "fix(critical): resolve production issue"

# 3. Test locally
npm run test
npm run build

# 4. Create PR to prod (expedited review)
# 5. After merge and deploy, merge back to dev
git checkout dev
git merge prod
git push origin dev
```

---

## Resources

- [The Twelve-Factor App](https://12factor.net/)
- [Environment Management Best Practices](https://www.atlassian.com/continuous-delivery/principles/environments)
- See `docs/rules/testing.md` for testing details
- See `docs/rules/deployment.md` for CI/CD details

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

