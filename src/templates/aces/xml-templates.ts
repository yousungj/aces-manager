// Import the pre-extracted BaseVehicle IDs
import megaSuperIds from './data/mega-super-ids.json';
import megaSuperSep2026Ids from './data/mega-super-sep2026-ids.json';
import scWoIhrIds from './data/sc-wo-ihr-ids.json';
import scWoIhrJun2026Ids from './data/sc-wo-ihr-jun2026-ids.json';
import scWoIhrSep2026Ids from './data/sc-wo-ihr-sep2026-ids.json';
import swc15InchIds from './data/swc-15inch-ids.json';
import swc16InchIds from './data/swc-16inch-ids.json';
import swc15InchJun2026Ids from './data/swc-15inch-jun2026-ids.json';
import swc16InchJun2026Ids from './data/swc-16inch-jun2026-ids.json';
import swc15InchSep2026Ids from './data/swc-15inch-sep2026-ids.json';
import swc16InchSep2026Ids from './data/swc-16inch-sep2026-ids.json';
import vc0Ids from './data/vc0-ids.json';
import vc1Ids from './data/vc1-ids.json';
import vc2Ids from './data/vc2-ids.json';
import vc3Ids from './data/vc3-ids.json';
import cc1Ids from './data/cc1-ids.json';
import cc2Ids from './data/cc2-ids.json';
import cc3Ids from './data/cc3-ids.json';
import cc4Ids from './data/cc4-ids.json';
import cc5Ids from './data/cc5-ids.json';
import cc1Aug2026Ids from './data/cc1-aug2026-ids.json';
import cc2Aug2026Ids from './data/cc2-aug2026-ids.json';
import cc3Aug2026Ids from './data/cc3-aug2026-ids.json';
import cc4Aug2026Ids from './data/cc4-aug2026-ids.json';
import cc5Aug2026Ids from './data/cc5-aug2026-ids.json';
import cc3Cc4Ids from './data/cc3-cc4-ids.json';
// Truck Cover (CATC) — apps carry BodyType (cab) and optional BedLength refinements
import catcFitment from './data/truck-cover-catc-fitment.json';
// Windshield Cover (AS)
import asSmallIds from './data/as-small-ids.json';
import asMediumIds from './data/as-medium-ids.json';
import asLargeIds from './data/as-large-ids.json';
import asXlargeIds from './data/as-xlarge-ids.json';
import as5824Ids from './data/as-58-24-ids.json';
import as6627Ids from './data/as-66-27-ids.json';
// Tonneau Cover (MBTN)
import mbtn1111Ids from './data/mbtn-1111-bf-ids.json';
import mbtn1155Ids from './data/mbtn-1155-bf-ids.json';
import mbtn1466Ids from './data/mbtn-1466-bf-ids.json';
import mbtn1476Ids from './data/mbtn-1476-bf-ids.json';
import mbtn2223Ids from './data/mbtn-2223-bf-ids.json';
import mbtn2243Ids from './data/mbtn-2243-bf-ids.json';
import mbtn2254Ids from './data/mbtn-2254-bf-ids.json';
import mbtn3332Ids from './data/mbtn-3332-bf-ids.json';
import mbtn3342Ids from './data/mbtn-3342-bf-ids.json';
import mbtn3587Ids from './data/mbtn-3587-bf-ids.json';
import mbtn3687Ids from './data/mbtn-3687-bf-ids.json';
import mbtn3710Ids from './data/mbtn-3710-bf-ids.json';
import mbtn3f2223Ids from './data/mbtn-3f-2223-bf-ids.json';
import mbtn4820Ids from './data/mbtn-4820-bf-ids.json';
import mbtn5910Ids from './data/mbtn-5910-bf-ids.json';
// Floor Mat (CAMT)
import camt3103Ids from './data/camt-3103-ids.json';
import camt3143Ids from './data/camt-3143-bk-ids.json';
import camt3201Ids from './data/camt-3201-bk-ids.json';
import camt3202Ids from './data/camt-3202-bk-ids.json';
import camt3301Ids from './data/camt-3301-bk-ids.json';
import camt3302Ids from './data/camt-3302-bk-ids.json';
import camt3303Ids from './data/camt-3303-bk-ids.json';
import camt3304Ids from './data/camt-3304-bk-ids.json';
import camt3401Ids from './data/camt-3401-bk-ids.json';
import camt3501Ids from './data/camt-3501-bk-ids.json';
import camt3502Ids from './data/camt-3502-bk-ids.json';
import camt3519Ids from './data/camt-3519-ids.json';
import camt3523Ids from './data/camt-3523-bk-ids.json';
import camt3603Ids from './data/camt-3603-bk-ids.json';
import camt3613Ids from './data/camt-3613-bk-ids.json';
import camt3624Ids from './data/camt-3624-bk-ids.json';
import camt3703Ids from './data/camt-3703-bk-ids.json';
import camt3713Ids from './data/camt-3713-bk-ids.json';
// Floor Mat (CAMT) — Nov 2026: templates added from the TPS descriptions (VCdb 2026-09-24)
import camt3111Ids from './data/camt-3111-bk-ids.json';
import camt3112Ids from './data/camt-3112-bk-ids.json';
import camt3121Ids from './data/camt-3121-bk-ids.json';
import camt3122Ids from './data/camt-3122-bk-ids.json';
import camt3131Ids from './data/camt-3131-bk-ids.json';
import camt3132Ids from './data/camt-3132-bk-ids.json';
import camt3148Ids from './data/camt-3148-bk-ids.json';
import camt3153Ids from './data/camt-3153-bk-ids.json';
import camt3163Ids from './data/camt-3163-bk-ids.json';
import camt3173Ids from './data/camt-3173-bk-ids.json';
import camt3183Ids from './data/camt-3183-bk-ids.json';
import camt3184Ids from './data/camt-3184-bk-ids.json';
import camt3193Ids from './data/camt-3193-bk-ids.json';
import camt3213Ids from './data/camt-3213-bk-ids.json';
import camt3218Ids from './data/camt-3218-bk-ids.json';
import camt3223Ids from './data/camt-3223-bk-ids.json';
import camt3308Ids from './data/camt-3308-bk-ids.json';
import camt3333Ids from './data/camt-3333-bk-ids.json';
import camt3334Ids from './data/camt-3334-bk-ids.json';
import camt3338Ids from './data/camt-3338-bk-ids.json';
import camt3413Ids from './data/camt-3413-bk-ids.json';
import camt3414Ids from './data/camt-3414-bk-ids.json';
import camt3423Ids from './data/camt-3423-bk-ids.json';
import camt3511Ids from './data/camt-3511-bk-ids.json';
import camt3512Ids from './data/camt-3512-bk-ids.json';
import camt3521Ids from './data/camt-3521-bk-ids.json';
import camt3533Ids from './data/camt-3533-bk-ids.json';
import camt3534Ids from './data/camt-3534-bk-ids.json';
import camt3542Ids from './data/camt-3542-bk-ids.json';
import camt3544Ids from './data/camt-3544-bk-ids.json';
import camt3604Ids from './data/camt-3604-bk-ids.json';
import camt3618Ids from './data/camt-3618-bk-ids.json';
import camt3633Ids from './data/camt-3633-bk-ids.json';
import camt3634Ids from './data/camt-3634-bk-ids.json';
import camt3638Ids from './data/camt-3638-bk-ids.json';
import camt3643Ids from './data/camt-3643-bk-ids.json';
import camt3644Ids from './data/camt-3644-bk-ids.json';
import camt3648Ids from './data/camt-3648-bk-ids.json';
import camt3654Ids from './data/camt-3654-bk-ids.json';
import camt3655Ids from './data/camt-3655-bk-ids.json';
import camt3658Ids from './data/camt-3658-bk-ids.json';
import camt3663Ids from './data/camt-3663-bk-ids.json';
import camt3664Ids from './data/camt-3664-bk-ids.json';
import camt3673Ids from './data/camt-3673-bk-ids.json';
import camt3683Ids from './data/camt-3683-bk-ids.json';
import camt3693Ids from './data/camt-3693-bk-ids.json';
import camt3694Ids from './data/camt-3694-bk-ids.json';
import camt3718Ids from './data/camt-3718-bk-ids.json';
import camt3724Ids from './data/camt-3724-bk-ids.json';
import camt3734Ids from './data/camt-3734-bk-ids.json';
import camt3803Ids from './data/camt-3803-bk-ids.json';
import camt3904Ids from './data/camt-3904-bk-ids.json';
import camt3905Ids from './data/camt-3905-bk-ids.json';
import camt3913Ids from './data/camt-3913-bk-ids.json';
import camt4104Ids from './data/camt-4104-bk-ids.json';
import camt4113Ids from './data/camt-4113-bk-ids.json';
import camt4123Ids from './data/camt-4123-bk-ids.json';
import camt4135Ids from './data/camt-4135-bk-ids.json';
import camt4138Ids from './data/camt-4138-bk-ids.json';
import camt4203Ids from './data/camt-4203-bk-ids.json';
import camt4303Ids from './data/camt-4303-bk-ids.json';
// Seat Cover
import scFronts2026Ids from './data/sc-fronts-reduced-2026-ids.json';
import scFronts2026JovenIds from './data/sc-fronts-reduced-2026-joven-ids.json';
import scFullBench2026Ids from './data/sc-full-withbench-reduced-2026-ids.json';
// Hubcap
import uma2025Kt16Ids from './data/uma2025-kt16-ids.json';

type AcesRow = {
  partNumber: string;
  partTypeId: string;
  brandAaiaId: string;
  baseVehicleId?: string;
};

// Helper to build XML from BaseVehicle ID list
function buildXmlFromIds(baseVehicleIds: string[] | number[], rows: AcesRow[]): string {
  // Get the first row's data for header (all rows should have same brand/type for a template)
  const row = rows[0] || { partNumber: '', brandAaiaId: '', partTypeId: '' };
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Build header
  const header = `<?xml version="1.0" encoding="utf-8"?>
<ACES version="3.2">
  <Header>
    <Company>BDK Auto</Company>
    <SenderName>BDK User</SenderName>
    <SenderPhone>000-000-0000</SenderPhone>
    <TransferDate>${currentDate}</TransferDate>
    <BrandAAIAID>${row.brandAaiaId}</BrandAAIAID>
    <DocumentTitle>ACES Export</DocumentTitle>
    <EffectiveDate>${currentDate}</EffectiveDate>
    <ApprovedFor>US</ApprovedFor>
    <SubmissionType>FULL</SubmissionType>
    <VcdbVersionDate>2022-06-24</VcdbVersionDate>
    <QdbVersionDate>2015-05-26</QdbVersionDate>
    <PcdbVersionDate>2022-07-08</PcdbVersionDate>
  </Header>`;
  
  // Generate App entries for each part number × each BaseVehicle ID
  let appId = 1;
  const apps: string[] = [];
  
  for (const partRow of rows) {
    for (const baseVehicleId of baseVehicleIds) {
      apps.push(`  <App action="A" id="${appId}">
    <BaseVehicle id="${baseVehicleId}" /><Note />
    <Qty>1</Qty>
    <PartType id="${partRow.partTypeId}" />
    <Part>${partRow.partNumber}</Part>
  </App>`);
      appId++;
    }
  }
  
  const recordCount = apps.length;
  const footer = `  <Footer>\n    <RecordCount>${recordCount}</RecordCount>\n  </Footer>`;
  return header + '\n' + apps.join('\n') + '\n' + footer + '\n</ACES>';
}

export function buildMegaSuperXml(rows: AcesRow[]): string {
  return buildXmlFromIds(megaSuperIds, rows);
}

// Sep 2026 update — synced to VCdb 2026-09-24: new 2024-2027 mainstream BVs, short year-gap fills, stale IDs removed
export function buildMegaSuperSep2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(megaSuperSep2026Ids, rows);
}

export function buildScWoIhrXml(rows: AcesRow[]): string {
  return buildXmlFromIds(scWoIhrIds, rows);
}

// Jun 2026 update — deduped + 572 new BVs (existing-model new years + selected popular non-IHR models)
export function buildScWoIhrJun2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(scWoIhrJun2026Ids, rows);
}

// Sep 2026 update — Jun 2026 list + newly cataloged years (VCdb 2026-09-24) for existing models only, stale IDs removed
export function buildScWoIhrSep2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(scWoIhrSep2026Ids, rows);
}

export function buildSwc15InchXml(rows: AcesRow[]): string {
  return buildXmlFromIds(swc15InchIds, rows);
}

export function buildSwc16InchXml(rows: AcesRow[]): string {
  return buildXmlFromIds(swc16InchIds, rows);
}

// Jun 2026 update — deduped, year reassignments per SWC_template_by_year.xlsx, +2026/2027 new years
export function buildSwc15InchJun2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(swc15InchJun2026Ids, rows);
}

export function buildSwc16InchJun2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(swc16InchJun2026Ids, rows);
}

// Sep 2026 update — Jun 2026 lists + new model-years from VCdb 2026-09-24, steering wheel size re-checked
export function buildSwc15InchSep2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(swc15InchSep2026Ids, rows);
}

export function buildSwc16InchSep2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(swc16InchSep2026Ids, rows);
}

export function buildVc0Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(vc0Ids, rows);
}

export function buildVc1Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(vc1Ids, rows);
}

export function buildVc2Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(vc2Ids, rows);
}

export function buildVc3Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(vc3Ids, rows);
}

export function buildCc1Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(cc1Ids, rows);
}

export function buildCc2Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(cc2Ids, rows);
}

export function buildCc3Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(cc3Ids, rows);
}

export function buildCc4Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(cc4Ids, rows);
}

export function buildCc5Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(cc5Ids, rows);
}

// Aug 2026 update — deduped, stale VCdb IDs removed, +513 missing model-years
// (existing-model new years from VCdb 2026-05-28, size-guide verified:
//  CC1<=157in, CC2<=170in, CC3<=190in, CC4<=210in, CC5<=228in)
export function buildCc1Aug2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(cc1Aug2026Ids, rows);
}

export function buildCc2Aug2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(cc2Aug2026Ids, rows);
}

export function buildCc3Aug2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(cc3Aug2026Ids, rows);
}

export function buildCc4Aug2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(cc4Aug2026Ids, rows);
}

export function buildCc5Aug2026Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(cc5Aug2026Ids, rows);
}

// CC3+CC4 combined (Aug 2026 data) — Large + XL1 in one template, no overlap
export function buildCc3Cc4Xml(rows: AcesRow[]): string {
  return buildXmlFromIds(cc3Cc4Ids, rows);
}

// --- Windshield Cover (AS) ---
export function buildAsSmallXml(rows: AcesRow[]): string { return buildXmlFromIds(asSmallIds, rows); }
export function buildAsMediumXml(rows: AcesRow[]): string { return buildXmlFromIds(asMediumIds, rows); }
export function buildAsLargeXml(rows: AcesRow[]): string { return buildXmlFromIds(asLargeIds, rows); }
export function buildAsXlargeXml(rows: AcesRow[]): string { return buildXmlFromIds(asXlargeIds, rows); }
export function buildAs5824Xml(rows: AcesRow[]): string { return buildXmlFromIds(as5824Ids, rows); }
export function buildAs6627Xml(rows: AcesRow[]): string { return buildXmlFromIds(as6627Ids, rows); }

// --- Tonneau Cover (MBTN) ---
export function buildMbtn1111Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn1111Ids, rows); }
export function buildMbtn1155Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn1155Ids, rows); }
export function buildMbtn1466Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn1466Ids, rows); }
export function buildMbtn1476Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn1476Ids, rows); }
export function buildMbtn2223Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn2223Ids, rows); }
export function buildMbtn2243Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn2243Ids, rows); }
export function buildMbtn2254Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn2254Ids, rows); }
export function buildMbtn3332Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn3332Ids, rows); }
export function buildMbtn3342Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn3342Ids, rows); }
export function buildMbtn3587Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn3587Ids, rows); }
export function buildMbtn3687Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn3687Ids, rows); }
export function buildMbtn3710Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn3710Ids, rows); }
export function buildMbtn3f2223Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn3f2223Ids, rows); }
export function buildMbtn4820Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn4820Ids, rows); }
export function buildMbtn5910Xml(rows: AcesRow[]): string { return buildXmlFromIds(mbtn5910Ids, rows); }

// --- Floor Mat (CAMT) ---
export function buildCamt3103Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3103Ids, rows); }
export function buildCamt3143Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3143Ids, rows); }
export function buildCamt3201Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3201Ids, rows); }
export function buildCamt3202Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3202Ids, rows); }
export function buildCamt3301Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3301Ids, rows); }
export function buildCamt3302Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3302Ids, rows); }
export function buildCamt3303Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3303Ids, rows); }
export function buildCamt3304Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3304Ids, rows); }
export function buildCamt3401Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3401Ids, rows); }
export function buildCamt3501Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3501Ids, rows); }
export function buildCamt3502Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3502Ids, rows); }
export function buildCamt3519Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3519Ids, rows); }
export function buildCamt3523Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3523Ids, rows); }
export function buildCamt3603Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3603Ids, rows); }
export function buildCamt3613Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3613Ids, rows); }
export function buildCamt3624Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3624Ids, rows); }
export function buildCamt3703Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3703Ids, rows); }
export function buildCamt3713Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3713Ids, rows); }
export function buildCamt3111Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3111Ids, rows); }
export function buildCamt3112Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3112Ids, rows); }
export function buildCamt3121Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3121Ids, rows); }
export function buildCamt3122Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3122Ids, rows); }
export function buildCamt3131Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3131Ids, rows); }
export function buildCamt3132Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3132Ids, rows); }
export function buildCamt3148Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3148Ids, rows); }
export function buildCamt3153Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3153Ids, rows); }
export function buildCamt3163Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3163Ids, rows); }
export function buildCamt3173Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3173Ids, rows); }
export function buildCamt3183Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3183Ids, rows); }
export function buildCamt3184Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3184Ids, rows); }
export function buildCamt3193Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3193Ids, rows); }
export function buildCamt3213Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3213Ids, rows); }
export function buildCamt3218Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3218Ids, rows); }
export function buildCamt3223Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3223Ids, rows); }
export function buildCamt3308Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3308Ids, rows); }
export function buildCamt3333Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3333Ids, rows); }
export function buildCamt3334Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3334Ids, rows); }
export function buildCamt3338Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3338Ids, rows); }
export function buildCamt3413Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3413Ids, rows); }
export function buildCamt3414Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3414Ids, rows); }
export function buildCamt3423Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3423Ids, rows); }
export function buildCamt3511Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3511Ids, rows); }
export function buildCamt3512Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3512Ids, rows); }
export function buildCamt3521Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3521Ids, rows); }
export function buildCamt3533Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3533Ids, rows); }
export function buildCamt3534Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3534Ids, rows); }
export function buildCamt3542Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3542Ids, rows); }
export function buildCamt3544Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3544Ids, rows); }
export function buildCamt3604Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3604Ids, rows); }
export function buildCamt3618Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3618Ids, rows); }
export function buildCamt3633Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3633Ids, rows); }
export function buildCamt3634Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3634Ids, rows); }
export function buildCamt3638Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3638Ids, rows); }
export function buildCamt3643Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3643Ids, rows); }
export function buildCamt3644Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3644Ids, rows); }
export function buildCamt3648Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3648Ids, rows); }
export function buildCamt3654Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3654Ids, rows); }
export function buildCamt3655Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3655Ids, rows); }
export function buildCamt3658Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3658Ids, rows); }
export function buildCamt3663Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3663Ids, rows); }
export function buildCamt3664Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3664Ids, rows); }
export function buildCamt3673Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3673Ids, rows); }
export function buildCamt3683Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3683Ids, rows); }
export function buildCamt3693Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3693Ids, rows); }
export function buildCamt3694Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3694Ids, rows); }
export function buildCamt3718Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3718Ids, rows); }
export function buildCamt3724Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3724Ids, rows); }
export function buildCamt3734Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3734Ids, rows); }
export function buildCamt3803Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3803Ids, rows); }
export function buildCamt3904Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3904Ids, rows); }
export function buildCamt3905Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3905Ids, rows); }
export function buildCamt3913Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt3913Ids, rows); }
export function buildCamt4104Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt4104Ids, rows); }
export function buildCamt4113Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt4113Ids, rows); }
export function buildCamt4123Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt4123Ids, rows); }
export function buildCamt4135Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt4135Ids, rows); }
export function buildCamt4138Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt4138Ids, rows); }
export function buildCamt4203Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt4203Ids, rows); }
export function buildCamt4303Xml(rows: AcesRow[]): string { return buildXmlFromIds(camt4303Ids, rows); }

// --- Seat Cover ---
export function buildScFronts2026Xml(rows: AcesRow[]): string { return buildXmlFromIds(scFronts2026Ids, rows); }
export function buildScFronts2026JovenXml(rows: AcesRow[]): string { return buildXmlFromIds(scFronts2026JovenIds, rows); }
export function buildScFullBench2026Xml(rows: AcesRow[]): string { return buildXmlFromIds(scFullBench2026Ids, rows); }

// --- Hubcap ---
export function buildUma2025Kt16Xml(rows: AcesRow[]): string { return buildXmlFromIds(uma2025Kt16Ids, rows); }

// --- Truck Cover (CATC-843..847) ---
// Unlike the plain-BV templates above, truck covers depend on cab style, so every
// app carries a BodyType id (17=Regular, 18=Extended, 22=Crew, 43=Extended Crew
// Cab Pickup) and, where one model/cab spans multiple bed lengths across the size
// boundary, a BedLength id. Built from VCdb 2026-05-28, US region.
type CatcApp = { baseVehicleId: number; bodyTypeId: number; bedLengthId: number | null };

function buildXmlFromCatcApps(appsData: CatcApp[], rows: AcesRow[]): string {
  const row = rows[0] || { partNumber: '', brandAaiaId: '', partTypeId: '' };
  const currentDate = new Date().toISOString().split('T')[0];
  const header = `<?xml version="1.0" encoding="utf-8"?>
<ACES version="3.2">
  <Header>
    <Company>BDK Auto</Company>
    <SenderName>BDK User</SenderName>
    <SenderPhone>000-000-0000</SenderPhone>
    <TransferDate>${currentDate}</TransferDate>
    <BrandAAIAID>${row.brandAaiaId}</BrandAAIAID>
    <DocumentTitle>ACES Export</DocumentTitle>
    <EffectiveDate>${currentDate}</EffectiveDate>
    <ApprovedFor>US</ApprovedFor>
    <SubmissionType>FULL</SubmissionType>
    <VcdbVersionDate>2026-05-28</VcdbVersionDate>
    <QdbVersionDate>2015-05-26</QdbVersionDate>
    <PcdbVersionDate>2022-07-08</PcdbVersionDate>
  </Header>`;

  let appId = 1;
  const apps: string[] = [];
  for (const partRow of rows) {
    for (const a of appsData) {
      const bed = a.bedLengthId ? `<BedLength id="${a.bedLengthId}" />` : '';
      apps.push(`  <App action="A" id="${appId}">
    <BaseVehicle id="${a.baseVehicleId}" /><BodyType id="${a.bodyTypeId}" />${bed}<Note />
    <Qty>1</Qty>
    <PartType id="${partRow.partTypeId}" />
    <Part>${partRow.partNumber}</Part>
  </App>`);
      appId++;
    }
  }

  const footer = `  <Footer>\n    <RecordCount>${apps.length}</RecordCount>\n  </Footer>`;
  return header + '\n' + apps.join('\n') + '\n' + footer + '\n</ACES>';
}

const CATC_FITMENT = catcFitment as Record<string, CatcApp[]>;

export function buildCatc843Xml(rows: AcesRow[]): string { return buildXmlFromCatcApps(CATC_FITMENT['CATC-843'], rows); }
export function buildCatc844Xml(rows: AcesRow[]): string { return buildXmlFromCatcApps(CATC_FITMENT['CATC-844'], rows); }
export function buildCatc845Xml(rows: AcesRow[]): string { return buildXmlFromCatcApps(CATC_FITMENT['CATC-845'], rows); }
export function buildCatc846Xml(rows: AcesRow[]): string { return buildXmlFromCatcApps(CATC_FITMENT['CATC-846'], rows); }
export function buildCatc847Xml(rows: AcesRow[]): string { return buildXmlFromCatcApps(CATC_FITMENT['CATC-847'], rows); }
