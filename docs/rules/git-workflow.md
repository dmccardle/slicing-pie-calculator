# Git Workflow

## Overview

We follow **Git-flow** branching strategy with semantic versioning for all projects.

## TL;DR (2-Minute Read) {#tldr}

**Critical Rules:**
- **NEVER push directly to protected branches**: `main`, `prod`, `sit`, `dev` - ALWAYS use PRs (see [Branch Protection](#branch-protection))
- **Feature branches**: Format `claude/<description>` for AI, `<issue>-<description>` for humans (see [Branch Strategy](#branch-strategy))
- **Branch protection MUST be enabled**: Configure in GitHub repo settings for all protected branches
- **Merge strategy**: Squash and merge for clean history (see [Merge Strategy](#merge-strategy))
- **Conventional commits**: `feat:`, `fix:`, `docs:` format (see `docs/rules/git-commits.md`)
- **Pull requests**: Always target `dev`, require approval (see [PR Workflow](#pr-workflow))

**Quick Example:**
```bash
# GOOD - Claude Code creates feature branch from dev
git checkout dev
git pull
git checkout -b claude/add-login-page
# ... make changes ...
git push origin claude/add-login-page
gh pr create --base dev  # Create PR, don't push to main!

# GOOD - Human developer with issue tracking
git checkout dev
git pull
git checkout -b 123-add-login-page

# BAD - Pushing directly to protected branch
git checkout main
git commit -m "changes"
git push origin main  # FORBIDDEN! This bypasses review and CI/CD!
```

---

## Branch Strategy {#branch-strategy}

### Protected Branches

- **`main`**: Production-ready code (protected)
- **`prod`**: Pre-production deployment (protected)
- **`sit`**: System Integration Testing environment (protected)
- **`dev`**: Active development (protected)

### Feature Branches

- **Format**: `<issue-number>-<short-description>`
- **Examples**:
  - `123-add-user-authentication`
  - `456-fix-navigation-bug`
  - `789-refactor-api-calls`

---

## Git-flow Diagram

```
main (production)
  ↑
prod (pre-production)
  ↑
uat/sit (testing)
  ↑
dev (development)
  ↑
feature branches (123-feature-name)
```

---

## Branching Rules

### Creating Feature Branches

**Rule**: Always branch from `dev`, never from `main` or other feature branches.

```bash
# CORRECT - Branch from dev
git checkout dev
git pull origin dev
git checkout -b 123-add-login-feature

# WRONG - Don't branch from main
git checkout main
git checkout -b 123-add-login-feature

# WRONG - Don't branch from another feature
git checkout 456-other-feature
git checkout -b 123-add-login-feature
```

### Branch Naming Convention

**Format**: `<issue-number>-<kebab-case-description>`

```bash
# GOOD
123-add-user-profile
456-fix-memory-leak
789-update-dependencies

# BAD - No issue number
add-user-profile

# BAD - Not kebab-case
123_add_user_profile
123AddUserProfile

# BAD - Too vague
123-fix
123-update
```

### Working on a Feature

```bash
# 1. Create branch from dev
git checkout dev
git pull origin dev
git checkout -b 123-add-feature

# 2. Make changes and commit frequently
# (See docs/rules/git-commits.md for commit format)
git add .
git commit -m "feat(auth): add login form component"

# 3. Keep branch up to date with dev
git checkout dev
git pull origin dev
git checkout 123-add-feature
git merge dev

# Or use rebase (if you prefer)
git checkout 123-add-feature
git rebase dev

# 4. Push to remote
git push origin 123-add-feature

# 5. Create Pull Request on GitHub
# (Target: dev, not main)
```

---

## Branch Protection Rules {#branch-protection}

**CRITICAL - For AI Agents (Claude Code):**
- **NEVER push directly to protected branches** (`main`, `prod`, `sit`, `dev`)
- **ALWAYS create a feature branch** and submit a pull request
- **Branch format**: `claude/<feature-description>` for AI-generated branches
- **Example**: `claude/add-user-authentication` or `claude/fix-navigation-bug`
- **Violation**: Pushing directly to `main` is a critical error that bypasses code review and CI/CD gates

**Setup Requirement:**
- Protected branches MUST be configured in GitHub repository settings
- Go to: Settings > Branches > Add branch protection rule
- Apply to: `main`, `prod`, `sit`, `dev` (and any other environment branches)

---

### `main` Branch

**Protections**:
- Requires pull request before merging
- Requires approvals: 2+ reviewers
- Requires status checks to pass
- Requires branches to be up to date
- No force pushes
- No deletions

**Who can merge**: Release managers only

### `prod` Branch

**Protections**:
- Requires pull request before merging
- Requires approvals: 1+ reviewer
- Requires status checks to pass
- No force pushes
- No deletions

**Who can merge**: Tech leads and release managers

### `sit` Branch

**Protections**:
- Requires pull request before merging
- Requires status checks to pass
- No force pushes

**Who can merge**: Developers and tech leads

### `dev` Branch

**Protections**:
- Requires pull request before merging
- Requires status checks to pass
- No force pushes

**Who can merge**: All developers after approval

---

## Merge Strategy {#merge-strategy}

### Feature → Dev

**Method**: Squash and Merge (recommended)

```bash
# Via GitHub PR:
# 1. Create PR from feature branch to dev
# 2. Get approval
# 3. Use "Squash and Merge" button
# 4. Delete feature branch after merge
```

**Why Squash**:
- Keeps dev branch history clean
- One commit per feature
- Easier to understand history
- Easier to revert if needed

### Dev → SIT → UAT → Prod → Main

**Method**: Regular Merge (no squash)

```bash
# Merge dev to sit
git checkout sit
git pull origin sit
git merge dev
git push origin sit

# Merge sit to uat
git checkout uat
git pull origin uat
git merge sit
git push origin uat

# Merge uat to prod
git checkout prod
git pull origin prod
git merge uat
git push origin prod

# Merge prod to main
git checkout main
git pull origin main
git merge prod
git push origin main
```

**Why Regular Merge**:
- Preserves complete history
- Shows when features were promoted
- Maintains traceability

---

## Semantic Versioning

### Format

**`MAJOR.MINOR.PATCH`**

- **MAJOR**: Breaking changes (e.g., 1.0.0 → 2.0.0)
- **MINOR**: New features, backwards compatible (e.g., 1.0.0 → 1.1.0)
- **PATCH**: Bug fixes, backwards compatible (e.g., 1.0.0 → 1.0.1)

### Examples

```
1.0.0 → 1.0.1  (Bug fix)
1.0.1 → 1.1.0  (New feature)
1.1.0 → 2.0.0  (Breaking change)
```

### Pre-release Versions

```
1.0.0-alpha.1   (Alpha release)
1.0.0-beta.1    (Beta release)
1.0.0-rc.1      (Release candidate)
1.0.0           (Stable release)
```

### Tagging Releases

```bash
# After merging to main
git checkout main
git pull origin main

# Create annotated tag
git tag -a v1.2.3 -m "Release v1.2.3: Add user authentication"

# Push tag
git push origin v1.2.3

# Push all tags
git push origin --tags
```

### Version Bumping

Determine version bump based on changes:

```bash
# PATCH (1.0.0 → 1.0.1)
# - Bug fixes only
# - No new features
# - No breaking changes

# MINOR (1.0.0 → 1.1.0)
# - New features
# - Backwards compatible
# - No breaking changes

# MAJOR (1.0.0 → 2.0.0)
# - Breaking changes
# - API changes that break compatibility
# - Remove deprecated features
```

---

## Pull Request Workflow {#pr-workflow}

### Creating a Pull Request

1. **Push your feature branch**
   ```bash
   git push origin 123-add-feature
   ```

2. **Create PR on GitHub**
   - Base branch: `dev`
   - Compare branch: `123-add-feature`
   - Fill in PR template

3. **PR Description Should Include**:
   - Summary of changes
   - Related issue(s): `Closes #123`
   - Testing steps
   - Screenshots (if UI changes)
   - Breaking changes (if any)

4. **Request Review**
   - Tag relevant team members
   - Assign yourself
   - Add appropriate labels

### PR Template Example

```markdown
## Description
Brief description of changes

Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

**Reviewer Responsibilities**:
- Check code quality
- Verify tests exist and pass
- Ensure documentation is updated
- Check for security issues
- Verify accessibility compliance
- Test functionality locally if needed

**Author Responsibilities**:
- Address all feedback
- Re-request review after changes
- Keep PR scope focused
- Respond to comments promptly

### Merging a PR

**Requirements Before Merge**:
- [ ] All checks pass (lint, tests, build)
- [ ] At least 1 approval (2+ for main branch)
- [ ] No unresolved comments
- [ ] Branch is up to date with base
- [ ] No merge conflicts

**After Merge**:
```bash
# Delete local feature branch
git branch -d 123-add-feature

# Delete remote feature branch (usually auto-deleted by GitHub)
git push origin --delete 123-add-feature

# Update local dev branch
git checkout dev
git pull origin dev
```

---

## Handling Merge Conflicts

### Prevention

```bash
# Keep your branch up to date
git checkout dev
git pull origin dev
git checkout 123-add-feature
git merge dev
```

### Resolution

```bash
# When conflict occurs during merge
git status  # See conflicted files

# Open conflicted files and resolve
# Look for conflict markers:
# <<<<<<< HEAD
# Your changes
# =======
# Their changes
# >>>>>>> dev

# After resolving all conflicts
git add .
git commit -m "Merge dev into 123-add-feature, resolve conflicts"
git push origin 123-add-feature
```

---

## Common Git Operations

### Updating Your Branch

```bash
# Method 1: Merge (preserves all commits)
git checkout dev
git pull origin dev
git checkout 123-add-feature
git merge dev

# Method 2: Rebase (cleaner history, but rewrites commits)
git checkout 123-add-feature
git rebase dev
```

### Amending Last Commit

```bash
# If you forgot to add a file or want to fix commit message
git add forgotten-file.ts
git commit --amend --no-edit

# Or change commit message
git commit --amend -m "New commit message"

# Push (requires force if already pushed)
git push origin 123-add-feature --force-with-lease
```

**Warning**: Only amend commits that haven't been pushed, or use `--force-with-lease` carefully.

### Stashing Changes

```bash
# Save work in progress
git stash

# Apply stashed changes
git stash pop

# List stashes
git stash list

# Apply specific stash
git stash apply stash@{0}
```

### Cherry-picking

```bash
# Apply specific commit from another branch
git cherry-pick <commit-hash>
```

### Reverting Changes

```bash
# Revert a merged PR (creates new commit)
git revert -m 1 <merge-commit-hash>

# Revert specific commit
git revert <commit-hash>
```

---

## Branch Cleanup

### Local Cleanup

```bash
# Delete local branch
git branch -d 123-add-feature

# Force delete unmerged branch
git branch -D 123-add-feature

# Delete all local branches that are merged
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

### Remote Cleanup

```bash
# Delete remote branch
git push origin --delete 123-add-feature

# Prune deleted remote branches
git fetch --prune
```

---

## Git Best Practices

1. **Commit Often**: Small, focused commits are better than large ones
2. **Pull Before Push**: Always pull latest changes before pushing
3. **Branch from Dev**: Always create feature branches from dev
4. **One Feature Per Branch**: Don't mix unrelated changes
5. **Keep Branches Short-Lived**: Merge within days, not weeks
6. **Delete Merged Branches**: Clean up after merging
7. **Use Descriptive Branch Names**: Include issue number and description
8. **Never Force Push** to protected branches (main, dev, sit, prod)
9. **Review Before Committing**: Use `git diff` to review changes
10. **Write Good Commit Messages**: See `docs/rules/git-commits.md`

---

## Emergency Procedures

### Hotfix for Production

```bash
# 1. Branch from main (not dev)
git checkout main
git pull origin main
git checkout -b hotfix-critical-bug

# 2. Make fix and commit
git commit -m "fix(critical): resolve production issue"

# 3. Create PR to main (expedited review)

# 4. After merge to main, also merge to dev
git checkout dev
git merge main
git push origin dev
```

### Reverting a Bad Deployment

```bash
# Find the commit before the bad merge
git log

# Revert the merge
git revert -m 1 <bad-merge-commit-hash>
git push origin main

# Or reset to previous tag (more drastic)
git reset --hard v1.2.3
git push origin main --force-with-lease
```

---

## Tools and Aliases

### Helpful Git Aliases

Add to `~/.gitconfig`:

```ini
[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  pu = push
  pl = pull
  df = diff
  lg = log --oneline --decorate --graph
  amend = commit --amend --no-edit
  undo = reset --soft HEAD~1
```

### Git GUI Tools

- **GitKraken**: Visual git client
- **GitHub Desktop**: Simple GitHub integration
- **Tower**: Advanced git client
- **VS Code Git**: Built-in git integration

---

## Troubleshooting

### "Branch is X commits behind"

```bash
# Update your branch
git checkout dev
git pull origin dev
git checkout 123-add-feature
git merge dev
```

### "Pull request has conflicts"

```bash
# Resolve conflicts locally
git checkout dev
git pull origin dev
git checkout 123-add-feature
git merge dev
# Resolve conflicts in editor
git add .
git commit
git push origin 123-add-feature
```

### Accidentally Committed to Wrong Branch

```bash
# Save the commit
git log  # Copy the commit hash

# Go to correct branch
git checkout correct-branch
git cherry-pick <commit-hash>

# Remove from wrong branch
git checkout wrong-branch
git reset --hard HEAD~1
```

---

## Resources

- [Git-flow Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)

---

## Related Documentation

**Essential Rules (Read Together)**:
- [Git Commits](./git-commits.md) - Conventional commits format, message standards
- [Semantic Versioning](./semantic-versioning.md) - Automated version bumping
- [Code Standards](./code-standards.md) - Pre-commit hooks, linting

**Implementation Guides**:
- [Deployment](./deployment.md) - CI/CD pipeline integration
- [Environments](./environments.md) - Branch-to-environment mapping

**Development**:
- [Refactoring](../02-development/refactoring.md) - Safe refactoring with git
- [Technical Debt](../02-development/technical-debt.md) - Tracking debt in commits

**Quick Links**:
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Rules](./)
