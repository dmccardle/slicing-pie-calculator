# Code Standards

## Overview

All code must pass linting and formatting checks before being committed. We maintain a **zero tolerance policy** for linter errors and warnings.

## Standards

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Strict mode enabled
- **Pre-commit hooks**: Automated enforcement
- **Policy**: 0 errors, 0 warnings

---

## ESLint Configuration

### Setup

```bash
# Install ESLint and plugins
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Configuration File

Create `.eslintrc.json`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    // Enforce rules
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": ["warn", {
      "allowExpressions": true
    }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Custom Rules

Add project-specific rules as needed:

```json
{
  "rules": {
    // Add your project-specific rules here
    "@typescript-eslint/naming-convention": ["error", {
      "selector": "interface",
      "format": ["PascalCase"]
    }]
  }
}
```

### Running ESLint

```bash
# Check for issues
npm run lint

# Auto-fix issues where possible
npm run lint -- --fix
```

Add to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix"
  }
}
```

---

## Prettier Configuration

### Setup

```bash
# Install Prettier
npm install --save-dev prettier eslint-config-prettier
```

### Configuration File

Create `.prettierrc.json`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Ignore File

Create `.prettierignore`:

```
# Dependencies
node_modules/

# Build output
.next/
dist/
build/
out/

# Generated files
*.generated.ts

# Configuration
.env*

# Misc
.DS_Store
coverage/
```

### Running Prettier

```bash
# Check formatting
npm run format:check

# Auto-format
npm run format
```

Add to `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

---

## TypeScript Configuration

### Strict Mode Enabled

**Rule**: TypeScript strict mode MUST be enabled in all projects.

Create or update `tsconfig.json`:

```json
{
  "compilerOptions": {
    // Strict mode
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    // Module resolution
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",

    // Output
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,

    // Paths
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### TypeScript Best Practices

#### Use Explicit Types

```typescript
// BAD - Implicit any
function processData(data) {
  return data.value;
}

// GOOD - Explicit types
function processData(data: { value: number }): number {
  return data.value;
}

// BETTER - Interface for reusability
interface DataInput {
  value: number;
}

function processData(data: DataInput): number {
  return data.value;
}
```

#### Avoid `any`

```typescript
// BAD - Using any
function handleData(data: any) {
  console.log(data.value);
}

// GOOD - Unknown for unsafe data
function handleData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    console.log((data as { value: string }).value);
  }
}

// BETTER - Proper type
interface Data {
  value: string;
}

function handleData(data: Data) {
  console.log(data.value);
}
```

#### Use Union Types

```typescript
// BAD - Any for multiple types
function formatValue(value: any): string {
  return String(value);
}

// GOOD - Union type
function formatValue(value: string | number | boolean): string {
  return String(value);
}
```

---

## Pre-commit Hooks

### Setup with Husky and lint-staged

```bash
# Install dependencies
npm install --save-dev husky lint-staged

# Initialize husky
npx husky init
```

### Configuration

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

---

## Zero Tolerance Policy

### 0 Errors, 0 Warnings

**Rule**: Code with linter errors or warnings CANNOT be committed.

This policy ensures:
- Code quality remains high
- Technical debt doesn't accumulate
- Bugs are caught early
- Team follows consistent standards

### Enforcement

```bash
# Pre-commit: Automated check
# CI/CD: Build fails if lint fails
# PR review: Blocked until lint passes
```

### Handling Unavoidable Warnings

If you MUST bypass a rule (very rare):

```typescript
// ACCEPTABLE - Documented exception
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function legacyApiCall(data: any) {
  // Explanation: Legacy API doesn't provide types
  // TODO(TICKET-123): Add types when API is updated
  return data;
}

// BAD - Disabling without explanation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getData(data: any) {
  return data;
}
```

---

## IDE Integration

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Recommended Extensions

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/lint.yml`:

```yaml
name: Lint

on:
  pull_request:
  push:
    branches: [main, dev]

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: TypeScript check
        run: npx tsc --noEmit
```

---

## Common Linter Rules Explained

### `no-console`

```typescript
// Error - console.log in production code
console.log('User data:', user);

// OK - console.error and console.warn allowed
console.error('Failed to load user data');
console.warn('API rate limit approaching');

// OK - Proper logging utility
logger.info('User logged in', { userId: user.id });
```

### `@typescript-eslint/no-unused-vars`

```typescript
// Error - Unused variable
const unusedVariable = 'never used';

// OK - Prefixed with underscore for intentionally unused
const _internalVar = 'used by external tool';

// OK - All variables used
const userName = user.name;
console.log(userName);
```

### `prefer-const`

```typescript
// Error - Should use const
let name = 'Alice';
console.log(name);

// OK - Uses const
const name = 'Alice';
console.log(name);

// OK - let when reassignment happens
let count = 0;
count++;
```

### `no-var`

```typescript
// Error - Using var
var userName = 'Alice';

// OK - Use const or let
const userName = 'Alice';
```

---

## Merge Checklist

Before merging ANY PR:

- [ ] `npm run lint` passes with 0 errors, 0 warnings
- [ ] `npm run format:check` passes
- [ ] `npx tsc --noEmit` passes (TypeScript check)
- [ ] All tests pass
- [ ] Pre-commit hooks configured and working
- [ ] CI/CD lint checks pass

---

## Updating Standards

### When to Update

- New best practices emerge
- Team agrees on new conventions
- Tool updates require configuration changes

### How to Update

1. Propose changes in team discussion
2. Update configuration files
3. Update this document
4. Run `npm run lint:fix` on codebase
5. Create PR with changes
6. Get team approval
7. Merge and communicate to team

---

## Troubleshooting

### ESLint Issues

```bash
# Clear ESLint cache
rm -rf .eslintcache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Prettier Conflicts with ESLint

- Ensure `eslint-config-prettier` is installed
- Add `"prettier"` as the LAST item in ESLint extends array

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf .next
rm -rf tsconfig.tsbuildinfo

# Rebuild
npm run build
```

---

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [@typescript-eslint](https://typescript-eslint.io/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [Husky](https://typicode.github.io/husky/)

---

## Related Documentation

**Essential Rules (Read Together)**:
- [Clean Code](./clean-code.md) - Code quality principles
- [Testing](./testing.md) - Test file structure and naming
- [Git Commits](./git-commits.md) - Conventional commits format

**Implementation Guides**:
- [API Design](./api-design.md) - API code standards
- [UI Standards](./ui-standards.md) - Component code standards
- [Technology Stack](./technology-stack.md) - Approved tools and libraries

**Development**:
- [Refactoring](../02-development/refactoring.md) - When and how to refactor
- [Technical Debt](../02-development/technical-debt.md) - Managing code quality debt
- [Documentation Standards](../02-development/documentation-standards.md) - Code documentation

**Practical Resources**:
- [React Component Template](../templates/react-component-template.tsx) - Well-formatted component
- [API Endpoint Template](../templates/api-endpoint-template.ts) - Well-structured API
- [Test Template](../templates/test-template.test.ts) - Properly formatted tests

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Rules](./)
