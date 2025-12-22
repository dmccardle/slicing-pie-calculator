# Claude Code Git Workflow

This document explains how to differentiate commits made by Claude Code from your manual commits.

---

## How It Works

When Claude Code makes commits, they are attributed to:

**Author:** `Claude Code Bot`
**Email:** `[CLAUDE_CODE_BOT_EMAIL]`
**GitHub Account:** `[CLAUDE_CODE_BOT_ACCOUNT]`

When you make manual commits, they use your identity:

**Author:** `[DEVELOPER_NAME]`
**Email:** `[DEVELOPER_EMAIL]`
**GitHub Account:** `[DEVELOPER_GITHUB_ACCOUNT]`

---

## Benefits

### 1. **Clear Attribution on GitHub**
- Claude's commits show "Claude Code Bot" as author (via [CLAUDE_CODE_BOT_ACCOUNT] account)
- Your commits show "[DEVELOPER_NAME]" as author (via [DEVELOPER_GITHUB_ACCOUNT] account)
- Easy to see who (or what) made each change

### 2. **You Can Review Your Own PRs**
- If Claude creates a PR, it's from [CLAUDE_CODE_BOT_ACCOUNT] account
- You ([DEVELOPER_GITHUB_ACCOUNT]) can review PRs created by the bot account
- Slack notifications will work!

### 3. **Better Audit Trail**
- Know which code was AI-generated
- Track Claude's contributions separately
- Useful for learning: "What did Claude change?"

---

## Workflow

### When Claude Code is Working

```bash
# Claude automatically uses this identity
Author: Claude Code Bot
Email: [CLAUDE_CODE_BOT_EMAIL]
GitHub: [CLAUDE_CODE_BOT_ACCOUNT]

# Branches created by Claude
git checkout -b claude/feature-name

# Commits by Claude
git commit -m "feat(ai): implemented by Claude Code

Generated with Claude Code
"
```

### When You're Working Manually

```bash
# Switch back to your identity
git config user.name "[DEVELOPER_NAME]"
git config user.email "[DEVELOPER_EMAIL]"

# Your branches
git checkout -b feature/my-work

# Your commits
git commit -m "feat: my manual implementation"
```

---

## Quick Commands

### Switch to Claude Identity (for this repo only)
```bash
git config user.name "Claude Code Bot"
git config user.email "[CLAUDE_CODE_BOT_EMAIL]"
```

### Switch Back to Your Identity
```bash
git config user.name "[DEVELOPER_NAME]"
git config user.email "[DEVELOPER_EMAIL]"
```

### Check Current Identity
```bash
git config user.name
git config user.email
```

### See Commit Authors
```bash
# View recent commits with authors
git log --format="%h %an <%ae> %s" -10

# Example output:
# abc1234 Claude Code Bot <[CLAUDE_CODE_BOT_EMAIL]> feat(ai): add feature
# def5678 [DEVELOPER_NAME] <[DEVELOPER_EMAIL]> fix: manual bugfix
```

---

## Example PR Flow

### Scenario: Claude Implements a Feature

1. **Claude creates branch:**
   ```bash
   git checkout -b claude/add-authentication
   ```

2. **Claude makes commits:**
   ```bash
   # Author: Claude Code Bot (mat-claude-code)
   git commit -m "feat(auth): add login system"
   git commit -m "feat(auth): add signup flow"
   git commit -m "test(auth): add auth tests"
   ```

3. **Claude creates PR:**
   ```bash
   gh pr create --title "[Claude] Add Authentication" \
                --body "Implemented authentication system with login, signup, and JWT tokens."
   ```

4. **You request your own review:**
   ```bash
   # This works because Claude is the author, not you!
   gh pr edit --add-reviewer [DEVELOPER_GITHUB_ACCOUNT]
   ```

5. **You get Slack notification:**
   ```
   Your Review is Requested

   PR: #2 [Claude] Add Authentication
   Requested by: [CLAUDE_CODE_BOT_ACCOUNT] (Claude Code Bot)

   [Review Now]
   ```

6. **You review Claude's code:**
   - Check the implementation
   - Request changes if needed
   - Approve when ready

7. **Merge:**
   ```bash
   gh pr merge 2 --squash
   ```

---

## Viewing Git History

### See All Claude's Commits
```bash
git log --author="Claude Code Bot" --oneline
```

### See All Your Commits
```bash
git log --author="[DEVELOPER_NAME]" --oneline
```

### See Commit Stats by Author
```bash
git shortlog -sn
# Output:
#   42  Claude Code Bot
#   15  [DEVELOPER_NAME]
```

---

## ️ Helper Script

We've created a helper script for easy identity switching:

### Switch to Claude Identity
```bash
# Set Claude's identity for this repo
git config user.name "Claude Code Bot"
git config user.email "[CLAUDE_CODE_BOT_EMAIL]"
```

### Switch to Your Identity
```bash
# Set your identity for this repo
git config user.name "[DEVELOPER_NAME]"
git config user.email "[DEVELOPER_EMAIL]"
```

---

## ️ Automation with Git Hooks

Want to automatically prefix Claude's commits? Add to `.git/hooks/prepare-commit-msg`:

```bash
#!/bin/bash
# Auto-add emoji to Claude's commits

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Check if committer is Claude
AUTHOR_EMAIL=$(git config user.email)
if [[ "$AUTHOR_EMAIL" == *"claude"* ]]; then
  # Add Claude emoji if not already present
  if ! grep -q "" "$COMMIT_MSG_FILE"; then
    echo "" >> "$COMMIT_MSG_FILE"
    echo "Generated with Claude Code" >> "$COMMIT_MSG_FILE"
  fi
fi
```

---

## Related Documentation

**Workflows:**
- [Quality Gates Setup](./quality-gates-setup.md) - CI/CD configuration
- [Slack Notification Rules](./slack-notification-rules.md) - When you get notified

**Git:**
- [Git Workflow](../rules/git-workflow.md) - Branching strategy
- [Git Commits](../rules/git-commits.md) - Commit message format

**Quick Links:**
- [← Back to Documentation Home](../../CLAUDE.md)
- [↑ All Deployment Docs](./)

---

**Last Updated**: 2025-12-22
**Identity Setup Since**: v1.1.9
