'use client';

import React, { useState, useMemo } from "react";

// Full configuration and state management with original details

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
  baseVehicleId?: string; // 추가됨
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
      if (i + 1 < s.length && s[i + 1] === "\n") i++;
      lines.push(buf);
      buf = "";
      continue;
    }
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

  const [singleForm, setSingleForm] = useState<GenerateRow>({
    partNumber: "",
    partTypeId: PART_TYPE_OPTIONS[0]?.id || "",
    brandAaiaId: BRAND_OPTIONS[0]?.code || "",
  });

  const level1 = useMemo(() => tree, [tree]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Pill>ACES File Manager</Pill>
      </div>
    </div>
  );
}
