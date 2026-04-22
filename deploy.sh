#!/bin/bash
# Commits the wiper + ACES delete template changes and pushes to GitHub.
# Amplify/Vercel then auto-deploys on push to main.

set -e

cd "$(dirname "$0")"

echo "==> repo: $(pwd)"
echo "==> clearing stale lock (if any)"
rm -f .git/index.lock

echo "==> staging all changes"
git add -A

echo "==> files to commit:"
git diff --cached --name-only | wc -l
git diff --cached --name-only | head -5
echo "  ..."
git diff --cached --name-only | tail -5

echo "==> commit"
git commit -m "Add Wiper category (60 size templates) + ACES Delete Template

- New 'Wiper' category in Templates section with 60 subcategories
  (WIPER-13x13 through WIPER-28x28) derived from aces_by_size_v6.
  Each template generates ACES 3.2 XML with action=\"A\" and uses
  pre-extracted BaseVehicleID lists (9,994 total apps, 9,941 unique).

- New 'ACES Delete Template' category with a single template that
  issues action=\"D\" across the union of every BaseVehicleID
  previously used (21,588 IDs). Editable via Template Editor for
  targeted-subset deletes.

- Split wiper + delete builders into src/templates/aces/wiper-templates.ts
  to keep xml-templates.ts lean.

- Bumped localStorage tree cache key aces_tree_v1 -> aces_tree_v2 so
  existing clients pick up the two new folders on next load.

- Template Editor now emits action=\"D\" when the selected template's
  category is 'ACES Delete Template'.
"

echo "==> push origin main"
git push origin main

echo ""
echo "✓ push complete. Amplify/Vercel should start the deploy now."
echo "  - Amplify console: https://console.aws.amazon.com/amplify/"
echo "  - Vercel dashboard: https://vercel.com/dashboard"
