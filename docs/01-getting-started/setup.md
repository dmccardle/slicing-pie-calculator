# Project Setup & Workflows

## Prerequisites

### Required Software

- **Node.js**: Version [VERSION] or higher (e.g., 20.x LTS)
- **Package Manager**: [PACKAGE_MANAGER] (e.g., pnpm 9.x, npm 10.x, yarn 4.x)
- **Git**: Version 2.x or higher
- **[OTHER_REQUIREMENT]**: (e.g., Docker, PostgreSQL client)

### Optional Software

- **IDE**: VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - [PROJECT_SPECIFIC_EXTENSIONS]
- **API Testing**: Postman, Insomnia, or Bruno
- **Database GUI**: [TOOL] (e.g., pgAdmin, TablePlus, Prisma Studio)

### Access Requirements

Before starting, ensure you have access to:

- [ ] GitHub repository: [REPOSITORY_URL]
- [ ] Environment variables (see team lead)
- [ ] [DATABASE_NAME] database credentials
- [ ] [EXTERNAL_SERVICE] API keys
- [ ] [DEPLOYMENT_PLATFORM] account
- [ ] Team Slack/communication channel

## Initial Setup

### 1. Clone the Repository

```bash
git clone [REPOSITORY_URL]
cd [PROJECT_DIRECTORY]
```

### 2. Install Dependencies

```bash
[PACKAGE_MANAGER] install
```

For example:
```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values:

```bash
# Database
DATABASE_URL="[YOUR_DATABASE_URL]"

# Authentication
JWT_SECRET="[YOUR_JWT_SECRET]"
NEXTAUTH_SECRET="[YOUR_NEXTAUTH_SECRET]"
NEXTAUTH_URL="http://localhost:3000"

# External Services
[API_KEY_1]="[YOUR_API_KEY]"
[API_KEY_2]="[YOUR_API_KEY]"

# Feature Flags
NEXT_PUBLIC_FEATURE_FLAG="[true/false]"
```

**Where to get these values:**
- Database URL: [INSTRUCTIONS]
- API Keys: [INSTRUCTIONS]
- Secrets: Ask team lead or generate with `openssl rand -base64 32`

### 4. Set Up the Database

#### Option A: Local Database

Install and start [DATABASE]:

```bash
# Example for PostgreSQL
brew install postgresql@16  # macOS
# or
apt-get install postgresql  # Linux

# Start the database
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

Create the database:

```bash
createdb [DATABASE_NAME]
```

#### Option B: Cloud Database

Use the provided DATABASE_URL in your `.env.local` file.

#### Run Migrations

```bash
[MIGRATION_COMMAND]
```

For example:
```bash
npx prisma migrate dev
# or
npm run db:migrate
```

#### Seed the Database (Optional)

```bash
[SEED_COMMAND]
```

For example:
```bash
npx prisma db seed
# or
npm run db:seed
```

### 5. Verify Setup

Run the development server:

```bash
[DEV_COMMAND]
```

For example:
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

If you see the app running, you're all set!

## Development Workflow

### Daily Workflow

1. **Pull latest changes**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b [ISSUE_NUMBER]-[feature-description]
   ```

   Example: `git checkout -b 123-add-user-profile`

3. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

4. **Run linter**
   ```bash
   npm run lint
   # or
   pnpm lint
   ```

   Fix any errors before committing.

5. **Run tests**
   ```bash
   npm run test
   # or
   pnpm test
   ```

6. **Commit your changes** (using Conventional Commits)
   ```bash
   git add .
   git commit -m "feat(auth): add user profile page"
   ```

7. **Push your branch**
   ```bash
   git push origin [ISSUE_NUMBER]-[feature-description]
   ```

8. **Create a Pull Request**
   - Go to GitHub
   - Create PR from your branch to `dev`
   - Fill in the PR template
   - Request review from team members

9. **Address review feedback**
   - Make requested changes
   - Push updates to the same branch
   - Re-request review

10. **Merge** (after approval and passing checks)

### Common Commands

#### Development

```bash
# Start development server
[DEV_COMMAND]

# Build for production
[BUILD_COMMAND]

# Start production build locally
[START_COMMAND]

# Run type checking
[TYPE_CHECK_COMMAND]

# Run linter
[LINT_COMMAND]

# Run linter with auto-fix
[LINT_FIX_COMMAND]

# Format code with Prettier
[FORMAT_COMMAND]
```

#### Testing

```bash
# Run all tests
[TEST_COMMAND]

# Run tests in watch mode
[TEST_WATCH_COMMAND]

# Run tests with coverage
[TEST_COVERAGE_COMMAND]

# Run specific test file
[TEST_FILE_COMMAND]
```

#### Database

```bash
# Run migrations
[MIGRATE_COMMAND]

# Create new migration
[MIGRATE_CREATE_COMMAND]

# Reset database
[DB_RESET_COMMAND]

# Open database studio
[DB_STUDIO_COMMAND]

# Seed database
[SEED_COMMAND]
```

#### Build & Deploy

```bash
# Build for production
[BUILD_COMMAND]

# Deploy to [ENVIRONMENT]
[DEPLOY_COMMAND]

# Check build size
[ANALYZE_COMMAND]
```

## Git Workflow

We follow **Git-flow** branching strategy:

### Branches

- **`main`**: Production code (protected)
- **`prod`**: Pre-production code (protected)
- **`sit`**: System integration testing (protected)
- **`dev`**: Development code (protected)
- **`[issue#]-[feature]`**: Feature branches

### Creating a Feature Branch

```bash
# Always branch from dev
git checkout dev
git pull origin dev
git checkout -b [ISSUE_NUMBER]-[short-description]
```

Examples:
- `123-add-login-page`
- `456-fix-navigation-bug`
- `789-refactor-api-calls`

### Commit Message Format

We use **Conventional Commits**:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(auth): add social login with Google"
git commit -m "fix(api): resolve null pointer in user endpoint"
git commit -m "docs(readme): update setup instructions"
git commit -m "refactor(utils): simplify date formatting function"
```

See `docs/rules/git-commits.md` for more details.

### Pull Request Process

1. **Create PR** from your feature branch to `dev`
2. **Fill in PR template** with:
   - Description of changes
   - Related issue number
   - Testing steps
   - Screenshots (if UI changes)
3. **Ensure checks pass**:
   - [ ] Build succeeds
   - [ ] Linter passes (0 errors, 0 warnings)
   - [ ] Tests pass
   - [ ] Type checking passes
4. **Request review** from at least one team member
5. **Address feedback** and make requested changes
6. **Merge** after approval (squash and merge recommended)

## Testing

### Test Environments

- **DEV**: Unit tests must pass before merging to `dev`
- **SIT**: Integration tests must pass before promoting to `sit`
- **UAT**: User acceptance tests must pass before promoting to `uat`
- **PROD**: All tests pass + manual approval required

### Running Tests Locally

```bash
# Run all tests
[TEST_COMMAND]

# Run specific test suite
[TEST_SUITE_COMMAND]

# Run with coverage report
[TEST_COVERAGE_COMMAND]

# Run in watch mode (useful during development)
[TEST_WATCH_COMMAND]
```

### Writing Tests

Tests should be located in:
```
__tests__/          # For unit tests
# or
[COMPONENT].test.ts # Next to the component/function
```

See `docs/rules/testing.md` for testing standards and requirements.

## Environment Promotion

### DEV → SIT

**Checklist:**
- [ ] All unit tests pass
- [ ] Build succeeds
- [ ] Linter passes (0 errors, 0 warnings)
- [ ] Code review approved
- [ ] No console errors/warnings

**Command:**
```bash
# Merge dev to sit
git checkout sit
git pull origin sit
git merge dev
git push origin sit
```

### SIT → UAT

**Checklist:**
- [ ] Everything from DEV checklist
- [ ] Integration tests pass
- [ ] QA team review complete
- [ ] No critical bugs

**Command:**
```bash
# Merge sit to uat
git checkout uat
git pull origin uat
git merge sit
git push origin uat
```

### UAT → PROD

**Checklist:**
- [ ] Everything from SIT checklist
- [ ] User acceptance tests pass
- [ ] Stakeholder approval
- [ ] Release notes prepared
- [ ] Rollback plan ready

**Command:**
```bash
# Merge uat to prod
git checkout prod
git pull origin prod
git merge uat
git push origin prod

# Tag the release
git tag -a v[VERSION] -m "Release v[VERSION]"
git push origin v[VERSION]
```

See `docs/rules/environments.md` for detailed environment requirements.

## Troubleshooting

### Common Issues

#### "Dependencies not found" error

```bash
# Clear node_modules and reinstall
rm -rf node_modules
[PACKAGE_MANAGER] install
```

#### "Database connection error"

- Verify `DATABASE_URL` in `.env.local`
- Check if database server is running
- Ensure database exists: `createdb [DATABASE_NAME]`
- Run migrations: `[MIGRATE_COMMAND]`

#### "Port already in use"

```bash
# Find process using the port
lsof -ti:[PORT] | xargs kill -9

# Or change port in .env.local
PORT=[NEW_PORT]
```

#### "Build fails"

```bash
# Clear build cache
[CLEAR_CACHE_COMMAND]

# Try rebuilding
[BUILD_COMMAND]
```

#### "Tests failing locally but pass in CI"

- Ensure you have latest dependencies: `[PACKAGE_MANAGER] install`
- Check Node.js version matches CI
- Clear test cache: `[CLEAR_TEST_CACHE_COMMAND]`

### Getting Help

1. Check existing documentation in `/docs`
2. Search closed issues on GitHub
3. Ask in team Slack channel: [CHANNEL_NAME]
4. Contact: [TECH_LEAD_NAME] ([EMAIL])

## IDE Setup

### VS Code Recommended Settings

Create or update `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### VS Code Recommended Extensions

Create or update `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "[OTHER_EXTENSIONS]"
  ]
}
```

## Code Quality

### Pre-commit Hooks

We use [TOOL] (e.g., Husky, Lefthook) to run checks before committing:

- Linting (ESLint)
- Formatting (Prettier)
- Type checking (TypeScript)
- Tests (on staged files)

### Code Review Checklist

Before requesting review, ensure:

- [ ] Code follows style guide (`docs/rules/clean-code.md`)
- [ ] All tests pass
- [ ] No linter errors or warnings
- [ ] TypeScript types are correct
- [ ] Documentation updated (if needed)
- [ ] No commented-out code
- [ ] No console.logs (except intentional logging)
- [ ] Commits follow Conventional Commits format

## Performance

### Local Development Performance

If development is slow:

- Enable SWC/Turbopack (if available)
- Reduce bundle size by lazy loading
- Use production builds for testing: `[BUILD_COMMAND] && [START_COMMAND]`

### Build Performance

- Check bundle size: `[ANALYZE_COMMAND]`
- Target: < [X]kb for initial bundle
- Use code splitting for large features

## Additional Resources

- **Project Documentation**: `docs/project/`
- **Coding Rules**: `docs/rules/`
- **API Documentation**: [API_DOCS_URL]
- **Team Wiki**: [WIKI_URL]
- **Design System**: [DESIGN_SYSTEM_URL]

## Updating This Guide

If you find issues or improvements for this setup guide:

1. Update this file
2. Create a PR with your changes
3. Tag relevant team members for review

Keep this guide current as the project evolves!

---

## Related Documentation

**Next Steps**:
- [Architecture](./architecture.md) - System design and patterns
- [Setup Guide](./setup.md) - Installation and configuration

**Core Rules**:
- [API Design](../rules/api-design.md) - API standards and versioning
- [UI Standards](../rules/ui-standards.md) - Responsive design requirements
- [Security & Privacy](../rules/security-privacy.md) - Security requirements

**SaaS Essentials**:
- [SaaS Architecture](../09-saas-specific/saas-architecture.md) - Multi-tenancy patterns
- [Subscription Billing](../09-saas-specific/subscription-billing.md) - Stripe integration
- [User Management & RBAC](../09-saas-specific/user-management-rbac.md) - Permissions

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)

