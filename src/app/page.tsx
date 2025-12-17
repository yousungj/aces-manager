'use client';

import React, { useState, useMemo } from "react";

// 기존 카테고리 정보 유지
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

export default function Page() {
  const [tree, setTree] = useState<Folder[]>(DEFAULT_TREE);
  const [path, setPath] = useState<PathState>({ level1: null, level2: null, template: null });

  const level1 = useMemo(() => tree, [tree]);
  const selectedL1 = useMemo(() => level1.find((x) => x.id === path.level1) || null, [level1, path.level1]);

  return (
    <div>
      <h1>ACES Manager</h1>
      <ul>
        {level1.map((folder) => (
          <li key={folder.id}>{folder.name}</li>
        ))}
      </ul>
    </div>
  );
}
