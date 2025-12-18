# Adding New XML Templates

## Overview
Each subcategory (like "a. Mega_super", "b. Small-14 inch", etc.) is automatically linked to a specific XML template function. When users select a subcategory and generate XML, the system uses the pre-configured template.

## How to Add a New Template

### Step 1: Create the Template Function

Create a new file in `src/templates/aces/` (e.g., `mega-super.ts`):

```typescript
type AcesRow = {
  partNumber: string;
  partTypeId: string;
  brandAaiaId: string;
  baseVehicleId?: string;
};

export function buildMegaSuperXml(rows: AcesRow[]) {
  // 1. XML Header
  const header = `<?xml version="1.0" encoding="utf-8"?>
<ACES version="3.2">
  <Header>
    <Company>BDK Auto</Company>
    <SenderName>BDK User</SenderName>
    <Date>${new Date().toISOString().split("T")[0]}</Date>
  </Header>
  <Apps>`;

  // 2. Generate XML for each row
  const body = rows.map((row, index) => {
    return `    <App action="A" id="${index + 1}">
      <BaseVehicle id="${row.baseVehicleId || '0'}"/>
      <PartType id="${row.partTypeId}"/>
      <Position id="1"/>
      <Qty>1</Qty>
      <Part>${row.partNumber}</Part>
      <BrandAAIAID>${row.brandAaiaId}</BrandAAIAID>
    </App>`;
  }).join('\n');

  // 3. XML Footer
  const footer = `  </Apps>
</ACES>`;

  return header + '\n' + body + '\n' + footer;
}
```

### Step 2: Register the Template

Open `src/templates/template-registry.ts` and add your template:

```typescript
import { buildSeatCoverXml } from './aces/seat-cover';
import { buildMegaSuperXml } from './aces/mega-super'; // Import your new template

export const TEMPLATE_REGISTRY: Record<string, TemplateFunction> = {
  // Map subcategory ID to template function
  'mega-super': buildMegaSuperXml,  // Your new template
  'mega-wo-int': buildSeatCoverXml,
  // ... other mappings
};
```

### Step 3: Test

1. Select the subcategory in the UI (e.g., "1. Mega" → "a. Mega_super")
2. Enter part numbers, brand, and part type
3. Click "Generate & Download"
4. The XML will use your new template!

## Template Mapping Reference

Current mappings in `template-registry.ts`:

| Subcategory ID | Template Function | Location |
|----------------|-------------------|----------|
| `mega-super` | `buildSeatCoverXml` | `src/templates/aces/seat-cover.ts` |
| `mega-wo-int` | `buildSeatCoverXml` | `src/templates/aces/seat-cover.ts` |
| `swc-s` | `buildSeatCoverXml` | `src/templates/aces/seat-cover.ts` |
| ... | ... | ... |

## Template Function Requirements

Your template function must:
- Accept `rows: AcesRow[]` as parameter
- Return a complete XML string
- Handle multiple rows (for bulk generation)
- Include proper ACES XML structure

## Available Data in Each Row

```typescript
{
  partNumber: string;      // e.g., "MT-923"
  partTypeId: string;      // e.g., "1316" (from PART_TYPE_OPTIONS)
  brandAaiaId: string;     // e.g., "GFLT" (from BRAND_OPTIONS)
  baseVehicleId?: string;  // Optional, defaults to '0'
}
```
