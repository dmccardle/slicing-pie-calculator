# [PROJECT_NAME] - Claude Code Documentation

> **This file is automatically loaded when you start a new Claude Code session.**
>
> **TEMPLATE NOTICE**: Replace all `[PLACEHOLDERS]` with your project details before using. See "Customization" section at bottom.

---

## 30-SECOND CRITICAL RULES (READ THIS FIRST!)

**EVERY implementation MUST follow these non-negotiable rules:**

**Speckit Workflow**: ALWAYS use Speckit for new features and change requests:
  1. `/speckit.specify` - Create feature specification from user description
  2. `/speckit.plan` - Generate implementation plan and design artifacts
  3. `/speckit.tasks` - Break down into actionable tasks
  4. `/speckit.implement` - Execute the implementation
  Never skip this workflow for features. Only skip for trivial bug fixes or single-line changes.

**Git Identity**: ALWAYS use Claude Code Bot identity for commits → `docs/07-deployment/claude-git-workflow.md`
  ```bash
  git config user.name "Claude Code Bot"
  git config user.email "[CLAUDE_CODE_BOT_EMAIL]"
  ```
**Git Workflow**: NEVER push directly to `main`, `dev`, `sit`, `uat`, `prod` - ALWAYS create feature branch (`claude/feature-name`) and PR → `docs/rules/git-workflow.md#branch-protection`
**PR Merging**: NEVER merge PRs without explicit human approval. Only ask for approval when ALL checks pass → `docs/rules/pr-approval.md`
**CI/CD Cost**: Test locally BEFORE pushing. Only push when lint, build, tests pass → `docs/rules/ci-cost-optimization.md`
**Backend APIs**: ALL endpoints MUST use `/api/v1/` versioning → `docs/rules/api-design.md`
**Frontend UIs**: ALL interfaces MUST be responsive (mobile, tablet, desktop) → `docs/rules/ui-standards.md`
**Security**: ALL PII encrypted, GDPR compliant, proper auth → `docs/rules/security-privacy.md`
**Quality**: 0 lint errors, 0 warnings, 80%+ test coverage → `docs/rules/code-standards.md`, `docs/rules/testing.md`
**Git**: Conventional Commits, semantic versioning → `docs/rules/git-commits.md`
**SaaS**: Multi-tenant isolation, subscription gating → `docs/09-saas-specific/`

**If you skip these, the PR will be rejected. No exceptions.**

---

## QUICK FIND INDEX

**START HERE**: [`docs/QUICK-REFERENCE.md`](docs/QUICK-REFERENCE.md) - Fast lookup for 90% of common questions (94% token savings)

**"How do I..."**

| Task | Go To | Key Section |
|------|-------|-------------|
| Version an API endpoint? | `docs/rules/api-design.md#api-versioning` | API Versioning |
| Make UI responsive? | `docs/rules/ui-standards.md#responsive-design` | Responsive Design |
| Handle PII data? | `docs/rules/security-privacy.md` | Line 89: PII Protection |
| Implement feature flags? | `docs/09-saas-specific/saas-architecture.md` | Line 149: Feature Flags |
| Set up Stripe billing? | `docs/09-saas-specific/subscription-billing.md` | Webhooks, Plan Management |
| Add user roles/permissions? | `docs/09-saas-specific/user-management-rbac.md` | Permission Matrix |
| Track analytics events? | `docs/08-analytics/analytics.md` | SaaS Event Taxonomy |
| Build onboarding wizard? | `docs/09-saas-specific/user-onboarding.md` | Wizard Implementation |
| Support internationalization? | `docs/09-saas-specific/internationalization.md` | 9 required languages |
| Write tests? | `docs/rules/testing.md` | Testing Pyramid |
| Configure multi-tenancy? | `docs/09-saas-specific/saas-architecture.md` | Line 31: Row-Level Security |
| Format git commits? | `docs/rules/git-commits.md` | Conventional Commits |

---

## Startup Instructions

**FIRST: Set Git Identity for This Session**

Before making any commits, configure git to use Claude Code Bot identity:

```bash
git config user.name "Claude Code Bot"
git config user.email "[CLAUDE_CODE_BOT_EMAIL]"
```

**Verify identity:**
```bash
git config user.name  # Should show: Claude Code Bot
```

**Why:** This ensures all AI-generated commits are attributed to the Claude Code Bot account ([CLAUDE_CODE_BOT_ACCOUNT]), not the human developer. See `docs/07-deployment/claude-git-workflow.md` for details.

---

**SECOND: Check Quick Reference for Fast Answers**

Before reading full documentation files, check the Quick Reference for 90% of common questions:

**`docs/QUICK-REFERENCE.md`** - Consolidated TL;DR from all major documentation files

**Why Quick Reference First:**
- **Token efficiency**: 500 lines vs 8,000+ lines (94% savings)
- **Fast answers**: Critical requirements, patterns, and code examples
- **Precise links**: Jump to specific sections when detail needed
- **90% coverage**: Most questions answered without reading full docs

**When to use full docs:**
- Need detailed implementation examples
- Working with edge cases
- Comprehensive guides required
- Quick Reference doesn't cover specific topic

---

On every new session, please read the following documentation files in order to understand the project context, architecture, and coding standards:

### Project Documentation

First, read these files to understand the project:

1. `docs/01-getting-started/overview.md` - Project details, purpose, and tech stack
2. `docs/01-getting-started/architecture.md` - System architecture and design patterns
3. `docs/01-getting-started/setup.md` - Installation, setup, and common workflows

### Essential Coding Rules (Read Every Session)

**CRITICAL - Always read these first:**

1. `docs/rules/api-design.md#tldr` - API design standards (ALL APIs MUST be versioned as `/api/v1/resource`)
2. `docs/rules/ui-standards.md#tldr` - UI/UX standards (ALL UIs MUST be responsive: mobile, tablet, desktop)
3. `docs/rules/security-privacy.md` - Security and privacy requirements (GDPR, PII, encryption, auth)
4. `docs/rules/accessibility.md` - WCAG 2.2 Level AA compliance for all visual changes

**Core Standards:**

5. `docs/rules/pr-approval.md` - **CRITICAL**: NEVER merge without human approval, wait for ALL checks
6. `docs/rules/code-standards.md` - Linting, formatting, and code quality standards
7. `docs/rules/git-workflow.md#tldr` - Git-flow branching strategy
8. `docs/rules/git-commits.md` - Conventional Commits format and frequency
9. `docs/rules/semantic-versioning.md` - Automated versioning based on commits
10. `docs/rules/ci-cost-optimization.md` - **CRITICAL**: Test locally before pushing, minimize CI/CD costs

**Context-Dependent (Read when relevant to your task):**

- `docs/rules/clean-code.md` - Clean code practices (read when refactoring or writing complex logic)
- `docs/rules/testing.md` - Testing requirements (read when writing tests)
- `docs/rules/environments.md` - Environment stages (read when deploying)
- `docs/rules/deployment.md` - Deployment automation (read when setting up CI/CD)
- `docs/rules/technology-stack.md` - Technology reference (read when choosing libraries)

### SaaS-Specific Rules (Read on Session Start)

**Core SaaS Patterns (CRITICAL):**

1. `docs/09-saas-specific/saas-architecture.md` - Multi-tenancy, feature flags, sales automation, custom domains
2. `docs/09-saas-specific/subscription-billing.md` - Stripe integration, webhooks, plan management, feature gating
3. `docs/09-saas-specific/user-management-rbac.md` - Roles, permissions, RBAC patterns, user invitations
4. `docs/09-saas-specific/user-onboarding.md` - **NEW**: Wizard patterns, progress tracking, sample data, checklists
5. `docs/09-saas-specific/internationalization.md` - i18n requirements, supported languages, implementation

**Reference Documentation (Read when needed):**

- `docs/09-saas-specific/ai-development-workflow.md` - AI workflow guide (read when planning new features)
- `docs/10-ai-workflow/setup.md` - AI workflow setup (read during initial setup)

**Architecture & Operations Reference (Read for specific tasks):**

- `docs/02-development/` - Refactoring, technical debt, documentation standards
- `docs/03-architecture/` - Caching, database optimization, performance, load balancing, microservices
- `docs/04-frontend/` - User feedback, UX research
- `docs/06-operations/` - Monitoring, backups, security testing, incident response, compliance, disaster recovery
- `docs/07-deployment/` - Infrastructure as code
- `docs/08-analytics/` - Analytics setup (Plausible, PostHog)

---

## Quick Reference

### Important Links

- Repository: `[REPOSITORY_URL]`
- Documentation: `[DOCS_URL]`
- Issue Tracker: `[ISSUES_URL]`
- CI/CD: `[CI_CD_URL]`

### Tech Stack

- **Web**: [FRAMEWORK] (e.g., Next.js)
- **Mobile**: [MOBILE_FRAMEWORK] (e.g., Expo)
- **Language**: [LANGUAGE] (e.g., TypeScript)
- **Database**: [DATABASE]
- **Deployment**: [DEPLOYMENT_PLATFORM] (e.g., Railway)

### Key Contacts

- **Team Lead**: [TEAM_LEAD_NAME]
- **Tech Lead**: [TECH_LEAD_NAME]
- **Product Owner**: [PO_NAME]

### Common Commands

```bash
# Development
[DEV_START_COMMAND]          # Start development server
[DEV_TEST_COMMAND]           # Run tests
[DEV_LINT_COMMAND]           # Run linter

# Deployment
[DEPLOY_COMMAND]             # Deploy to environment
```

---

## Current Focus

> **Update this section with current sprint goals, in-progress features, and known issues**

---

## Important Notes

### For Claude Code Users

This documentation system ensures that Claude always has context about:
- What this project does and how it's structured
- Security, privacy, and accessibility requirements
- Coding standards and best practices
- Git workflow and testing requirements
- Technology choices and deployment processes
- **AI development workflow** (Speckit → Figma → Claude Code)

**When implementing features:**
- **ALWAYS use the Speckit workflow** for new features and change requests:
  1. `/speckit.specify` - Capture requirements as a specification
  2. `/speckit.plan` - Design the implementation (tech stack, architecture, contracts)
  3. `/speckit.tasks` - Generate actionable task breakdown
  4. `/speckit.implement` - Execute tasks systematically
- Only skip Speckit for trivial fixes (typos, single-line bug fixes, config changes)
- Use the Explore agent to understand the codebase before planning
- Request approval before major architectural changes
- See `docs/09-saas-specific/ai-development-workflow.md` for complete workflow

**CRITICAL REQUIREMENTS (Every Implementation):**
- **Backend**: ALL API endpoints MUST use versioning (/api/v1/...)
  - See `docs/rules/api-design.md#api-versioning` for complete API standards
- **Frontend**: ALL UIs MUST be responsive (mobile, tablet, desktop)
  - See `docs/rules/ui-standards.md#responsive-design` for complete UI/UX standards
  - Test at breakpoints: < 640px, 768px, 1024px+

**When making changes:**
- **ALWAYS verify git identity is set to Claude Code before committing** (critical!)
- **NEVER use emojis in .md files** - Use plain text formatting instead (see `docs/02-development/documentation-standards.md#no-emojis`)
- Always follow the rules defined in `docs/rules/`
- Check `docs/09-saas-specific/` for project-specific overrides
- Update this CLAUDE.md file if you add or remove documentation files
- Keep the "Current Focus" section up to date
- Use branch naming convention: `claude/feature-name` for AI-generated branches

**When to read reference documentation:**

Read these docs when working on specific tasks:
- **Refactoring code?** → Read `docs/02-development/refactoring.md`
- **Planning architecture?** → Read `docs/03-architecture/` (caching, database, load balancing, microservices)
- **Adding user feedback?** → Read `docs/04-frontend/user-feedback.md`
- **Setting up monitoring?** → Read `docs/06-operations/monitoring.md`
- **Deploying?** → Read `docs/07-deployment/infrastructure-as-code.md`
- **Security incident?** → Read `docs/06-operations/incident-response.md`
- **Compliance questions?** → Read `docs/06-operations/compliance.md`
- **Writing tests?** → Read `docs/rules/testing.md`
- **Choosing a library?** → Read `docs/rules/technology-stack.md`

**Documentation Structure:**
- `docs/01-getting-started/` - Project overview, architecture, setup
- `docs/02-development/` - Development practices (refactoring, technical debt, docs)
- `docs/03-architecture/` - System architecture (caching, database, load balancing, microservices)
- `docs/04-frontend/` - Frontend/UX (user feedback, UX research)
- `docs/05-backend/` - Backend-specific documentation
- `docs/06-operations/` - Operations (monitoring, backups, security, incident response, compliance)
- `docs/07-deployment/` - Deployment (infrastructure as code, CI/CD)
- `docs/08-analytics/` - Analytics and metrics
- `docs/09-saas-specific/` - SaaS patterns (multi-tenancy, feature flags, internationalization)
- `docs/10-ai-workflow/` - AI development workflow setup
- `docs/rules/` - General coding rules (security, API design, testing, etc.)


### Customization

To customize this template for your project:

1. Replace all `[PLACEHOLDER]` values with your actual information
2. Update file paths if you change the directory structure
3. Remove rule files you don't need and update the list above
4. Add new rule files as needed and reference them above
5. Keep the "Quick Reference" and "Current Focus" sections updated

## Active Technologies
- TypeScript 5.x (strict mode) + Next.js 16 (App Router), React 19, Tailwind CSS 4, Recharts, xlsx, jsPDF (001-template-core)
- Browser localStorage (no external database) (001-template-core)
- TypeScript 5.x (strict mode) + Tailwind CSS 4, Recharts (charts), xlsx (Excel), jsPDF (PDF) (001-slicing-pie-calculator)
- Browser localStorage (local-first architecture) (001-slicing-pie-calculator)
- TypeScript 5.x (strict mode) + React Context, existing ContributionForm componen (002-edit-contributions)
- localStorage via existing useLocalStorage hook (002-edit-contributions)
- TypeScript 5.x (strict mode) + React Context, existing useLocalStorage and useEntities hooks (003-cliff-vesting-projections)
- localStorage via existing hooks (003-cliff-vesting-projections)
- localStorage (via existing useLocalStorage hook) (004-company-valuation)
- Browser localStorage (via existing useLocalStorage and useEntities hooks) (005-soft-deletion)
- TypeScript 5.x (strict mode) + Next.js 16 (App Router), React 19, Anthropic Claude API (006-ai-tool-use)
- N/A (no storage changes - localStorage unchanged) (006-ai-tool-use)

## Recent Changes
- 001-template-core: Added TypeScript 5.x (strict mode) + Next.js 16 (App Router), React 19, Tailwind CSS 4, Recharts, xlsx, jsPDF
