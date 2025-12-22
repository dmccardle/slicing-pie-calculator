# Code Templates

This directory contains **production-ready boilerplate templates** that follow all documented rules and best practices. Use these as starting points for new features to ensure consistency and quality.

---

## Available Templates

### 1. API Endpoint Template
**File**: `api-endpoint-template.ts`

**Purpose**: Create new versioned REST API endpoints with authentication, validation, and multi-tenant support.

**Follows**:
- API versioning (`/api/v1/...`)
- Standard response format
- Input validation with Zod
- Multi-tenant row-level security
- Authentication & authorization
- Error handling (401, 403, 404, 409, 500)
- Analytics tracking
- Feature limit checks

**Usage**:
```bash
# 1. Copy to your API route
cp docs/templates/api-endpoint-template.ts src/app/api/v1/[resource]/route.ts

# 2. Find & replace placeholders
# - [RESOURCE] → Your resource name (PascalCase, e.g., "Product")
# - [resource] → Your resource name (camelCase, e.g., "product")

# 3. Customize validation schema
# 4. Implement business logic
# 5. Test all endpoints
```

**Included Endpoints**:
- `GET /api/v1/[resource]` - List all (with pagination)
- `POST /api/v1/[resource]` - Create new
- `PUT /api/v1/[resource]/[id]` - Update existing
- `DELETE /api/v1/[resource]/[id]` - Soft delete

---

### 2. React Component Template
**File**: `react-component-template.tsx`

**Purpose**: Create new React components with TypeScript, accessibility, and responsive design.

**Follows**:
- Responsive design (mobile, tablet, desktop)
- TypeScript with strict types
- WCAG 2.2 Level AA accessibility
- Proper ARIA attributes
- Loading and error states
- Internationalization (i18n)
- Clean code practices

**Usage**:
```bash
# 1. Copy to your components directory
cp docs/templates/react-component-template.tsx src/components/[ComponentName].tsx

# 2. Find & replace placeholders
# - [ComponentName] → Your component name (PascalCase)
# - [componentName] → Your component name (camelCase)

# 3. Update props interface
# 4. Implement component logic
# 5. Test on multiple screen sizes
```

**Features**:
- Responsive Tailwind CSS classes
- Accessible button with ARIA attributes
- Loading spinner with screen reader support
- Error boundary pattern
- i18n integration

---

### 3. Database Migration Template
**File**: `database-migration-template.sql`

**Purpose**: Create new database tables with multi-tenant security, proper indexes, and audit fields.

**Follows**:
- Multi-tenant row-level security (RLS)
- Soft delete pattern (`deletedAt`)
- Audit fields (`createdAt`, `updatedAt`, `createdById`)
- Proper indexes for performance
- Foreign key constraints
- Unique constraints
- Triggers for auto-updating timestamps

**Usage**:
```bash
# 1. Copy to your migrations directory
cp docs/templates/database-migration-template.sql prisma/migrations/[timestamp]_[description]/migration.sql

# 2. Find & replace placeholders
# - [table_name] → Your table name (plural, snake_case, e.g., "products")

# 3. Add your custom columns
# 4. Update indexes based on query patterns
# 5. Run migration: npx prisma migrate dev
```

**Included**:
- Multi-tenant isolation with RLS policies
- Indexes for common query patterns
- Soft delete support
- Auto-updating `updated_at` trigger
- Example queries and rollback script

---

### 4. Test Template
**File**: `test-template.test.ts`

**Purpose**: Write comprehensive tests following the testing pyramid.

**Follows**:
- AAA pattern (Arrange, Act, Assert)
- Descriptive test names
- Isolated tests (no shared state)
- 80%+ code coverage target
- Unit, integration, and E2E examples
- Accessibility tests
- Responsive design tests

**Usage**:
```bash
# 1. Copy to your tests directory
cp docs/templates/test-template.test.ts src/[module]/__tests__/[file].test.ts

# 2. Find & replace placeholders
# - [ComponentName] or [functionName] → Your test subject

# 3. Add test cases
# 4. Run tests: npm test
# 5. Check coverage: npm run test:coverage
```

**Test Categories**:
- Rendering tests
- User interaction tests
- Accessibility tests
- Responsive design tests
- Integration tests
- E2E examples (commented)
- Performance tests (commented)

---

## Quick Start Workflow

### Creating a New Feature

1. **Start with Architecture Planning**
   ```bash
   # Read relevant docs
   cat docs/01-getting-started/architecture.md
   cat docs/rules/api-design.md
   cat docs/rules/ui-standards.md
   ```

2. **Create Database Schema**
   ```bash
   # Use database migration template
   cp docs/templates/database-migration-template.sql \
      prisma/migrations/$(date +%Y%m%d%H%M%S)_add_products/migration.sql

   # Edit and run migration
   npx prisma migrate dev
   ```

3. **Build Backend API**
   ```bash
   # Use API endpoint template
   cp docs/templates/api-endpoint-template.ts \
      src/app/api/v1/products/route.ts

   # Customize and test
   ```

4. **Build Frontend Component**
   ```bash
   # Use React component template
   cp docs/templates/react-component-template.tsx \
      src/components/ProductList.tsx

   # Implement UI
   ```

5. **Write Tests**
   ```bash
   # Use test template
   cp docs/templates/test-template.test.ts \
      src/components/__tests__/ProductList.test.tsx

   # Add test cases
   npm test
   ```

6. **Verify Quality**
   ```bash
   # Lint
   npm run lint

   # Type check
   npm run type-check

   # Test coverage
   npm run test:coverage

   # Build
   npm run build
   ```

---

## Related Documentation

### Before Using Templates, Read:
- `docs/rules/api-design.md` - API standards (versioning, response format)
- `docs/rules/ui-standards.md` - UI/UX standards (responsive design)
- `docs/rules/security-privacy.md` - Security requirements
- `docs/rules/testing.md` - Testing pyramid and coverage
- `docs/09-saas-specific/saas-architecture.md` - Multi-tenancy patterns

### Reference While Implementing:
- `docs/rules/code-standards.md` - Linting and formatting
- `docs/rules/git-commits.md` - Commit message format
- `docs/09-saas-specific/subscription-billing.md` - Stripe integration
- `docs/09-saas-specific/user-management-rbac.md` - Permissions

---

## Checklist: Template Customization

When using a template, ensure you:

- [ ] Replace ALL `[PLACEHOLDER]` values
- [ ] Update imports to match your project structure
- [ ] Customize validation schemas (Zod, constraints)
- [ ] Add business logic specific to your feature
- [ ] Test on multiple screen sizes (mobile, tablet, desktop)
- [ ] Verify accessibility (keyboard nav, screen readers)
- [ ] Run linter and fix all warnings
- [ ] Write comprehensive tests (80%+ coverage)
- [ ] Update documentation if you add new patterns

---

## Template Philosophy

These templates are designed to be:

1. **Complete**: Include all required boilerplate (auth, validation, error handling)
2. **Opinionated**: Follow best practices from all docs/rules/
3. **Production-Ready**: No TODOs or placeholders in implementation code
4. **Educational**: Comments explain why each pattern is used
5. **Maintainable**: Consistent structure across all features

**NOT meant to be**:
- Generic one-size-fits-all solutions
- Over-engineered abstractions
- Replacement for understanding the rules

---

## Tips for AI Agents

When using Claude Code to implement features:

1. **Always start with templates** - Don't reinvent patterns
2. **Read related docs first** - Understand the "why" behind each rule
3. **Customize methodically** - Replace placeholders one section at a time
4. **Test incrementally** - Verify each endpoint/component works before moving on
5. **Ask for clarification** - If a rule conflicts with requirements, ask the user

**Common Pitfalls**:
- Forgetting to replace `[PLACEHOLDER]` values
- Skipping multi-tenant isolation (`tenantId`)
- Missing responsive breakpoints (mobile, tablet, desktop)
- Not testing accessibility (keyboard nav, ARIA)
- Hardcoding values instead of using i18n

---

## Keeping Templates Updated

Templates should be updated when:
- New rules are added to `docs/rules/`
- SaaS patterns evolve in `docs/09-saas-specific/`
- Technology stack changes (e.g., new framework version)
- Common bugs are discovered in template usage

**Process**:
1. Update template file
2. Add changelog entry
3. Update this README
4. Notify team in Slack/Discord
5. Run `npm run test:templates` (if available)

---

## Questions?

- **Documentation**: See `docs/` directory
- **Issues**: Create GitHub issue with `template` label
- **Discussions**: Use GitHub Discussions for template requests

---

## Related Documentation

**Templates in This Directory**:
- [API Endpoint Template](./api-endpoint-template.ts) - Versioned REST API with auth
- [React Component Template](./react-component-template.tsx) - Responsive, accessible component
- [Database Migration Template](./database-migration-template.sql) - Multi-tenant schema
- [Test Template](./test-template.test.ts) - Unit, integration, E2E tests

**Rules These Templates Follow**:
- [API Design](../rules/api-design.md) - API versioning, response format
- [UI Standards](../rules/ui-standards.md) - Responsive design, breakpoints
- [Security & Privacy](../rules/security-privacy.md) - Auth, encryption, GDPR
- [Accessibility](../rules/accessibility.md) - WCAG 2.2 Level AA
- [Testing](../rules/testing.md) - Testing pyramid, coverage
- [Code Standards](../rules/code-standards.md) - Linting, formatting

**SaaS Patterns**:
- [SaaS Architecture](../09-saas-specific/saas-architecture.md) - Multi-tenancy, feature flags
- [Subscription Billing](../09-saas-specific/subscription-billing.md) - Stripe integration
- [User Management & RBAC](../09-saas-specific/user-management-rbac.md) - Permissions

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)

---

**Last Updated**: 2025-12-22 (v1.1.5)
