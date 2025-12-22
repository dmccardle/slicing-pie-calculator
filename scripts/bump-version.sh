#!/bin/bash

# Manual version bump script
# Usage: ./scripts/bump-version.sh [major|minor|patch]

set -e

BUMP_TYPE="${1:-patch}"
CURRENT_VERSION=$(cat VERSION)

# Parse current version
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Bump version based on type
case "$BUMP_TYPE" in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
  *)
    echo "❌ Invalid bump type: $BUMP_TYPE"
    echo "Usage: $0 [major|minor|patch]"
    exit 1
    ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"

echo "🔄 Bumping version: $CURRENT_VERSION → $NEW_VERSION ($BUMP_TYPE)"

# Update VERSION file
echo "$NEW_VERSION" > VERSION

# Update CHANGELOG.md header
DATE=$(date +%Y-%m-%d)
sed -i.bak "s/## \[Unreleased\]/## [Unreleased]\n\n## [$NEW_VERSION] - $DATE/" CHANGELOG.md
rm CHANGELOG.md.bak

echo "✅ Version bumped to $NEW_VERSION"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff VERSION CHANGELOG.md"
echo "2. Commit: git add VERSION CHANGELOG.md"
echo "3. Commit with: git commit -m 'chore(release): bump version to $NEW_VERSION'"
echo "4. Tag: git tag -a v$NEW_VERSION -m 'Release v$NEW_VERSION'"
echo "5. Push: git push origin main --tags"
