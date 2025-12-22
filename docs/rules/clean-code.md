# Clean Code Practices

## Overview

We follow clean code principles to ensure our codebase is maintainable, readable, and scalable. These rules are inspired by Uncle Bob's "Clean Code" but adapted pragmatically for modern development.

## Core Principles

1. **Small functions** - Single responsibility
2. **Small files** - Reasonable length
3. **Verbose comments** - Explain "why", not "what"
4. **Descriptive naming** - Easy to comprehend, not short
5. **Avoid bad practices** - No commented code, no !important, proper scope

---

## Functions

### Small Functions

**Rule**: Functions should do ONE thing and do it well.

**Guidelines**:
- Maximum ~20-30 lines per function (guideline, not hard rule)
- If you can extract a meaningful function, do it
- Function name should clearly describe what it does

```typescript
// BAD - Function does too many things
function processUserData(userData: any) {
  // Validate
  if (!userData.email) throw new Error('Email required');
  if (!userData.name) throw new Error('Name required');

  // Transform
  const normalized = userData.email.toLowerCase();
  const fullName = `${userData.firstName} ${userData.lastName}`;

  // Save to database
  const user = db.user.create({
    email: normalized,
    name: fullName
  });

  // Send email
  sendEmail(user.email, 'Welcome!');

  // Log
  console.log(`User created: ${user.id}`);

  return user;
}

// GOOD - Separated into focused functions
function validateUserData(userData: UserInput): void {
  if (!userData.email) throw new Error('Email required');
  if (!userData.name) throw new Error('Name required');
}

function normalizeUserData(userData: UserInput): NormalizedUser {
  return {
    email: userData.email.toLowerCase(),
    name: `${userData.firstName} ${userData.lastName}`
  };
}

async function createUser(userData: NormalizedUser): Promise<User> {
  return await db.user.create(userData);
}

async function sendWelcomeEmail(email: string): Promise<void> {
  await sendEmail(email, 'Welcome!');
}

async function processUserData(userData: UserInput): Promise<User> {
  validateUserData(userData);
  const normalized = normalizeUserData(userData);
  const user = await createUser(normalized);
  await sendWelcomeEmail(user.email);
  logger.info(`User created: ${user.id}`);
  return user;
}
```

### Single Responsibility

**Rule**: Each function should have ONE reason to change.

```typescript
// BAD - Mixing concerns
function saveUserAndNotify(user: User) {
  db.save(user);
  sendEmail(user.email);
  logToAnalytics(user.id);
}

// GOOD - Separated concerns
function saveUser(user: User) {
  return db.save(user);
}

function notifyUser(user: User) {
  return sendEmail(user.email);
}

function trackUserCreation(userId: string) {
  return logToAnalytics(userId);
}

// Orchestrate in a higher-level function
async function createUserWorkflow(user: User) {
  const savedUser = await saveUser(user);
  await notifyUser(savedUser);
  await trackUserCreation(savedUser.id);
  return savedUser;
}
```

### Function Arguments

**Guidelines**:
- 0-2 arguments: Ideal
- 3 arguments: Acceptable
- 4+ arguments: Consider using an object parameter

```typescript
// BAD - Too many arguments
function createPost(title: string, body: string, author: string, tags: string[], published: boolean, createdAt: Date) {
  // ...
}

// GOOD - Object parameter
interface CreatePostParams {
  title: string;
  body: string;
  author: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
}

function createPost(params: CreatePostParams) {
  // ...
}
```

---

## Files

### Small Files

**Rule**: Keep files focused and reasonably sized.

**Guidelines**:
- **React Components**: ~100-200 lines (including JSX)
- **Utility Functions**: ~50-100 lines
- **API Routes**: ~50-150 lines
- **If larger**: Consider splitting into multiple files

```
// BAD - 1000+ line component file
components/UserDashboard.tsx (1200 lines)

// GOOD - Split into focused files
components/UserDashboard/
  ├── UserDashboard.tsx (50 lines)
  ├── UserProfile.tsx (80 lines)
  ├── UserStats.tsx (60 lines)
  ├── UserActivity.tsx (100 lines)
  └── index.ts
```

### File Organization

**Rule**: Group related files together.

```
// GOOD - Feature-based organization
features/
  ├── auth/
  │   ├── components/
  │   ├── hooks/
  │   ├── utils/
  │   └── types.ts
  ├── dashboard/
  │   ├── components/
  │   ├── hooks/
  │   └── types.ts
```

---

## Naming Conventions

### Descriptive Names

**Rule**: Names should clearly describe purpose. Don't abbreviate to save characters.

```typescript
// BAD - Unclear, abbreviated
const usr = getUsr();
const btn = doc.querySelector('.btn');
function calc(a, b) { return a + b; }

// GOOD - Clear, descriptive
const currentUser = getCurrentUser();
const submitButton = document.querySelector('.submit-button');
function calculateTotalPrice(basePrice: number, tax: number): number {
  return basePrice + tax;
}
```

### Naming Conventions by Type

#### Variables

```typescript
// Boolean: Use is/has/should prefix
const isAuthenticated = true;
const hasPermission = false;
const shouldRedirect = true;

// Arrays: Use plural nouns
const users = ['Alice', 'Bob'];
const activeConnections = [];

// Objects: Use singular nouns
const user = { name: 'Alice' };
const configuration = { timeout: 5000 };

// Constants: UPPER_SNAKE_CASE (for truly constant values)
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';
```

#### Functions

```typescript
// Functions: Use verb + noun
function getUserById(id: string) { }
function calculateTotal() { }
function validateEmail(email: string) { }

// Event handlers: Use handle + Event
function handleSubmit(event: FormEvent) { }
function handleClick() { }
function handleInputChange(event: ChangeEvent) { }
```

#### Components (React)

```typescript
// PascalCase for components
function UserProfile() { }
function NavigationBar() { }
function ProductCard() { }
```

#### Files

```bash
# Components: PascalCase
UserProfile.tsx
NavigationBar.tsx

# Utilities/Hooks: camelCase
formatDate.ts
useAuth.ts

# Constants: camelCase or UPPER_SNAKE_CASE
constants.ts
API_CONFIG.ts
```

#### Classes

```typescript
// PascalCase for classes
class UserRepository { }
class EmailService { }

// camelCase for methods and properties
class User {
  firstName: string;
  lastName: string;

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

---

## Comments

### Verbose Comments for "Why"

**Rule**: Comments should explain WHY, not WHAT. Code should be self-explanatory for WHAT.

```typescript
// BAD - Comments explain what (obvious from code)
// Increment counter by 1
counter++;

// Set user email to lowercase
user.email = user.email.toLowerCase();

// GOOD - Comments explain why
// Normalize email for case-insensitive comparison in database
user.email = user.email.toLowerCase();

// Delay to prevent rate limiting from external API
await sleep(1000);

// Use UTC to avoid timezone-related bugs in different regions
const timestamp = new Date().toISOString();
```

### When to Comment

**DO comment**:
- Complex business logic
- Non-obvious workarounds
- Performance optimizations
- Security considerations
- TODOs with context

```typescript
// GOOD - Explains non-obvious business rule
// VAT is only applied to EU customers, not to businesses with valid VAT numbers
if (customer.region === 'EU' && !customer.vatNumber) {
  total += calculateVAT(subtotal);
}

// GOOD - Explains workaround
// FIXME: Temporary workaround for Safari 15 bug with dynamic imports
// See: https://bugs.webkit.org/show_bug.cgi?id=12345
if (isSafari15) {
  await import('./polyfill');
}

// GOOD - Security note
// WARNING: Never log the actual token value, only its presence
logger.info('Authentication token received', { hasToken: !!token });
```

**DON'T comment**:
- Obvious code
- What the code does (code should be self-documenting)
- Redundant information

```typescript
// BAD - Redundant comments
// Create a new user object
const user = new User();

// Loop through all items
items.forEach(item => {
  // ...
});

// GOOD - No comment needed, code is clear
const user = new User();
items.forEach(processItem);
```

### TODOs

```typescript
// GOOD - Includes context and owner
// TODO(@username): Refactor to use new authentication service after v2.0 launch
// Blocked by: AUTH-123

// BAD - No context
// TODO: fix this
```

### Documentation Comments (JSDoc)

**Rule**: Use JSDoc for public APIs, exported functions, and complex types.

```typescript
/**
 * Calculates the total price including tax and discounts
 *
 * @param basePrice - The original price before tax and discounts
 * @param taxRate - Tax rate as a decimal (e.g., 0.2 for 20%)
 * @param discountCode - Optional discount code to apply
 * @returns The final price after tax and discounts
 * @throws {Error} If discount code is invalid
 *
 * @example
 * ```ts
 * const total = calculateFinalPrice(100, 0.2, 'SAVE10');
 * // Returns 108 (100 + 20% tax - 10% discount)
 * ```
 */
function calculateFinalPrice(
  basePrice: number,
  taxRate: number,
  discountCode?: string
): number {
  // Implementation
}
```

---

## Bad Practices to Avoid

### 1. Commented Out Code

**Rule**: NEVER commit commented-out code. Delete it.

```typescript
// BAD - Commented code
function processData(data: any) {
  // const oldWay = transformLegacy(data);
  // if (oldWay.isValid) {
  //   return oldWay;
  // }

  return transformNew(data);
}

// GOOD - Removed dead code
function processData(data: any) {
  return transformNew(data);
}
```

**Why**: Git history preserves old code. If you need it, check git history.

### 2. Using !important in CSS

**Rule**: Avoid `!important` unless absolutely necessary (e.g., overriding third-party styles).

```css
/* BAD - !important used unnecessarily */
.button {
  color: blue !important;
}

/* GOOD - Proper specificity */
.button {
  color: blue;
}

/* ACCEPTABLE - Overriding third-party library when no other option */
.third-party-widget .custom-override {
  background: white !important; /* Required to override inline styles from library */
}
```

### 3. Variables at Higher Scope Than Needed

**Rule**: Declare variables in the smallest scope possible.

```typescript
// BAD - Variable at higher scope
let result;
if (condition) {
  result = calculateSomething();
  console.log(result);
}

// GOOD - Variable in minimal scope
if (condition) {
  const result = calculateSomething();
  console.log(result);
}

// BAD - Variable outside loop
let item;
for (item of items) {
  processItem(item);
}

// GOOD - Variable scoped to loop
for (const item of items) {
  processItem(item);
}
```

### 4. Magic Numbers

**Rule**: Don't use unexplained numbers. Use named constants.

```typescript
// BAD - Magic numbers
if (user.age >= 18) { }
setTimeout(callback, 3600000);

// GOOD - Named constants
const LEGAL_AGE = 18;
const ONE_HOUR_MS = 60 * 60 * 1000;

if (user.age >= LEGAL_AGE) { }
setTimeout(callback, ONE_HOUR_MS);
```

### 5. Deep Nesting

**Rule**: Avoid deep nesting. Use early returns.

```typescript
// BAD - Deep nesting
function processUser(user: User) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        if (user.emailVerified) {
          // Do something
          return true;
        }
      }
    }
  }
  return false;
}

// GOOD - Early returns
function processUser(user: User) {
  if (!user) return false;
  if (!user.isActive) return false;
  if (!user.hasPermission) return false;
  if (!user.emailVerified) return false;

  // Do something
  return true;
}
```

### 6. Large Conditional Statements

**Rule**: Extract complex conditions into well-named functions.

```typescript
// BAD - Complex condition
if (user.age >= 18 && user.country === 'US' && user.hasCompletedProfile && !user.isBanned) {
  // ...
}

// GOOD - Extracted to named function
function canUserAccessPremiumFeatures(user: User): boolean {
  return (
    user.age >= LEGAL_AGE &&
    user.country === 'US' &&
    user.hasCompletedProfile &&
    !user.isBanned
  );
}

if (canUserAccessPremiumFeatures(user)) {
  // ...
}
```

---

## Uncle Bob's Clean Code Principles (Pragmatic Application)

### Principles We Follow

1. **Meaningful Names**: Variables, functions, and classes should have clear, descriptive names
2. **Functions Should Be Small**: One thing, one level of abstraction
3. **Don't Repeat Yourself (DRY)**: Extract repeated code
4. **Single Responsibility**: Each module/class/function does one thing
5. **Comments**: Explain "why", not "what"
6. **Error Handling**: Use exceptions, not error codes
7. **Testing**: Write tests for everything

### Principles We Apply Pragmatically

Some of Uncle Bob's rules are adjusted for modern development:

- **"Functions should have zero arguments"**: We aim for 0-3, use object parameters for more
- **"Classes should be small"**: We prefer functional programming where appropriate
- **"Avoid getters/setters"**: We use TypeScript properties and readonly where appropriate

**Rule**: Apply clean code principles when they improve code quality, not dogmatically.

---

## Code Review Checklist

Before submitting code for review:

- [ ] Functions are small and focused (~20-30 lines)
- [ ] Files are reasonably sized (~100-200 lines for components)
- [ ] Variable and function names are descriptive
- [ ] Comments explain "why", not "what"
- [ ] No commented-out code
- [ ] No `!important` in CSS (unless documented why)
- [ ] Variables declared in minimal scope
- [ ] No magic numbers (use named constants)
- [ ] No deep nesting (use early returns)
- [ ] Complex conditions extracted to functions
- [ ] No duplicate code (DRY principle)

---

## Examples of Clean vs. Messy Code

### Example 1: Processing a List

```typescript
// MESSY
function doStuff(arr: any[]) {
  let r = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].a > 10) {
      r.push(arr[i].b * 2);
    }
  }
  return r;
}

// CLEAN
interface Item {
  threshold: number;
  value: number;
}

function doubleValuesAboveThreshold(items: Item[], threshold: number = 10): number[] {
  return items
    .filter(item => item.threshold > threshold)
    .map(item => item.value * 2);
}
```

### Example 2: User Validation

```typescript
// MESSY
function v(u: any) {
  if (!u.e || !u.e.includes('@')) return false;
  if (u.a < 18) return false;
  if (!u.n) return false;
  return true;
}

// CLEAN
interface User {
  email: string;
  age: number;
  name: string;
}

function isValidUser(user: User): boolean {
  return (
    hasValidEmail(user.email) &&
    isLegalAge(user.age) &&
    hasName(user.name)
  );
}

function hasValidEmail(email: string): boolean {
  return email.includes('@'); // Simplified for example
}

function isLegalAge(age: number): boolean {
  const LEGAL_AGE = 18;
  return age >= LEGAL_AGE;
}

function hasName(name: string): boolean {
  return name.length > 0;
}
```

---

## Resources

- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [The Art of Readable Code](https://www.amazon.com/Art-Readable-Code-Practical-Techniques/dp/0596802293)
- [Refactoring by Martin Fowler](https://refactoring.com/)

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

