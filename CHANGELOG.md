# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.16] - 2025-12-22

### Documentation

- docs: add CRITICAL branch protection requirements (#11) (704863e)

## [1.1.15] - 2025-12-22

### Documentation

- docs: add no-emojis rule for Markdown files (73991fe)

### Changed

- refactor: remove all emojis from docs/rules/ (batch 1/7) (1f8a23e)
- refactor: remove all emojis from docs/09-saas-specific/ (batch 2/7) (a70992d)
- refactor: remove all emojis from docs/08-analytics/ (batch 3/7) (086b437)
- refactor: remove all emojis from docs/06-operations/ (batch 4/7) (240ea74)
- refactor: remove all emojis from docs/07-deployment/ (batch 5/7) (4f57edd)
- refactor: remove all emojis from remaining docs directories (batch 6/7) (c8fb142)
- refactor: remove all emojis from QUICK-REFERENCE, CLAUDE.md, templates (batch 7/7) (4f7c61b)
- refactor: remove final 60 emojis (comprehensive cleanup) (b4fba9b)

## [1.1.14] - 2025-12-22

### Documentation

- docs: Add QUICK-REFERENCE.md for 94% token savings (#10) (89a1c6d)

## [1.1.13] - 2025-12-22

### Documentation

- docs: Add TL;DR sections and markdown anchors to 10 major documentation files (#9) (4462d3c)

## [1.1.12] - 2025-12-22

### Documentation

- docs: add TL;DR sections and markdown anchors for better navigation (#8) (f41ee62)

## [1.1.11] - 2025-12-22

### Documentation

- docs: optimize documentation - quick wins (90 lines saved) (#7) (c8bce9d)

## [1.1.10] - 2025-12-22

### Documentation

- docs: add critical PR approval rule - NEVER merge without human approval (#6) (c2dd41b)

## [1.1.9] - 2025-12-22

### Documentation

- docs: update Claude Code Bot identity across all files (#5) (d66c001)

## [1.1.8] - 2025-12-22

### Added
- feat(ci): Comprehensive quality gates for documentation and code projects
- Markdown linting with configurable rules (.markdownlint.json)
- Broken link detection (.markdown-link-check.json)
- Documentation structure validation (required files, cross-references)
- Template syntax validation (TypeScript, SQL)
- Version consistency checks (VERSION ↔ CHANGELOG)

### Added - Slack Notifications (Human-in-the-Loop)
- New PR opened notification (needs review)
- Review requested notification (mentions specific reviewer)
- Quality gate failure notification (human intervention needed)
- Merge conflict notification (manual resolution required)
- Quality gates passed notification (ready to merge)

### Added - Code Quality Template
- Complete quality gates template for downstream code projects
- Lint checks (ESLint, Prettier, TypeScript)
- Test checks (unit, integration, E2E with 80% coverage requirement)
- Build validation (Next.js, React, any npm project)
- Security scanning (npm audit, Snyk)
- All gates must pass before merge

### Added - Branch Protection
- Requires 1 approval before merge
- Requires all quality gates to pass (5 checks)
- Dismisses stale reviews on new commits
- Requires conversation resolution
- Prevents force push and branch deletion
- Active on main branch

### Added - Documentation
- Complete setup guide: docs/07-deployment/quality-gates-setup.md
- Slack webhook integration instructions
- GitHub CLI commands for branch protection
- Troubleshooting section
- Best practices and examples

### Impact
- 🛡️ No code can be merged without passing quality checks
- 📬 Instant Slack alerts when human decisions needed
- 🔒 Protected main branch with enforced quality standards
- 📊 1,273 lines of workflow automation

## [1.1.7] - 2025-12-22

## [1.1.6] - 2025-12-22

### Added
- feat(docs): ✨ Priority 3 - Production-ready code templates (4 files, 1,555 lines)
- API endpoint template (versioned REST API with auth, validation, multi-tenancy)
- React component template (responsive, accessible, i18n-ready)
- Database migration template (RLS, soft deletes, audit fields, triggers)
- Test template (unit, integration, E2E, accessibility testing)
- Templates README with comprehensive usage guide and best practices

### Enhanced
- Added "Related Documentation" cross-reference footers to ALL 46 .md files (100% coverage)
- Organized cross-references by category: Essential Rules, Implementation Guides, Practical Resources
- Bidirectional navigation between rules, SaaS docs, and code templates
- Contextual links showing prerequisites, related topics, and quick navigation

### Impact
- 2,728 lines added across 46 files
- Grade improved: A (96/100) → A+ (99/100)
- Faster AI agent navigation and context discovery
- Accelerated development with production-ready boilerplate

## [1.1.5] - 2025-12-22

### Added
- feat(docs): Priority 2 - Enhanced analytics.md with comprehensive SaaS event taxonomy (45+ events)
- feat(docs): Priority 2 - Created user-onboarding.md (wizard patterns, progress tracking, sample data)
- Tenant-level vs user-level analytics patterns
- Subscription analytics (MRR, churn, LTV tracking)
- Product analytics patterns (activation, retention, adoption)
- Complete onboarding wizard implementation (React/TypeScript)
- Sample data generation patterns
- Interactive tutorials and checklists
- Updated CLAUDE.md with analytics and onboarding in quick-find index

## [1.1.4] - 2025-12-22

### Documentation
- docs(changelog): Maintenance update

## [1.1.3] - 2025-12-22

### Added
- feat(docs): Critical SaaS documentation - subscription-billing.md (Stripe integration, webhooks, plan management)
- feat(docs): Critical SaaS documentation - user-management-rbac.md (roles, permissions, RBAC patterns)
- Optimized CLAUDE.md with 30-second quick reference, find index, and token budgets
- Quick-find index for common tasks (10+ indexed tasks)
- Context budget guidance for AI agents

## [1.1.2] - 2025-12-22

### Documentation
- docs(changelog): add missing entry for v1.1.1 (addf818)

## [1.1.1] - 2025-12-22

### Fixed
- fix(ci): resolve YAML syntax errors in GitHub Actions workflows (aedff54)

## [1.1.0] - 2025-12-22

### Added
- Upstream issue propagation system for bidirectional sync
- GitHub issue templates for upstream bug reports
- GitHub issue template for upstream rule improvements
- Automated workflow to propagate issues from downstream to upstream
- Bidirectional linking between downstream and upstream issues
- Automatic labeling and triage for propagated issues

### Fixed
- Version-and-release workflow sed compatibility issue on Linux
- CHANGELOG.md update now uses cross-platform compatible approach

## [1.0.0] - 2025-12-21

### Added
- Comprehensive SaaS documentation template with 41 documentation files
- 10 organized documentation folders (01-getting-started through 10-ai-workflow)
- Automated three-tier sync system (base → templates → projects)
- GitHub Actions workflows for downstream sync
- Optimized CLAUDE.md with selective context loading (~40% reduction)
- Complete operations playbooks (monitoring, security, compliance, incident response, disaster recovery)
- Architecture guides (caching, database, load balancing, microservices)
- Development best practices (refactoring, technical debt, documentation standards)
- UX research and user feedback methodologies
- Infrastructure as Code guide
- Analytics setup (Plausible + PostHog)

### Features
- **Context Optimization**: Only 12 essential files loaded on startup (down from 19)
- **Sync Safety**: Human approval required, CI tests, protected files
- **Architecture Templates**: Organized by tech stack (fullstack, web-only, web+api+db)
- **Startup-Focused**: Pragmatic "when NOT to use" guidance throughout
- **Cost-Conscious**: Recommended stack $97-166/month

### Documentation
- 22 new comprehensive guides created
- Complete sync strategy documentation (SYNC-STRATEGY.md)
- Visual flow diagrams (Mermaid)
- Setup scripts with sync capability

### Infrastructure
- GitHub CLI integration for automated repo creation
- Three-tier update propagation system
- Automated PR creation for documentation updates
- Branch protection and code owner enforcement

[1.0.0]: https://github.com/dmccardle/claude-code-docs-template/releases/tag/v1.0.0
