# Example Project-Specific Rule

> **This is a template file showing how to add project-specific coding rules.**
>
> Copy this file and create new rules for requirements unique to your project.

## Overview

[Brief description of what this rule covers and why it's important for this specific project]

---

## Rule Category

**Category**: [e.g., API Design, Data Model, UI Patterns, Business Logic]

**Applies to**: [Which parts of the codebase this affects]

**Priority**: [High / Medium / Low]

---

## The Rule

**Rule**: [Clear, concise statement of the rule]

### Why This Rule Exists

[Explain the business or technical reason this rule is necessary for THIS project specifically]

---

## Examples

### Good Examples

```typescript
// Example of following this rule
// Include code that demonstrates the correct approach
```

### Bad Examples

```typescript
// Example of violating this rule
// Show what NOT to do
```

---

## When to Apply

- [Specific scenario 1]
- [Specific scenario 2]
- [Specific scenario 3]

## Exceptions

**When this rule can be broken**:
- [Exception 1 with explanation]
- [Exception 2 with explanation]

**How to request an exception**:
- [Process for getting approval to deviate from this rule]

---

## Related Rules

- See `docs/rules/[related-general-rule].md`
- See `docs/project-rules/[related-project-rule].md`

---

## Examples of Project-Specific Rules

### Example 1: API Response Format

```markdown
## API Response Format

**Rule**: All API responses must follow the standard envelope format.

### Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

### Examples

```typescript
// GOOD - Standard format
return Response.json({
  success: true,
  data: { users: [...] },
  meta: {
    timestamp: new Date().toISOString(),
    requestId: req.id
  }
});

// BAD - Non-standard format
return Response.json({ users: [...] });
```
```

### Example 2: Naming Convention

```markdown
## Component Naming for Feature Modules

**Rule**: Components in feature modules must be prefixed with the feature name.

### Why

We have a large codebase with multiple features. This prevents naming conflicts and makes it clear which feature a component belongs to.

### Format

`[FeatureName][ComponentType]`

### Examples

```typescript
// GOOD
export function DashboardHeader() { }
export function DashboardSidebar() { }
export function DashboardCard() { }

// BAD - Generic names
export function Header() { }  // Which header?
export function Sidebar() { } // Which sidebar?
```

### Exceptions

- Shared components in `components/ui/` don't need prefixes
- Layout components can omit feature prefix if they apply globally
```

### Example 3: Database Query Pattern

```markdown
## Database Query Pattern

**Rule**: All database queries must use the repository pattern.

### Why

- Centralizes database logic
- Makes testing easier (mock repositories)
- Enforces consistent error handling
- Easier to switch ORMs if needed

### Structure

```
src/repositories/
  ├── UserRepository.ts
  ├── PostRepository.ts
  └── BaseRepository.ts
```

### Example

```typescript
// GOOD - Using repository
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUser(id: string) {
    return await this.userRepo.findById(id);
  }
}

// BAD - Direct database access
export async function getUser(id: string) {
  return await db.user.findUnique({ where: { id } });
}
```
```

### Example 4: Feature Flag Pattern

```markdown
## Feature Flag Usage

**Rule**: All new features must be behind a feature flag until fully tested in production.

### Why

- Allows gradual rollout
- Easy rollback without code changes
- A/B testing capability
- Reduces risk of breaking production

### Implementation

```typescript
// lib/featureFlags.ts
export const features = {
  newDashboard: process.env.FEATURE_NEW_DASHBOARD === 'true',
  betaPayments: process.env.FEATURE_BETA_PAYMENTS === 'true',
};

// In component
import { features } from '@/lib/featureFlags';

export function Dashboard() {
  if (features.newDashboard) {
    return <NewDashboard />;
  }
  return <OldDashboard />;
}
```

### When to Remove

- After 2 weeks in production without issues
- After 95% user rollout
- After stakeholder approval
```

---

## Checklist for Creating Project-Specific Rules

When adding a new project-specific rule, ensure:

- [ ] Rule is specific to THIS project (not a general best practice)
- [ ] Clear explanation of WHY this rule exists
- [ ] Code examples showing good and bad patterns
- [ ] Documented exceptions (if any)
- [ ] Added to `CLAUDE.md` so it's loaded on startup
- [ ] Team reviewed and approved
- [ ] Related to actual project requirements or constraints

---

## Tips for Writing Good Project Rules

1. **Be Specific**: Don't repeat general rules. Focus on project-specific constraints.

2. **Explain Why**: Always explain the business or technical reason.

3. **Show Examples**: Code examples are more valuable than long descriptions.

4. **Keep It Updated**: Remove rules that are no longer relevant.

5. **Get Team Buy-in**: Discuss with team before adding major rules.

6. **Link to Context**: Reference related documentation or decisions.

---

## Common Project-Specific Rule Categories

- **API Conventions**: Response formats, error handling, versioning
- **Data Models**: Schema conventions, relationships, validation
- **UI Patterns**: Component structure, styling conventions, layouts
- **Business Logic**: Domain-specific rules, workflows, calculations
- **Performance**: Caching strategies, query optimization, lazy loading
- **Security**: Project-specific auth requirements, data handling
- **Third-party Integrations**: How to interact with specific external services
- **Domain Language**: Ubiquitous language for the business domain

---

## Template for New Rules

```markdown
# [Rule Name]

## Overview
[What this rule is about]

## The Rule
**Rule**: [Clear statement]

### Why
[Business/technical reason]

## Examples

### Good
\```typescript
// Good example
\```

### Bad
\```typescript
// Bad example
\```

## When to Apply
- [Scenario 1]
- [Scenario 2]

## Exceptions
- [Exception 1]

## Related
- [Links to related rules or docs]
```

---

## Getting Started

1. **Copy this file** to create a new rule
2. **Follow the template** above
3. **Add examples** from your actual codebase
4. **Reference in CLAUDE.md** so Claude reads it on startup
5. **Commit and share** with the team

Example:

```bash
# Create new project rule
cp docs/project-rules/example-rule.md docs/project-rules/api-response-format.md

# Edit the file
# Add rule content...

# Update CLAUDE.md to reference it
# Add to "Project-Specific Rules" section

# Commit
git add docs/project-rules/api-response-format.md
git add CLAUDE.md
git commit -m "docs(rules): add API response format rule"
```

---

## Related Documentation

**SaaS Essentials**:
- [SaaS Architecture](./saas-architecture.md) - Multi-tenancy, feature flags
- [Subscription Billing](./subscription-billing.md) - Stripe integration, plans
- [User Management & RBAC](./user-management-rbac.md) - Roles, permissions
- [User Onboarding](./user-onboarding.md) - Wizards, tutorials, checklists
- [Internationalization](./internationalization.md) - i18n, l10n
- [AI Development Workflow](./ai-development-workflow.md) - AI-assisted development

**Core Rules**:
- [API Design](../rules/api-design.md) - Multi-tenant API patterns
- [Security & Privacy](../rules/security-privacy.md) - Data isolation, GDPR

**Practical Resources**:
- [API Endpoint Template](../templates/api-endpoint-template.ts) - Multi-tenant API boilerplate
- [Database Migration Template](../templates/database-migration-template.sql) - RLS setup

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All SaaS Docs](./)

