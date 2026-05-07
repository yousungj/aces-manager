// Auto-generated: vehicle-type templates derived from AutoCare VCdb
// Source: AutoCare_VCdb_NA_LDPS_enUS_JSON_20260430 (VehicleTypeID=6 -> Truck)
// 9,833 BaseVehicleIDs covering every truck make/model/year in the catalog.

import truckAllIds from './data/truck-all-ids.json';

type AcesRow = {
  partNumber: string;
  partTypeId: string;
  brandAaiaId: string;
  baseVehicleId?: string;
};

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
    <VcdbVersionDate>2026-04-30</VcdbVersionDate>
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

// Truck (All) — every truck BV (VehicleTypeID=6) in VCdb 2026-04-30
export function buildTruckAllXml(rows: AcesRow[]): string {
  return buildXml(truckAllIds as number[], rows, 'A');
}
