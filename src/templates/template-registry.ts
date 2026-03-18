import { buildSeatCoverXml } from './aces/seat-cover';
import {
  buildMegaSuperXml,
  buildScWoIhrXml,
  buildSwc15InchXml,
  buildSwc16InchXml,
  buildVc0Xml,
  buildVc1Xml,
  buildVc2Xml,
  buildVc3Xml,
  buildCc1Xml,
  buildCc2Xml,
  buildCc3Xml,
  buildCc4Xml,
  buildCc5Xml,
  // Windshield Cover
  buildAsSmallXml,
  buildAsMediumXml,
  buildAsLargeXml,
  buildAsXlargeXml,
  buildAs5824Xml,
  buildAs6627Xml,
  // Tonneau Cover
  buildMbtn1111Xml,
  buildMbtn1155Xml,
  buildMbtn1466Xml,
  buildMbtn1476Xml,
  buildMbtn2223Xml,
  buildMbtn2243Xml,
  buildMbtn2254Xml,
  buildMbtn3332Xml,
  buildMbtn3342Xml,
  buildMbtn3587Xml,
  buildMbtn3687Xml,
  buildMbtn3710Xml,
  buildMbtn3f2223Xml,
  buildMbtn4820Xml,
  buildMbtn5910Xml,
  // Floor Mat
  buildCamt3103Xml,
  buildCamt3143Xml,
  buildCamt3201Xml,
  buildCamt3202Xml,
  buildCamt3301Xml,
  buildCamt3302Xml,
  buildCamt3303Xml,
  buildCamt3304Xml,
  buildCamt3401Xml,
  buildCamt3501Xml,
  buildCamt3502Xml,
  buildCamt3519Xml,
  buildCamt3523Xml,
  buildCamt3603Xml,
  buildCamt3613Xml,
  buildCamt3624Xml,
  buildCamt3703Xml,
  buildCamt3713Xml,
  // Seat Cover
  buildScFronts2026Xml,
  buildScFronts2026JovenXml,
  buildScFullBench2026Xml,
  // Hubcap
  buildUma2025Kt16Xml,
} from './aces/xml-templates';

// Type for template functions
type AcesRow = {
  partNumber: string;
  partTypeId: string;
  brandAaiaId: string;
  baseVehicleId?: string;
};

export type TemplateFunction = (rows: AcesRow[]) => string;

// Template registry - maps subcategory IDs to their XML template functions
export const TEMPLATE_REGISTRY: Record<string, TemplateFunction> = {
  // Mega templates
  'mega-super': buildMegaSuperXml,
  'mega-wo-int': buildScWoIhrXml,
  'sc-wo-ihr': buildScWoIhrXml,

  // SWC templates
  'swc-s': buildSwc15InchXml,
  'swc-m': buildSwc15InchXml,
  'swc-l': buildSwc16InchXml,
  'swc-xl1': buildSwc15InchXml,
  'swc-15inch': buildSwc15InchXml,

  // Car Cover templates
  'cc-s': buildCc1Xml,
  'cc-m': buildCc2Xml,
  'cc-l': buildCc3Xml,
  'cc-xl1': buildCc4Xml,
  'cc-xl2': buildCc5Xml,

  // SUV Cover templates (Vehicle Cover)
  'suv-l': buildVc0Xml,
  'suv-xl1': buildVc1Xml,
  'suv-xl2': buildVc2Xml,
  'suv-xl3': buildVc3Xml,
  'vc0': buildVc0Xml,
  'vc1': buildVc1Xml,
  'vc2': buildVc2Xml,
  'vc3': buildVc3Xml,

  // Windshield Cover (AS)
  'as-small': buildAsSmallXml,
  'as-medium': buildAsMediumXml,
  'as-large': buildAsLargeXml,
  'as-xlarge': buildAsXlargeXml,
  'as-58-24': buildAs5824Xml,
  'as-66-27': buildAs6627Xml,

  // Tonneau Cover (MBTN)
  'mbtn-1111-bf': buildMbtn1111Xml,
  'mbtn-1155-bf': buildMbtn1155Xml,
  'mbtn-1466-bf': buildMbtn1466Xml,
  'mbtn-1476-bf': buildMbtn1476Xml,
  'mbtn-2223-bf': buildMbtn2223Xml,
  'mbtn-2243-bf': buildMbtn2243Xml,
  'mbtn-2254-bf': buildMbtn2254Xml,
  'mbtn-3332-bf': buildMbtn3332Xml,
  'mbtn-3342-bf': buildMbtn3342Xml,
  'mbtn-3587-bf': buildMbtn3587Xml,
  'mbtn-3687-bf': buildMbtn3687Xml,
  'mbtn-3710-bf': buildMbtn3710Xml,
  'mbtn-3f-2223-bf': buildMbtn3f2223Xml,
  'mbtn-4820-bf': buildMbtn4820Xml,
  'mbtn-5910-bf': buildMbtn5910Xml,

  // Floor Mat (CAMT)
  'camt-3103': buildCamt3103Xml,
  'camt-3143-bk': buildCamt3143Xml,
  'camt-3201-bk': buildCamt3201Xml,
  'camt-3202-bk': buildCamt3202Xml,
  'camt-3301-bk': buildCamt3301Xml,
  'camt-3302-bk': buildCamt3302Xml,
  'camt-3303-bk': buildCamt3303Xml,
  'camt-3304-bk': buildCamt3304Xml,
  'camt-3401-bk': buildCamt3401Xml,
  'camt-3501-bk': buildCamt3501Xml,
  'camt-3502-bk': buildCamt3502Xml,
  'camt-3519': buildCamt3519Xml,
  'camt-3523-bk': buildCamt3523Xml,
  'camt-3603-bk': buildCamt3603Xml,
  'camt-3613-bk': buildCamt3613Xml,
  'camt-3624-bk': buildCamt3624Xml,
  'camt-3703-bk': buildCamt3703Xml,
  'camt-3713-bk': buildCamt3713Xml,

  // Seat Cover
  'sc-fronts-2026': buildScFronts2026Xml,
  'sc-fronts-2026-joven': buildScFronts2026JovenXml,
  'sc-full-bench-2026': buildScFullBench2026Xml,

  // Hubcap
  'uma2025-kt16': buildUma2025Kt16Xml,
};

// Helper function to get template for a subcategory
export function getTemplateForSubcategory(subcategoryId: string): TemplateFunction | null {
  return TEMPLATE_REGISTRY[subcategoryId] || null;
}
