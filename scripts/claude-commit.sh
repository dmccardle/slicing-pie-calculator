#!/bin/bash
# Helper script for Claude Code commits
# Usage: ./scripts/claude-commit.sh "commit message"

# Set Claude's identity temporarily for this commit only
git -c user.name="Claude Code Bot" \
    -c user.email="[CLAUDE_CODE_BOT_EMAIL]" \
    commit "$@"

echo ""
echo "✅ Committed as Claude Code Bot"
echo "📝 Commit will appear on GitHub as [CLAUDE_CODE_BOT_ACCOUNT]"
