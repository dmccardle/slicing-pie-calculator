# CI/CD Cost Optimization Rules

## Overview

Continuous Integration and Deployment services charge based on usage (build minutes, workflow runs, etc.). To minimize costs while maintaining quality, Claude Code MUST follow these optimization rules.

## Critical Rules

### 1. Test Locally Before Pushing

**ALWAYS run the complete local test suite before pushing to remote:**

```bash
# Example workflow (adapt to your project):
npm run lint          # or yarn lint
npm run build         # or yarn build
npm run test          # or yarn test
npm run test:unit     # Unit tests
npm run test:integration  # Integration tests
```

**Only push when ALL local checks pass:**
- Build succeeds
- Linter reports 0 errors and 0 warnings
- All unit tests pass
- All integration tests pass
- Code coverage meets threshold (80%+)

### 2. Batch Commits Before Pushing

**DON'T:** Push after every single commit
```bash
git commit -m "fix typo"
git push  # Triggers CI/CD

git commit -m "fix another typo"
git push  # Triggers CI/CD again

git commit -m "fix lint error"
git push  # Triggers CI/CD again
```

**DO:** Batch related commits and push once
```bash
git commit -m "fix typo"
git commit -m "fix another typo"
git commit -m "fix lint error"

# Run local checks
npm run lint && npm run build && npm run test

# THEN push once all checks pass
git push  # Single CI/CD run
```

### 3. Test the Entire Project Locally

Before pushing, verify that the ENTIRE project works locally:

```bash
# Start all services locally (example):
docker-compose up -d postgres redis    # Database & cache
npm run dev:api                         # Backend API
npm run dev:web                         # Web frontend
npm run dev:mobile                      # Mobile app (if applicable)

# Verify:
# All services start without errors
# Database migrations run successfully
# API endpoints respond correctly
# Frontend loads and renders
# End-to-end tests pass (if applicable)
```

### 4. Use Draft PRs for Work-in-Progress

When working on a feature that requires multiple iterations:

```bash
# Create PR as draft to avoid triggering certain workflows
gh pr create --draft --title "[WIP] Feature name"

# Workflows that should skip draft PRs:
# - Expensive integration tests
# - Deployment previews
# - Security scans (can run once when marked ready)

# Mark ready only when:
gh pr ready  # After all local tests pass
```

### 5. Skip CI/CD for Documentation-Only Changes

When making documentation-only changes:

```bash
# Add [skip ci] or [ci skip] to commit message
git commit -m "docs: update README [skip ci]"
git push  # Won't trigger CI/CD
```

**Use sparingly** - only for pure documentation changes (no code changes).

## Cost Monitoring

### Track CI/CD Usage

Monitor your CI/CD usage monthly:
- GitHub Actions: Settings → Billing → Usage this month
- Railway: Dashboard → Usage & Billing
- Other services: Check their billing dashboards

### Set Budget Alerts

Configure alerts BEFORE you exceed budget:
- GitHub: Set spending limits in Settings → Billing
- Railway: Set usage alerts in project settings
- Cloud providers: Configure budget alerts

## Project-Specific Commands

### [PROJECT_NAME] Local Quality Gates

```bash
# Run the exact same checks that CI/CD runs:
[COMMAND_LINT]              # Linting (matches CI)
[COMMAND_TYPE_CHECK]        # Type checking (matches CI)
[COMMAND_BUILD]             # Build (matches CI)
[COMMAND_TEST_UNIT]         # Unit tests (matches CI)
[COMMAND_TEST_INTEGRATION]  # Integration tests (matches CI)
[COMMAND_TEST_E2E]          # E2E tests (matches CI)
```

### Local Development Stack

```bash
# Start full local environment:
[COMMAND_START_DB]          # Start database
[COMMAND_START_CACHE]       # Start Redis/cache
[COMMAND_START_API]         # Start API server
[COMMAND_START_WEB]         # Start web frontend
[COMMAND_START_MOBILE]      # Start mobile (if applicable)

# Verify everything works:
[COMMAND_HEALTH_CHECK]      # Health check all services
```

## Workflow Optimization

### Conditional Workflows

Configure workflows to run only when needed:

```yaml
# Example: Only run expensive tests on main branch
on:
  pull_request:
    branches: [main]
    paths-ignore:
      - 'docs/**'
      - '**.md'
  push:
    branches: [main]
```

### Cache Dependencies

Use caching to speed up workflows and reduce build minutes:

```yaml
# Example: Cache npm dependencies
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Parallel Jobs

Run independent jobs in parallel to reduce total time:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
  test-unit:
    runs-on: ubuntu-latest
  test-integration:
    runs-on: ubuntu-latest
# All 3 run in parallel
```

## Red Flags (What NOT to Do)

**DON'T** push every commit immediately
**DON'T** skip local testing and rely on CI/CD to catch errors
**DON'T** trigger workflows unnecessarily (e.g., documentation-only changes)
**DON'T** run expensive tests on every push (use draft PRs or branch filters)
**DON'T** ignore build minutes/usage warnings

## Estimated Cost Savings

Following these rules can reduce CI/CD costs by **60-80%**:

**Before optimization:**
- 50 pushes/day × 5 minutes/workflow = 250 build minutes/day
- 250 × 30 days = 7,500 minutes/month
- At $0.008/minute (GitHub Actions) = **$60/month**

**After optimization:**
- 10 pushes/day × 5 minutes/workflow = 50 build minutes/day
- 50 × 30 days = 1,500 minutes/month
- At $0.008/minute = **$12/month**
- **Savings: $48/month (80% reduction)**

## Related Documentation

- `docs/rules/deployment.md` - CI/CD best practices
- `docs/rules/testing.md` - Local testing requirements
- `docs/06-operations/cost-optimization.md` - Overall cost monitoring

## Quick Reference

**Before every push:**
1. Run lint locally
2. Run build locally
3. Run all tests locally
4. Verify full project runs locally
5. THEN push once

**Remember:** Every push costs money. Test locally first!
