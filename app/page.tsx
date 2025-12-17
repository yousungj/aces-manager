'use client';

import React, { useMemo, useState } from "react";
import { buildSeatCoverXml } from "../src/templates/aces/seat-cover";
/**
 * ACES File Manager (UI)
 *
 * Current scope:
 * - Folder/Subcategory/Template navigation
 * - Generator input UI (Single + Bulk) + Preview
 *
 * Bulk behavior:
 * - Bulk input = list of Part Numbers only (one per line)
 * - Shared Brand + Part Type are selected once via dropdowns
 * - Deduplicate Part Numbers in bulk (preserve first-seen order)
 *
 * NOTE ABOUT THE RECENT ERROR:
 * Some environments injected a literal carriage-return character into regex literals,
 * causing "Unterminated regular expression" at build time.
 * To harden this file, line splitting is now done WITHOUT regex literals.
 *
 * Next steps:
 * - Upload/Edit template XML (S3)
 * - Generate real ACES XML (Lambda) + Download
 */

type AcesTemplate = {
  id: string;
  name: string;
  description?: string;
};

type Subcategory = {
  id: string;
  name: string;
  templates: AcesTemplate[];
};

type Folder = {
  id: string;
  name: string;
  children: Subcategory[];
};

type PathState = {
  level1: string | null;
  level2: string | null;
  template: string | null;
};

type GenerateRow = {
  partNumber: string;
  partTypeId: string;
  brandAaiaId: string;
};

type PreviewState = {
  templateId: string;
  templateName: string;
  mode: "single" | "bulk";
  rows: GenerateRow[];
  note: string;
};

type BrandOption = { code: string; name: string };

type PartTypeOption = { name: string; id: string };

const BRAND_OPTIONS: BrandOption[] = [
  { code: "DGQS", name: "Motor Trend" },
  { code: "JZXV", name: "CAT" },
  { code: "GFLT", name: "BDK" },
  { code: "JZBF", name: "Motor Box" },
  { code: "JNLD", name: "Carbella" },
];

const PART_TYPE_OPTIONS: PartTypeOption[] = [
  { name: "Car cover", id: "1020" },
  { name: "Tonneau Cover", id: "1188" },
  { name: "SWC", id: "57008" },
  { name: "Trunk Mat", id: "47593" },
  { name: "Tailgate mat", id: "16121" },
  { name: "Mat", id: "1300" },
  { name: "Seat Cover", id: "1316" },
  { name: "Trunk Organizer", id: "14290" },
  { name: "Wiper Blade", id: "8852" },
  { name: "Windshield Snow Cover", id: "71066" },
];

// 이 부분 전체를 복사해서 기존 DEFAULT_TREE 자리에 덮어쓰세요.
const DEFAULT_TREE: Folder[] = [
  {
    id: "mega",
    name: "1. Mega",
    children: [
      {
        id: "mega-super",
        name: "a. Mega_super",
        templates: [{ id: "tpl-mega-super", name: "Standard XML" }],
      },
      {
        id: "mega-wo-int",
        name: "b. Mega_WO_Integrated_HR",
        templates: [{ id: "tpl-mega-wo", name: "Standard XML" }],
      },
    ],
  },
  {
    id: "swc",
    name: "2. SWC",
    children: [
      { id: "swc-s", name: "a. Small-14 inch", templates: [{ id: "tpl-swc-s", name: "Standard XML" }] },
      { id: "swc-m", name: "b. Medium-15 inch", templates: [{ id: "tpl-swc-m", name: "Standard XML" }] },
      { id: "swc-l", name: "c. Large-16 inch", templates: [{ id: "tpl-swc-l", name: "Standard XML" }] },
      { id: "swc-xl1", name: "d. XL1-BigRig", templates: [{ id: "tpl-swc-xl1", name: "Standard XML" }] },
    ],
  },
  {
    id: "car-cover",
    name: "3. Car Cover",
    children: [
      { id: "cc-s", name: "a. Small", templates: [{ id: "tpl-cc-s", name: "Standard XML" }] },
      { id: "cc-m", name: "b. Medium", templates: [{ id: "tpl-cc-m", name: "Standard XML" }] },
      { id: "cc-l", name: "c. Large", templates: [{ id: "tpl-cc-l", name: "Standard XML" }] },
      { id: "cc-xl1", name: "d. XL1", templates: [{ id: "tpl-cc-xl1", name: "Standard XML" }] },
      { id: "cc-xl2", name: "e. XL2", templates: [{ id: "tpl-cc-xl2", name: "Standard XML" }] },
    ],
  },
  {
    id: "suv-cover",
    name: "4. SUV Cover",
    children: [
      { id: "suv-l", name: "a. Large", templates: [{ id: "tpl-suv-l", name: "Standard XML" }] },
      { id: "suv-xl1", name: "b. XL1", templates: [{ id: "tpl-suv-xl1", name: "Standard XML" }] },
      { id: "suv-xl2", name: "c. XL2", templates: [{ id: "tpl-suv-xl2", name: "Standard XML" }] },
      { id: "suv-xl3", name: "d. XL3", templates: [{ id: "tpl-suv-xl3", name: "Standard XML" }] },
    ],
  },
];

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-neutral-700">
      {children}
    </span>
  );
}

function Card({
  title,
  subtitle,
  onClick,
  active,
  right,
}: {
  title: string;
  subtitle?: string;
  onClick: () => void;
  active?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "w-full text-left rounded-2xl border bg-white p-4 shadow-sm transition",
        active ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-300",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-neutral-900">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-xs leading-5 text-neutral-600">{subtitle}</div>
          ) : null}
        </div>
        {right}
      </div>
    </button>
  );
}

/**
 * Split text into lines without using regex literals.
 * This avoids build-time "Unterminated regular expression" issues if the file encoding
 * accidentally injects raw CR characters into regex literals.
 */
function splitLines(text: string): string[] {
  const s = text ?? "";
  const lines: string[] = [];
  let buf = "";

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (ch === "\n") {
      lines.push(buf);
      buf = "";
      continue;
    }

    if (ch === "\r") {
      // Handle CRLF: if next is \n, skip it.
      if (i + 1 < s.length && s[i + 1] === "\n") i++;
      lines.push(buf);
      buf = "";
      continue;
    }

    buf += ch;
  }

  // Push final buffer (even if empty).
  lines.push(buf);
  return lines;
}

/**
 * Legacy bulk parser (kept for backward-compat + existing tests).
 * Input per line: partNumber,partTypeId,brandAaiaId
 */
function parseBulk(text: string): GenerateRow[] {
  const rows: GenerateRow[] = [];
  const lines = splitLines(text ?? "");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;

    const parts = trimmed.split(",").map((x) => x.trim());
    if (parts.length < 3) continue;

    const [partNumber, partTypeId, brandAaiaId] = parts;
    if (!partNumber || !partTypeId || !brandAaiaId) continue;

    rows.push({ partNumber, partTypeId, brandAaiaId });
  }

  return rows;
}

/**
 * Bulk parser (new behavior):
 * - Bulk text contains ONLY part numbers
 * - One per line (optional: comma-separated on a single line)
 * - Ignore blank lines and comment lines starting with '#'
 * - Deduplicate while preserving order
 */
function parseBulkParts(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const lines = splitLines(text ?? "");

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) continue;

    const tokens = line
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    for (const t of tokens) {
      if (seen.has(t)) continue;
      seen.add(t);
      out.push(t);
    }
  }

  return out;
}

export default function ACESManagerStep1() {
  const [tree, setTree] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem("aces_tree_v1");
      return saved ? (JSON.parse(saved) as Folder[]) : DEFAULT_TREE;
    } catch {
      return DEFAULT_TREE;
    }
  });

  const [path, setPath] = useState<PathState>({ level1: null, level2: null, template: null });

  const level1 = useMemo(() => tree, [tree]);
  const selectedL1 = useMemo(
    () => level1.find((x) => x.id === path.level1) || null,
    [level1, path.level1],
  );
  const level2 = useMemo(() => selectedL1?.children || [], [selectedL1]);
  const selectedL2 = useMemo(
    () => level2.find((x) => x.id === path.level2) || null,
    [level2, path.level2],
  );
  const templates = useMemo(() => selectedL2?.templates || [], [selectedL2]);
  const selectedTpl = useMemo(
    () => templates.find((t) => t.id === path.template) || null,
    [templates, path.template],
  );

  function persist(nextTree: Folder[]) {
    setTree(nextTree);
    try {
      localStorage.setItem("aces_tree_v1", JSON.stringify(nextTree));
    } catch {
      // ignore
    }
  }

  function addTemplate() {
    if (!selectedL1 || !selectedL2) return;
    const name = prompt("Enter a template name (e.g., ACES Template – 16x16)");
    if (!name) return;

    const newTpl: AcesTemplate = {
      id: `tpl-${Date.now()}`,
      name,
      description: "(Description can be edited later)",
    };

    const next = tree.map((l1) => {
      if (l1.id !== selectedL1.id) return l1;
      return {
        ...l1,
        children: l1.children.map((l2) => {
          if (l2.id !== selectedL2.id) return l2;
          return {
            ...l2,
            templates: [...(l2.templates || []), newTpl],
          };
        }),
      };
    });

    persist(next);
    setPath((p) => ({ ...p, template: newTpl.id }));
  }

  function resetToLevel(level: 1 | 2 | 3) {
    if (level === 1) setPath({ level1: null, level2: null, template: null });
    if (level === 2) setPath((p) => ({ ...p, level2: null, template: null }));
    if (level === 3) setPath((p) => ({ ...p, template: null }));
  }

  const [mode, setMode] = useState<"single" | "bulk">("single");

  // Single mode: still allows overriding everything per part.
  const [singleForm, setSingleForm] = useState<GenerateRow>({
    partNumber: "",
    partTypeId: PART_TYPE_OPTIONS[0]?.id || "",
    brandAaiaId: BRAND_OPTIONS[0]?.code || "",
  });

  // Bulk mode: shared dropdowns
  const [bulkBrandCode, setBulkBrandCode] = useState<string>(BRAND_OPTIONS[0]?.code || "");
  const [bulkPartTypeId, setBulkPartTypeId] = useState<string>(PART_TYPE_OPTIONS[0]?.id || "");

  // Bulk text: part numbers only
  const [bulkText, setBulkText] = useState<string>(`# Paste Part Numbers (one per line)
# Lines starting with # are ignored
BDK-ABC-123
BDK-DEF-456
`);

  const [lastPreview, setLastPreview] = useState<PreviewState | null>(null);

  function updateSingle<K extends keyof GenerateRow>(key: K, value: GenerateRow[K]) {
    setSingleForm((f) => ({ ...f, [key]: value }));
  }

  function previewGeneration() {
    if (!selectedTpl) {
      alert("Please select a template first.");
      return;
    }

    if (mode === "single") {
      const { partNumber, partTypeId, brandAaiaId } = singleForm;
      if (!partNumber || !partTypeId || !brandAaiaId) {
        alert("Fill Part Number, Part Type ID, and Brand Code.");
        return;
      }
      setLastPreview({
        templateId: selectedTpl.id,
        templateName: selectedTpl.name,
        mode: "single",
        rows: [{ partNumber, partTypeId, brandAaiaId }],
        note: "Preview only. Next step will generate real ACES XML (client-side first, then AWS Lambda).",
      });
      return;
    }

    // Bulk mode: part numbers only + shared dropdowns
    if (!bulkBrandCode || !bulkPartTypeId) {
      alert("Select a Brand and Part Type for bulk generation.");
      return;
    }

    const partNumbers = parseBulkParts(bulkText);
    if (partNumbers.length === 0) {
      alert("No valid part numbers found in bulk input.");
      return;
    }

    const rows: GenerateRow[] = partNumbers.map((pn) => ({
      partNumber: pn,
      partTypeId: bulkPartTypeId,
      brandAaiaId: bulkBrandCode,
    }));

    setLastPreview({
      templateId: selectedTpl.id,
      templateName: selectedTpl.name,
      mode: "bulk",
      rows,
      note: "Preview only. Later we will generate multiple ACES XML outputs (zip or batch download).",
    });
  }

// ▼ 이 함수를 새로 추가하세요!
  function comingSoon(label: string) {
  alert(`${label} 기능은 아직 준비 중입니다.`);
}

  function handleDownload() {
    if (!lastPreview || !lastPreview.rows.length) {
      alert("먼저 'Preview' 버튼을 눌러 데이터를 확인해주세요.");
      return;
    }

    // 1. 아까 만든 함수를 써서 XML 글자를 만듭니다.
    // (지금은 모든 카테고리가 이 함수 하나를 같이 씁니다)
    const xmlContent = buildSeatCoverXml(lastPreview.rows);

    // 2. 가상의 파일을 만들어서 다운로드 시킵니다.
    const blob = new Blob([xmlContent], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    // 파일명 예시: aces_output_날짜.xml
    link.download = `aces_output_${Date.now()}.xml`;
    document.body.appendChild(link);
    link.click();
    
    // 뒷정리
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const selectedBulkBrandName = useMemo(() => {
    return BRAND_OPTIONS.find((b) => b.code === bulkBrandCode)?.name || "";
  }, [bulkBrandCode]);

  const selectedBulkPartTypeName = useMemo(() => {
    return PART_TYPE_OPTIONS.find((p) => p.id === bulkPartTypeId)?.name || "";
  }, [bulkPartTypeId]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-neutral-900">ACES File Manager</div>
            <div className="mt-1 text-sm text-neutral-600">
              Step 1: Folder/template browsing UI + generator inputs (preview only)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill>Amazon Vendor</Pill>
            <Pill>Amazon Seller</Pill>
            <Pill>ACES 3.0</Pill>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mt-5 rounded-2xl border bg-white p-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              className={classNames(
                "rounded-lg px-2 py-1",
                path.level1 ? "hover:bg-neutral-100" : "font-semibold",
              )}
              onClick={() => resetToLevel(1)}
              type="button"
            >
              Home
            </button>
            {path.level1 ? <span className="text-neutral-400">/</span> : null}
            {selectedL1 ? (
              <button
                className={classNames(
                  "rounded-lg px-2 py-1",
                  path.level2 ? "hover:bg-neutral-100" : "font-semibold",
                )}
                onClick={() => resetToLevel(2)}
                type="button"
              >
                {selectedL1.name}
              </button>
            ) : null}
            {path.level2 ? <span className="text-neutral-400">/</span> : null}
            {selectedL2 ? (
              <button
                className={classNames(
                  "rounded-lg px-2 py-1",
                  path.template ? "hover:bg-neutral-100" : "font-semibold",
                )}
                onClick={() => resetToLevel(3)}
                type="button"
              >
                {selectedL2.name}
              </button>
            ) : null}
            {path.template ? <span className="text-neutral-400">/</span> : null}
            {selectedTpl ? <span className="px-2 py-1 font-semibold">{selectedTpl.name}</span> : null}
          </div>
        </div>

        {/* 3-column layout */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Column 1 */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-neutral-900">Top Folders</div>
              <Pill>{level1.length}</Pill>
            </div>
            <div className="space-y-2">
              {level1.map((x) => (
                <Card
                  key={x.id}
                  title={x.name}
                  subtitle={`${(x.children || []).length} subcategories`}
                  active={path.level1 === x.id}
                  onClick={() => setPath({ level1: x.id, level2: null, template: null })}
                />
              ))}
            </div>
          </div>

          {/* Column 2 */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-neutral-900">Subcategories</div>
              <Pill>{level2.length}</Pill>
            </div>
            {!selectedL1 ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-neutral-600">
                Select a top folder on the left first.
              </div>
            ) : (
              <div className="space-y-2">
                {level2.map((x) => (
                  <Card
                    key={x.id}
                    title={x.name}
                    subtitle={`${(x.templates || []).length} templates`}
                    active={path.level2 === x.id}
                    onClick={() => setPath((p) => ({ ...p, level2: x.id, template: null }))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Column 3 */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-neutral-900">Templates</div>
              <div className="flex items-center gap-2">
                <Pill>{templates.length}</Pill>
                <button
                  type="button"
                  className={classNames(
                    "rounded-xl border px-3 py-1.5 text-sm",
                    selectedL2
                      ? "border-neutral-300 bg-white hover:bg-neutral-50"
                      : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400",
                  )}
                  onClick={addTemplate}
                  disabled={!selectedL2}
                >
                  + Add template
                </button>
              </div>
            </div>

            {!selectedL2 ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-neutral-600">
                Select a subcategory in the middle.
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {templates.map((t) => (
                    <Card
                      key={t.id}
                      title={t.name}
                      subtitle={t.description}
                      active={path.template === t.id}
                      onClick={() => setPath((p) => ({ ...p, template: t.id }))}
                      right={<Pill>ACES XML</Pill>}
                    />
                  ))}
                </div>

                {selectedTpl ? (
                  <div className="mt-4 rounded-2xl border bg-neutral-50 p-4">
                    <div className="text-sm font-semibold text-neutral-900">Selected template</div>
                    <div className="mt-1 text-sm text-neutral-700">{selectedTpl.name}</div>
                    {selectedTpl.description ? (
                      <div className="mt-2 text-xs text-neutral-600">{selectedTpl.description}</div>
                    ) : null}

                    <div className="mt-4 rounded-2xl border bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-neutral-900">Generate ACES from template</div>
                          <div className="mt-1 text-xs text-neutral-600">Preview only for now.</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMode("single")}
                            className={classNames(
                              "rounded-xl border px-3 py-1.5 text-sm",
                              mode === "single"
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-300 bg-white hover:bg-neutral-50",
                            )}
                          >
                            Single
                          </button>
                          <button
                            type="button"
                            onClick={() => setMode("bulk")}
                            className={classNames(
                              "rounded-xl border px-3 py-1.5 text-sm",
                              mode === "bulk"
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-300 bg-white hover:bg-neutral-50",
                            )}
                          >
                            Bulk
                          </button>
                        </div>
                      </div>

                      {mode === "single" ? (
                        <div className="mt-4 space-y-3">
                          <label className="text-xs font-medium text-neutral-700">
                            Part Number
                            <input
                              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                              value={singleForm.partNumber}
                              onChange={(e) => updateSingle("partNumber", e.target.value)}
                              placeholder="e.g. BDK-ABC-123"
                            />
                          </label>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <label className="text-xs font-medium text-neutral-700">
                              Brand
                              <select
                                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                                value={singleForm.brandAaiaId}
                                onChange={(e) => updateSingle("brandAaiaId", e.target.value)}
                              >
                                {BRAND_OPTIONS.map((b) => (
                                  <option key={b.code} value={b.code}>
                                    {b.code} — {b.name}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="text-xs font-medium text-neutral-700">
                              Part Type
                              <select
                                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                                value={singleForm.partTypeId}
                                onChange={(e) => updateSingle("partTypeId", e.target.value)}
                              >
                                {PART_TYPE_OPTIONS.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} — {p.id}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <label className="text-xs font-medium text-neutral-700">
                              Brand (shared)
                              <select
                                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                                value={bulkBrandCode}
                                onChange={(e) => setBulkBrandCode(e.target.value)}
                              >
                                {BRAND_OPTIONS.map((b) => (
                                  <option key={b.code} value={b.code}>
                                    {b.code} — {b.name}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="text-xs font-medium text-neutral-700">
                              Part Type (shared)
                              <select
                                className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                                value={bulkPartTypeId}
                                onChange={(e) => setBulkPartTypeId(e.target.value)}
                              >
                                {PART_TYPE_OPTIONS.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} — {p.id}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <div className="rounded-xl border bg-neutral-50 p-3 text-xs text-neutral-700">
                            Bulk will apply: <span className="font-mono">Brand={bulkBrandCode}</span>
                            {selectedBulkBrandName ? ` (${selectedBulkBrandName})` : ""} and{" "}
                            <span className="font-mono">PartTypeId={bulkPartTypeId}</span>
                            {selectedBulkPartTypeName ? ` (${selectedBulkPartTypeName})` : ""} to every Part Number.
                            <div className="mt-1 text-neutral-600">Duplicates will be removed automatically.</div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-neutral-700">Part Numbers (one per line)</div>
                            <div className="mt-1 text-xs text-neutral-600">
                              You can also paste comma-separated values on a single line (optional).
                            </div>
                            <textarea
                              className="mt-2 h-40 w-full rounded-xl border border-neutral-300 p-3 font-mono text-xs"
                              value={bulkText}
                              onChange={(e) => setBulkText(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          className="rounded-xl border border-neutral-900 bg-neutral-900 px-3 py-2 text-sm text-white hover:opacity-90"
                          onClick={previewGeneration}
                        >
                          Preview
                        </button>

                        <button
                          type="button"
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
                          // ▼ 여기를 이렇게 고치세요!
                          onClick={handleDownload}
                        >
                          Generate & download XML
                        </button>

                        <button
                          type="button"
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
                          onClick={() => comingSoon("Upload/Edit template XML")}
                        >
                          Upload/Edit template XML
                        </button>

                        <button
                          type="button"
                          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
                          onClick={() => comingSoon("Attach BaseVehicleId list")}
                        >
                          Attach BaseVehicleId list
                        </button>
                      </div>

                      {lastPreview ? (
                        <div className="mt-4 rounded-2xl border bg-neutral-50 p-3">
                          <div className="text-xs font-semibold text-neutral-900">Preview output</div>
                          <pre className="mt-2 overflow-auto rounded-xl bg-white p-3 text-xs">
                            {JSON.stringify(lastPreview, null, 2)}
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-4 text-sm text-neutral-700">
          <div className="font-semibold text-neutral-900">Why this is Step 1</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>We lock down folder/template navigation first.</li>
            <li>We add real template XML storage + generation next (AWS Lambda + S3).</li>
            <li>Then we add bulk outputs (zip/batch) and BaseVehicleId linking.</li>
          </ul>
        </div>
      </div>

      {/* Tiny dev-only tests for the bulk parsers (opt-in). */}
      <BulkParserTests />
    </div>
  );
}

function BulkParserTests() {
  // Set window.__ACES_RUN_TESTS__ = true in devtools to run these.
  const shouldRun =
    typeof window !== "undefined" &&
    (window as any).__ACES_RUN_TESTS__ === true &&
    process.env.NODE_ENV !== "production";

  if (!shouldRun) return null;

  const results: Array<{ name: string; ok: boolean; details?: string }> = [];

  function assert(name: string, condition: boolean, details?: string) {
    results.push({ name, ok: condition, details });
  }

  try {
    // Added tests for splitLines (new helper)
    const sl1 = splitLines("A\nB\n");
    assert("splitLines: LF", sl1.join("|") === "A|B|", `got=${sl1.join("|")}`);

    const sl2 = splitLines("A\r\nB\r\n");
    assert("splitLines: CRLF", sl2.join("|") === "A|B|", `got=${sl2.join("|")}`);

    const sl3 = splitLines("A\rB\r");
    assert("splitLines: CR", sl3.join("|") === "A|B|", `got=${sl3.join("|")}`);

    // Existing tests for legacy parseBulk (kept)
    const r1 = parseBulk("\n# comment\nA,PT,1\n\n");
    assert("Legacy: Ignores comments and blanks", r1.length === 1, `len=${r1.length}`);
    assert(
      "Legacy: Parses fields",
      r1[0]?.partNumber === "A" && r1[0]?.partTypeId === "PT" && r1[0]?.brandAaiaId === "1",
    );

    const r2 = parseBulk("A,PT,1\nB,PT,2\n");
    assert("Legacy: Parses multiple rows", r2.length === 2, `len=${r2.length}`);

    const r3 = parseBulk("BADROW\nC,PT,3\n");
    assert("Legacy: Skips invalid rows", r3.length === 1 && r3[0]?.partNumber === "C");

    const r4 = parseBulk("A, PT , 1 \r\nB,PT,2\r\n");
    assert("Legacy: Handles CRLF and trims spaces", r4.length === 2 && r4[0]?.partTypeId === "PT");

    const r5 = parseBulk("A,,1\n");
    assert("Legacy: Rejects rows with missing values", r5.length === 0, `len=${r5.length}`);

    const r6 = parseBulk("# only comments\n# again\n");
    assert("Legacy: All comments => empty", r6.length === 0, `len=${r6.length}`);

    // Tests for parseBulkParts (new behavior)
    const p1 = parseBulkParts("\n# comment\nABC-1\n\nDEF-2\n");
    assert("New: Parses part numbers", p1.length === 2 && p1[0] === "ABC-1" && p1[1] === "DEF-2");

    const p2 = parseBulkParts("A, B ,C\n");
    assert("New: Allows comma-separated", p2.length === 3 && p2[1] === "B");

    const p3 = parseBulkParts("\n\r\n");
    assert("New: Empty input => empty array", p3.length === 0);

    const p4 = parseBulkParts("A\nA\nB\nA,B\n");
    assert("New: Deduplicates while preserving order", p4.join(",") === "A,B", `got=${p4.join(",")}`);

    const p5 = parseBulkParts("  A  \n#x\nA\n  B  \n");
    assert("New: Trims + dedupes", p5.join(",") === "A,B", `got=${p5.join(",")}`);
  } catch (e: any) {
    assert("No throw", false, String(e?.message || e));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-6">
      <div className="rounded-2xl border bg-white p-4">
        <div className="text-sm font-semibold text-neutral-900">Dev tests (Bulk parsers)</div>
        <div className="mt-2 space-y-1 text-sm">
          {results.map((t) => (
            <div key={t.name} className="flex items-start justify-between gap-3">
              <div className="text-neutral-800">{t.name}</div>
              <div className={t.ok ? "text-green-700" : "text-red-700"}>{t.ok ? "PASS" : "FAIL"}</div>
            </div>
          ))}
          {results.some((x) => !x.ok) ? (
            <pre className="mt-3 overflow-auto rounded-xl bg-neutral-50 p-3 text-xs">
              {JSON.stringify(results, null, 2)}
            </pre>
          ) : null}
        </div>
      </div>
    </div>
  );
}
