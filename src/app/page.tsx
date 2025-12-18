'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { getTemplateForSubcategory } from "../templates/template-registry";

type Subcategory = { id: string; name: string; description?: string };
type Folder = { id: string; name: string; children: Subcategory[] };
type PathState = { level1: string | null; level2: string | null };
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
      { id: "mega-super", name: "a. Mega_super" },
      { id: "mega-wo-int", name: "b. Mega_WO_Integrated_HR" },
    ]},
  { id: "swc", name: "2. SWC", children: [
      { id: "swc-s", name: "a. Small-14 inch" },
      { id: "swc-m", name: "b. Medium-15 inch" },
      { id: "swc-l", name: "c. Large-16 inch" },
      { id: "swc-xl1", name: "d. XL1-BigRig" },
    ]},
  { id: "car-cover", name: "3. Car Cover", children: [
      { id: "cc-s", name: "a. Small" },
      { id: "cc-m", name: "b. Medium" },
      { id: "cc-l", name: "c. Large" },
      { id: "cc-xl1", name: "d. XL1" },
      { id: "cc-xl2", name: "e. XL2" },
    ]},
  { id: "suv-cover", name: "4. SUV Cover", children: [
      { id: "suv-l", name: "a. Large" },
      { id: "suv-xl1", name: "b. XL1" },
      { id: "suv-xl2", name: "c. XL2" },
      { id: "suv-xl3", name: "d. XL3" },
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
  const [tree, setTree] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem("aces_tree_v1");
      return saved ? JSON.parse(saved) : DEFAULT_TREE;
    } catch { return DEFAULT_TREE; }
  });

  const [path, setPath] = useState<PathState>({ level1: null, level2: null });
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
  const selectedTemplate = useMemo(() => level2.find(x => x.id === path.level2) || null, [level2, path.level2]);
  const selectedBulkBrandName = BRAND_OPTIONS.find(b => b.code === bulkBrandCode)?.name || "";
  const selectedBulkPartTypeName = PART_TYPE_OPTIONS.find(p => p.id === bulkPartTypeId)?.name || "";

  const previewGeneration = () => {
    // 미리보기 로직 (기존 그대로)
    const rows: GenerateRow[] = mode === "single" 
      ? [{ partNumber: singlePartNumber, brandAaiaId: singleBrandCode, partTypeId: singlePartTypeId }]
      : parseBulkParts(bulkText).map(pn => ({ partNumber: pn, brandAaiaId: bulkBrandCode, partTypeId: bulkPartTypeId }));
    
    setLastPreview({
      templateId: path.level2 || "unknown",
      templateName: selectedTemplate?.name || "Unknown",
      mode,
      rows,
      note: "Preview only - no BaseVehicle linking yet"
    });
  };

  const handleGenerate = () => {
    if (!selectedTemplate) {
      alert("Please select a template first!");
      return;
    }

    const rows: GenerateRow[] = mode === "single" 
      ? [{ partNumber: singlePartNumber, brandAaiaId: singleBrandCode, partTypeId: singlePartTypeId }]
      : parseBulkParts(bulkText).map(pn => ({ partNumber: pn, brandAaiaId: bulkBrandCode, partTypeId: bulkPartTypeId }));

    if (rows.length === 0 || !rows[0].partNumber) {
      alert("Please enter at least one part number!");
      return;
    }

    // Get the template function for the selected subcategory
    const templateFunc = getTemplateForSubcategory(selectedTemplate.id);
    if (!templateFunc) {
      alert(`No template configured for ${selectedTemplate.name}. Please contact administrator.`);
      return;
    }

    // For bulk mode, generate and download separate XML for each part number
    if (mode === "bulk") {
      rows.forEach((row, index) => {
        // Generate XML for this part number
        const xmlContent = templateFunc([row]);
        
        // Download with delay to avoid browser blocking multiple downloads
        setTimeout(() => {
          const blob = new Blob([xmlContent], { type: 'application/xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `aces-${row.partNumber}-${selectedTemplate.name}-${new Date().toISOString().split('T')[0]}.xml`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, index * 300); // 300ms delay between downloads
      });
      
      alert(`Generating ${rows.length} XML files. Please wait...`);
    } else {
      // Single mode - generate one XML file
      const xmlContent = templateFunc(rows);

      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aces-${selectedTemplate.name}-${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleAttachVehicles = () => {
    alert("Attach Vehicles - Feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent" style={{ letterSpacing: '-0.04em' }}>ACES Manager</h1>
            <p className="text-gray-500 mt-2 text-lg">Powerful XML generation for automotive parts</p>
          </div>
          <Link href="/custom-builder" className="apple-btn apple-btn-secondary px-6 py-3">
            Custom Builder →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 폴더 트리 */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6">
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-gray-900" style={{ letterSpacing: '-0.03em' }}>Templates</h2>
                <div className="space-y-4">
                  {level1.map(folder => (
                    <div key={folder.id}>
                      <button
                        onClick={() => setPath({ level1: folder.id, level2: null })}
                        className={classNames(
                          "w-full text-left px-5 py-4 font-medium folder-btn",
                          path.level1 === folder.id ? "folder-btn-active" : "folder-btn-inactive"
                        )}
                      >
                        {folder.name}
                      </button>
                      {path.level1 === folder.id && level2.map(sub => (
                        <div key={sub.id} className="ml-6 mt-2">
                          <button
                            onClick={() => setPath(prev => ({ ...prev, level2: sub.id }))}
                            className={classNames(
                              "w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                              path.level2 === sub.id ? "bg-blue-500 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-transparent"
                            )}
                          >
                            {sub.name}
                          </button>
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
              <div className="glass-card rounded-3xl p-8">
                <div>
                  <h2 className="text-3xl font-semibold mb-6 text-gray-900" style={{ letterSpacing: '-0.03em' }}>Generate XML</h2>
                  <p className="text-gray-500 mb-6">Template: {selectedTemplate.name}</p>

                  <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8 inline-flex">
                    <button onClick={() => setMode("single")} className={classNames("px-6 py-2.5 rounded-xl font-medium transition-all duration-200", mode === "single" ? "bg-white text-gray-900 shadow-md" : "text-gray-600 hover:text-gray-900")}>Single</button>
                    <button onClick={() => setMode("bulk")} className={classNames("px-6 py-2.5 rounded-xl font-medium transition-all duration-200", mode === "bulk" ? "bg-white text-gray-900 shadow-md" : "text-gray-600 hover:text-gray-900")}>Bulk</button>
                  </div>

                  {mode === "single" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" placeholder="Part Number" className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50" value={singlePartNumber} onChange={e => setSinglePartNumber(e.target.value)} />
                      <select className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50" value={singleBrandCode} onChange={e => setSingleBrandCode(e.target.value)}>
                        <option value="">Select Brand</option>
                        {BRAND_OPTIONS.map(b => <option key={b.code} value={b.code}>{b.code} - {b.name}</option>)}
                      </select>
                      <select className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50" value={singlePartTypeId} onChange={e => setSinglePartTypeId(e.target.value)}>
                        <option value="">Select Part Type</option>
                        {PART_TYPE_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50" value={bulkBrandCode} onChange={e => setBulkBrandCode(e.target.value)}>
                          {BRAND_OPTIONS.map(b => <option key={b.code} value={b.code}>{b.code} - {b.name}</option>)}
                        </select>
                        <select className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50" value={bulkPartTypeId} onChange={e => setBulkPartTypeId(e.target.value)}>
                          {PART_TYPE_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                        </select>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm text-blue-800">
                        <span>Bulk settings: Brand={bulkBrandCode} ({selectedBulkBrandName}), PartType={bulkPartTypeId} ({selectedBulkPartTypeName})</span>
                      </div>
                      <textarea className="w-full h-48 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono text-sm bg-white/50 resize-none" placeholder="One part number per line or comma-separated" value={bulkText} onChange={e => setBulkText(e.target.value)} />
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
                    <button onClick={previewGeneration} className="apple-btn apple-btn-secondary px-6 py-3.5">Preview</button>
                    <button onClick={handleGenerate} className="apple-btn apple-btn-primary px-6 py-3.5">Generate & Download</button>
                    <button onClick={handleAttachVehicles} className="apple-btn apple-btn-secondary px-6 py-3.5">Attach Vehicles</button>
                  </div>

                  {lastPreview && (
                    <div className="mt-8">
                      <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 text-sm text-green-800 font-medium mb-4">✓ Preview generated successfully!</div>
                      <pre className="bg-gray-50 p-5 rounded-2xl overflow-auto text-xs border border-gray-200">
                        {JSON.stringify(lastPreview, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-8 text-center">
                <div className="text-5xl mb-4">📁</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a template</h3>
                <p className="text-gray-500">Choose Folder → Template from the left panel</p>
              </div>
            )}

            <div className="glass-card rounded-3xl p-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900" style={{ letterSpacing: '-0.02em' }}>Development Progress</h3>
                <ul className="space-y-2.5 text-gray-600">
                  <li className="flex items-start"><span className="text-green-500 mr-2 text-lg">✓</span><span>Folder/template navigation completed</span></li>
                  <li className="flex items-start"><span className="text-blue-500 mr-2 text-lg">◉</span><span>Template save + generation features coming soon (AWS Lambda + S3)</span></li>
                  <li className="flex items-start"><span className="text-gray-400 mr-2 text-lg">○</span><span>Finally bulk output + BaseVehicle linking</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
