# Documentation Standards

## Overview

Good documentation helps teammates understand code faster and reduces onboarding time. This document defines what and how to document.

**Rule**: Write docs for your future self (who will forget everything in 3 months).

---

## What to Document

### Always Document

1. **Public APIs** - Functions/classes used by other teams
2. **Complex algorithms** - Non-obvious logic
3. **"Why" decisions** - Why you chose approach A over B
4. **Setup instructions** - How to run locally
5. **Deployment procedures** - How to deploy
6. **Incident runbooks** - How to respond to emergencies

### Don't Document

1. **Obvious code** - Self-explanatory functions
2. **Implementation details** - How code works (code shows this)
3. **Outdated info** - Remove old docs, don't leave them

---

## Markdown Standards

### No Emojis

**Rule**: NEVER use emojis in Markdown files (.md) in this project.

**Why**:
- Increases file size unnecessarily
- Reduces token efficiency for AI agents
- Decreases context space available for actual content
- Makes documentation harder to parse programmatically

```markdown
// BAD - Uses emojis
**Critical Requirements:**
- API versioning
- Responsive design

// GOOD - Plain text
**Critical Requirements:**
- API versioning
- Responsive design
```

**Exceptions**: None. Use plain text, bold, bullet points, and formatting instead.

---

## Code Comments

### Good Comments (Why, Not What)

```typescript
// GOOD: Explains WHY
// Use exponential backoff to avoid overwhelming Stripe API during retries
// Stripe rate limit: 100 req/sec, our retry could exceed this
async function retryPayment(orderId: string) {
  await exponentialBackoff(() => stripe.charge(orderId));
}

// GOOD: Warns about gotchas
// IMPORTANT: This must run AFTER inventory is reserved
// Running it before can cause overselling
async function createOrder() {
  await reserveInventory();
  await chargePayment();  // <-- Must be second
}

// GOOD: Links to external context
// Algorithm from: https://en.wikipedia.org/wiki/Luhn_algorithm
// Used to validate credit card numbers
function luhnCheck(cardNumber: string): boolean {
  // ...
}
```

### Bad Comments (What, Not Why)

```typescript
// BAD: States the obvious
// Increment counter
counter++;

// BAD: Repeats code
// Get user from database by ID
const user = await prisma.user.findUnique({ where: { id } });

// BAD: Outdated (code changed, comment didn't)
// Returns user email
function getUserName(id: string) {  // Function now returns name, not email!
  return prisma.user.findUnique({ where: { id }, select: { name: true } });
}

// BAD: Commented-out code (delete it!)
// const oldImplementation = () => { ... };
```

### When to Add Comments

**Ask**: "Will this confuse my teammate in 6 months?"

- Yes → Add comment
- No → Clean code is better than comments

---

## Function/API Documentation

### Use JSDoc for Public APIs

```typescript
/**
 * Creates a new user account and sends verification email.
 *
 * @param email - User's email address (must be valid format)
 * @param password - Plain text password (will be hashed)
 * @param options - Optional user metadata
 * @returns Created user object (password excluded)
 * @throws {ValidationError} If email already exists
 * @throws {EmailError} If verification email fails to send
 *
 * @example
 * ```typescript
 * const user = await createUser('user@example.com', 'password123', {
 *   name: 'John Doe',
 *   plan: 'pro',
 * });
 * ```
 */
export async function createUser(
  email: string,
  password: string,
  options?: CreateUserOptions
): Promise<User> {
  // Implementation...
}
```

**Benefits**:
- IDE shows docs on hover
- Auto-generates API reference
- Type checking for params

### Document Complex Types

```typescript
/**
 * Represents an order in the system.
 *
 * @property id - Unique order identifier (UUID)
 * @property userId - ID of user who placed order
 * @property items - Array of order items with quantity and price
 * @property status - Current order status (pending → paid → shipped → delivered)
 * @property total - Total price in cents (USD)
 * @property createdAt - When order was created (ISO 8601)
 */
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
}
```

---

## README Files

### Repository Root README

**Every repository needs**:

```markdown
# Project Name

Brief description (1-2 sentences).

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Run locally
npm run dev

# Open http://localhost:3000
\`\`\`

## Tech Stack

- Next.js 15
- PostgreSQL
- Prisma ORM
- Railway (deployment)

## Project Structure

\`\`\`
src/
├── app/          # Next.js app router pages
├── components/   # Reusable React components
├── lib/          # Utility functions
└── types/        # TypeScript types
\`\`\`

## Environment Variables

\`\`\`bash
# Copy example file
cp .env.example .env

# Required variables:
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://...
\`\`\`

## Development

\`\`\`bash
npm run dev      # Start dev server
npm run build    # Build for production
npm test         # Run tests
npm run lint     # Run linter
\`\`\`

## Deployment

See \`docs/deployment.md\` for detailed deployment guide.

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT
\`\`\`

### Feature/Module README

**Complex features need their own README**:

```markdown
# Payment Processing

Handles all payment operations using Stripe.

## Flow

1. User clicks "Pay"
2. Frontend creates payment intent
3. Stripe processes payment
4. Webhook confirms payment
5. Order marked as paid

## Files

- \`payment-intent.ts\` - Creates Stripe payment intents
- \`webhook.ts\` - Handles Stripe webhooks
- \`refund.ts\` - Processes refunds

## Testing

Use Stripe test mode with test cards:
- Success: \`4242 4242 4242 4242\`
- Decline: \`4000 0000 0000 0002\`

## Error Handling

- Card declined → Show user error, retry
- Network error → Retry with exponential backoff
- Webhook missed → Cron job reconciles daily

## See Also

- [Stripe API Docs](https://stripe.com/docs/api)
- [Webhook Testing](docs/testing-webhooks.md)
\`\`\`

---

## Architecture Documentation

### High-Level Architecture Diagram

Use Mermaid (renders in GitHub):

```markdown
## System Architecture

\`\`\`mermaid
graph TD
    A[Web App] --> B[API Server]
    C[Mobile App] --> B
    B --> D[PostgreSQL]
    B --> E[Redis Cache]
    B --> F[Stripe API]
    B --> G[SendGrid Email]

    H[Background Worker] --> D
    H --> G
\`\`\`

## Data Flow

\`\`\`mermaid
sequenceDiagram
    User->>Web: Click "Purchase"
    Web->>API: POST /orders
    API->>DB: Create order
    API->>Stripe: Create charge
    Stripe-->>API: Charge success
    API->>Worker: Queue email
    Worker->>Email: Send receipt
\`\`\`
\`\`\`

### Decision Records (ADRs)

**Document important decisions**:

```markdown
# ADR-001: Use PostgreSQL Instead of MongoDB

## Status
Accepted (2025-01-15)

## Context
We need a database for user data, orders, and analytics.
Options: PostgreSQL (relational) vs MongoDB (document).

## Decision
Use PostgreSQL.

## Rationale
- Data is highly relational (users → orders → items)
- Need ACID transactions for payments
- Team has more PostgreSQL experience
- Prisma ORM works great with PostgreSQL

## Consequences
- Pros: ACID guarantees, strong typing, great tooling
- Cons: Requires migrations for schema changes
- Migration path: If we need document storage later, use JSONB columns

## Alternatives Considered
- MongoDB: Better for unstructured data, but our data is structured
- Firebase: Too expensive at scale, vendor lock-in
\`\`\`

---

## API Documentation

### Use OpenAPI/Swagger

```typescript
// Generate API docs from code
/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
export async function POST(request: Request) {
  // Implementation...
}
```

**Auto-generate docs**:
- Swagger UI: Interactive API playground
- Hosted at `/api-docs`
- Always up-to-date

---

## Changelog

### Keep a CHANGELOG.md

**Follow [Keep a Changelog](https://keepachangelog.com/)**:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Two-factor authentication for user accounts

## [1.2.0] - 2025-01-20

### Added
- Export orders to CSV feature
- Dark mode support

### Fixed
- Payment processing race condition
- Email delivery failures

### Security
- Updated Next.js to 15.0.3 (XSS fix)

## [1.1.0] - 2025-01-10

### Changed
- Migrated from Pages Router to App Router
- Improved dashboard performance (2s → 0.5s load time)

### Removed
- Legacy authentication system
\`\`\`

---

## Runbooks (Operational Docs)

**Document how to respond to incidents**:

```markdown
# Runbook: API Down

## Symptoms
- Uptime monitor alerts
- Users report errors
- API returning 500s

## Investigation
1. Check recent deployments: \`railway logs\`
2. Check error logs: Better Stack → Filter last 30 min
3. Check database: \`psql $DATABASE_URL -c "SELECT 1"\`

## Common Fixes

### Bad deployment
\`\`\`bash
railway rollback
\`\`\`

### Database down
\`\`\`bash
railway restart database
\`\`\`

### Out of memory
\`\`\`bash
railway restart api
\`\`\`

## Escalation
If not resolved in 30 minutes, call CTO: +1-555-0123
\`\`\`

**See `docs/06-operations/incident-management.md` for full runbook templates**

---

## Documentation Checklist

Before merging PR:

### Code
- [ ] Complex functions have comments explaining WHY
- [ ] Public APIs have JSDoc
- [ ] No commented-out code (delete it)

### Repository
- [ ] README exists with setup instructions
- [ ] CHANGELOG updated (if user-facing change)
- [ ] Environment variables documented

### Architecture
- [ ] Major decisions documented (ADR)
- [ ] Architecture diagrams up-to-date
- [ ] API docs generated (Swagger/OpenAPI)

### Operations
- [ ] Deployment procedure documented
- [ ] Runbooks updated (if new alerts/incidents possible)

---

## Tools

**Auto-generate docs**:
- **TypeDoc**: Generate API docs from JSDoc
- **Swagger**: API documentation from OpenAPI spec
- **Docusaurus**: Full documentation sites
- **Mermaid**: Diagrams in Markdown

**Linters**:
- **markdownlint**: Enforce Markdown standards
- **vale**: Prose linter (checks grammar, style)

---

## Summary

**Documentation priorities**:
1. **README** - Setup and quick start (first thing people read)
2. **API docs** - How to use your code (JSDoc, Swagger)
3. **Runbooks** - How to respond to incidents (ops team needs this)
4. **Architecture** - Why things are the way they are (ADRs)
5. **Changelog** - What changed and when (users need this)

**Good docs are**:
- Up-to-date (outdated docs are worse than no docs)
- Concise (respect reader's time)
- Searchable (clear headings, good SEO)
- Accessible (Markdown, rendered in GitHub)

**See Also**:
- `docs/rules/clean-code.md` - Self-documenting code
- `docs/06-operations/incident-management.md` - Runbook templates

---

## Related Documentation

**Related Development Practices**:
- [Refactoring](./refactoring.md) - When and how to refactor
- [Technical Debt](./technical-debt.md) - Managing code quality debt
- [Documentation Standards](./documentation-standards.md) - Writing good docs

**Core Rules**:
- [Code Standards](../rules/code-standards.md) - Linting and formatting
- [Clean Code](../rules/clean-code.md) - Code quality principles
- [Testing](../rules/testing.md) - Testing requirements

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)

