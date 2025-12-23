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
  buildCc5Xml
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
  'cc-s': buildCc1Xml,      // Small
  'cc-m': buildCc2Xml,      // Medium
  'cc-l': buildCc3Xml,      // Large
  'cc-xl1': buildCc4Xml,    // XL1
  'cc-xl2': buildCc5Xml,    // XL2
  
  // SUV Cover templates (Vehicle Cover)
  'suv-l': buildVc0Xml,
  'suv-xl1': buildVc1Xml,
  'suv-xl2': buildVc2Xml,
  'suv-xl3': buildVc3Xml,
  'vc0': buildVc0Xml,
  'vc1': buildVc1Xml,
  'vc2': buildVc2Xml,
  'vc3': buildVc3Xml,
};

// Helper function to get template for a subcategory
export function getTemplateForSubcategory(subcategoryId: string): TemplateFunction | null {
  return TEMPLATE_REGISTRY[subcategoryId] || null;
}
