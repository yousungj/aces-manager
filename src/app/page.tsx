'use client';

import React, { useMemo, useState } from "react";
import { buildSeatCoverXml } from "../templates/aces/seat-cover";

type AcesTemplate = { id: string; name: string; description?: string };
type Subcategory = { id: string; name: string; templates: AcesTemplate[] };
type Folder = { id: string; name: string; children: Subcategory[] };
type PathState = { level1: string | null; level2: string | null; template: string | null };
type GenerateRow = { partNumber: string; partTypeId: string; brandAaiaId: string; baseVehicleId?: string };

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

const DEFAULT_TREE: Folder[] = [
  { id: "mega", name: "1. Mega", children: [
      { id: "mega-super", name: "a. Mega_super", templates: [{ id: "tpl-mega-super", name: "Standard XML" }] },
      { id: "mega-wo-int", name: "b. Mega_WO_Integrated_HR", templates: [{ id: "tpl-mega-wo", name: "Standard XML" }] },
    ]},
  { id: "swc", name: "2. SWC", children: [
      { id: "swc-s", name: "a. Small-14 inch", templates: [{ id: "tpl-swc-s", name: "Standard XML" }] },
      { id: "swc-m", name: "b. Medium-15 inch", templates: [{ id: "tpl-swc-m", name: "Standard XML" }] },
      { id: "swc-l", name: "c. Large-16 inch", templates: [{ id: "tpl-swc-l", name: "Standard XML" }] },
      { id: "swc-xl1", name: "d. XL1-BigRig", templates: [{ id: "tpl-swc-xl1", name: "Standard XML" }] },
    ]},
  { id: "car-cover", name: "3. Car Cover", children: [
      { id: "cc-s", name: "a. Small", templates: [{ id: "tpl-cc-s", name: "Standard XML" }] },
      { id: "cc-m", name: "b. Medium", templates: [{ id: "tpl-cc-m", name: "Standard XML" }] },
      { id: "cc-l", name: "c. Large", templates: [{ id: "tpl-cc-l", name: "Standard XML" }] },
      { id: "cc-xl1", name: "d. XL1", templates: [{ id: "tpl-cc-xl1", name: "Standard XML" }] },
      { id: "cc-xl2", name: "e. XL2", templates: [{ id: "tpl-cc-xl2", name: "Standard XML" }] },
    ]},
  { id: "suv-cover", name: "4. SUV Cover", children: [
      { id: "suv-l", name: "a. Large", templates: [{ id: "tpl-suv-l", name: "Standard XML" }] },
      { id: "suv-xl1", name: "b. XL1", templates: [{ id: "tpl-suv-xl1", name: "Standard XML" }] },
      { id: "suv-xl2", name: "c. XL2", templates: [{ id: "tpl-suv-xl2", name: "Standard XML" }] },
      { id: "suv-xl3", name: "d. XL3", templates: [{ id: "tpl-suv-xl3", name: "Standard XML" }] },
    ]},
];

function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function splitLines(text: string): string[] {
  // 기존 함수 그대로
  const s = text ?? "";
  const lines: string[] = [];
  let buf = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "\n") { lines.push(buf); buf = ""; continue; }
    if (ch === "\r") { if (i + 1 < s.length && s[i + 1] === "\n") i++; lines.push(buf); buf = ""; continue; }
    buf += ch;
  }
  lines.push(buf);
  return lines;
}

function parseBulkParts(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const lines = splitLines(text ?? "");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const tokens = line.split(",").map(x => x.trim()).filter(Boolean);
    for (const t of tokens) {
      if (seen.has(t)) continue;
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

export default function ACESManagerStep1() {
  const [tree] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem("aces_tree_v1");
      return saved ? JSON.parse(saved) : DEFAULT_TREE;
    } catch { return DEFAULT_TREE; }
  });

  const [path, setPath] = useState<PathState>({ level1: null, level2: null, template: null });
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [singlePartNumber, setSinglePartNumber] = useState("");
  const [singleBrandCode, setSingleBrandCode] = useState("");
  const [singlePartTypeId, setSinglePartTypeId] = useState("");
  const [bulkBrandCode, setBulkBrandCode] = useState("GFLT");
  const [bulkPartTypeId, setBulkPartTypeId] = useState("57008");
  const [bulkText, setBulkText] = useState("");
  const [lastPreview, setLastPreview] = useState<any>(null);

  const level1 = useMemo(() => tree, [tree]);
  const selectedL1 = useMemo(() => level1.find(x => x.id === path.level1) || null, [level1, path.level1]);
  const level2 = useMemo(() => selectedL1?.children || [], [selectedL1]);
  const selectedL2 = useMemo(() => level2.find(x => x.id === path.level2) || null, [level2, path.level2]);
  const templates = useMemo(() => selectedL2?.templates || [], [selectedL2]);

  const selectedTemplate = useMemo(() => templates.find(t => t.id === path.template) || null, [templates, path.template]);
  const selectedBulkBrandName = BRAND_OPTIONS.find(b => b.code === bulkBrandCode)?.name || "";
  const selectedBulkPartTypeName = PART_TYPE_OPTIONS.find(p => p.id === bulkPartTypeId)?.name || "";

  const previewGeneration = () => {
    // 미리보기 로직 (기존 그대로)
    const rows: GenerateRow[] = mode === "single" 
      ? [{ partNumber: singlePartNumber, brandAaiaId: singleBrandCode, partTypeId: singlePartTypeId }]
      : parseBulkParts(bulkText).map(pn => ({ partNumber: pn, brandAaiaId: bulkBrandCode, partTypeId: bulkPartTypeId }));
    
    setLastPreview({
      templateId: path.template || "unknown",
      templateName: selectedTemplate?.name || "Unknown",
      mode,
      rows,
      note: "Preview only - no BaseVehicle linking yet"
    });
  };

  const handleDownload = () => {
    alert("다운로드 기능은 아직 구현 중이에요! 😅");
  };

  const comingSoon = (feature: string) => {
    alert(`${feature} - 곧 추가될 기능입니다!`);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">ACES File Manager</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 폴더 트리 */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">폴더 선택</h2>
                <div className="space-y-4">
                  {level1.map(folder => (
                    <div key={folder.id}>
                      <button
                        onClick={() => setPath({ level1: folder.id, level2: null, template: null })}
                        className={classNames(
                          "w-full text-left p-4 rounded-lg transition",
                          path.level1 === folder.id ? "bg-primary text-white" : "bg-base-200 hover:bg-base-300"
                        )}
                      >
                        {folder.name}
                      </button>
                      {path.level1 === folder.id && level2.map(sub => (
                        <div key={sub.id} className="ml-6 mt-2">
                          <button
                            onClick={() => setPath(prev => ({ ...prev, level2: sub.id, template: null }))}
                            className={classNames(
                              "w-full text-left p-3 rounded-lg transition",
                              path.level2 === sub.id ? "bg-secondary text-white" : "bg-base-200 hover:bg-base-300"
                            )}
                          >
                            {sub.name}
                          </button>
                          {path.level2 === sub.id && templates.map(tpl => (
                            <div key={tpl.id} className="ml-6 mt-1">
                              <button
                                onClick={() => setPath(prev => ({ ...prev, template: tpl.id }))}
                                className={classNames(
                                  "w-full text-left p-2 rounded transition text-sm",
                                  path.template === tpl.id ? "bg-accent text-white" : "hover:bg-base-300"
                                )}
                              >
                                {tpl.name}
                              </button>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 설정 및 생성 */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTemplate ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">템플릿: {selectedTemplate.name}</h2>

                  <div className="tabs tabs-boxed mb-6">
                    <button onClick={() => setMode("single")} className={classNames("tab", mode === "single" && "tab-active")}>Single</button>
                    <button onClick={() => setMode("bulk")} className={classNames("tab", mode === "bulk" && "tab-active")}>Bulk</button>
                  </div>

                  {mode === "single" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" placeholder="Part Number" className="input input-bordered" value={singlePartNumber} onChange={e => setSinglePartNumber(e.target.value)} />
                      <select className="select select-bordered" value={singleBrandCode} onChange={e => setSingleBrandCode(e.target.value)}>
                        <option value="">Brand 선택</option>
                        {BRAND_OPTIONS.map(b => <option key={b.code} value={b.code}>{b.code} - {b.name}</option>)}
                      </select>
                      <select className="select select-bordered" value={singlePartTypeId} onChange={e => setSinglePartTypeId(e.target.value)}>
                        <option value="">Part Type 선택</option>
                        {PART_TYPE_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select className="select select-bordered" value={bulkBrandCode} onChange={e => setBulkBrandCode(e.target.value)}>
                          {BRAND_OPTIONS.map(b => <option key={b.code} value={b.code}>{b.code} - {b.name}</option>)}
                        </select>
                        <select className="select select-bordered" value={bulkPartTypeId} onChange={e => setBulkPartTypeId(e.target.value)}>
                          {PART_TYPE_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                        </select>
                      </div>
                      <div className="alert alert-info">
                        <span>Bulk 적용: Brand={bulkBrandCode} ({selectedBulkBrandName}), PartType={bulkPartTypeId} ({selectedBulkPartTypeName})</span>
                      </div>
                      <textarea className="textarea textarea-bordered w-full h-48 font-mono text-sm" placeholder="Part Number 한 줄씩 또는 콤마로 구분" value={bulkText} onChange={e => setBulkText(e.target.value)} />
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <button onClick={previewGeneration} className="btn btn-primary">Preview</button>
                    <button onClick={handleDownload} className="btn btn-success">Generate & Download</button>
                    <button onClick={() => comingSoon("템플릿 업로드")} className="btn btn-neutral">Upload Template</button>
                    <button onClick={() => comingSoon("BaseVehicle 연결")} className="btn btn-neutral">Attach Vehicles</button>
                  </div>

                  {lastPreview && (
                    <div className="mt-6">
                      <div className="alert alert-success">Preview 생성 완료!</div>
                      <pre className="bg-base-200 p-4 rounded-lg overflow-auto text-xs mt-2">
                        {JSON.stringify(lastPreview, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">
                <span>왼쪽에서 폴더 → 서브카테고리 → 템플릿을 차례대로 선택해주세요!</span>
              </div>
            )}

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Why this is Step 1</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>폴더/템플릿 네비게이션 먼저 완성</li>
                  <li>실제 템플릿 저장 + 생성 기능 추가 예정 (AWS Lambda + S3)</li>
                  <li>마지막으로 벌크 출력 + BaseVehicle 연결</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
