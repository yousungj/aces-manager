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
git commit -m "Add Vehicle Type -> Truck (All) template + 2 new PartTypes

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

- Added two PartType options to the dropdown (page.tsx and
  custom-builder/page.tsx): Truck Bed Liner (1008), Hubcap (10026).

- Moved Jeep Wrangler 2007-2016 (10 BaseVehicleIDs) from SWC 16-inch
  to SWC 15-inch. SWC 15-inch already had Wrangler 2000-2006 and
  2017-2026; this fills the missing decade so Wrangler coverage in
  15-inch is now continuous 2000-2026.

- Boosted Mega Super coverage of recent model years (2024-2027) by
  adding 853 BaseVehicleIDs from 32 mainstream brands (Mercedes-Benz,
  BMW, Audi, Chevrolet, Toyota, Lexus, Ford, Volkswagen, Nissan,
  Hyundai, Kia, GMC, Honda, Cadillac, Volvo, Ram, Mazda, Jeep,
  Subaru, Genesis, Land Rover, Mitsubishi, Porsche, Dodge, Buick,
  Acura, Lincoln, INFINITI, Mini, Jaguar, Chrysler, Tesla). Total
  Mega Super now 10,888 BVs. Coverage of 2027 Car+Truck+Van jumped
  from 0% to 83%.

- Synced Mega Super against AutoCare VCdb release 2026-05-28
  (one month after the prior 2026-04-30 sync). Added 42 newly
  cataloged mainstream BVs: mostly 2027 model year additions
  (BMW M3/M4/X6/X7/i5/5-series/7-series, Audi Q5/SQ5/Q4 e-tron,
  Chevrolet/GMC HD pickups, Ford F-250/F-350 Super Duty, Toyota
  RAV4/Mirai, Honda Pilot, Jeep Cherokee, Kia EV4/Carnival,
  Hyundai Kona Electric, VW Golf R/GTI/ID. Buzz, Volvo XC60,
  Acura Integra, Chrysler Grand Caravan, plus Ram 700 2026).
  Total Mega Super now 10,930 BVs; 2027 mainstream coverage 100%.

- Added 'SWC 15 inch (Jun 2026 update)' and 'SWC 16 inch (Jun 2026
  update)' template versions. Legacy 'SWC 15/16 inch' templates
  remain untouched so prior submissions stay reproducible. The
  Jun 2026 versions are: (a) deduped (legacy SWC 15 had 305 dup
  entries), (b) year-by-year reassigned for the 14 overlapping
  models per user-supplied SWC_template_by_year.xlsx (covers
  Ram 1500, Ford Expedition/Flex, Honda Pilot/Ridgeline, Jeep
  Cherokee/Compass/Grand Cherokee/Liberty, Nissan TITAN, Toyota
  4Runner/Highlander/Land Cruiser/Sienna), and (c) extended with
  newly cataloged 2026/2027 BVs from VCdb 2026-05-28 — but only
  for models whose latest registered year was already 2023+
  (preserves intentional bounded year ranges on older models).
  Final counts: SWC 15 Jun 2026 = 1,633 BVs (legacy 1,884 raw /
  1,579 unique), SWC 16 Jun 2026 = 735 BVs (legacy 791 raw).

- Bumped localStorage tree cache key aces_tree_v3 -> aces_tree_v4
  so existing clients see the two new SWC Jun 2026 entries.
"

echo "==> push origin main"
git push origin main

echo ""
echo "✓ push complete. Amplify/Vercel should start the deploy now."
echo "  - Amplify console: https://console.aws.amazon.com/amplify/"
echo "  - Vercel dashboard: https://vercel.com/dashboard"
