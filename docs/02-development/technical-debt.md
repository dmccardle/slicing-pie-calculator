# Technical Debt Management

## Overview

Technical debt is the implied cost of future rework caused by choosing quick solutions over better long-term approaches. Like financial debt, it accrues "interest" (slower development, more bugs) over time.

**Rule**: Some technical debt is acceptable. Manage it, don't eliminate it.

---

## Types of Technical Debt

### 1. Deliberate Debt (Good Debt)

**Consciously taken to ship faster**:
- "Let's hardcode this now, refactor later when we validate demand"
- "Skip tests for this prototype to ship by Friday"
- "Use a simpler algorithm now, optimize if it becomes a bottleneck"

**Acceptable** if:
- Documented (TODO comments, tickets)
- Planned for payback (in backlog)
- Trade-off is worth it (ship vs perfect)

### 2. Accidental Debt (Bad Debt)

**Unintentional, from lack of knowledge or care**:
- Didn't know better patterns
- Didn't understand requirements
- Rushed without thinking
- Copy-pasted code without understanding

**Must** be addressed in code review.

### 3. Bit Rot (Unavoidable Debt)

**Debt that accumulates over time**:
- Dependencies become outdated
- Best practices evolve
- New framework versions release

**Manage** with regular maintenance sprints.

---

## Identifying Technical Debt

### Code Smells

**Red flags that indicate debt**:

```typescript
// Smell: Giant function (> 100 lines)
function processOrder() {
  // 200 lines of spaghetti code
}

// Smell: Deep nesting (> 3 levels)
if (user) {
  if (user.role === 'admin') {
    if (user.canEdit) {
      if (document.status === 'draft') {
        // Do something
      }
    }
  }
}

// Smell: Duplicated code (copy-pasted 5 times)
async function getActiveUsers() {
  return prisma.user.findMany({ where: { active: true } });
}
async function getActivePosts() {
  return prisma.post.findMany({ where: { active: true } });
}

// Smell: Magic numbers (what is 86400000?)
setTimeout(() => refresh(), 86400000);

// Smell: Comment explains why code is bad
// HACK: This is terrible but it works
// TODO: Refactor this mess
```

### Metrics That Indicate Debt

**Track these**:
- **Code churn**: Files changed frequently (unstable)
- **Cyclomatic complexity**: Functions with > 10 branches
- **Test coverage**: < 70% coverage
- **Build time**: > 10 minutes
- **Deploy frequency**: < once per week

---

## Documenting Technical Debt

### Use TODO Comments

```typescript
// TODO: Refactor to use Prisma transactions
// Currently uses raw SQL which is error-prone
// See ticket: PROJ-123
async function updateInventory(items: Item[]) {
  for (const item of items) {
    await db.query('UPDATE inventory SET quantity = quantity - 1 WHERE id = ?', [item.id]);
  }
}

// TODO(priority): Replace with proper queue system
// Current implementation doesn't handle failures
// Blocks: User notifications feature
async function sendEmails(emails: Email[]) {
  for (const email of emails) {
    await sendEmail(email);  // Not fault-tolerant!
  }
}
```

### Create Debt Tickets

**In your issue tracker**:
```markdown
# [TECH DEBT] Replace synchronous email sending with queue

## Current State
Emails sent synchronously in API request, blocking user.
Failures cause 500 errors.

## Desired State
Use background queue (BullMQ) to send emails asynchronously.
Retry failed emails. Log all sends.

## Impact if Not Fixed
- Poor UX (slow API responses)
- Lost emails on failures
- Can't scale (blocks on email service)

## Effort
- Estimate: 2 days
- Priority: Medium (causes occasional 500s)
- Blocks: User notification features

## Acceptance Criteria
- [ ] BullMQ queue set up
- [ ] Email jobs processed in background
- [ ] Failed emails retry 3x
- [ ] All emails logged to database
```

---

## Prioritizing Technical Debt

### Debt Quadrants

| Urgency | Impact | Action |
|---------|--------|--------|
| **High urgency, High impact** | Causes prod bugs, blocks features | **Fix now** (sprint planning) |
| **Low urgency, High impact** | Makes development slow, risky | **Fix soon** (next 2 sprints) |
| **High urgency, Low impact** | Annoying but not critical | **Fix when convenient** |
| **Low urgency, Low impact** | Cosmetic issues | **Won't fix** (close ticket) |

### Prioritization Formula

```
Debt Priority = (Impact × Frequency) / Effort

Impact: 1-10 (how bad is it?)
Frequency: 1-10 (how often does it hurt?)
Effort: 1-10 (how hard to fix?)

Example:
- Slow test suite: (Impact: 7, Frequency: 10, Effort: 3) = 23.3 → HIGH
- Outdated dependency: (Impact: 3, Frequency: 1, Effort: 2) = 1.5 → LOW
```

---

## Paying Down Debt

### Strategy 1: Boy Scout Rule

**"Leave code better than you found it"**

```typescript
// You're adding a new feature to this file
export async function createOrder(userId: string, items: Item[]) {
  // BEFORE: Messy code you found
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }

  // AFTER: Clean it up while you're here
  const total = items.reduce((sum, item) => sum + item.price, 0);

  // Then add your new feature...
}
```

**Benefits**:
- Gradual debt paydown
- No dedicated refactor time needed
- Code improves with every change

### Strategy 2: Debt Sprint

**Dedicate 1 sprint every quarter to debt**:
- No new features
- Focus on refactoring, updates, cleanup
- Pay down top 5 debt tickets

**Example sprint**:
```markdown
## Q1 2025 Tech Debt Sprint

Goal: Pay down top 5 debt items

Tasks:
1. Upgrade Next.js 14 → 15 (security fixes)
2. Migrate from deprecated API (Stripe v1 → v2)
3. Add tests to payment processing (currently 0% coverage)
4. Refactor giant UserService class (1000 lines → 5 files)
5. Replace magic numbers with constants

Result:
- 10 security vulnerabilities fixed
- Test coverage: 45% → 65%
- Build time: 8 min → 5 min
```

### Strategy 3: 20% Time

**Spend 20% of each sprint on debt**:
- 4 out of 5 days: features
- 1 day: refactoring, updates, cleanup

**Benefits**:
- Continuous paydown
- Prevents debt accumulation
- Keeps codebase healthy

---

## Preventing Debt

### 1. Code Review

**Catch debt before merge**:
```markdown
# PR Review Checklist

Code Quality:
- [ ] No duplicated code (DRY)
- [ ] Functions < 50 lines
- [ ] No magic numbers
- [ ] Clear variable names

Testing:
- [ ] Tests added for new code
- [ ] Edge cases covered
- [ ] Coverage didn't decrease

Documentation:
- [ ] Public APIs documented
- [ ] Complex logic explained
- [ ] TODO comments for known issues
```

### 2. Definition of Done

**Feature not done until**:
- Code works
- Tests written (> 80% coverage)
- Code reviewed
- Documentation updated
- No linting errors
- No new security vulnerabilities

### 3. Regular Dependency Updates

**Automate with Dependabot**:
- Weekly dependency updates
- Auto-merge patch versions
- Review minor/major updates

**See `docs/06-operations/security-testing.md`**

---

## Measuring Debt

### Code Quality Metrics

**Track monthly**:

```typescript
// ESLint warnings/errors
npm run lint
// Target: 0 errors, < 10 warnings

// Test coverage
npm run test:coverage
// Target: > 80%

// TypeScript strict mode compliance
npm run type-check
// Target: 0 errors

// Bundle size
npm run build
// Target: < 300KB main bundle
```

### Debt Velocity

**Track how fast debt grows/shrinks**:
```
Month   | Debt Items | Change
--------|------------|-------
Jan '25 | 15         | -
Feb '25 | 18         | +3 
Mar '25 | 12         | -6 (debt sprint!)
Apr '25 | 14         | +2
```

**Goal**: Debt velocity ≈ 0 (not growing)

---

## Communicating Debt

### To Stakeholders

**Don't say**: "We need to refactor the codebase" (they don't care)

**Do say**: "Fixing this tech debt will let us ship features 2x faster"

**Frame debt as**:
- Lost velocity ("We're slowing down")
- Risk ("This could cause outages")
- Cost ("We're paying $500/month extra for slow DB queries")

### To Team

**Track debt visually**:
```markdown
## Tech Debt Board

### Critical (Fix Now)
- [DEBT-1] Replace sync email sending (causes 500s)
- [DEBT-2] Fix memory leak in API (OOM crashes)

### High Priority (Fix Soon)
- [DEBT-3] Upgrade Next.js (security fixes)
- [DEBT-4] Add tests to payment flow (0% coverage)

### Medium Priority
- [DEBT-5] Refactor UserService (1000 lines)
- [DEBT-6] Remove deprecated Stripe API

### Low Priority (Someday)
- [DEBT-7] Update UI to new design system
- [DEBT-8] Rename confusing variables
```

---

## Debt Checklist

### Monthly Debt Review

- [ ] Review debt board (close fixed items, add new ones)
- [ ] Prioritize top 5 debt items
- [ ] Update debt metrics (coverage, errors, bundle size)
- [ ] Schedule debt work for next sprint (Boy Scout rule or dedicated time)

### Quarterly Debt Sprint

- [ ] Dedicate 1 sprint to debt paydown
- [ ] Fix top 5 critical debt items
- [ ] Update all dependencies
- [ ] Improve test coverage (goal: +10%)
- [ ] Refactor most complex files

### Prevent New Debt

- [ ] Code review catches duplicates, complexity
- [ ] Definition of Done includes tests
- [ ] Dependabot auto-updates dependencies
- [ ] ESLint/TypeScript strict mode enforced

---

## Summary

**Technical debt is normal**:
- Some debt is acceptable (ship faster)
- Document debt (TODO, tickets)
- Prioritize by impact/frequency/effort
- Don't let debt grow unchecked

**Paydown strategies**:
1. **Boy Scout Rule** - Clean as you go (daily)
2. **Debt Sprint** - Dedicate time (quarterly)
3. **20% Time** - Continuous paydown (weekly)

**Prevention**:
- Code review catches debt
- Definition of Done includes quality
- Automate dependency updates

**Key metrics**:
- Test coverage > 80%
- ESLint errors = 0
- Debt velocity ≈ 0 (not growing)

**See Also**:
- `docs/02-development/refactoring.md` - How to pay down debt
- `docs/rules/clean-code.md` - Prevent debt with clean code
- `docs/06-operations/security-testing.md` - Prevent security debt

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

