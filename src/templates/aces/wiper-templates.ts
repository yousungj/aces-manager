// Auto-generated: wiper size templates + ACES delete template
// BaseVehicleID lists derived from aces_by_size_v6 output

import wiper13X13Ids from './data/wiper-13x13-ids.json';
import wiper15X15Ids from './data/wiper-15x15-ids.json';
import wiper16X16Ids from './data/wiper-16x16-ids.json';
import wiper17X17Ids from './data/wiper-17x17-ids.json';
import wiper18X15Ids from './data/wiper-18x15-ids.json';
import wiper18X17Ids from './data/wiper-18x17-ids.json';
import wiper18X18Ids from './data/wiper-18x18-ids.json';
import wiper19X17Ids from './data/wiper-19x17-ids.json';
import wiper19X18Ids from './data/wiper-19x18-ids.json';
import wiper19X19Ids from './data/wiper-19x19-ids.json';
import wiper20X16Ids from './data/wiper-20x16-ids.json';
import wiper20X17Ids from './data/wiper-20x17-ids.json';
import wiper20X18Ids from './data/wiper-20x18-ids.json';
import wiper20X19Ids from './data/wiper-20x19-ids.json';
import wiper20X20Ids from './data/wiper-20x20-ids.json';
import wiper21X17Ids from './data/wiper-21x17-ids.json';
import wiper21X18Ids from './data/wiper-21x18-ids.json';
import wiper21X19Ids from './data/wiper-21x19-ids.json';
import wiper21X20Ids from './data/wiper-21x20-ids.json';
import wiper21X21Ids from './data/wiper-21x21-ids.json';
import wiper22X14Ids from './data/wiper-22x14-ids.json';
import wiper22X16Ids from './data/wiper-22x16-ids.json';
import wiper22X17Ids from './data/wiper-22x17-ids.json';
import wiper22X18Ids from './data/wiper-22x18-ids.json';
import wiper22X19Ids from './data/wiper-22x19-ids.json';
import wiper22X20Ids from './data/wiper-22x20-ids.json';
import wiper22X21Ids from './data/wiper-22x21-ids.json';
import wiper22X22Ids from './data/wiper-22x22-ids.json';
import wiper24X14Ids from './data/wiper-24x14-ids.json';
import wiper24X15Ids from './data/wiper-24x15-ids.json';
import wiper24X16Ids from './data/wiper-24x16-ids.json';
import wiper24X17Ids from './data/wiper-24x17-ids.json';
import wiper24X18Ids from './data/wiper-24x18-ids.json';
import wiper24X19Ids from './data/wiper-24x19-ids.json';
import wiper24X20Ids from './data/wiper-24x20-ids.json';
import wiper24X21Ids from './data/wiper-24x21-ids.json';
import wiper24X22Ids from './data/wiper-24x22-ids.json';
import wiper24X24Ids from './data/wiper-24x24-ids.json';
import wiper26X14Ids from './data/wiper-26x14-ids.json';
import wiper26X15Ids from './data/wiper-26x15-ids.json';
import wiper26X16Ids from './data/wiper-26x16-ids.json';
import wiper26X17Ids from './data/wiper-26x17-ids.json';
import wiper26X18Ids from './data/wiper-26x18-ids.json';
import wiper26X19Ids from './data/wiper-26x19-ids.json';
import wiper26X20Ids from './data/wiper-26x20-ids.json';
import wiper26X21Ids from './data/wiper-26x21-ids.json';
import wiper26X22Ids from './data/wiper-26x22-ids.json';
import wiper26X24Ids from './data/wiper-26x24-ids.json';
import wiper26X26Ids from './data/wiper-26x26-ids.json';
import wiper28X12Ids from './data/wiper-28x12-ids.json';
import wiper28X14Ids from './data/wiper-28x14-ids.json';
import wiper28X15Ids from './data/wiper-28x15-ids.json';
import wiper28X16Ids from './data/wiper-28x16-ids.json';
import wiper28X17Ids from './data/wiper-28x17-ids.json';
import wiper28X18Ids from './data/wiper-28x18-ids.json';
import wiper28X20Ids from './data/wiper-28x20-ids.json';
import wiper28X21Ids from './data/wiper-28x21-ids.json';
import wiper28X24Ids from './data/wiper-28x24-ids.json';
import wiper28X26Ids from './data/wiper-28x26-ids.json';
import wiper28X28Ids from './data/wiper-28x28-ids.json';
import acesDeleteIds from './data/aces-delete-ids.json';

type AcesRow = {
  partNumber: string;
  partTypeId: string;
  brandAaiaId: string;
  baseVehicleId?: string;
};

// Internal: shared XML builder. `action` is either 'A' (add) or 'D' (delete).
function buildXml(baseVehicleIds: (string | number)[], rows: AcesRow[], action: 'A' | 'D'): string {
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
    <VcdbVersionDate>2022-06-24</VcdbVersionDate>
    <QdbVersionDate>2015-05-26</QdbVersionDate>
    <PcdbVersionDate>2022-07-08</PcdbVersionDate>
  </Header>`;

  let appId = 1;
  const apps: string[] = [];
  for (const partRow of rows) {
    for (const baseVehicleId of baseVehicleIds) {
      apps.push(`  <App action="${action}" id="${appId}">
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

// Wiper size templates (action='A')
export function buildWiper13X13Xml(rows: AcesRow[]): string { return buildXml(wiper13X13Ids as number[], rows, 'A'); }
export function buildWiper15X15Xml(rows: AcesRow[]): string { return buildXml(wiper15X15Ids as number[], rows, 'A'); }
export function buildWiper16X16Xml(rows: AcesRow[]): string { return buildXml(wiper16X16Ids as number[], rows, 'A'); }
export function buildWiper17X17Xml(rows: AcesRow[]): string { return buildXml(wiper17X17Ids as number[], rows, 'A'); }
export function buildWiper18X15Xml(rows: AcesRow[]): string { return buildXml(wiper18X15Ids as number[], rows, 'A'); }
export function buildWiper18X17Xml(rows: AcesRow[]): string { return buildXml(wiper18X17Ids as number[], rows, 'A'); }
export function buildWiper18X18Xml(rows: AcesRow[]): string { return buildXml(wiper18X18Ids as number[], rows, 'A'); }
export function buildWiper19X17Xml(rows: AcesRow[]): string { return buildXml(wiper19X17Ids as number[], rows, 'A'); }
export function buildWiper19X18Xml(rows: AcesRow[]): string { return buildXml(wiper19X18Ids as number[], rows, 'A'); }
export function buildWiper19X19Xml(rows: AcesRow[]): string { return buildXml(wiper19X19Ids as number[], rows, 'A'); }
export function buildWiper20X16Xml(rows: AcesRow[]): string { return buildXml(wiper20X16Ids as number[], rows, 'A'); }
export function buildWiper20X17Xml(rows: AcesRow[]): string { return buildXml(wiper20X17Ids as number[], rows, 'A'); }
export function buildWiper20X18Xml(rows: AcesRow[]): string { return buildXml(wiper20X18Ids as number[], rows, 'A'); }
export function buildWiper20X19Xml(rows: AcesRow[]): string { return buildXml(wiper20X19Ids as number[], rows, 'A'); }
export function buildWiper20X20Xml(rows: AcesRow[]): string { return buildXml(wiper20X20Ids as number[], rows, 'A'); }
export function buildWiper21X17Xml(rows: AcesRow[]): string { return buildXml(wiper21X17Ids as number[], rows, 'A'); }
export function buildWiper21X18Xml(rows: AcesRow[]): string { return buildXml(wiper21X18Ids as number[], rows, 'A'); }
export function buildWiper21X19Xml(rows: AcesRow[]): string { return buildXml(wiper21X19Ids as number[], rows, 'A'); }
export function buildWiper21X20Xml(rows: AcesRow[]): string { return buildXml(wiper21X20Ids as number[], rows, 'A'); }
export function buildWiper21X21Xml(rows: AcesRow[]): string { return buildXml(wiper21X21Ids as number[], rows, 'A'); }
export function buildWiper22X14Xml(rows: AcesRow[]): string { return buildXml(wiper22X14Ids as number[], rows, 'A'); }
export function buildWiper22X16Xml(rows: AcesRow[]): string { return buildXml(wiper22X16Ids as number[], rows, 'A'); }
export function buildWiper22X17Xml(rows: AcesRow[]): string { return buildXml(wiper22X17Ids as number[], rows, 'A'); }
export function buildWiper22X18Xml(rows: AcesRow[]): string { return buildXml(wiper22X18Ids as number[], rows, 'A'); }
export function buildWiper22X19Xml(rows: AcesRow[]): string { return buildXml(wiper22X19Ids as number[], rows, 'A'); }
export function buildWiper22X20Xml(rows: AcesRow[]): string { return buildXml(wiper22X20Ids as number[], rows, 'A'); }
export function buildWiper22X21Xml(rows: AcesRow[]): string { return buildXml(wiper22X21Ids as number[], rows, 'A'); }
export function buildWiper22X22Xml(rows: AcesRow[]): string { return buildXml(wiper22X22Ids as number[], rows, 'A'); }
export function buildWiper24X14Xml(rows: AcesRow[]): string { return buildXml(wiper24X14Ids as number[], rows, 'A'); }
export function buildWiper24X15Xml(rows: AcesRow[]): string { return buildXml(wiper24X15Ids as number[], rows, 'A'); }
export function buildWiper24X16Xml(rows: AcesRow[]): string { return buildXml(wiper24X16Ids as number[], rows, 'A'); }
export function buildWiper24X17Xml(rows: AcesRow[]): string { return buildXml(wiper24X17Ids as number[], rows, 'A'); }
export function buildWiper24X18Xml(rows: AcesRow[]): string { return buildXml(wiper24X18Ids as number[], rows, 'A'); }
export function buildWiper24X19Xml(rows: AcesRow[]): string { return buildXml(wiper24X19Ids as number[], rows, 'A'); }
export function buildWiper24X20Xml(rows: AcesRow[]): string { return buildXml(wiper24X20Ids as number[], rows, 'A'); }
export function buildWiper24X21Xml(rows: AcesRow[]): string { return buildXml(wiper24X21Ids as number[], rows, 'A'); }
export function buildWiper24X22Xml(rows: AcesRow[]): string { return buildXml(wiper24X22Ids as number[], rows, 'A'); }
export function buildWiper24X24Xml(rows: AcesRow[]): string { return buildXml(wiper24X24Ids as number[], rows, 'A'); }
export function buildWiper26X14Xml(rows: AcesRow[]): string { return buildXml(wiper26X14Ids as number[], rows, 'A'); }
export function buildWiper26X15Xml(rows: AcesRow[]): string { return buildXml(wiper26X15Ids as number[], rows, 'A'); }
export function buildWiper26X16Xml(rows: AcesRow[]): string { return buildXml(wiper26X16Ids as number[], rows, 'A'); }
export function buildWiper26X17Xml(rows: AcesRow[]): string { return buildXml(wiper26X17Ids as number[], rows, 'A'); }
export function buildWiper26X18Xml(rows: AcesRow[]): string { return buildXml(wiper26X18Ids as number[], rows, 'A'); }
export function buildWiper26X19Xml(rows: AcesRow[]): string { return buildXml(wiper26X19Ids as number[], rows, 'A'); }
export function buildWiper26X20Xml(rows: AcesRow[]): string { return buildXml(wiper26X20Ids as number[], rows, 'A'); }
export function buildWiper26X21Xml(rows: AcesRow[]): string { return buildXml(wiper26X21Ids as number[], rows, 'A'); }
export function buildWiper26X22Xml(rows: AcesRow[]): string { return buildXml(wiper26X22Ids as number[], rows, 'A'); }
export function buildWiper26X24Xml(rows: AcesRow[]): string { return buildXml(wiper26X24Ids as number[], rows, 'A'); }
export function buildWiper26X26Xml(rows: AcesRow[]): string { return buildXml(wiper26X26Ids as number[], rows, 'A'); }
export function buildWiper28X12Xml(rows: AcesRow[]): string { return buildXml(wiper28X12Ids as number[], rows, 'A'); }
export function buildWiper28X14Xml(rows: AcesRow[]): string { return buildXml(wiper28X14Ids as number[], rows, 'A'); }
export function buildWiper28X15Xml(rows: AcesRow[]): string { return buildXml(wiper28X15Ids as number[], rows, 'A'); }
export function buildWiper28X16Xml(rows: AcesRow[]): string { return buildXml(wiper28X16Ids as number[], rows, 'A'); }
export function buildWiper28X17Xml(rows: AcesRow[]): string { return buildXml(wiper28X17Ids as number[], rows, 'A'); }
export function buildWiper28X18Xml(rows: AcesRow[]): string { return buildXml(wiper28X18Ids as number[], rows, 'A'); }
export function buildWiper28X20Xml(rows: AcesRow[]): string { return buildXml(wiper28X20Ids as number[], rows, 'A'); }
export function buildWiper28X21Xml(rows: AcesRow[]): string { return buildXml(wiper28X21Ids as number[], rows, 'A'); }
export function buildWiper28X24Xml(rows: AcesRow[]): string { return buildXml(wiper28X24Ids as number[], rows, 'A'); }
export function buildWiper28X26Xml(rows: AcesRow[]): string { return buildXml(wiper28X26Ids as number[], rows, 'A'); }
export function buildWiper28X28Xml(rows: AcesRow[]): string { return buildXml(wiper28X28Ids as number[], rows, 'A'); }

// ACES Delete Template (action='D') — deletes every BaseVehicleID previously submitted
export function buildAcesDeleteXml(rows: AcesRow[]): string { return buildXml(acesDeleteIds as number[], rows, 'D'); }
