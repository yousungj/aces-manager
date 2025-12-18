// Import base vehicle IDs from JSON files (generated at build time)
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

// Helper to build XML from base vehicle IDs
function buildXmlFromIds(baseVehicleIds: string[], rows: AcesRow[]): string {
  // Get the first row's data (all rows should have same part/brand/type for a template)
  const row = rows[0] || { partNumber: '', brandAaiaId: '', partTypeId: '' };
  const currentDate = new Date().toISOString().split('T')[0];
  
  // XML Header
  const header = `<?xml version="1.0" encoding="utf-8"?>
<ACES version="3.0">
  <Header>
    <Company>BDK Auto</Company>
    <SenderName>BDK User</SenderName>
    <SenderPhone>000-000-0000</SenderPhone>
    <TransferDate>${currentDate}</TransferDate>
    <BrandAAIAID>${row.brandAaiaId}</BrandAAIAID>
    <DocumentTitle>${row.partNumber}</DocumentTitle>
    <EffectiveDate>${currentDate}</EffectiveDate>
    <ApprovedFor>US</ApprovedFor>
    <SubmissionType>FULL</SubmissionType>
    <VcdbVersionDate>2022-06-24</VcdbVersionDate>
    <QdbVersionDate>2015-05-26</QdbVersionDate>
    <PcdbVersionDate>2022-07-08</PcdbVersionDate>
  </Header>`;
  
  // Generate App entries with BaseVehicle IDs
  const apps = baseVehicleIds.map((baseVehicleId, index) => {
    return `  <App action="A" id="${index + 1}">
    <BaseVehicle id="${baseVehicleId}" /><Note></Note>
    <Qty>1</Qty>
    <PartType id="${row.partTypeId}" />
    <Part>${row.partNumber}</Part>
  </App>`;
  }).join('\n');
  
  return `${header}\n${apps}\n</ACES>`;
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
