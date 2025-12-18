# ACES Manager - AI Agent Instructions

## Project Overview
Next.js 14 (App Router) application for generating ACES XML files for automotive parts catalog data. Manages multi-level product categories (Mega mats, SWC, car/SUV covers) with brand and part type metadata.

## Architecture

### Core Structure
- **[src/app/page.tsx](../src/app/page.tsx)**: Single-page application containing all UI logic (folder navigation, template selection, single/bulk part number entry, preview)
- **[src/templates/aces/](../src/templates/aces/)**: XML generator functions (e.g., `seat-cover.ts`) - each template exports a function that takes rows and returns ACES XML string
- **`app_old/`**: Legacy code - ignore in favor of `src/app/`

### Data Model
Templates organized in 3-level hierarchy stored in localStorage (`aces_tree_v1`):
```typescript
Folder → Subcategory → Template
// Example: "1. Mega" → "a. Mega_super" → "Standard XML"
```

Each generation row requires:
- `partNumber`: Product SKU
- `brandAaiaId`: 4-letter brand code (DGQS, GFLT, etc. - see `BRAND_OPTIONS`)
- `partTypeId`: Numeric ACES part type (1020, 1316, etc. - see `PART_TYPE_OPTIONS`)
- `baseVehicleId`: Optional vehicle linking (not yet implemented)

## Development Commands

```bash
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run lint         # ESLint check (Next.js config)
```

Node.js ≥20 required (see [package.json](../package.json#L26-L28))

## Styling & UI

- **Tailwind CSS v4** + **DaisyUI v5** component library
- Custom Apple-inspired color palette in [tailwind.config.js](../tailwind.config.js#L11-L36)
- Korean locale (`lang="ko"` in [layout.tsx](../src/app/layout.tsx#L11))
- All UI strings currently in Korean - maintain this convention

## Project Conventions

### State Management
- Use React `useState` + `useMemo` - no external state library
- LocalStorage for tree persistence (key: `aces_tree_v1`)
- Client-side only (`'use client'` directive required in [page.tsx](../src/app/page.tsx#L1))

### Component Patterns
- Single-file monolithic component (no component extraction yet)
- Inline utility functions (`classNames`, `splitLines`, `parseBulkParts`)
- DaisyUI classes: `btn`, `card`, `tabs-boxed`, `alert`, `select`

### XML Generation
Template functions in `src/templates/aces/` follow this pattern:
```typescript
export function buildXml(rows: AcesRow[]) {
  const header = `<?xml version="1.0" encoding="utf-8"?>\n<ACES version="3.2">...`;
  const body = rows.map((row, index) => `<App id="${index + 1}">...</App>`).join('\n');
  const footer = `</Apps>\n</ACES>`;
  return header + '\n' + body + '\n' + footer;
}
```
- Current date auto-injected in header
- Sequential `id` attributes starting from 1
- Row index NOT used as `baseVehicleId` (defaults to '0')

## Known Limitations & TODO
- Download/generation not functional (placeholder alerts)
- BaseVehicle linking UI incomplete
- Template upload not implemented
- No backend/API - pure client-side (AWS Lambda + S3 planned)
- Bulk mode uses same brand/partType for all parts

## File Path Conventions
- Use `@/*` alias for root imports (configured in [tsconfig.json](../tsconfig.json#L24-L26))
- CSS: `./globals.css` imports in layout files
- Template imports: Relative paths from `src/app/` to `src/templates/`

## Testing & Validation
- No test suite currently - verify XML output manually in browser preview
- ESLint with Next.js TypeScript rules (strict mode enabled)
