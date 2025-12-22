# Documentation Sync Strategy

## Overview

This template supports a **three-tier synchronization system** that propagates updates safely with human approval gates:

```
claude-code-docs-template (base: general SaaS documentation)
    ↓ automated sync with approval
saas-fullstack-template (Web + Mobile + API + Database)
    ↓ automated sync with approval
my-startup-app (actual project)

OR

claude-code-docs-template (base)
    ↓
marketing-website-template (Web only, no backend)
    ↓
company-website (actual project)

OR

claude-code-docs-template (base)
    ↓
web-api-db-template (Web + Backend API + Database, no mobile)
    ↓
internal-dashboard (actual project)
```

## How It Works

### Tier 1 → Tier 2: Base Template → Custom Templates

**Trigger:** Push to `docs/` or `CLAUDE.md` in base template

**Automated Process:**
1. GitHub Action detects documentation changes
2. Sends webhook to downstream repositories
3. Downstream repos create sync branch
4. Merges upstream changes (excluding custom files)
5. Runs CI tests
6. Creates Pull Request for human review
7. **Human approves** → Changes merge

**Safety:** Tests must pass, human must approve

### Tier 2 → Tier 3: Custom Templates → Projects

**Same process** - each project tracks its template as upstream

**Custom files protected:**
- `docs/01-getting-started/` - Project-specific details
- `docs/09-saas-specific/` - Project-specific SaaS patterns

## Setup Instructions

### 1. Set Up Base Template (This Repo)

Already done! This repo is configured to push updates downstream.

**Configure downstream targets:**

```bash
# Edit .github/workflows/sync-downstream.yml
# Add your template repositories
```

**Create GitHub token:**
1. Go to: https://github.com/settings/tokens
2. Generate token with `repo` and `workflow` scopes
3. Add to repository secrets as `DOWNSTREAM_SYNC_TOKEN`

### 2. Create Architecture-Specific Template

**Example 1: Full-Stack SaaS (Web + Mobile + API + DB)**

```bash
# Create new repo from base template
gh repo create saas-fullstack-template --public --template dmccardle/claude-code-docs-template

cd saas-fullstack-template

# Set up sync capability
/path/to/claude-code-docs-template/setup-with-sync.sh . https://github.com/dmccardle/claude-code-docs-template.git

# Customize for full-stack architecture
# Edit: docs/09-saas-specific/multi-platform-architecture.md (Web, iOS, Android)
# Edit: docs/09-saas-specific/mobile-deployment.md (Expo setup)
# Edit: docs/09-saas-specific/api-gateway-patterns.md

# Commit and push
git add .
git commit -m "feat: full-stack SaaS template (Web+Mobile+API+DB)"
git push origin main
```

**Example 2: Marketing Website (Web Only, No Backend)**

```bash
gh repo create marketing-website-template --public --template dmccardle/claude-code-docs-template

cd marketing-website-template

# Remove backend/database docs (not needed for static sites)
rm -rf docs/05-backend/ docs/06-operations/database*.md

# Add marketing-specific docs
# Create: docs/09-saas-specific/seo-optimization.md
# Create: docs/09-saas-specific/landing-page-patterns.md

git add .
git commit -m "feat: marketing website template (static Next.js)"
git push origin main
```

**Configure for downstream projects:**
```bash
# Add DOWNSTREAM_SYNC_TOKEN secret
gh secret set DOWNSTREAM_SYNC_TOKEN --body "ghp_your_token_here"

# Enable branch protection
gh api repos/dmccardle/saas-fullstack-template/branches/main/protection \
  --method PUT \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field enforce_admins=true
```

### 3. Create Actual Project

**From Full-Stack Template:**

```bash
# Use full-stack template
gh repo create my-startup-app --private --template dmccardle/saas-fullstack-template

cd my-startup-app

# Set up upstream tracking
git remote add upstream https://github.com/dmccardle/saas-fullstack-template.git

# Copy sync workflow
cp .github/workflows/receive-upstream-updates.yml.template .github/workflows/receive-upstream-updates.yml

# Customize for your actual project
# Edit: docs/01-getting-started/* (your app details)
# Edit: docs/09-saas-specific/* (your specific patterns)

git add .
git commit -m "feat: initialize healthcare app from template"
git push origin main
```

## Sync Workflows

### Automatic Sync (Recommended)

**When base template updates:**
1. GitHub Action triggers in downstream repos
2. PR created automatically with changes
3. CI tests run
4. **You review PR** → Approve if tests pass
5. Changes merge automatically

**You do:** Just review and approve PRs when they appear

### Manual Sync (On Demand)

**When you want to pull updates:**

```bash
# Run manual sync script
./sync-upstream.sh

# Or do it manually:
git fetch upstream
git checkout -b sync/upstream-$(date +%Y%m%d)
git merge upstream/main --no-commit

# Resolve conflicts if any
git checkout HEAD -- docs/01-getting-started/
git checkout HEAD -- docs/09-saas-specific/

# Test
npm test

# Commit
git commit -m "sync: merge upstream docs"
git push origin sync/upstream-$(date +%Y%m%d)

# Create PR
gh pr create --title "Sync upstream documentation"
```

## Safety Mechanisms

### ✅ Automated Checks

**Before creating sync PR:**
- Conflict detection (aborts if conflicts)
- CI tests must pass
- Protected files aren't overwritten

**PR review checks:**
- CLAUDE.md syntax validation
- Project-specific files unchanged
- All tests pass

### ✅ Human Approval Gates

**Required approvals:**
- Minimum 1 approval before merge
- Code owners must approve documentation changes
- Can't bypass with admin privileges

**Review checklist:**
```markdown
- [ ] Changes don't break CLAUDE.md structure
- [ ] Custom project files unchanged
- [ ] All CI checks passing
- [ ] Tested locally
```

### ✅ Rollback Safety

**If sync breaks something:**

```bash
# Revert the merge commit
git revert HEAD
git push origin main

# Or reset to before sync
git reset --hard HEAD~1
git push origin main --force  # (if no one else has pulled)
```

## Configuration Files

### `.sync-config.yml`

Defines what gets synced and what's protected:

```yaml
sync_paths:
  - docs/02-development/
  - docs/03-architecture/
  # ... shared documentation

exclude_paths:
  - docs/01-getting-started/
  - docs/09-saas-specific/
```

### `.github/CODEOWNERS`

Requires specific reviewers:

```
/docs/ @dmccardle
/CLAUDE.md @dmccardle
```

### `.github/workflows/receive-upstream-updates.yml`

Automated sync workflow (see template)

### `.github/workflows/sync-pr-checks.yml`

PR validation checks

## Common Scenarios

### Scenario 1: Base template adds new monitoring guide

**What happens:**
1. Push to `claude-code-docs-template/docs/06-operations/monitoring.md`
2. All architecture templates get PR with new file (fullstack, web-only, etc.)
3. Review → Approve → New monitoring guide available in all templates
4. All projects built from those templates get the update next
5. Each project's custom monitoring settings remain unchanged

### Scenario 2: Full-Stack template adds mobile-specific patterns

**What happens:**
1. Push to `saas-fullstack-template/docs/09-saas-specific/mobile-deployment.md`
2. All full-stack projects get PR with mobile deployment docs
3. Base template doesn't get this (it's architecture-specific)
4. Other templates (marketing-website) don't get this (different architecture)

### Scenario 3: Conflict during sync

**What happens:**
1. Automated sync detects conflict
2. Creates GitHub Issue (not PR) with manual instructions
3. Developer resolves conflict manually
4. Creates PR with resolved changes
5. Review → Approve → Merge

### Scenario 4: Tests fail after sync

**What happens:**
1. CI tests fail on sync PR
2. PR blocked from merging (branch protection)
3. Developer investigates failure locally
4. Fixes issue or rejects sync
5. Either fix code or wait for upstream fix

## Best Practices

### ✅ DO

- **Review every sync PR** - Don't auto-merge blindly
- **Run tests locally** before approving
- **Keep custom files separate** in designated directories
- **Document customizations** in project-specific files
- **Sync regularly** (weekly/monthly) to avoid large merge conflicts

### ❌ DON'T

- **Don't edit shared docs directly** in projects - edit upstream and sync down
- **Don't disable branch protection** for convenience
- **Don't mix custom code with template docs**
- **Don't ignore failing CI checks**
- **Don't sync without testing**

## Troubleshooting

### Sync PR not created

**Check:**
1. `DOWNSTREAM_SYNC_TOKEN` secret configured?
2. Workflow enabled in downstream repo?
3. GitHub Actions have permission?

**Fix:**
```bash
# Verify secret exists
gh secret list

# Check workflow status
gh workflow list
gh workflow enable "Receive Upstream Documentation Updates"
```

### Conflicts on every sync

**Problem:** You're editing shared files in your project

**Solution:** Move customizations to project-specific directories

```bash
# Instead of editing shared file
docs/03-architecture/caching-strategy.md

# Create project-specific override
docs/09-saas-specific/our-caching-strategy.md
```

### Tests fail after sync

**Debug:**

```bash
# Fetch sync branch
git fetch origin sync/upstream-*
git checkout sync/upstream-*

# Run tests locally
npm test

# Check what changed
git diff main

# Fix or reject
git checkout main
git branch -D sync/upstream-*
```

## Monitoring Sync Health

### GitHub Actions Dashboard

- View all sync PRs: https://github.com/your-org/your-repo/pulls?q=label%3Async
- Check workflow runs: https://github.com/your-org/your-repo/actions

### Metrics to Track

- **Sync lag:** Time between upstream push and downstream merge
- **Approval time:** How long PRs wait for review
- **Failure rate:** % of syncs that fail tests
- **Conflict rate:** % of syncs with merge conflicts

**Target metrics:**
- Sync lag: < 1 day
- Approval time: < 2 days
- Failure rate: < 10%
- Conflict rate: < 5%

## Cost

**GitHub Actions:**
- Free for public repos
- 2,000 minutes/month for private repos (free tier)
- Each sync: ~2-5 minutes
- ~400 syncs/month on free tier

**Total cost:** $0 for public templates, $0-4/month for private

## Summary

✅ **Automated** - Updates flow downstream automatically
✅ **Safe** - Tests, human approval, rollback capability
✅ **Selective** - Custom files protected from overwrite
✅ **Auditable** - All changes in PRs with full history
✅ **Low maintenance** - Set up once, works forever

**You spend:** 5-10 min/week reviewing sync PRs
**You save:** Hours of manual doc updates across projects

## See Also

- `setup-with-sync.sh` - Setup script for new projects
- `sync-upstream.sh` - Manual sync script
- `.github/workflows/` - Automated sync workflows
