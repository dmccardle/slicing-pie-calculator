# Git Commit Rules

## Overview

We use **Conventional Commits** format for all commit messages. Commits should be frequent and focused on "why" rather than "what".

**Critical:** This project uses **automated semantic versioning** based on commit messages. Your commit type determines the version bump:

- `feat:` → Minor version bump (1.0.0 → 1.1.0)
- `fix:` → Patch version bump (1.0.0 → 1.0.1)
- `feat!:` or `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)

See `docs/rules/semantic-versioning.md` for complete details.

## Conventional Commits Format

```
type(scope): description

[optional body]

[optional footer(s)]
```

### Examples

```bash
feat(auth): add Google OAuth login
fix(api): resolve null pointer in user endpoint
docs(readme): update installation instructions
refactor(utils): simplify date formatting logic
```

---

## Commit Types

### Primary Types

| Type | Description | When to Use |
|------|-------------|-------------|
| `feat` | New feature | Adding new functionality |
| `fix` | Bug fix | Fixing a bug |
| `docs` | Documentation | Documentation-only changes |
| `style` | Code style | Formatting, semicolons, etc. (no logic change) |
| `refactor` | Code refactoring | Code restructuring without changing behavior |
| `test` | Tests | Adding or updating tests |
| `chore` | Maintenance | Build process, dependencies, tooling |

### Additional Types (Optional)

| Type | Description | When to Use |
|------|-------------|-------------|
| `perf` | Performance | Performance improvements |
| `build` | Build system | Build configuration changes |
| `ci` | CI/CD | CI configuration changes |
| `revert` | Revert | Reverting a previous commit |

---

## Type Examples

### `feat` - New Feature

```bash
# GOOD
feat(auth): add two-factor authentication
feat(dashboard): add user statistics widget
feat(api): implement rate limiting

# BAD - Too vague
feat: add stuff
feat: update code
```

### `fix` - Bug Fix

```bash
# GOOD
fix(login): prevent session timeout on page refresh
fix(api): handle null values in user profile
fix(ui): correct alignment of nav menu on mobile

# BAD - Doesn't explain what was fixed
fix: bug fix
fix: issue resolved
```

### `docs` - Documentation

```bash
# GOOD
docs(readme): add API authentication examples
docs(contributing): update PR guidelines
docs(api): document new endpoints

# BAD
docs: update
```

### `style` - Code Style

```bash
# GOOD
style(components): format with Prettier
style(api): fix indentation in user controller
style: remove trailing whitespace

# BAD - This is refactoring, not style
style: restructure component logic
```

### `refactor` - Code Refactoring

```bash
# GOOD
refactor(auth): extract validation logic to separate module
refactor(api): simplify error handling
refactor(hooks): rename useUser to useCurrentUser

# BAD - This adds functionality, should be feat
refactor: add new validation
```

### `test` - Tests

```bash
# GOOD
test(auth): add tests for login flow
test(api): increase coverage for user endpoints
test(utils): add edge cases for date formatting

# BAD
test: add tests
```

### `chore` - Maintenance

```bash
# GOOD
chore(deps): upgrade React to v19
chore: update .gitignore
chore(build): configure webpack for production

# BAD - This should be fix
chore: fix broken build
```

---

## Scope

### What is Scope?

Scope indicates what part of the codebase is affected.

### Common Scopes

```bash
feat(auth):        # Authentication module
feat(api):         # API/backend
feat(ui):          # User interface
feat(db):          # Database
feat(dashboard):   # Dashboard feature
feat(settings):    # Settings feature
feat(components):  # Shared components
```

### Scope Guidelines

```bash
# GOOD - Specific scope
feat(user-profile): add avatar upload
fix(payment-gateway): handle declined cards

# GOOD - No scope for global changes
chore: update dependencies
docs: fix typos across all files

# BAD - Too generic
feat(stuff): add thing
```

---

## Description

### Rules for Description

1. **Use imperative mood** ("add" not "added" or "adds")
2. **Don't capitalize first letter**
3. **No period at the end**
4. **Be specific and concise**
5. **Focus on "why", not "what"**

### Good vs. Bad Descriptions

```bash
# GOOD - Imperative, specific
feat(auth): add email verification flow
fix(api): prevent duplicate user registration
refactor(utils): improve error handling clarity

# BAD - Past tense
feat(auth): added email verification
fix(api): fixed the bug

# BAD - Capitalized
feat(auth): Add email verification

# BAD - Period at end
feat(auth): add email verification.

# BAD - Too vague
feat: update
fix: bug fix
```

---

## Commit Body (Optional)

### When to Use

Use body for:
- Complex changes needing explanation
- Context about "why" the change was made
- Non-obvious decisions
- Breaking changes
- Migration instructions

### Format

```
type(scope): short description

Longer explanation of the change, providing context about why
this change was necessary. Wrap at 72 characters per line.

- Can use bullet points
- To list multiple changes
- Or provide additional context
```

### Example

```bash
git commit -m "feat(auth): add OAuth 2.0 support

Add Google and GitHub OAuth providers for user authentication.
This reduces friction in the signup process and improves security
by delegating authentication to trusted providers.

- Implemented OAuth callback handlers
- Added user account linking
- Updated database schema for provider tokens

Closes #123"
```

---

## Commit Footer (Optional)

### Breaking Changes

```bash
feat(api): update user endpoints

BREAKING CHANGE: The /api/user endpoint now requires authentication.
All clients must include an Authorization header.

Migration: Update API calls to include auth token:
  fetch('/api/user', { headers: { Authorization: `Bearer ${token}` }})
```

### Issue References

```bash
fix(login): resolve session timeout issue

Closes #456
Fixes #789
Resolves #123
```

### Multiple Footers

```bash
feat(payments): add Stripe integration

Closes #234
Reviewed-by: @teammate
BREAKING CHANGE: Payment processing moved to Stripe
```

---

## Commit Frequency

### Commit Often

**Rule**: Commit frequently, not just at end of day.

**Benefits**:
- Easier to track progress
- Easier to revert if needed
- Better collaboration
- More granular history

```bash
# GOOD - Frequent, focused commits
git commit -m "feat(auth): add login form component"
git commit -m "feat(auth): add form validation"
git commit -m "feat(auth): integrate with API"
git commit -m "test(auth): add login form tests"

# BAD - One massive commit at end of day
git commit -m "feat(auth): complete login feature"
# (Contains 50 files, multiple features, tests, docs)
```

### Commit Size

**Guideline**: Each commit should be a logical unit of work.

```bash
# GOOD - Atomic commits
feat(ui): add button component
test(ui): add button tests

# BAD - Mixing unrelated changes
feat(ui): add button, fix navbar, update readme
```

---

## Focus on "Why", Not "What"

### The Code Shows "What", Commit Shows "Why"

```bash
# BAD - Describes what (obvious from code)
git commit -m "fix: change timeout from 5000 to 10000"

# GOOD - Explains why
git commit -m "fix(api): increase timeout to handle slow responses

External API sometimes takes 7-8 seconds to respond during peak hours.
Increased timeout from 5s to 10s to prevent false negatives."

# BAD - What (obvious)
git commit -m "refactor: move function to utils"

# GOOD - Why
git commit -m "refactor(auth): extract validation to utils for reuse

Validation logic is needed in both signup and profile update flows.
Extracted to utils/validation.ts to avoid duplication."
```

---

## Special Commit Messages

### Merge Commits

```bash
# Automatic merge commit (via GitHub)
Merge pull request #123 from user/feature-branch

# Manual merge commit
Merge branch 'dev' into 123-add-feature
```

### Revert Commits

```bash
# Automatic revert
Revert "feat(auth): add OAuth support"

This reverts commit abc123def456.

# Manual revert with explanation
revert(auth): remove OAuth support

Reverting due to security concerns discovered in third-party library.
Will re-implement after library update.

Reverts commit abc123def456
```

---

## Examples of Great Commits

### Simple Feature

```bash
feat(search): add fuzzy search for user lookup

Implemented fuzzy matching using fuse.js to improve search accuracy
when users misspell names. Reduces support tickets for "can't find user".

Closes #234
```

### Bug Fix

```bash
fix(api): prevent race condition in order processing

Orders submitted simultaneously for same product could both succeed,
causing overselling. Added database transaction with row-level locking.

Fixes #567
```

### Refactoring

```bash
refactor(components): split UserDashboard into smaller components

UserDashboard.tsx was 800+ lines. Split into:
- UserProfile.tsx
- UserStats.tsx
- UserActivity.tsx

Improves maintainability and makes components more reusable.
```

### Documentation

```bash
docs(api): add examples for authentication endpoints

Added code examples in TypeScript and curl for:
- Login
- Signup
- Token refresh
- Logout

Addresses confusion reported in #345
```

### Breaking Change

```bash
feat(api): migrate to REST versioning

BREAKING CHANGE: API endpoints now versioned as /v2/resource

All API calls must be updated to use /v2/ prefix:
- Old: /api/users
- New: /api/v2/users

/v1/ endpoints will be deprecated on 2024-12-31

Closes #890
```

---

## Common Mistakes

### Mistake 1: Vague Messages

```bash
# BAD
git commit -m "fix bug"
git commit -m "update"
git commit -m "changes"

# GOOD
git commit -m "fix(api): resolve null pointer in user endpoint"
```

### Mistake 2: Too Much in One Commit

```bash
# BAD
git commit -m "feat: add login, fix navbar, update tests, refactor utils"

# GOOD - Split into separate commits
git commit -m "feat(auth): add login component"
git commit -m "fix(nav): correct alignment on mobile"
git commit -m "test(auth): add login tests"
git commit -m "refactor(utils): simplify validation"
```

### Mistake 3: Wrong Type

```bash
# BAD - This is a feature, not a fix
git commit -m "fix: add new dashboard widget"

# GOOD
git commit -m "feat(dashboard): add user statistics widget"

# BAD - This is a fix, not a chore
git commit -m "chore: fix broken tests"

# GOOD
git commit -m "fix(tests): resolve flaky user creation test"
```

### Mistake 4: Including "WIP" or "temp"

```bash
# BAD
git commit -m "WIP: working on feature"
git commit -m "temp commit"

# GOOD - If truly WIP, don't push to remote yet
# Or use proper message
git commit -m "feat(auth): implement OAuth callback handler (incomplete)"
```

---

## Tools and Automation

### Commitlint

Enforce conventional commits automatically:

```bash
# Install
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Configure
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

# Add to husky
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

### Commitizen

Interactive commit message builder:

```bash
# Install
npm install --save-dev commitizen cz-conventional-changelog

# Initialize
npx commitizen init cz-conventional-changelog --save-dev --save-exact

# Usage (instead of git commit)
npx cz
```

---

## Commit Message Template

Create `~/.gitmessage`:

```
# type(scope): subject

# Body: Explain *why* this change is being made

# Footer:
# Closes #issue
# BREAKING CHANGE: description
```

Configure git to use it:

```bash
git config --global commit.template ~/.gitmessage
```

---

## Reviewing Commits

Before committing:

```bash
# Review changes
git diff

# Review staged changes
git diff --cached

# Review commit message
git log -1
```

---

## Commit Checklist

Before committing:

- [ ] Changes are focused and related
- [ ] Commit message follows Conventional Commits format
- [ ] Type is correct (feat, fix, docs, etc.)
- [ ] Scope is appropriate (if applicable)
- [ ] Description is imperative mood
- [ ] Description is specific and clear
- [ ] Body explains "why" (if needed)
- [ ] Related issues referenced
- [ ] Breaking changes documented
- [ ] No "WIP" or "temp" messages
- [ ] Code is tested
- [ ] Linter passes

---

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Commit Messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)
- [Commitlint](https://commitlint.js.org/)
- [Commitizen](https://github.com/commitizen/cz-cli)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

---

## Related Documentation

**Essential Rules (Read Together)**:
- [Git Workflow](./git-workflow.md) - Branching strategy, pull requests
- [Semantic Versioning](./semantic-versioning.md) - Version bumping from commits
- [Code Standards](./code-standards.md) - Commit hooks with lint-staged

**Implementation Guides**:
- [Deployment](./deployment.md) - Automated releases from commits
- [Documentation Standards](../02-development/documentation-standards.md) - Documenting changes

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Rules](./)
