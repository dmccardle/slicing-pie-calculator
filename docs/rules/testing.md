# Testing Rules

## Overview

Testing is mandatory at every stage of development. Different environments require different testing levels.

## Testing by Environment

| Environment | Test Type | When | Tools |
|-------------|-----------|------|-------|
| **DEV** | Unit Tests | Before merge to dev | Jest, React Testing Library |
| **SIT** | Integration Tests | Before promotion to SIT | Jest, Supertest |
| **UAT** | User Acceptance Tests | Before promotion to UAT | Playwright, Manual |
| **PROD** | Smoke Tests | After deployment | Playwright, Monitoring |

---

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **Test Coverage**: 80%+ unit test coverage minimum (see [Unit Testing](#unit-testing))
- **Before Merge**: ALL unit tests MUST pass before merging to dev (see [Merge Checklist](#merge-checklist))
- **Integration Tests**: Required for SIT promotion (see [Integration Testing](#integration-testing))
- **UAT**: Manual acceptance testing before production (see [UAT](#uat))
- **CI/CD**: Automated testing in all pipelines (see [Continuous Integration](#continuous-integration))

**Quick Example:**
```typescript
// GOOD - Comprehensive test with mocks
describe('UserService', () => {
  it('should create user and send welcome email', async () => {
    const mockEmailService = { send: jest.fn() };
    const user = await createUser(data, mockEmailService);
    expect(user).toBeDefined();
    expect(mockEmailService.send).toHaveBeenCalledWith(...);
  });
});

// BAD - No test coverage
// (Just ship it and hope it works)
```

**Key Sections:**
- [Unit Testing](#unit-testing) - Jest, React Testing Library
- [Integration Testing](#integration-testing) - API endpoints, database
- [Best Practices](#best-practices) - AAA pattern, mocking, test data
- [Test Data Management](#test-data) - Fixtures, factories, seeding

---

## Testing Frameworks {#testing-frameworks}

### Unit & Integration Testing

**Framework**: Jest

```bash
# Install
npm install --save-dev jest @types/jest
```

### React Component Testing

**Framework**: React Testing Library (Web) / React Native Testing Library (Mobile)

```bash
# Web
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Mobile
npm install --save-dev @testing-library/react-native
```

### End-to-End Testing

**Framework**: Playwright (Web) / Detox or Maestro (Mobile)

```bash
# Web
npm install --save-dev @playwright/test

# Mobile - Detox
npm install --save-dev detox
```

---

## Unit Testing (DEV) {#unit-testing}

### What to Test

- Individual functions and methods
- Component rendering
- User interactions
- Edge cases and error handling
- Business logic
- Utility functions

### Test Structure

```typescript
// Using Jest + React Testing Library

import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should render email and password inputs', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should show error when email is invalid', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('should call onSubmit when form is valid', async () => {
    const mockOnSubmit = jest.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123'
    });
  });
});
```

### Test Coverage Requirements

**Minimum Coverage**:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

**Critical paths**: 100% coverage required for:
- Authentication
- Payment processing
- Data validation
- Security functions

### Running Unit Tests

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test LoginForm.test.tsx
```

Configure in `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "coverageThreshold": {
      "global": {
        "statements": 80,
        "branches": 75,
        "functions": 80,
        "lines": 80
      }
    }
  }
}
```

---

## Integration Testing (SIT) {#integration-testing}

### What to Test

- API endpoints
- Database interactions
- External service integrations
- Multiple components working together
- Data flow through the system

### API Integration Test Example

```typescript
import request from 'supertest';
import { app } from '../app';
import { db } from '../db';

describe('POST /api/users', () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.user.deleteMany();
  });

  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'securePassword123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body).toMatchObject({
      email: userData.email,
      name: userData.name
    });
    expect(response.body.password).toBeUndefined();
  });

  it('should return 400 if email is invalid', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'invalid', name: 'Test', password: 'pass' })
      .expect(400);

    expect(response.body.error).toMatch(/email/i);
  });

  it('should return 409 if user already exists', async () => {
    const userData = { email: 'test@example.com', name: 'Test', password: 'pass' };

    // Create user first
    await request(app).post('/api/users').send(userData);

    // Try to create again
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(409);

    expect(response.body.error).toMatch(/already exists/i);
  });
});
```

### Database Integration Test Example

```typescript
describe('UserRepository', () => {
  let repository: UserRepository;

  beforeAll(async () => {
    await db.connect();
    repository = new UserRepository(db);
  });

  afterAll(async () => {
    await db.disconnect();
  });

  beforeEach(async () => {
    await db.user.deleteMany();
  });

  it('should find user by email', async () => {
    const user = await repository.create({
      email: 'test@example.com',
      name: 'Test User'
    });

    const found = await repository.findByEmail('test@example.com');

    expect(found).toMatchObject({
      id: user.id,
      email: 'test@example.com',
      name: 'Test User'
    });
  });
});
```

---

## User Acceptance Testing (UAT) {#uat}

### What to Test

- End-to-end user workflows
- Business requirements
- User stories
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility
- Performance

### E2E Test Example (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('should allow user to sign up and log in', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');

    // Fill out registration form
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Should show welcome message
    await expect(page.locator('text=Welcome')).toBeVisible();

    // Log out
    await page.click('button:has-text("Logout")');

    // Should redirect to home
    await expect(page).toHaveURL('/');

    // Log back in
    await page.goto('/login');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    // Should be back in dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', '123'); // Too short
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/invalid email/i')).toBeVisible();
    await expect(page.locator('text=/password must be/i')).toBeVisible();
  });
});
```

### Manual UAT Checklist

For features requiring manual testing:

- [ ] User can complete the primary workflow
- [ ] Error messages are clear and helpful
- [ ] Loading states are shown appropriately
- [ ] Success confirmations are visible
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on mobile devices
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Performance is acceptable (< 3s load time)

---

## Test Organization

### File Structure

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx          # Unit test
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts          # Unit test
├── api/
│   ├── users.ts
│   └── users.integration.test.ts # Integration test
└── __tests__/
    └── e2e/
        ├── auth.spec.ts         # E2E test
        └── checkout.spec.ts     # E2E test
```

### Naming Conventions

- **Unit tests**: `[Component].test.tsx` or `[function].test.ts`
- **Integration tests**: `[module].integration.test.ts`
- **E2E tests**: `[feature].spec.ts`

---

## Testing Best Practices {#best-practices}

### 1. Arrange, Act, Assert (AAA)

```typescript
test('should calculate total with tax', () => {
  // Arrange
  const basePrice = 100;
  const taxRate = 0.2;

  // Act
  const total = calculateTotal(basePrice, taxRate);

  // Assert
  expect(total).toBe(120);
});
```

### 2. Test Behavior, Not Implementation

```typescript
// BAD - Testing implementation details
test('should set state to loading', () => {
  const component = render(<MyComponent />);
  expect(component.state.isLoading).toBe(true);
});

// GOOD - Testing behavior
test('should show loading spinner', () => {
  render(<MyComponent />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});
```

### 3. Use Descriptive Test Names

```typescript
// BAD
test('login works', () => { });

// GOOD
test('should display error when password is incorrect', () => { });
test('should redirect to dashboard after successful login', () => { });
```

### 4. Don't Test Third-Party Libraries

```typescript
// BAD - Testing React itself
test('useState updates state', () => {
  // Don't test React's functionality
});

// GOOD - Test your code
test('should update user name when input changes', () => {
  // Test your component's behavior
});
```

### 5. Mock External Dependencies

```typescript
// Mock API calls
jest.mock('../api/users', () => ({
  getUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' })
}));

test('should display user name', async () => {
  render(<UserProfile userId={1} />);
  expect(await screen.findByText('Test User')).toBeInTheDocument();
});
```

### 6. Test Edge Cases

```typescript
describe('calculateAge', () => {
  test('should handle leap year birthdays', () => {
    const birthdate = new Date('2000-02-29');
    const age = calculateAge(birthdate);
    expect(age).toBeGreaterThan(0);
  });

  test('should handle birthdates in the future as invalid', () => {
    const birthdate = new Date('2100-01-01');
    expect(() => calculateAge(birthdate)).toThrow();
  });

  test('should handle today as birthday', () => {
    const today = new Date();
    const age = calculateAge(today);
    expect(age).toBe(0);
  });
});
```

---

## Merge Checklist (DEV) {#merge-checklist}

Before merging to `dev`:

- [ ] Project builds successfully (`npm run build`)
- [ ] Linter passes with 0 errors, 0 warnings (`npm run lint`)
- [ ] Unit tests pass (`npm run test`)
- [ ] Test coverage meets threshold (80%+)
- [ ] New code has tests written
- [ ] All tests run quickly (< 10 seconds total)

---

## Promotion Checklist (SIT)

Before promoting from `dev` to `sit`:

- [ ] All DEV checklist items pass
- [ ] Integration tests pass
- [ ] API endpoints tested with real database
- [ ] External service integrations tested
- [ ] No test databases polluted with test data

---

## Promotion Checklist (UAT)

Before promoting from `sit` to `uat`:

- [ ] All SIT checklist items pass
- [ ] E2E tests pass
- [ ] User acceptance criteria met
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile testing done
- [ ] Accessibility testing done
- [ ] Performance testing done
- [ ] Manual approval from QA team

---

## Test Data Management {#test-data}

### Use Factories/Fixtures

```typescript
// test/fixtures/user.ts
export const createUserFixture = (overrides = {}) => ({
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
  ...overrides
});

// In tests
const user = createUserFixture({ email: 'custom@example.com' });
```

### Clean Up After Tests

```typescript
afterEach(async () => {
  // Clean up database
  await db.user.deleteMany();

  // Clear mocks
  jest.clearAllMocks();

  // Reset any global state
});
```

---

## Continuous Integration {#continuous-integration}

### GitHub Actions Example

```yaml
name: Tests

on:
  pull_request:
  push:
    branches: [main, dev]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## Performance Testing

### Measure Test Speed

```bash
# Show slow tests
npm run test -- --verbose

# Run tests with timing
npm run test -- --testTimeout=5000
```

### Keep Tests Fast

- Use mocks for external dependencies
- Use in-memory databases for integration tests
- Avoid unnecessary `async` operations
- Parallelize tests where possible

---

## Debugging Tests

### Running Single Test

```bash
# Run only one test file
npm run test Button.test.tsx

# Run only tests matching pattern
npm run test -- -t "should render"

# Run in watch mode
npm run test -- --watch
```

### Debugging in VS Code

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## Related Documentation

**Essential Rules (Read Together)**:
- [API Design](./api-design.md) - Testing API endpoints
- [UI Standards](./ui-standards.md) - Testing responsive design
- [Accessibility](./accessibility.md) - Accessibility testing requirements
- [Code Standards](./code-standards.md) - Linting test files

**Implementation Guides**:
- [Security & Privacy](./security-privacy.md) - Security testing strategies
- [User Management & RBAC](../09-saas-specific/user-management-rbac.md) - Testing permissions

**Operations**:
- [Security Testing](../06-operations/security-testing.md) - Automated security scans
- [Penetration Testing](../06-operations/penetration-testing.md) - Manual security audits

**Practical Resources**:
- [Test Template](../templates/test-template.test.ts) - Unit, integration, E2E examples
- [API Endpoint Template](../templates/api-endpoint-template.ts) - API testing patterns
- [React Component Template](../templates/react-component-template.tsx) - Component testing

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Rules](./)
