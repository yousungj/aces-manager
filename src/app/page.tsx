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

type SubmissionRecord = {
  partNumber: string;
  brandCode: string;
  brandName: string;
  partTypeId: string;
  partTypeName: string;
  date: string;
  timestamp: number;
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

  const [submissionHistory, setSubmissionHistory] = useState<Record<string, SubmissionRecord[]>>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{templateId: string; templateName: string; rows: GenerateRow[]} | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load submission history from API
  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          // Fallback to localStorage if no API configured
          const saved = localStorage.getItem("aces_submission_history_v1");
          setSubmissionHistory(saved ? JSON.parse(saved) : {});
          setIsLoadingHistory(false);
          return;
        }

        const response = await fetch(`${apiUrl}/submissions`);
        const data = await response.json();
        
        if (data.success) {
          setSubmissionHistory(data.history);
        } else {
          // Fallback to localStorage on API error
          const saved = localStorage.getItem("aces_submission_history_v1");
          setSubmissionHistory(saved ? JSON.parse(saved) : {});
        }
      } catch (error) {
        console.error('Failed to load submission history:', error);
        // Fallback to localStorage on error
        const saved = localStorage.getItem("aces_submission_history_v1");
        setSubmissionHistory(saved ? JSON.parse(saved) : {});
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadHistory();
  }, []);

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

    // Generate and download separate XML file for each part number
    rows.forEach((row, index) => {
      // Generate XML for this single part number
      const xmlContent = templateFunc([row]);

      // Download the XML file
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${row.partNumber}.xml`;
      document.body.appendChild(a);
      
      // Add small delay between downloads in bulk mode to avoid browser blocking
      setTimeout(() => {
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, index * 100);
    });

    // Show save prompt
    setPendingSubmission({ templateId: selectedTemplate.id, templateName: selectedTemplate.name, rows });
    setShowSavePrompt(true);
  };

  const handleSaveSubmission = async () => {
    if (!pendingSubmission) return;

    const newRecords: SubmissionRecord[] = pendingSubmission.rows.map(row => {
      const brandName = BRAND_OPTIONS.find(b => b.code === row.brandAaiaId)?.name || row.brandAaiaId;
      const partTypeName = PART_TYPE_OPTIONS.find(p => p.id === row.partTypeId)?.name || row.partTypeId;
      return {
        partNumber: row.partNumber,
        brandCode: row.brandAaiaId,
        brandName,
        partTypeId: row.partTypeId,
        partTypeName,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
      };
    });

    const templateId = pendingSubmission.templateId;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      if (apiUrl) {
        // Save to AWS API
        const response = await fetch(`${apiUrl}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId, records: newRecords })
        });
        const data = await response.json();
        
        if (data.success) {
          setSubmissionHistory(data.history);
        } else {
          throw new Error('API save failed');
        }
      } else {
        throw new Error('No API configured');
      }
    } catch (error) {
      console.error('Failed to save to API, using localStorage:', error);
      // Fallback to localStorage
      const updatedHistory = {
        ...submissionHistory,
        [templateId]: [...(submissionHistory[templateId] || []), ...newRecords]
      };
      setSubmissionHistory(updatedHistory);
      localStorage.setItem("aces_submission_history_v1", JSON.stringify(updatedHistory));
    }

    setShowSavePrompt(false);
    setPendingSubmission(null);
  };

  const handleSkipSave = () => {
    setShowSavePrompt(false);
    setPendingSubmission(null);
  };

  const handleClearHistory = async (templateId: string) => {
    if (!confirm(`Clear all submission history for ${selectedTemplate?.name}?`)) return;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      if (apiUrl) {
        // Delete from AWS API
        const response = await fetch(`${apiUrl}/submissions?templateId=${templateId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
          setSubmissionHistory(data.history);
        } else {
          throw new Error('API delete failed');
        }
      } else {
        throw new Error('No API configured');
      }
    } catch (error) {
      console.error('Failed to delete from API, using localStorage:', error);
      // Fallback to localStorage
      const updatedHistory = { ...submissionHistory };
      delete updatedHistory[templateId];
      setSubmissionHistory(updatedHistory);
      localStorage.setItem("aces_submission_history_v1", JSON.stringify(updatedHistory));
    }
  };

  const handleAttachVehicles = () => {
    alert("Attach Vehicles - Feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent" style={{ letterSpacing: '-0.04em' }}>ACES Manager</h1>
            <p className="text-center text-gray-500 text-lg">Powerful XML generation for automotive parts</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/template-editor" 
              className="apple-btn apple-btn-secondary px-6 py-3 whitespace-nowrap"
            >
              📝 Edit Templates
            </Link>
            <Link 
              href="/custom-builder" 
              className="apple-btn apple-btn-primary px-6 py-3 whitespace-nowrap"
            >
              🛠️ Custom Builder
            </Link>
            <Link 
              href="/vehicle-lookup" 
              className="apple-btn apple-btn-primary px-6 py-3 whitespace-nowrap"
            >
              🚗 Vehicle Lookup
            </Link>
            <Link 
              href="/asin-checker" 
              className="apple-btn apple-btn-primary px-6 py-3 whitespace-nowrap"
            >
              🔍 ASIN Checker
            </Link>
          </div>
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
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-semibold text-gray-900" style={{ letterSpacing: '-0.03em' }}>Generate XML</h2>
                      <p className="text-gray-500 mt-1">Template: {selectedTemplate.name}</p>
                    </div>
                    {submissionHistory[selectedTemplate.id]?.length > 0 && (
                      <button
                        onClick={() => setShowHistory(true)}
                        className="apple-btn apple-btn-secondary px-4 py-2 text-sm"
                      >
                        📋 View History ({submissionHistory[selectedTemplate.id].length})
                      </button>
                    )}
                  </div>

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

      {/* Save Submission Prompt Modal */}
      {showSavePrompt && pendingSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="glass-card rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Save Submission Record?</h3>
            <p className="text-gray-600 mb-6">
              Would you like to save this submission to your history?
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Template:</strong> {pendingSubmission.templateName}<br/>
                <strong>Parts:</strong> {pendingSubmission.rows.map(r => r.partNumber).join(', ')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSkipSave}
                className="flex-1 px-6 py-3 rounded-xl font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              >
                Skip
              </button>
              <button
                onClick={handleSaveSubmission}
                className="flex-1 apple-btn apple-btn-primary px-6 py-3"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission History Viewer */}
      {showHistory && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="glass-card rounded-3xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Submission History: {selectedTemplate.name}
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {submissionHistory[selectedTemplate.id]?.length > 0 ? (
              <>
                <div className="mb-4">
                  <button
                    onClick={() => handleClearHistory(selectedTemplate.id)}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear All History
                  </button>
                </div>
                <div className="space-y-3">
                  {submissionHistory[selectedTemplate.id]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((record, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{record.partNumber}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {record.brandName} ({record.brandCode}) • {record.partTypeName}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">{record.date}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No submission history for this template yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
