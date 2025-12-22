#!/bin/bash

# Claude Code Documentation Setup Script
# This script copies the documentation template to your project

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Get target directory (default to current directory)
TARGET_DIR="${1:-.}"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Claude Code Documentation Setup                           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Confirm target directory
echo -e "${YELLOW}This will copy documentation template files to:${NC}"
echo -e "${GREEN}  $TARGET_DIR${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Setup cancelled.${NC}"
    exit 1
fi

# Create directories
echo -e "${BLUE}Creating directory structure...${NC}"
mkdir -p "$TARGET_DIR/docs/project"
mkdir -p "$TARGET_DIR/docs/rules"
mkdir -p "$TARGET_DIR/docs/project-rules"

# Copy CLAUDE.md
echo -e "${BLUE}Copying CLAUDE.md...${NC}"
if [ -f "$TARGET_DIR/CLAUDE.md" ]; then
    echo -e "${YELLOW}  Warning: CLAUDE.md already exists${NC}"
    read -p "  Overwrite? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp "$SCRIPT_DIR/CLAUDE.md" "$TARGET_DIR/CLAUDE.md"
        echo -e "${GREEN}  ✓ Overwritten${NC}"
    else
        echo -e "${YELLOW}  ⊘ Skipped${NC}"
    fi
else
    cp "$SCRIPT_DIR/CLAUDE.md" "$TARGET_DIR/CLAUDE.md"
    echo -e "${GREEN}  ✓ Copied${NC}"
fi

# Copy project documentation templates
echo -e "${BLUE}Copying project documentation...${NC}"
cp "$SCRIPT_DIR/docs/project/overview.md" "$TARGET_DIR/docs/project/"
cp "$SCRIPT_DIR/docs/project/architecture.md" "$TARGET_DIR/docs/project/"
cp "$SCRIPT_DIR/docs/project/setup.md" "$TARGET_DIR/docs/project/"
echo -e "${GREEN}  ✓ overview.md${NC}"
echo -e "${GREEN}  ✓ architecture.md${NC}"
echo -e "${GREEN}  ✓ setup.md${NC}"

# Copy all coding rules
echo -e "${BLUE}Copying coding rules...${NC}"
cp "$SCRIPT_DIR/docs/rules/security-privacy.md" "$TARGET_DIR/docs/rules/"
cp "$SCRIPT_DIR/docs/rules/accessibility.md" "$TARGET_DIR/docs/rules/"
cp "$SCRIPT_DIR/docs/rules/clean-code.md" "$TARGET_DIR/docs/rules/"
cp "$SCRIPT_DIR/docs/rules/code-standards.md" "$TARGET_DIR/docs/rules/"
cp "$SCRIPT_DIR/docs/rules/git-workflow.md" "$TARGET_DIR/docs/rules/"
cp "$SCRIPT_DIR/docs/rules/git-commits.md" "$TARGET_DIR/docs/rules/"
cp "$SCRIPT_DIR/docs/rules/testing.md" "$TARGET_DIR/docs/rules/"
cp "$SCRIPT_DIR/docs/rules/environments.md" "$TARGET_DIR/docs/rules/"
cp "$SCRIPT_DIR/docs/rules/deployment.md" "$TARGET_DIR/docs/rules/"
cp "$SCRIPT_DIR/docs/rules/technology-stack.md" "$TARGET_DIR/docs/rules/"
echo -e "${GREEN}  ✓ security-privacy.md${NC}"
echo -e "${GREEN}  ✓ accessibility.md${NC}"
echo -e "${GREEN}  ✓ clean-code.md${NC}"
echo -e "${GREEN}  ✓ code-standards.md${NC}"
echo -e "${GREEN}  ✓ git-workflow.md${NC}"
echo -e "${GREEN}  ✓ git-commits.md${NC}"
echo -e "${GREEN}  ✓ testing.md${NC}"
echo -e "${GREEN}  ✓ environments.md${NC}"
echo -e "${GREEN}  ✓ deployment.md${NC}"
echo -e "${GREEN}  ✓ technology-stack.md${NC}"

# Copy project-specific rules
echo -e "${BLUE}Copying project-specific rules...${NC}"
cp "$SCRIPT_DIR/docs/project-rules/saas-architecture.md" "$TARGET_DIR/docs/project-rules/"
cp "$SCRIPT_DIR/docs/project-rules/internationalization.md" "$TARGET_DIR/docs/project-rules/"
cp "$SCRIPT_DIR/docs/project-rules/example-rule.md" "$TARGET_DIR/docs/project-rules/"
echo -e "${GREEN}  ✓ saas-architecture.md${NC}"
echo -e "${GREEN}  ✓ internationalization.md${NC}"
echo -e "${GREEN}  ✓ example-rule.md${NC}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Documentation template copied successfully!             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Next steps
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Customize the documentation:${NC}"
echo -e "   ${GREEN}cd $TARGET_DIR${NC}"
echo -e "   ${GREEN}# Edit CLAUDE.md and replace placeholders${NC}"
echo -e "   ${GREEN}# Edit docs/project/*.md files${NC}"
echo ""
echo -e "${YELLOW}2. Replace placeholders:${NC}"
echo -e "   ${GREEN}[PROJECT_NAME]${NC} → Your project name"
echo -e "   ${GREEN}[REPOSITORY_URL]${NC} → Your GitHub URL"
echo -e "   ${GREEN}[TECH_STACK]${NC} → Your technologies"
echo -e "   ${GREEN}# ... and others${NC}"
echo ""
echo -e "${YELLOW}3. Remove unused rules (optional):${NC}"
echo -e "   ${GREEN}# Delete any rule files you don't need${NC}"
echo -e "   ${GREEN}# Update CLAUDE.md to remove references${NC}"
echo ""
echo -e "${YELLOW}4. Add project-specific rules:${NC}"
echo -e "   ${GREEN}cp docs/project-rules/example-rule.md docs/project-rules/my-rule.md${NC}"
echo -e "   ${GREEN}# Edit my-rule.md with your project-specific rules${NC}"
echo -e "   ${GREEN}# Add reference in CLAUDE.md${NC}"
echo ""
echo -e "${YELLOW}5. Test with Claude Code:${NC}"
echo -e "   ${GREEN}# Start a new Claude Code session in this directory${NC}"
echo -e "   ${GREEN}# Verify CLAUDE.md is automatically loaded${NC}"
echo ""
echo -e "${BLUE}For more information, see:${NC}"
echo -e "   ${GREEN}$SCRIPT_DIR/README.md${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
