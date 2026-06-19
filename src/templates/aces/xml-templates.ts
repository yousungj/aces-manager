// Import the pre-extracted BaseVehicle IDs
import megaSuperIds from './data/mega-super-ids.json';
import scWoIhrIds from './data/sc-wo-ihr-ids.json';
import swc15InchIds from './data/swc-15inch-ids.json';
import swc16InchIds from './data/swc-16inch-ids.json';
import swc15InchJun2026Ids from './data/swc-15inch-jun2026-ids.json';
import swc16InchJun2026Ids from './data/swc-16inch-jun2026-ids.json';
import vc0Ids from './data/vc0-ids.json';
import vc1Ids from './data/vc1-ids.json';
import vc2Ids from './data/vc2-ids.json';
import vc3Ids from './data/vc3-ids.json';
import cc1Ids from './data/cc1-ids.json';
import cc2Ids from './data/cc2-ids.json';
import cc3Ids from './data/cc3-ids.json';
import cc4Ids from './data/cc4-ids.json';
import cc5Ids from './data/cc5-ids.json';
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

export function buildScWoIhrXml(rows: AcesRow[]): string {
  return buildXmlFromIds(scWoIhrIds, rows);
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

// --- Seat Cover ---
export function buildScFronts2026Xml(rows: AcesRow[]): string { return buildXmlFromIds(scFronts2026Ids, rows); }
export function buildScFronts2026JovenXml(rows: AcesRow[]): string { return buildXmlFromIds(scFronts2026JovenIds, rows); }
export function buildScFullBench2026Xml(rows: AcesRow[]): string { return buildXmlFromIds(scFullBench2026Ids, rows); }

// --- Hubcap ---
export function buildUma2025Kt16Xml(rows: AcesRow[]): string { return buildXmlFromIds(uma2025Kt16Ids, rows); }
