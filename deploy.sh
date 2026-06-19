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

- Added 'Seat Cover WO IHR (Jun 2026 update)' template version
  alongside the legacy 'Seat Cover WO IHR'. New version: deduped
  (43 dups removed) plus 572 additional BVs covering (a) the new
  2024-2027 model years of every model already in the legacy WO
  IHR list whose latest registered year was 2023+, and (b) a
  curated set of popular non-IHR models that the legacy template
  was missing entirely — Mercedes EQ-series and AMG lineup, BMW
  iX1/iX2/iX3/i5/M5 Touring/2-series/etc., Audi A1/A6 Sportback
  e-tron/RS e-tron GT Performance, Lexus RZ/UX300h/LX700h, Cadillac
  ESCALADE IQ/OPTIQ/VISTIQ/CELESTIQ, GMC Hummer EV Pickup/SUV,
  Kia EV3/EV4, Hyundai Ioniq 5 N/6 N/9, Volvo EX-series, Porsche
  Taycan/Macan EV/911/Panamera/718 lineup, Mini Aceman/Countryman,
  Toyota GR Corolla/GR Supra/GR86/Crown Signia/bZ, Acura ADX, Jeep
  Recon/Wagoneer S, Chevy Bolt 2027, Rivian R2, Lucid Gravity
  2027, plus Mercedes G-Class and S-Class trims. Explicitly
  EXCLUDED: Tesla Cybertruck and Audi Q6 e-tron / SQ6 e-tron (user
  confirmed these have integrated headrests). Total WO IHR Jun
  2026 = 14,097 BVs (legacy 13,568 raw / 13,525 unique). Year
  distribution of added BVs: 2024:93, 2025:119, 2026:161, 2027:199.

- Bumped localStorage tree cache key aces_tree_v4 -> aces_tree_v5.

- Refined Seat Cover WO IHR (Jun 2026 update) per user audit:
  REMOVED 187 BVs that have integrated/sport-bucket headrests:
  Tesla 3/S/X/Y all years (kept Roadster), Porsche 911/718/Taycan,
  BMW M3/M4/M5/M5 Touring/M440i/Z4, Mercedes all AMG variants
  (AMG GT 43/53/55/63, SL43/55/63 AMG, Maybach SL680, A35/A45/CLA45
  AMG S, CLE53 AMG, GLC/GLE/GLS AMG variants, EQE/EQS AMG, S63 AMG
  E Performance), Audi RS3/RS Q3/RS e-tron GT Performance, Toyota
  GR Supra/GR Corolla/GR86/Supra, Subaru BRZ, Nissan Z, Mazda MX-5,
  Hyundai Ioniq 5 N/6 N. ADDED 7 BVs: Audi A7 2016-2017 (catalog
  gap) and Chrysler Pacifica 2004-2008 (1st-generation minivan).
  Final WO IHR Jun 2026 = 13,917 BVs.
"

echo "==> push origin main"
git push origin main

echo ""
echo "✓ push complete. Amplify/Vercel should start the deploy now."
echo "  - Amplify console: https://console.aws.amazon.com/amplify/"
echo "  - Vercel dashboard: https://vercel.com/dashboard"
