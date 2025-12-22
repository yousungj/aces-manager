// Import the pre-extracted BaseVehicle IDs
import megaSuperIds from './data/mega-super-ids.json';
import scWoIhrIds from './data/sc-wo-ihr-ids.json';
import swc15InchIds from './data/swc-15inch-ids.json';
import vc0Ids from './data/vc0-ids.json';
import vc1Ids from './data/vc1-ids.json';
import vc2Ids from './data/vc2-ids.json';
import vc3Ids from './data/vc3-ids.json';

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
  </Header>
  <Apps>`;
  
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
  
  return header + '\n' + apps.join('\n') + '\n</Apps>\n</ACES>';
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
