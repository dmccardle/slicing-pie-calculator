# Quality Gates & Slack Notifications Setup

This guide shows how to set up automated quality gates (build, lint, test) and Slack notifications for PR reviews and human intervention.

---

## Overview

**Quality Gates ensure:**
- All code is linted and formatted
- All tests pass (unit, integration, E2E)
- Code builds successfully
- Coverage meets threshold (80%+)
- No high-severity security vulnerabilities

**Slack Notifications alert you when:**
- New PR is opened (needs review)
- Your review is requested
- Quality gate fails (human intervention needed)
- Merge conflicts detected
- Quality gates pass (ready to merge)

---

## Step 1: Choose Your Quality Gates

### Option A: Documentation Template (This Repo)

This repository includes documentation quality checks:

**`.github/workflows/quality-gates.yml`** (already set up):
- Markdown linting
- Link checking
- Documentation structure validation
- Template syntax validation
- Version consistency checks

### Option B: Code Project (Downstream)

For your actual SaaS project, use the code quality template:

**Copy this file:**
```bash
cp .github/workflows/code-quality-gates.yml.template \
   .github/workflows/code-quality-gates.yml
```

**Customize for your stack:**
```yaml
# Edit these commands to match your project:
- npm run lint          # Your linting command
- npm run type-check    # TypeScript type checking
- npm run test:unit     # Unit tests
- npm run build         # Build command
```

**Supported tech stacks:**
- Next.js / React
- Node.js / Express
- TypeScript / JavaScript
- Any npm-based project

---

## Step 2: Set Up Slack Webhook

### Create Slack Incoming Webhook

1. **Go to Slack API Console**: https://api.slack.com/apps
2. **Create New App** → "From scratch"
3. **Name**: "GitHub Notifications"
4. **Select Workspace**: Choose your workspace
5. **Activate Incoming Webhooks**:
   - Features → Incoming Webhooks
   - Toggle "On"
   - Click "Add New Webhook to Workspace"
   - Select channel (e.g., `#engineering`, `#github-prs`)
   - Click "Allow"
6. **Copy Webhook URL**:
   ```
   https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
   ```

### Add Webhook to GitHub Secrets

```bash
# Using GitHub CLI (recommended)
gh secret set SLACK_WEBHOOK_URL

# Paste your webhook URL when prompted
# (it will be hidden)
```

**Or via GitHub Web UI:**
1. Go to: `https://github.com/[owner]/[repo]/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `SLACK_WEBHOOK_URL`
4. Value: Paste your webhook URL
5. Click "Add secret"

---

## Step 3: Configure Branch Protection Rules

Branch protection ensures PRs can't be merged unless quality gates pass.

### Using GitHub CLI (Recommended)

```bash
# Set up protection for main branch
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]=lint \
  --field required_status_checks[contexts][]=test \
  --field required_status_checks[contexts][]=build \
  --field required_status_checks[contexts][]=quality-gate-status \
  --field enforce_admins=false \
  --field required_pull_request_reviews[required_approving_review_count]=1 \
  --field required_pull_request_reviews[dismiss_stale_reviews]=true \
  --field restrictions=null
```

### Using GitHub Web UI

1. Go to: `Settings → Branches → Branch protection rules`
2. Click "Add rule"
3. **Branch name pattern**: `main`
4. **Enable these settings**:
   - Require a pull request before merging
     - Require approvals: **1**
     - Dismiss stale pull request approvals when new commits are pushed
   - Require status checks to pass before merging
     - Require branches to be up to date before merging
     - **Select these checks**:
       - `lint` (Code linting)
       - `test` (Unit & integration tests)
       - `build` (Application build)
       - `quality-gate-status` (Overall gate status)
   - Require conversation resolution before merging
   - Do not allow bypassing the above settings (optional)
5. Click "Create"

### For develop branch

Repeat the above for `develop` branch if using git-flow.

---

## Step 4: Test the Setup

### Test Quality Gates

```bash
# Create a test branch
git checkout -b test/quality-gates

# Make a change with a linting error
echo "const x = 'unused variable';" >> src/test.ts

# Commit and push
git add .
git commit -m "test: verify quality gates"
git push -u origin test/quality-gates

# Create PR
gh pr create --title "Test: Quality Gates" --body "Testing quality gate checks"

# Expected: Quality gate should FAIL on lint error
```

### Test Slack Notifications

```bash
# Create a PR (should trigger Slack notification)
gh pr create --title "Test: Slack Notification" --body "Testing Slack integration"

# Check your Slack channel for notification
```

### Expected Slack Message

```
New Pull Request Needs Review

Repository: your-org/your-repo
PR Number: #123
Author: your-username
Status: Awaiting Review

Title: Test: Slack Notification

[Review PR] [View Diff]
```

---

## Step 5: Customize Notifications

### Change Notification Channel

Edit `.github/workflows/pr-notifications.yml`:

```yaml
# Current: Uses SLACK_WEBHOOK_URL secret

# To use different channels for different events:
env:
  SLACK_WEBHOOK_URL_PR_REVIEW: ${{ secrets.SLACK_WEBHOOK_PR_REVIEW }}
  SLACK_WEBHOOK_URL_FAILURES: ${{ secrets.SLACK_WEBHOOK_FAILURES }}
```

### Add Custom Notifications

Add a new job to `pr-notifications.yml`:

```yaml
notify-slack-custom-event:
  name: Notify - Custom Event
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request' && contains(github.event.pull_request.labels.*.name, 'urgent')
  steps:
    - name: Send urgent PR notification
      uses: slackapi/slack-github-action@v1
      with:
        payload: |
          {
            "text": "URGENT: PR needs immediate review",
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*URGENT PR*\n<${{ github.event.pull_request.html_url }}|#${{ github.event.pull_request.number }}> needs immediate attention!"
                }
              }
            ]
          }
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Mention Specific People

```yaml
# In the Slack payload, mention users:
"text": "Hey <@U12345678>! Your review is needed"
```

**Get Slack User IDs:**
1. Right-click user in Slack
2. View profile
3. Click ⋮ (More)
4. Copy member ID

---

## Step 6: Add More Quality Checks

### Security Scanning

Add to your workflow:

```yaml
security-scan:
  name: Security Scan
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Run Snyk scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Set up Snyk:**
1. Create account: https://snyk.io/
2. Get API token
3. Add to GitHub secrets: `gh secret set SNYK_TOKEN`

### License Compliance

```yaml
license-check:
  name: License Check
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Check licenses
      run: npx license-checker --onlyAllow 'MIT;Apache-2.0;BSD-3-Clause;ISC'
```

### Accessibility Testing

```yaml
accessibility:
  name: Accessibility Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Run axe-core
      run: npm run test:a11y
```

---

## Step 7: Monitor & Maintain

### View Workflow Runs

```bash
# List recent workflow runs
gh run list --workflow=quality-gates.yml

# View specific run
gh run view <run-id>

# Re-run failed workflow
gh run rerun <run-id>
```

### Webhook Delivery History

1. Go to: `Settings → Webhooks`
2. Click on your webhook
3. View "Recent Deliveries"
4. Check for failed deliveries

### Update Quality Thresholds

Edit workflow to adjust thresholds:

```yaml
# Example: Increase coverage requirement
- name: Check coverage threshold
  run: |
    coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$coverage < 90" | bc -l) )); then  # Changed from 80
      echo "::error::Coverage is below 90% ($coverage%)"
      exit 1
    fi
```

---

## Troubleshooting

### Quality Gates Not Running

**Check:**
1. Workflow file is in `.github/workflows/`
2. File has `.yml` extension (not `.yml.template`)
3. Workflow is enabled (Actions → Workflows → Enable)
4. Branch is listed in `on.push.branches`

**Fix:**
```bash
# Enable workflows
gh workflow enable quality-gates.yml
gh workflow enable pr-notifications.yml
```

### Slack Notifications Not Sending

**Check:**
1. `SLACK_WEBHOOK_URL` secret is set
2. Webhook URL is valid (starts with `https://hooks.slack.com/`)
3. Slack app is installed in workspace
4. Channel exists and bot has access

**Test webhook manually:**
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Hello from GitHub Actions!"}' \
  YOUR_WEBHOOK_URL
```

### Quality Gates Always Passing

**Check:**
1. Tests are actually running (`npm test` works locally)
2. Test script in `package.json` exits with non-zero on failure
3. Coverage check is not using `continue-on-error: true`

**Fix test script:**
```json
{
  "scripts": {
    "test": "jest --coverage --passWithNoTests=false"
  }
}
```

### Branch Protection Not Working

**Check:**
1. You're not an admin (admins can bypass)
2. Status check names match workflow job IDs
3. Branch protection is saved and active

**View protection rules:**
```bash
gh api repos/{owner}/{repo}/branches/main/protection | jq
```

---

## Best Practices

### DO 

- **Run quality gates on every PR** - Catch issues early
- **Require at least 1 approval** - Code review is critical
- **Set coverage threshold to 80%+** - Maintain test quality
- **Notify on failures immediately** - Fast feedback loop
- **Keep gate checks fast** - Under 5 minutes total
- **Cache dependencies** - Speed up workflows

### DON'T 

- **Don't allow force push to main** - Protect production code
- **Don't skip quality gates for "urgent" changes** - Creates technical debt
- **Don't notify on every commit** - Only on PR events
- **Don't run E2E tests on every commit** - Too slow, run on PRs only
- **Don't hardcode secrets in workflows** - Always use GitHub Secrets
- **Don't ignore security warnings** - Address or acknowledge them

---

## Summary

You now have:

**Quality Gates**:
- Automated linting, testing, building
- Coverage threshold enforcement
- Security scanning
- All PRs must pass before merge

**Slack Notifications**:
- New PR alerts
- Review requests
- Failure notifications
- Merge conflict alerts

**Branch Protection**:
- Require quality gates to pass
- Require code review approval
- Prevent force push to main

**Human-in-the-Loop**:
- Notified when review needed
- Notified when manual intervention required
- Clear action buttons in Slack

---

## Related Documentation

**Essential Rules**:
- [Git Workflow](../rules/git-workflow.md) - Branching strategy and PR process
- [Testing](../rules/testing.md) - Testing requirements and coverage
- [Code Standards](../rules/code-standards.md) - Linting and formatting rules
- [Deployment](../rules/deployment.md) - CI/CD pipeline overview

**Operations**:
- [Monitoring](../06-operations/monitoring.md) - Production monitoring
- [Security Testing](../06-operations/security-testing.md) - Security scans
- [Incident Response](../06-operations/incident-response.md) - Handling failures

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Deployment Docs](./)

---

**Last Updated**: 2025-12-22
**Estimated Setup Time**: 30 minutes
**Difficulty**: Intermediate
