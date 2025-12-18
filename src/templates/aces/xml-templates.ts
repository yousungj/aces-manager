import * as fs from 'fs';
import * as path from 'path';

type AcesRow = {
  partNumber: string;
  partTypeId: string;
  brandAaiaId: string;
  baseVehicleId?: string;
};

// Helper to read and parse XML template
function parseXmlTemplate(xmlPath: string, rows: AcesRow[]): string {
  // Read the XML file
  const xmlContent = fs.readFileSync(path.join(__dirname, xmlPath), 'utf-8');
  
  // Extract header and footer
  const headerMatch = xmlContent.match(/([\s\S]*?)<App/);
  const header = headerMatch ? headerMatch[1] : '';
  
  // Parse all App entries to get BaseVehicle IDs
  const appRegex = /<App[^>]*>[\s\S]*?<BaseVehicle id="(\d+)"[\s\S]*?<\/App>/g;
  const baseVehicleIds: string[] = [];
  let match;
  
  while ((match = appRegex.exec(xmlContent)) !== null) {
    baseVehicleIds.push(match[1]);
  }
  
  // Get the first row's data (all rows should have same part/brand/type for a template)
  const row = rows[0] || { partNumber: '', brandAaiaId: '', partTypeId: '' };
  
  // Update header with new brand and date
  let updatedHeader = header.replace(
    /<BrandAAIAID>.*?<\/BrandAAIAID>/,
    `<BrandAAIAID>${row.brandAaiaId}</BrandAAIAID>`
  );
  updatedHeader = updatedHeader.replace(
    /<TransferDate>.*?<\/TransferDate>/,
    `<TransferDate>${new Date().toISOString().split('T')[0]}</TransferDate>`
  );
  updatedHeader = updatedHeader.replace(
    /<EffectiveDate>.*?<\/EffectiveDate>/,
    `<EffectiveDate>${new Date().toISOString().split('T')[0]}</EffectiveDate>`
  );
  
  // Generate App entries with BaseVehicle IDs from template
  const apps = baseVehicleIds.map((baseVehicleId, index) => {
    return `<App action="A" id="${index + 1}">
                <BaseVehicle id="${baseVehicleId}" /><Note />
                <Qty>1</Qty>
                <PartType id="${row.partTypeId}" />
                <Part>${row.partNumber}</Part>
            </App>`;
  }).join('');
  
  return updatedHeader + apps + '\n</ACES>';
}

export function buildMegaSuperXml(rows: AcesRow[]): string {
  return parseXmlTemplate('./aces/Mega_super.xml', rows);
}

export function buildScWoIhrXml(rows: AcesRow[]): string {
  return parseXmlTemplate('./aces/SC_WO_IHR.xml', rows);
}

export function buildSwc15InchXml(rows: AcesRow[]): string {
  return parseXmlTemplate('./aces/SWC_15inch.xml', rows);
}

export function buildVc0Xml(rows: AcesRow[]): string {
  return parseXmlTemplate('./aces/VC0.xml', rows);
}

export function buildVc1Xml(rows: AcesRow[]): string {
  return parseXmlTemplate('./aces/VC1.xml', rows);
}

export function buildVc2Xml(rows: AcesRow[]): string {
  return parseXmlTemplate('./aces/VC2.xml', rows);
}

export function buildVc3Xml(rows: AcesRow[]): string {
  return parseXmlTemplate('./aces/VC3.xml', rows);
}
