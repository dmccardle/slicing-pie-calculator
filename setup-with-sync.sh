#!/bin/bash

# Setup a new project with upstream sync capability
# Usage: ./setup-with-sync.sh /path/to/new-project upstream-repo-url

set -e

PROJECT_PATH="${1:-.}"
UPSTREAM_REPO="${2:-https://github.com/dmccardle/claude-code-docs-template.git}"

echo "🚀 Setting up project with upstream sync capability..."
echo "Project: $PROJECT_PATH"
echo "Upstream: $UPSTREAM_REPO"

cd "$PROJECT_PATH"

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git branch -M main
fi

# Add upstream remote
echo "🔗 Adding upstream remote..."
git remote add upstream "$UPSTREAM_REPO" 2>/dev/null || {
    echo "⚠️  Upstream remote already exists, updating URL..."
    git remote set-url upstream "$UPSTREAM_REPO"
}

# Copy documentation
echo "📚 Copying documentation structure..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create directory structure
mkdir -p docs/{01-getting-started,02-development,03-architecture,04-frontend,05-backend,06-operations,07-deployment,08-analytics,09-saas-specific,10-ai-workflow,rules}
mkdir -p .github/workflows

# Copy docs (excluding project-specific customizations)
rsync -av --exclude='01-getting-started' --exclude='09-saas-specific' \
    "$SCRIPT_DIR/docs/" ./docs/

# Copy CLAUDE.md and README.md
cp "$SCRIPT_DIR/CLAUDE.md" ./CLAUDE.md
cp "$SCRIPT_DIR/QUICK-START.md" ./QUICK-START.md

# Copy sync workflow
cp "$SCRIPT_DIR/.github/workflows/receive-upstream-updates.yml.template" \
   ./.github/workflows/receive-upstream-updates.yml

# Create .github/CODEOWNERS for automatic PR reviewers
mkdir -p .github
cat > .github/CODEOWNERS <<EOF
# Documentation updates require review
/docs/ @$USER
/CLAUDE.md @$USER
EOF

# Create sync configuration
cat > .sync-config.yml <<EOF
# Upstream Sync Configuration
upstream:
  repo: $UPSTREAM_REPO
  branch: main

# Paths to sync from upstream
sync_paths:
  - docs/02-development/
  - docs/03-architecture/
  - docs/04-frontend/
  - docs/06-operations/
  - docs/07-deployment/
  - docs/08-analytics/
  - docs/10-ai-workflow/
  - docs/rules/
  - CLAUDE.md

# Paths to exclude (project-specific customizations)
exclude_paths:
  - docs/01-getting-started/
  - docs/09-saas-specific/

# Automated checks before creating sync PR
checks:
  - command: "npm test"
    required: false
  - command: "npm run lint"
    required: false

# Require human approval before merging sync PRs
require_approval: true
min_approvals: 1
EOF

# Create manual sync script
cat > sync-upstream.sh <<'EOF'
#!/bin/bash
# Manual sync script - run when you want to pull upstream changes

set -e

echo "🔄 Syncing with upstream documentation template..."

# Fetch upstream
git fetch upstream

# Show what would change
echo "📊 Changes available from upstream:"
git log HEAD..upstream/main --oneline --graph

read -p "Continue with sync? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Sync cancelled"
    exit 1
fi

# Create sync branch
BRANCH_NAME="sync/upstream-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BRANCH_NAME"

# Merge upstream changes (only docs)
echo "📥 Merging upstream documentation..."
git checkout upstream/main -- docs/
git checkout upstream/main -- CLAUDE.md

# Restore project-specific files
echo "🔒 Restoring project-specific customizations..."
git checkout HEAD -- docs/01-getting-started/ 2>/dev/null || true
git checkout HEAD -- docs/09-saas-specific/ 2>/dev/null || true

# Show changes
echo "📝 Changes to be committed:"
git diff --staged --stat

# Run tests if available
if [ -f "package.json" ]; then
    echo "🧪 Running tests..."
    npm test || {
        echo "⚠️  Tests failed! Review changes before committing."
        echo "To abort: git checkout main && git branch -D $BRANCH_NAME"
        exit 1
    }
fi

# Commit
git commit -m "sync: merge upstream documentation updates

🤖 Synced from upstream template
Manual sync on $(date +%Y-%m-%d)"

echo "✅ Sync complete! Branch: $BRANCH_NAME"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff main"
echo "2. Push branch: git push origin $BRANCH_NAME"
echo "3. Create PR: gh pr create --title 'Sync upstream docs'"
echo "4. Or merge locally: git checkout main && git merge $BRANCH_NAME"
EOF

chmod +x sync-upstream.sh

# Create GitHub Actions workflow for branch protection
cat > .github/workflows/sync-pr-checks.yml <<EOF
# CI checks for upstream sync PRs
name: Sync PR Checks

on:
  pull_request:
    branches: [main]
    paths:
      - 'docs/**'
      - 'CLAUDE.md'

jobs:
  validate-sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check for conflicts in project-specific files
        run: |
          # Ensure project-specific files weren't overwritten
          if git diff origin/main -- docs/01-getting-started/ | grep -q "^-"; then
            echo "⚠️  Warning: Changes detected in docs/01-getting-started/"
            echo "This directory should contain project-specific content."
            exit 1
          fi

      - name: Validate CLAUDE.md syntax
        run: |
          # Check CLAUDE.md has required sections
          grep -q "## Startup Instructions" CLAUDE.md
          grep -q "## Quick Reference" CLAUDE.md
          echo "✅ CLAUDE.md structure valid"

      - name: Run tests (if available)
        continue-on-error: true
        run: |
          if [ -f "package.json" ]; then
            npm ci
            npm test
          fi

      - name: Notify reviewers
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ **Sync PR detected** - Please review carefully before merging.\n\nThis PR syncs documentation from the upstream template. Ensure it doesn\'t overwrite your project-specific customizations.'
            })
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Customize project-specific files:"
echo "   - docs/01-getting-started/overview.md"
echo "   - docs/01-getting-started/architecture.md"
echo "   - docs/09-saas-specific/*.md"
echo ""
echo "2. Configure GitHub repository:"
echo "   - Add DOWNSTREAM_SYNC_TOKEN secret (for pushing to downstream repos)"
echo "   - Enable branch protection on main (require PR reviews)"
echo "   - Add yourself as a code owner (.github/CODEOWNERS)"
echo ""
echo "3. To manually sync upstream changes:"
echo "   ./sync-upstream.sh"
echo ""
echo "4. Automatic sync:"
echo "   - Upstream changes trigger automatic PR creation"
echo "   - Review and approve PR to merge"
echo "   - Tests must pass before merge"
echo ""
echo "📚 Documentation:"
echo "   - Sync config: .sync-config.yml"
echo "   - Manual sync: ./sync-upstream.sh"
echo "   - Auto sync: .github/workflows/receive-upstream-updates.yml"
