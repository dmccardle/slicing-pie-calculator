# Pull Request Approval Rules

## CRITICAL: Human-in-the-Loop for Merging

Claude Code MUST NEVER merge pull requests without explicit human approval. This is a non-negotiable rule to maintain code quality and human oversight.

---

## TL;DR (2-Minute Read) {#tldr}

**Critical Requirements:**
- **NEVER merge without approval**: Claude MUST wait for explicit human approval ("merge it", "yes", "go ahead") (see [The Rule](#the-rule))
- **ALL checks must pass FIRST**: NEVER ask for approval if ANY check is failing or pending (see [Correct Workflow](#correct-workflow))
- **API usage optimization**: Wait 90s after PR creation, then poll every 45s (see [API Optimization](#api-optimization))
- **No exceptions**: Even if user seems impatient, NEVER skip the approval step (see [Exception Handling](#exceptions))
- **Report status clearly**: Tell user what checks passed/failed before asking (see [Correct Workflow](#correct-workflow))

**Quick Example:**
```bash
# BAD - Merges without asking
gh pr merge 5 --squash  # FORBIDDEN!

# GOOD - Waits for approval
# 1. Check all tests pass
gh pr checks 5
# 2. Report to user: "All checks passed. Ready to merge?"
# 3. Wait for explicit "yes"/"merge it"
# 4. Only then: gh pr merge 5 --squash
```

**Key Rules:**
1. Wait for ALL checks to pass
2. Report status to user
3. Ask: "Would you like me to merge PR #X?"
4. Wait for explicit approval
5. Only then execute merge

**No Exceptions. No Shortcuts. No Auto-Merge.**

---

## The Rule {#the-rule}

### NEVER Do This

```bash
# WRONG - Claude merges without asking
gh pr merge 5 --squash
```

**This is FORBIDDEN.** Claude Code must NEVER execute merge commands without explicit human approval.

---

## The Correct Workflow {#correct-workflow}

### Step 1: Wait for ALL Checks to Pass

Before asking for approval, Claude MUST verify that **ALL** workflow checks are passing:

```bash
# Check PR status
gh pr checks <PR_NUMBER>

# ALL checks must show "pass" - not "pending", not "fail"
# Example of ready PR:
# Markdown Lint       pass
# Quality Gate Status pass
# Version Consistency pass
# Validate Templates  pass
# All other checks    pass
```

**If ANY check is failing or pending:**
- DO NOT ask for approval yet
- DO NOT dismiss failures as "not important"
- Wait for checks to complete
- Fix any failures
- Only ask when everything is green

### Step 1.5: GitHub API Usage Optimization {#api-optimization}

**CRITICAL:** To reduce GitHub API usage and avoid rate limiting:

**After creating a PR:**
```bash
# CORRECT - Wait 90 seconds before first check
gh pr create ...
sleep 90  # Give CI time to start
gh pr checks <PR_NUMBER>
```

**When polling for status:**
```bash
# CORRECT - Check every 45 seconds
gh pr checks <PR_NUMBER>
sleep 45
gh pr checks <PR_NUMBER>
sleep 45
gh pr checks <PR_NUMBER>
```

**Why these intervals:**
- **90 seconds initial**: CI workflows take time to queue and start
- **45 seconds between**: Balances responsiveness with API usage
- **Avoids rate limiting**: GitHub API has rate limits per hour
- **Reduces costs**: Fewer API calls = lower infrastructure costs
- **Better behavior**: Don't hammer GitHub's servers

**DON'T do this:**
```bash
# WRONG - Immediate check after PR creation
gh pr create ...
gh pr checks <PR_NUMBER>  # CI hasn't even started yet!

# WRONG - Checking too frequently
sleep 5  # Only 5 seconds - wasteful!
gh pr checks <PR_NUMBER>
```

**Implementation pattern:**
```bash
# After creating PR
gh pr create --title "..." --body "..."
echo "Waiting 90 seconds for CI to start..."
sleep 90

# First check
gh pr checks <PR_NUMBER>

# If checks still pending, poll at 45s intervals
while [ checks_pending ]; do
  echo "Waiting 45 seconds for checks to complete..."
  sleep 45
  gh pr checks <PR_NUMBER>
done
```

### Step 2: Report Status to User

Once ALL checks pass, inform the user:

```markdown
PR #5 is ready for review!

**Status:**
- All quality gates passing 
- No merge conflicts 
- Ready to merge 

**Changes:**
- [Brief summary of what changed]

Would you like me to merge this PR?
```

### Step 3: Wait for Explicit Approval

Claude MUST wait for the user to explicitly say:
- "merge it"
- "merge pr 5"
- "yes, merge"
- "go ahead"

**DO NOT merge if user says:**
- "looks good" (not explicit approval)
- "nice" (not explicit approval)
- "thanks" (not explicit approval)

### Step 4: Merge Only After Approval

```bash
# Only after user gives explicit approval:
gh pr merge <PR_NUMBER> --squash --body "Merging with user approval"
```

---

## When Checks Are Failing

### Scenario: Some checks are failing

```bash
gh pr checks 5
# Markdown Lint       pass
# Notify - Something  fail
# ⋯ Quality Gate        pending
```

**What Claude should do:**

1. **Investigate the failure:**
   ```bash
   gh run view <RUN_ID> --log-failed
   ```

2. **Report to user:**
   ```markdown
   PR #5 has failing checks:

   - Notify - Something (permissions issue)
   - ⋯ Quality Gate (still running)

   I'll wait for all checks to complete before asking for approval.
   ```

3. **Fix issues if possible** (e.g., code issues, lint errors)

4. **Only ask for approval when ALL checks pass**

---

## Exception Handling {#exceptions}

### When can Claude ignore a failing check?

**NEVER.** There are no exceptions.

Even if:
- It looks like a "minor" notification failure
- Other checks are passing
- The failure is from a third-party service
- You think the user won't care

**The rule is absolute:** ALL checks must pass before asking for approval.

---

## Why This Rule Exists

1. **Code Quality:** Failed checks indicate issues that need attention
2. **Security:** Some checks verify security requirements
3. **Consistency:** Ensures every PR meets quality standards
4. **Human Oversight:** Critical decisions require human judgment
5. **Accountability:** User is responsible for what gets merged, not the AI

---

## Examples

### Good: Wait for approval

```markdown
User: "Create a PR to fix the bug"
Claude: *creates PR #10*
Claude: *waits for checks...*
Claude: "PR #10 is ready! All checks passing. Would you like me to merge it?"
User: "yes"
Claude: *merges PR*
```

### Bad: Merge without approval

```markdown
User: "Create a PR to fix the bug"
Claude: *creates PR #10*
Claude: *merges immediately*
Claude: "PR merged!"
```

**This is WRONG.** Claude violated the rule.

### Bad: Ask for approval while checks failing

```markdown
Claude: "PR #5 has one failing check (notification workflow), but quality gates passed. Should I merge?"
```

**This is WRONG.** Claude should wait for ALL checks to pass.

### Good: Report and wait

```markdown
Claude: "PR #5 created. Some checks are still running, I'll let you know when it's ready for review."
*waits...*
Claude: "All checks passed! PR #5 is ready. Would you like me to merge it?"
User: "merge it"
Claude: *merges*
```

---

## Quick Reference

| Situation | Claude's Action |
|-----------|----------------|
| PR created | Wait for ALL checks to complete |
| Some checks failing | DO NOT ask for approval |
| All checks passing | Ask user if they want to merge |
| User says "merge" | Execute merge command |
| User doesn't respond | DO NOT merge automatically |
| User says "looks good" | DO NOT merge (not explicit) |

---

## Implementation Notes

### How to check if all checks are passing

```bash
# Method 1: Check exit code
gh pr checks <PR_NUMBER>
if [ $? -eq 0 ]; then
  echo "All checks passed"
else
  echo "Some checks failed or pending"
fi

# Method 2: Parse output
gh pr checks <PR_NUMBER> --json state -q '.[] | select(.state != "PASSING")'
# If empty output = all passing
```

### How to ask for approval

```markdown
PR #<NUMBER> is ready for review!

**Status:** All checks passing 

**Summary:** [Brief description]

**Files changed:** <COUNT> files

Would you like me to merge this PR?
```

---

## Related Documentation

- `docs/rules/git-workflow.md` - Git workflow and branching
- `docs/rules/deployment.md` - CI/CD and deployment
- `docs/07-deployment/quality-gates-setup.md` - Quality gates configuration

---

## Non-Negotiable

This rule is **NON-NEGOTIABLE**. Claude Code MUST:
- Wait for ALL checks to pass
- Ask for explicit approval
- Never merge without permission
- Report status clearly

**If Claude violates this rule, it should be immediately corrected and documented.**
