# Semantic Versioning

## Overview

This project uses [Semantic Versioning (SemVer)](https://semver.org/) to communicate changes clearly and predictably.

**Rule**: Every merge to `main` triggers automatic version bumping based on commit messages.

---

## Version Format

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─ Bug fixes, docs, refactoring (backwards compatible)
  │     └─────── New features (backwards compatible)
  └───────────── Breaking changes (not backwards compatible)
```

**Examples:**
- `1.0.0` → `1.0.1` - Bug fix (patch)
- `1.0.0` → `1.1.0` - New feature (minor)
- `1.0.0` → `2.0.0` - Breaking change (major)

---

## Commit Types and Version Bumps

### Patch Bump (1.0.0 → 1.0.1)

**Triggers:**
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, whitespace)
- `refactor:` - Code refactoring without behavior change
- `perf:` - Performance improvements
- `test:` - Adding/updating tests
- `chore:` - Build process, dependencies

**Examples:**
```bash
git commit -m "fix: correct typo in monitoring docs"
git commit -m "docs: update setup instructions"
git commit -m "chore: update dependencies"
```

### Minor Bump (1.0.0 → 1.1.0)

**Triggers:**
- `feat:` - New features (backwards compatible)

**Examples:**
```bash
git commit -m "feat: add penetration testing guide"
git commit -m "feat: add user feedback collection workflows"
```

### Major Bump (1.0.0 → 2.0.0)

**Triggers:**
- `feat!:` - Breaking feature change
- `fix!:` - Breaking bug fix
- Any commit with `BREAKING CHANGE:` in body

**Examples:**
```bash
# Option 1: Exclamation mark
git commit -m "feat!: redesign CLAUDE.md startup instructions"

# Option 2: Breaking change footer
git commit -m "feat: redesign documentation structure

BREAKING CHANGE: Folder structure completely reorganized.
Projects using old paths must update CLAUDE.md references."
```

---

## Automated Versioning Workflow

### How It Works

```
1. Developer commits with conventional format
        ↓
2. Push to main
        ↓
3. GitHub Action analyzes commits
        ↓
4. Determines bump type (major/minor/patch)
        ↓
5. Updates VERSION file
        ↓
6. Updates CHANGELOG.md
        ↓
7. Creates git tag (v1.2.3)
        ↓
8. Creates GitHub Release
        ↓
9. Triggers downstream sync (if configured)
```

**All automatic - you just commit!**

### What Gets Updated

**VERSION file:**
```
1.2.3
```

**CHANGELOG.md:**
```markdown
## [1.2.3] - 2025-12-21

### Added
- feat: add penetration testing guide (a1b2c3d)

### Fixed
- fix: correct monitoring setup steps (d4e5f6g)

### Documentation
- docs: update sync strategy examples (h7i8j9k)
```

**Git tag:**
```
v1.2.3
```

**GitHub Release:**
- Automatically created with changelog notes
- Attached to git tag

---

## Manual Version Bumping

**When to use:**
- Pre-release versions (alpha, beta, rc)
- Hotfix releases
- Forcing specific version

### Using the Script

```bash
# Patch bump (1.0.0 → 1.0.1)
./scripts/bump-version.sh patch

# Minor bump (1.0.0 → 1.1.0)
./scripts/bump-version.sh minor

# Major bump (1.0.0 → 2.0.0)
./scripts/bump-version.sh major
```

### Manual Steps

```bash
# 1. Update VERSION file
echo "1.2.3" > VERSION

# 2. Update CHANGELOG.md
# Add new section with today's date

# 3. Commit
git add VERSION CHANGELOG.md
git commit -m "chore(release): bump version to 1.2.3"

# 4. Tag
git tag -a v1.2.3 -m "Release v1.2.3"

# 5. Push
git push origin main --tags
```

---

## Pre-Release Versions

**For alpha/beta/rc releases:**

```
1.0.0-alpha.1
1.0.0-beta.1
1.0.0-rc.1
1.0.0
```

**Tagging:**
```bash
# Alpha release
git tag -a v1.0.0-alpha.1 -m "Alpha release 1"

# Beta release
git tag -a v1.0.0-beta.1 -m "Beta release 1"

# Release candidate
git tag -a v1.0.0-rc.1 -m "Release candidate 1"

# Final release
git tag -a v1.0.0 -m "Release 1.0.0"
```

---

## Version Constraints

### Template Compatibility Matrix

**Base Template (this repo):**
```
Version 1.x.x - Original release
Version 2.x.x - Breaking: New folder structure
Version 3.x.x - Breaking: Different sync system
```

**Architecture Templates:**
```
saas-fullstack-template: requires base >= 1.0.0, < 2.0.0
marketing-website-template: requires base >= 1.0.0, < 2.0.0
```

**Actual Projects:**
```
my-startup-app: requires saas-fullstack-template >= 1.0.0, < 2.0.0
```

### Compatibility File

**package.json (if using):**
```json
{
  "name": "saas-fullstack-template",
  "version": "1.0.0",
  "baseTemplate": {
    "name": "claude-code-docs-template",
    "version": "^1.0.0"
  }
}
```

**Or .template-version:**
```yaml
name: saas-fullstack-template
version: 1.0.0
upstream:
  name: claude-code-docs-template
  version: ^1.0.0
  url: https://github.com/dmccardle/claude-code-docs-template
```

---

## Breaking Changes

### When to Introduce Breaking Changes

**Valid reasons:**
- Reorganize folder structure (breaks file paths)
- Rename core documentation files
- Change CLAUDE.md structure
- Remove deprecated features
- Change sync workflow significantly

**Avoid if possible:**
- Can you add new alongside old? (deprecate gradually)
- Can you provide migration script?
- Can you maintain backwards compatibility?

### Communicating Breaking Changes

**In commit message:**
```bash
git commit -m "feat!: reorganize documentation structure

BREAKING CHANGE: Folder structure changed from flat to hierarchical.

Migration:
- docs/monitoring.md → docs/06-operations/monitoring.md
- docs/caching.md → docs/03-architecture/caching-strategy.md

See MIGRATION.md for complete guide."
```

**Create MIGRATION.md:**
```markdown
# Migration Guide: v1.x → v2.0

## Breaking Changes

### Folder Structure Reorganization

**Before:**
- docs/monitoring.md
- docs/caching.md

**After:**
- docs/06-operations/monitoring.md
- docs/03-architecture/caching-strategy.md

## Migration Steps

1. Update CLAUDE.md file paths
2. Run migration script: ./scripts/migrate-v1-to-v2.sh
3. Review and test
4. Commit changes
```

---

## CI/CD Integration

### Version-Based Deployments

**GitHub Actions:**
```yaml
# Deploy on new version tag
on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Get version
        id: version
        run: echo "version=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Deploy to production
        run: |
          echo "Deploying version ${{ steps.version.outputs.version }}"
          # Your deployment commands
```

### Version in Documentation

**Auto-inject version:**
```bash
# In build process
VERSION=$(cat VERSION)
sed -i "s/{{VERSION}}/$VERSION/g" README.md
```

**Display in docs:**
```markdown
# Claude Code Docs Template v{{VERSION}}

Current version: {{VERSION}}
Released: {{RELEASE_DATE}}
```

---

## Changelog Maintenance

### Unreleased Section

**Between releases, track changes:**
```markdown
# Changelog

## [Unreleased]

### Added
- New monitoring dashboard setup guide

### Fixed
- Corrected backup restoration steps

### Changed
- Updated sync strategy for better performance

## [1.2.0] - 2025-12-20
...
```

**On release, becomes:**
```markdown
## [Unreleased]

## [1.3.0] - 2025-12-21

### Added
- New monitoring dashboard setup guide

### Fixed
- Corrected backup restoration steps
```

### Changelog Automation

**Automated by GitHub Action:**
- Parses commit messages
- Groups by type (Added, Fixed, Changed)
- Includes commit hashes for reference
- Updates on every push to main

---

## Version Checking

### Check Current Version

```bash
# From VERSION file
cat VERSION

# From git tags
git describe --tags --abbrev=0

# From GitHub releases
gh release list
```

### Check Compatibility

```bash
# Compare versions
CURRENT=$(cat VERSION)
REQUIRED="1.0.0"

if [ "$(printf '%s\n' "$REQUIRED" "$CURRENT" | sort -V | head -n1)" = "$REQUIRED" ]; then
  echo "Compatible"
else
  echo "Incompatible - upgrade required"
fi
```

---

## Summary

**Semantic versioning in this project:**
- **Automatic** - Based on commit messages
- **Predictable** - Clear rules for major/minor/patch
- **Documented** - CHANGELOG.md updated automatically
- **Tagged** - Git tags for every release
- **Released** - GitHub Releases created automatically

**Developer workflow:**
```bash
# 1. Make changes
git add .

# 2. Commit with conventional format
git commit -m "feat: add new guide"

# 3. Push
git push origin main

# 4. Done! Version bumps automatically
# New tag: v1.1.0
# New release: v1.1.0 on GitHub
# CHANGELOG updated
# Downstream sync triggered
```

**See Also:**
- `docs/rules/git-commits.md` - Commit message format
- `CHANGELOG.md` - Project history
- `VERSION` - Current version number
- `.github/workflows/version-and-release.yml` - Automation

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

