# Refactoring Strategy

## Overview

Refactoring improves code structure without changing behavior. This document defines when and how to refactor code effectively.

**Rule**: Make it work → Make it right → Make it fast

---

## When to Refactor

### Refactor When:

1. **Before adding new features**
   - Clean up messy code before building on it
   - "Leave the campground cleaner than you found it"

2. **During code review**
   - Reviewer suggests improvements
   - Code doesn't follow standards

3. **When you see duplication** (DRY principle)
   - Same code in 3+ places → Extract to function/component

4. **When complexity is high**
   - Function > 50 lines → Break into smaller functions
   - File > 300 lines → Split into multiple files
   - Cyclomatic complexity > 10 → Simplify logic

5. **When tests are hard to write**
   - If you can't test it, refactor it first

### Don't Refactor When:

1. **Under deadline pressure** - Ship first, refactor later
2. **Code works and rarely changes** - If it ain't broke, don't fix it
3. **You don't understand the code** - Study it first
4. **No tests exist** - Write tests first, then refactor

---

## Refactoring Techniques

### 1. Extract Function

**Before**:
```typescript
export async function createOrder(userId: string, items: Item[]) {
  // Calculate total (complex logic)
  let total = 0;
  for (const item of items) {
    const discount = item.price * item.discountPercent;
    const tax = (item.price - discount) * 0.08;
    total += item.price - discount + tax;
  }

  // Validate inventory (complex logic)
  for (const item of items) {
    const stock = await prisma.inventory.findUnique({ where: { id: item.id } });
    if (!stock || stock.quantity < item.quantity) {
      throw new Error('Insufficient inventory');
    }
  }

  // Create order
  return prisma.order.create({
    data: { userId, items, total },
  });
}
```

**After**:
```typescript
export async function createOrder(userId: string, items: Item[]) {
  const total = calculateTotal(items);
  await validateInventory(items);

  return prisma.order.create({
    data: { userId, items, total },
  });
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => {
    const discount = item.price * item.discountPercent;
    const tax = (item.price - discount) * 0.08;
    return sum + item.price - discount + tax;
  }, 0);
}

async function validateInventory(items: Item[]): Promise<void> {
  for (const item of items) {
    const stock = await prisma.inventory.findUnique({ where: { id: item.id } });
    if (!stock || stock.quantity < item.quantity) {
      throw new Error(`Insufficient inventory for ${item.name}`);
    }
  }
}
```

### 2. Extract Component (React)

**Before**:
```tsx
export default function Dashboard() {
  const { data: user } = useUser();
  const { data: orders } = useOrders();
  const { data: analytics } = useAnalytics();

  return (
    <div>
      {/* User profile - 50 lines */}
      <div className="profile">
        <img src={user.avatar} />
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        {/* ... more profile UI */}
      </div>

      {/* Orders list - 80 lines */}
      <div className="orders">
        {orders.map(order => (
          <div key={order.id}>
            {/* Complex order UI */}
          </div>
        ))}
      </div>

      {/* Analytics charts - 100 lines */}
      <div className="analytics">
        {/* Complex chart UI */}
      </div>
    </div>
  );
}
```

**After**:
```tsx
export default function Dashboard() {
  return (
    <div>
      <UserProfile />
      <OrdersList />
      <AnalyticsCharts />
    </div>
  );
}

// Each component in its own file
function UserProfile() { /* ... */ }
function OrdersList() { /* ... */ }
function AnalyticsCharts() { /* ... */ }
```

### 3. Remove Duplication

**Before**:
```typescript
// Duplicated in 5 files
async function getActiveUsers() {
  return prisma.user.findMany({ where: { active: true } });
}

async function getActivePosts() {
  return prisma.post.findMany({ where: { active: true } });
}

async function getActiveProducts() {
  return prisma.product.findMany({ where: { active: true } });
}
```

**After**:
```typescript
// lib/db-utils.ts
export async function findActive<T>(
  model: any,
  additionalWhere?: any
): Promise<T[]> {
  return model.findMany({
    where: {
      active: true,
      ...additionalWhere,
    },
  });
}

// Usage
const users = await findActive<User>(prisma.user);
const posts = await findActive<Post>(prisma.post);
const products = await findActive<Product>(prisma.product);
```

### 4. Simplify Conditionals

**Before**:
```typescript
if (user.role === 'admin' || user.role === 'moderator' || user.role === 'owner') {
  // Allow action
}
```

**After**:
```typescript
const canModerate = (user: User) =>
  ['admin', 'moderator', 'owner'].includes(user.role);

if (canModerate(user)) {
  // Allow action
}
```

### 5. Replace Magic Numbers with Constants

**Before**:
```typescript
if (user.age < 18) return 'minor';
if (user.age < 65) return 'adult';
return 'senior';
```

**After**:
```typescript
const AGE_OF_MAJORITY = 18;
const RETIREMENT_AGE = 65;

if (user.age < AGE_OF_MAJORITY) return 'minor';
if (user.age < RETIREMENT_AGE) return 'adult';
return 'senior';
```

---

## Refactoring Workflow

### 1. Write Tests First (If None Exist)

```typescript
// BEFORE refactoring, write tests
import { calculateTotal } from './orders';

describe('calculateTotal', () => {
  it('calculates total with tax and discount', () => {
    const items = [
      { price: 100, discountPercent: 0.1, quantity: 1 },
    ];
    expect(calculateTotal(items)).toBe(97.2); // 100 - 10 + 7.2 tax
  });
});
```

### 2. Refactor in Small Steps

```bash
# Make one change at a time
git add -p
git commit -m "refactor: extract calculateTotal function"

# Run tests after each change
npm test

# If tests fail, revert
git reset --hard
```

### 3. Keep Tests Passing

- Run tests after every refactor
- If tests fail, undo and try smaller steps
- Never refactor without tests

---

## Common Refactoring Patterns

### Pattern: Replace Type Code with Enum

**Before**:
```typescript
const status = 'pending';  // Could be anything!
```

**After**:
```typescript
enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Shipped = 'shipped',
  Delivered = 'delivered',
}

const status: OrderStatus = OrderStatus.Pending;  // Type-safe!
```

### Pattern: Replace Callback with Promise/Async

**Before**:
```typescript
function fetchUser(id: string, callback: (user: User) => void) {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
    if (err) throw err;
    callback(result);
  });
}
```

**After**:
```typescript
async function fetchUser(id: string): Promise<User> {
  return prisma.user.findUnique({ where: { id } });
}
```

### Pattern: Replace Long Parameter List with Object

**Before**:
```typescript
function createUser(
  name: string,
  email: string,
  age: number,
  country: string,
  phone: string,
  address: string
) {
  // Too many parameters!
}
```

**After**:
```typescript
interface CreateUserParams {
  name: string;
  email: string;
  age: number;
  country: string;
  phone: string;
  address: string;
}

function createUser(params: CreateUserParams) {
  // Much cleaner!
}
```

---

## Refactoring Checklist

Before merging refactor PR:

- [ ] Tests exist and pass
- [ ] Behavior unchanged (same inputs → same outputs)
- [ ] Code is simpler/clearer than before
- [ ] No new features added (refactor ≠ new features)
- [ ] Performance not degraded (run benchmarks if needed)
- [ ] Documentation updated (if public API changed)

---

## Summary

**When to refactor**:
- Before adding features (clean first)
- During code review (reviewer suggests improvements)
- When you see duplication (DRY principle)
- Under deadline (ship first)
- Without tests (tests first!)

**Key techniques**:
1. Extract function/component
2. Remove duplication
3. Simplify conditionals
4. Replace magic numbers with constants

**Workflow**:
1. Write tests (if none exist)
2. Refactor in small steps
3. Keep tests passing

**See Also**:
- `docs/02-development/technical-debt.md` - Managing tech debt
- `docs/rules/clean-code.md` - Clean code principles

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

