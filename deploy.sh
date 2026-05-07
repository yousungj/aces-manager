#!/bin/bash
# Commits pending template changes and pushes to GitHub.
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
git commit -m "Add Vehicle Type -> Truck (All) template (9,833 BVs)

- New '12. Vehicle Type' category with a 'Truck (All)' subcategory
  covering every truck (VehicleTypeID=6) in the AutoCare VCdb
  release dated 2026-04-30: 9,833 BaseVehicleIDs across 1,523
  unique truck models from 112 makes (GMC, Chevrolet, Ford, Jeep,
  Ram, Dodge, Mercedes-Benz, Toyota, Nissan, etc.).

- New src/templates/aces/truck-templates.ts builds ACES 3.2 XML
  with action=\"A\" and VcdbVersionDate 2026-04-30.

- Pre-extracted BV list at src/templates/aces/data/truck-all-ids.json
  and public/data/truck-all-ids.json for runtime fetch.

- Bumped localStorage tree cache key aces_tree_v2 -> aces_tree_v3
  so existing clients pick up the new Vehicle Type folder on
  next load.
"

echo "==> push origin main"
git push origin main

echo ""
echo "✓ push complete. Amplify/Vercel should start the deploy now."
echo "  - Amplify console: https://console.aws.amazon.com/amplify/"
echo "  - Vercel dashboard: https://vercel.com/dashboard"
