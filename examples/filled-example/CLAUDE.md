# TaskMaster Pro - Claude Code Documentation

> **This file is automatically loaded when you start a new Claude Code session.**

## Startup Instructions

On every new session, please read the following documentation files in order to understand the project context, architecture, and coding standards:

### Project Documentation

First, read these files to understand the project:

1. `docs/project/overview.md` - Project details, purpose, and tech stack
2. `docs/project/architecture.md` - System architecture and design patterns
3. `docs/project/setup.md` - Installation, setup, and common workflows

### General Coding Rules

Please read ALL of the following coding rules files. These define the standards for all code written in this project:

1. `docs/rules/security-privacy.md` - Security and privacy requirements (GDPR, PII, encryption, auth)
2. `docs/rules/accessibility.md` - WCAG 2.2 Level AA compliance for all visual changes
3. `docs/rules/clean-code.md` - Clean code practices (functions, naming, comments)
4. `docs/rules/code-standards.md` - Linting, formatting, and code quality standards
5. `docs/rules/git-workflow.md` - Git-flow branching strategy and semantic versioning
6. `docs/rules/git-commits.md` - Conventional Commits format and frequency
7. `docs/rules/testing.md` - Testing requirements by environment (unit, integration, UAT)
8. `docs/rules/environments.md` - Environment stages (DEV/SIT/UAT/PROD) and promotion checklists
9. `docs/rules/deployment.md` - Deployment automation and CI/CD requirements
10. `docs/rules/technology-stack.md` - Preferred technologies and version policies

### Project-Specific Rules

If any files exist in `docs/project-rules/`, please read them as well. These contain rules specific to this project that override or extend the general rules above.

---

## Quick Reference

### Important Links

- Repository: `https://github.com/company/taskmaster-pro`
- Documentation: `https://docs.taskmaster-pro.com`
- Issue Tracker: `https://github.com/company/taskmaster-pro/issues`
- CI/CD: `https://github.com/company/taskmaster-pro/actions`

### Tech Stack

- **Web**: Next.js 15 (App Router)
- **Mobile**: Expo SDK 52
- **Language**: TypeScript 5.6
- **Database**: PostgreSQL 16
- **Deployment**: Railway

### Key Contacts

- **Team Lead**: Sarah Johnson - sarah@company.com
- **Tech Lead**: Alex Chen - alex@company.com
- **Product Owner**: Maria Garcia - maria@company.com

### Common Commands

```bash
# Development
pnpm dev                  # Start development server
pnpm test                 # Run tests
pnpm lint                 # Run linter

# Deployment
pnpm build                # Build for production
```

---

## Current Focus

> **Update this section with what's currently being worked on**

### Active Sprint/Milestone

- Sprint: Sprint 23
- End Date: 2024-12-31
- Goals:
  - Complete task sharing feature
  - Implement real-time notifications
  - Improve mobile performance

### In Progress

- Task collaboration UI (issue #234)
- Push notification system (issue #245)
- Mobile app performance optimization (issue #256)

### Known Issues

- Occasional sync delay in real-time updates (investigating)
- Mobile app crashes on iOS 16 (fix in progress)

---

## Important Notes

### For Claude Code Users

This documentation system ensures that Claude always has context about:
- What this project does and how it's structured
- Security, privacy, and accessibility requirements
- Coding standards and best practices
- Git workflow and testing requirements
- Technology choices and deployment processes

**When making changes:**
- Always follow the rules defined in `docs/rules/`
- Check `docs/project-rules/` for project-specific overrides
- Update this CLAUDE.md file if you add or remove documentation files
- Keep the "Current Focus" section up to date

### Project-Specific Notes

**TaskMaster Pro** is a collaborative task management application with:
- Real-time collaboration features
- Mobile and web clients
- Team workspaces
- AI-powered task suggestions
- Integration with calendar and email

### Customization

This documentation template has been customized for TaskMaster Pro. The general coding rules apply to all projects at our company, while project-specific rules in `docs/project-rules/` contain requirements unique to TaskMaster Pro.
