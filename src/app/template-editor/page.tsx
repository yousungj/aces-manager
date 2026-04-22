'use client';

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";

type TemplateOption = {
  id: string;
  name: string;
  filePath: string;
  category: string;
  description?: string;
  coverSize?: string;
  vehicleType?: string;
};

type BaseVehicle = {
  BaseVehicleID: number;
  YearID: number;
  MakeID: number;
  ModelID: number;
};

type Make = {
  MakeID: number;
  MakeName: string;
};

type Model = {
  ModelID: number;
  ModelName: string;
};

type VehicleInfo = {
  id: number;
  make: string;
  model: string;
  year: number;
};

const TEMPLATES: TemplateOption[] = [
  // --- Car Cover ---
  { id: "cc1", name: "Car Cover Small", filePath: "/data/cc1-ids.json", category: "Car Cover", coverSize: "Small", vehicleType: "Car" },
  { id: "cc2", name: "Car Cover Medium", filePath: "/data/cc2-ids.json", category: "Car Cover", coverSize: "Medium", vehicleType: "Car" },
  { id: "cc3", name: "Car Cover Large", filePath: "/data/cc3-ids.json", category: "Car Cover", coverSize: "Large", vehicleType: "Car" },
  { id: "cc4", name: "Car Cover XL1", filePath: "/data/cc4-ids.json", category: "Car Cover", coverSize: "XL1", vehicleType: "Car" },
  { id: "cc5", name: "Car Cover XL2", filePath: "/data/cc5-ids.json", category: "Car Cover", coverSize: "XL2", vehicleType: "Car" },
  // --- Vehicle Cover ---
  { id: "vc0", name: "Vehicle Cover Small", filePath: "/data/vc0-ids.json", category: "Vehicle Cover", coverSize: "Small", vehicleType: "SUV/Truck" },
  { id: "vc1", name: "Vehicle Cover Medium", filePath: "/data/vc1-ids.json", category: "Vehicle Cover", coverSize: "Medium", vehicleType: "SUV/Truck" },
  { id: "vc2", name: "Vehicle Cover Large", filePath: "/data/vc2-ids.json", category: "Vehicle Cover", coverSize: "Large", vehicleType: "SUV/Truck" },
  { id: "vc3", name: "Vehicle Cover XL", filePath: "/data/vc3-ids.json", category: "Vehicle Cover", coverSize: "XL", vehicleType: "SUV/Truck" },
  // --- Seat Cover ---
  { id: "mega-super", name: "Mega Super", filePath: "/data/mega-super-ids.json", category: "Seat Cover" },
  { id: "sc-wo-ihr", name: "Seat Cover WO IHR", filePath: "/data/sc-wo-ihr-ids.json", category: "Seat Cover" },
  { id: "SC-Fronts-Reduced-2026", name: "SC-Fronts-Reduced-2026", filePath: "/data/sc-fronts-reduced-2026-ids.json", category: "Seat Cover", description: "Old ACES / Current" },
  { id: "SC-Fronts-Reduced-2026-Joven", name: "SC-Fronts-Reduced-2026-Joven", filePath: "/data/sc-fronts-reduced-2026-joven-ids.json", category: "Seat Cover", vehicleType: "Universal", description: "SC reduced fronts - Joven (pulled int. seatbelts etc)" },
  { id: "SC-Full_withBench_Reduced-2026", name: "SC-Full_withBench_Reduced-2026", filePath: "/data/sc-full-withbench-reduced-2026-ids.json", category: "Seat Cover", description: "Old ACES / Current" },
  // --- Steering Wheel Cover ---
  { id: "swc-15inch", name: "SWC 15 inch", filePath: "/data/swc-15inch-ids.json", category: "Steering Wheel Cover", coverSize: "15 inch" },
  { id: "swc-16inch", name: "SWC 16 inch", filePath: "/data/swc-16inch-ids.json", category: "Steering Wheel Cover", coverSize: "16 inch" },
  // --- Windshield Cover ---
  { id: "AS-SMALL", name: "AS-SMALL", filePath: "/data/as-small-ids.json", category: "Windshield Cover", coverSize: "SMALL", vehicleType: "Universal", description: 'AutoAmericS windshield sunshade - SMALL (W-28.5" x L-59")' },
  { id: "AS-MEDIUM", name: "AS-MEDIUM", filePath: "/data/as-medium-ids.json", category: "Windshield Cover", coverSize: "MEDIUM", vehicleType: "Universal", description: 'AutoAmericS windshield sunshade - MEDIUM (W-32" x L-61")' },
  { id: "AS-LARGE", name: "AS-LARGE", filePath: "/data/as-large-ids.json", category: "Windshield Cover", coverSize: "LARGE", vehicleType: "Universal", description: 'AutoAmericS windshield sunshade - LARGE (W-33.5" x L-64")' },
  { id: "AS-XLARGE", name: "AS-XLARGE", filePath: "/data/as-xlarge-ids.json", category: "Windshield Cover", coverSize: "XLARGE", vehicleType: "Universal", description: 'AutoAmericS windshield sunshade - XLARGE (W-36" x L-66")' },
  { id: "AS-58-24", name: "AS-58-24", filePath: "/data/as-58-24-ids.json", category: "Windshield Cover", description: "Size info here / measurements" },
  { id: "AS-66-27", name: "AS-66-27", filePath: "/data/as-66-27-ids.json", category: "Windshield Cover", description: "Size info here / measurements" },
  // --- Tonneau Cover ---
  { id: "MBTN-1111-BF", name: "MBTN-1111-BF", filePath: "/data/mbtn-1111-bf-ids.json", category: "Tonneau Cover", coverSize: "5.5 ft", vehicleType: "Truck", description: "Ford F150 2015-2026 | 5.5 ft bed" },
  { id: "MBTN-1155-BF", name: "MBTN-1155-BF", filePath: "/data/mbtn-1155-bf-ids.json", category: "Tonneau Cover", coverSize: "6.4 ft", vehicleType: "Truck", description: "Ford F150 2009-2026 | 6.4 ft bed" },
  { id: "MBTN-1466-BF", name: "MBTN-1466-BF", filePath: "/data/mbtn-1466-bf-ids.json", category: "Tonneau Cover", coverSize: "6.8 ft", vehicleType: "Truck", description: "Ford F250/F350 1999-2016 | 6.8 ft bed" },
  { id: "MBTN-1476-BF", name: "MBTN-1476-BF", filePath: "/data/mbtn-1476-bf-ids.json", category: "Tonneau Cover", coverSize: "6.8 ft", vehicleType: "Truck", description: "Ford F250/F350 2017-2026 | 6.8 ft bed" },
  { id: "MBTN-2223-BF", name: "MBTN-2223-BF", filePath: "/data/mbtn-2223-bf-ids.json", category: "Tonneau Cover", coverSize: "6.4 ft", vehicleType: "Truck", description: "Ram/Dodge 1500/2500/3500 2002-2026 | 6.4 ft bed; Classic Body for 2019+" },
  { id: "MBTN-2243-BF", name: "MBTN-2243-BF", filePath: "/data/mbtn-2243-bf-ids.json", category: "Tonneau Cover", coverSize: "6.4 ft", vehicleType: "Truck", description: "Ram/Dodge 1500/2500/3500 New Body 2019-2026 | 6.4 ft bed; New Body Only" },
  { id: "MBTN-2254-BF", name: "MBTN-2254-BF", filePath: "/data/mbtn-2254-bf-ids.json", category: "Tonneau Cover", coverSize: "5.7 ft", vehicleType: "Truck", description: "Ram/Dodge 1500/2500/3500 2009-2026 | 5.7 ft bed" },
  { id: "MBTN-3332-BF", name: "MBTN-3332-BF", filePath: "/data/mbtn-3332-bf-ids.json", category: "Tonneau Cover", coverSize: "5.8 ft", vehicleType: "Truck", description: "Chevrolet/GMC Silverado/Sierra 1500 2007-2018 | 5.8 ft bed" },
  { id: "MBTN-3342-BF", name: "MBTN-3342-BF", filePath: "/data/mbtn-3342-bf-ids.json", category: "Tonneau Cover", coverSize: "5.8 ft", vehicleType: "Truck", description: "Chevrolet/GMC Silverado/Sierra 1500 2019-2026 | 5.8 ft bed" },
  { id: "MBTN-3587-BF", name: "MBTN-3587-BF", filePath: "/data/mbtn-3587-bf-ids.json", category: "Tonneau Cover", coverSize: "6.6 ft", vehicleType: "Truck", description: "Chevrolet/GMC Silverado/Sierra 1500 2014-2018 | 6.6 ft bed" },
  { id: "MBTN-3687-BF", name: "MBTN-3687-BF", filePath: "/data/mbtn-3687-bf-ids.json", category: "Tonneau Cover", coverSize: "6.6 ft", vehicleType: "Truck", description: "Chevrolet/GMC Silverado/Sierra 2500HD/3500HD 2014-2018 | 6.6 ft bed" },
  { id: "MBTN-3710-BF", name: "MBTN-3710-BF", filePath: "/data/mbtn-3710-bf-ids.json", category: "Tonneau Cover", coverSize: "5.2 ft", vehicleType: "Truck", description: "Chevrolet/GMC Colorado/Canyon 2015-2026 | 5.2 ft bed" },
  { id: "MBTN-3F-2223-BF", name: "MBTN-3F-2223-BF", filePath: "/data/mbtn-3f-2223-bf-ids.json", category: "Tonneau Cover", coverSize: "6.4 ft", vehicleType: "Truck", description: "Ram/Dodge 1500/2500/3500 2002-2026 | 6.4 ft bed" },
  { id: "MBTN-4820-BF", name: "MBTN-4820-BF", filePath: "/data/mbtn-4820-bf-ids.json", category: "Tonneau Cover", coverSize: "5.0 ft", vehicleType: "Truck", description: "Nissan Frontier 2005-2026 | 5.0 ft bed" },
  { id: "MBTN-5910-BF", name: "MBTN-5910-BF", filePath: "/data/mbtn-5910-bf-ids.json", category: "Tonneau Cover", coverSize: "5.0 ft", vehicleType: "Truck", description: "Toyota Tacoma 2016-2023 | 5.0 ft bed; with deck rail system" },
  // --- Floor Mat ---
  { id: "CAMT-3103", name: "CAMT-3103", filePath: "/data/camt-3103-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "Cat® Floor Mats for 2015-2026 Ford F-150 SuperCrew Cab, Front & Rear" },
  { id: "CAMT-3143-BK", name: "CAMT-3143-BK", filePath: "/data/camt-3143-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "CAT® JustFit™ 3D All Weather Floor Mats for Ford Bronco Sport 2021-2026" },
  { id: "CAMT-3201-BK", name: "CAMT-3201-BK", filePath: "/data/camt-3201-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "Cat® JustFit™ 3D Floor Mats for Tesla Model Y 2020–2024" },
  { id: "CAMT-3202-BK", name: "CAMT-3202-BK", filePath: "/data/camt-3202-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "Cat® JustFit™ 3D Floor Mats for Tesla Model 3 2017–2024" },
  { id: "CAMT-3301-BK", name: "CAMT-3301-BK", filePath: "/data/camt-3301-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "Cat® JustFit™ 3D Floor Mats for Jeep Wrangler JL 2018–2026" },
  { id: "CAMT-3302-BK", name: "CAMT-3302-BK", filePath: "/data/camt-3302-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "CAT® JustFit™ 3D Floor Mats for Jeep Gladiator (JL) 2020–2026" },
  { id: "CAMT-3303-BK", name: "CAMT-3303-BK", filePath: "/data/camt-3303-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "Cat® JustFit™ 3D Floor Mats for Jeep Wrangler 4XE 2021–2026" },
  { id: "CAMT-3304-BK", name: "CAMT-3304-BK", filePath: "/data/camt-3304-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "Cat® JustFit™ 3D All Weather Floor Mats for Jeep Gladiator (JL) 2020-2026" },
  { id: "CAMT-3401-BK", name: "CAMT-3401-BK", filePath: "/data/camt-3401-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "CAT® JustFit™ 3D Custom Fit Floor Mats for Dodge Ram 1500 Crew Cab 2009-2018 / Ram 2500/3500 2010-2024" },
  { id: "CAMT-3501-BK", name: "CAMT-3501-BK", filePath: "/data/camt-3501-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "CAT® JustFit™ 3D Custom Fit Bench Floor Mat for 2019-2026 Chevy Silverado 1500/GMC Sierra 1500 Crew Cab" },
  { id: "CAMT-3502-BK", name: "CAMT-3502-BK", filePath: "/data/camt-3502-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "CAT® JustFit™ 3D Custom Fit Floor Mats Chevrolet Silverado 1500/GMC Sierra 2019-2026" },
  { id: "CAMT-3519", name: "CAMT-3519", filePath: "/data/camt-3519-ids.json", category: "Truck Bed Mat", vehicleType: "Universal", description: "CAT Custom Fit Truck Bed Mat for 2010-2018 Chevrolet Silverado 5.8 ft Short Bed" },
  { id: "CAMT-3523-BK", name: "CAMT-3523-BK", filePath: "/data/camt-3523-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "CAT® JustFit™ 3D Custom Fit Floor Mats for Chevy Equinox / GMC Terrain 2019-2024" },
  { id: "CAMT-3603-BK", name: "CAMT-3603-BK", filePath: "/data/camt-3603-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "CAT® JustFit™ 3D All Weather Floor Mats for Toyota Tacoma 2016-2023 Double Cab" },
  { id: "CAMT-3613-BK", name: "CAMT-3613-BK", filePath: "/data/camt-3613-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "CAT® JustFit™ 3D Custom Fit Floor Mats for Toyota RAV4 2019-2025 (Not Hybrid)" },
  { id: "CAMT-3624-BK", name: "CAMT-3624-BK", filePath: "/data/camt-3624-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "CAT® JustFit™ 3D All Weather Floor Mats for Toyota Highlander 2020-2026 (7 Seater, Not Hybrid)" },
  { id: "CAMT-3703-BK", name: "CAMT-3703-BK", filePath: "/data/camt-3703-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "CAT® JustFit™ 3D Custom Fit Floor Mats for Honda Civic 2022-2026 / Acura Integra 2023-2026" },
  { id: "CAMT-3713-BK", name: "CAMT-3713-BK", filePath: "/data/camt-3713-bk-ids.json", category: "Floor Mat", vehicleType: "Universal", description: "CAT® JustFit™ 3D Custom Fit Floor Mats for Honda CRV 2023-2026" },
  // --- Hubcap ---
  { id: "UMA2025-KT16", name: "UMA2025-KT16", filePath: "/data/uma2025-kt16-ids.json", category: "Hubcap", description: "Old ACES / Current" },
  // --- Wiper (by size, from aces_by_size_v6) ---
  { id: "wiper-13x13", name: "Wiper 13x13", filePath: "/data/wiper-13x13-ids.json", category: "Wiper", coverSize: "13x13", vehicleType: "Universal" },
  { id: "wiper-15x15", name: "Wiper 15x15", filePath: "/data/wiper-15x15-ids.json", category: "Wiper", coverSize: "15x15", vehicleType: "Universal" },
  { id: "wiper-16x16", name: "Wiper 16x16", filePath: "/data/wiper-16x16-ids.json", category: "Wiper", coverSize: "16x16", vehicleType: "Universal" },
  { id: "wiper-17x17", name: "Wiper 17x17", filePath: "/data/wiper-17x17-ids.json", category: "Wiper", coverSize: "17x17", vehicleType: "Universal" },
  { id: "wiper-18x15", name: "Wiper 18x15", filePath: "/data/wiper-18x15-ids.json", category: "Wiper", coverSize: "18x15", vehicleType: "Universal" },
  { id: "wiper-18x17", name: "Wiper 18x17", filePath: "/data/wiper-18x17-ids.json", category: "Wiper", coverSize: "18x17", vehicleType: "Universal" },
  { id: "wiper-18x18", name: "Wiper 18x18", filePath: "/data/wiper-18x18-ids.json", category: "Wiper", coverSize: "18x18", vehicleType: "Universal" },
  { id: "wiper-19x17", name: "Wiper 19x17", filePath: "/data/wiper-19x17-ids.json", category: "Wiper", coverSize: "19x17", vehicleType: "Universal" },
  { id: "wiper-19x18", name: "Wiper 19x18", filePath: "/data/wiper-19x18-ids.json", category: "Wiper", coverSize: "19x18", vehicleType: "Universal" },
  { id: "wiper-19x19", name: "Wiper 19x19", filePath: "/data/wiper-19x19-ids.json", category: "Wiper", coverSize: "19x19", vehicleType: "Universal" },
  { id: "wiper-20x16", name: "Wiper 20x16", filePath: "/data/wiper-20x16-ids.json", category: "Wiper", coverSize: "20x16", vehicleType: "Universal" },
  { id: "wiper-20x17", name: "Wiper 20x17", filePath: "/data/wiper-20x17-ids.json", category: "Wiper", coverSize: "20x17", vehicleType: "Universal" },
  { id: "wiper-20x18", name: "Wiper 20x18", filePath: "/data/wiper-20x18-ids.json", category: "Wiper", coverSize: "20x18", vehicleType: "Universal" },
  { id: "wiper-20x19", name: "Wiper 20x19", filePath: "/data/wiper-20x19-ids.json", category: "Wiper", coverSize: "20x19", vehicleType: "Universal" },
  { id: "wiper-20x20", name: "Wiper 20x20", filePath: "/data/wiper-20x20-ids.json", category: "Wiper", coverSize: "20x20", vehicleType: "Universal" },
  { id: "wiper-21x17", name: "Wiper 21x17", filePath: "/data/wiper-21x17-ids.json", category: "Wiper", coverSize: "21x17", vehicleType: "Universal" },
  { id: "wiper-21x18", name: "Wiper 21x18", filePath: "/data/wiper-21x18-ids.json", category: "Wiper", coverSize: "21x18", vehicleType: "Universal" },
  { id: "wiper-21x19", name: "Wiper 21x19", filePath: "/data/wiper-21x19-ids.json", category: "Wiper", coverSize: "21x19", vehicleType: "Universal" },
  { id: "wiper-21x20", name: "Wiper 21x20", filePath: "/data/wiper-21x20-ids.json", category: "Wiper", coverSize: "21x20", vehicleType: "Universal" },
  { id: "wiper-21x21", name: "Wiper 21x21", filePath: "/data/wiper-21x21-ids.json", category: "Wiper", coverSize: "21x21", vehicleType: "Universal" },
  { id: "wiper-22x14", name: "Wiper 22x14", filePath: "/data/wiper-22x14-ids.json", category: "Wiper", coverSize: "22x14", vehicleType: "Universal" },
  { id: "wiper-22x16", name: "Wiper 22x16", filePath: "/data/wiper-22x16-ids.json", category: "Wiper", coverSize: "22x16", vehicleType: "Universal" },
  { id: "wiper-22x17", name: "Wiper 22x17", filePath: "/data/wiper-22x17-ids.json", category: "Wiper", coverSize: "22x17", vehicleType: "Universal" },
  { id: "wiper-22x18", name: "Wiper 22x18", filePath: "/data/wiper-22x18-ids.json", category: "Wiper", coverSize: "22x18", vehicleType: "Universal" },
  { id: "wiper-22x19", name: "Wiper 22x19", filePath: "/data/wiper-22x19-ids.json", category: "Wiper", coverSize: "22x19", vehicleType: "Universal" },
  { id: "wiper-22x20", name: "Wiper 22x20", filePath: "/data/wiper-22x20-ids.json", category: "Wiper", coverSize: "22x20", vehicleType: "Universal" },
  { id: "wiper-22x21", name: "Wiper 22x21", filePath: "/data/wiper-22x21-ids.json", category: "Wiper", coverSize: "22x21", vehicleType: "Universal" },
  { id: "wiper-22x22", name: "Wiper 22x22", filePath: "/data/wiper-22x22-ids.json", category: "Wiper", coverSize: "22x22", vehicleType: "Universal" },
  { id: "wiper-24x14", name: "Wiper 24x14", filePath: "/data/wiper-24x14-ids.json", category: "Wiper", coverSize: "24x14", vehicleType: "Universal" },
  { id: "wiper-24x15", name: "Wiper 24x15", filePath: "/data/wiper-24x15-ids.json", category: "Wiper", coverSize: "24x15", vehicleType: "Universal" },
  { id: "wiper-24x16", name: "Wiper 24x16", filePath: "/data/wiper-24x16-ids.json", category: "Wiper", coverSize: "24x16", vehicleType: "Universal" },
  { id: "wiper-24x17", name: "Wiper 24x17", filePath: "/data/wiper-24x17-ids.json", category: "Wiper", coverSize: "24x17", vehicleType: "Universal" },
  { id: "wiper-24x18", name: "Wiper 24x18", filePath: "/data/wiper-24x18-ids.json", category: "Wiper", coverSize: "24x18", vehicleType: "Universal" },
  { id: "wiper-24x19", name: "Wiper 24x19", filePath: "/data/wiper-24x19-ids.json", category: "Wiper", coverSize: "24x19", vehicleType: "Universal" },
  { id: "wiper-24x20", name: "Wiper 24x20", filePath: "/data/wiper-24x20-ids.json", category: "Wiper", coverSize: "24x20", vehicleType: "Universal" },
  { id: "wiper-24x21", name: "Wiper 24x21", filePath: "/data/wiper-24x21-ids.json", category: "Wiper", coverSize: "24x21", vehicleType: "Universal" },
  { id: "wiper-24x22", name: "Wiper 24x22", filePath: "/data/wiper-24x22-ids.json", category: "Wiper", coverSize: "24x22", vehicleType: "Universal" },
  { id: "wiper-24x24", name: "Wiper 24x24", filePath: "/data/wiper-24x24-ids.json", category: "Wiper", coverSize: "24x24", vehicleType: "Universal" },
  { id: "wiper-26x14", name: "Wiper 26x14", filePath: "/data/wiper-26x14-ids.json", category: "Wiper", coverSize: "26x14", vehicleType: "Universal" },
  { id: "wiper-26x15", name: "Wiper 26x15", filePath: "/data/wiper-26x15-ids.json", category: "Wiper", coverSize: "26x15", vehicleType: "Universal" },
  { id: "wiper-26x16", name: "Wiper 26x16", filePath: "/data/wiper-26x16-ids.json", category: "Wiper", coverSize: "26x16", vehicleType: "Universal" },
  { id: "wiper-26x17", name: "Wiper 26x17", filePath: "/data/wiper-26x17-ids.json", category: "Wiper", coverSize: "26x17", vehicleType: "Universal" },
  { id: "wiper-26x18", name: "Wiper 26x18", filePath: "/data/wiper-26x18-ids.json", category: "Wiper", coverSize: "26x18", vehicleType: "Universal" },
  { id: "wiper-26x19", name: "Wiper 26x19", filePath: "/data/wiper-26x19-ids.json", category: "Wiper", coverSize: "26x19", vehicleType: "Universal" },
  { id: "wiper-26x20", name: "Wiper 26x20", filePath: "/data/wiper-26x20-ids.json", category: "Wiper", coverSize: "26x20", vehicleType: "Universal" },
  { id: "wiper-26x21", name: "Wiper 26x21", filePath: "/data/wiper-26x21-ids.json", category: "Wiper", coverSize: "26x21", vehicleType: "Universal" },
  { id: "wiper-26x22", name: "Wiper 26x22", filePath: "/data/wiper-26x22-ids.json", category: "Wiper", coverSize: "26x22", vehicleType: "Universal" },
  { id: "wiper-26x24", name: "Wiper 26x24", filePath: "/data/wiper-26x24-ids.json", category: "Wiper", coverSize: "26x24", vehicleType: "Universal" },
  { id: "wiper-26x26", name: "Wiper 26x26", filePath: "/data/wiper-26x26-ids.json", category: "Wiper", coverSize: "26x26", vehicleType: "Universal" },
  { id: "wiper-28x12", name: "Wiper 28x12", filePath: "/data/wiper-28x12-ids.json", category: "Wiper", coverSize: "28x12", vehicleType: "Universal" },
  { id: "wiper-28x14", name: "Wiper 28x14", filePath: "/data/wiper-28x14-ids.json", category: "Wiper", coverSize: "28x14", vehicleType: "Universal" },
  { id: "wiper-28x15", name: "Wiper 28x15", filePath: "/data/wiper-28x15-ids.json", category: "Wiper", coverSize: "28x15", vehicleType: "Universal" },
  { id: "wiper-28x16", name: "Wiper 28x16", filePath: "/data/wiper-28x16-ids.json", category: "Wiper", coverSize: "28x16", vehicleType: "Universal" },
  { id: "wiper-28x17", name: "Wiper 28x17", filePath: "/data/wiper-28x17-ids.json", category: "Wiper", coverSize: "28x17", vehicleType: "Universal" },
  { id: "wiper-28x18", name: "Wiper 28x18", filePath: "/data/wiper-28x18-ids.json", category: "Wiper", coverSize: "28x18", vehicleType: "Universal" },
  { id: "wiper-28x20", name: "Wiper 28x20", filePath: "/data/wiper-28x20-ids.json", category: "Wiper", coverSize: "28x20", vehicleType: "Universal" },
  { id: "wiper-28x21", name: "Wiper 28x21", filePath: "/data/wiper-28x21-ids.json", category: "Wiper", coverSize: "28x21", vehicleType: "Universal" },
  { id: "wiper-28x24", name: "Wiper 28x24", filePath: "/data/wiper-28x24-ids.json", category: "Wiper", coverSize: "28x24", vehicleType: "Universal" },
  { id: "wiper-28x26", name: "Wiper 28x26", filePath: "/data/wiper-28x26-ids.json", category: "Wiper", coverSize: "28x26", vehicleType: "Universal" },
  { id: "wiper-28x28", name: "Wiper 28x28", filePath: "/data/wiper-28x28-ids.json", category: "Wiper", coverSize: "28x28", vehicleType: "Universal" },
  // --- ACES Delete Template ---
  { id: "aces-delete", name: "ACES Delete Template", filePath: "/data/aces-delete-ids.json", category: "ACES Delete Template", description: "Deletes every BaseVehicleID from prior submissions (action=D). Edit the list to target a subset." },
];

export default function TemplateEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption | null>(null);
  const [vehicleIds, setVehicleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkIdInput, setBulkIdInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Vehicle data
  const [baseVehicles, setBaseVehicles] = useState<BaseVehicle[]>([]);
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [vehicleDataLoading, setVehicleDataLoading] = useState(true);
  
  // Vehicle selection
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  // Load vehicle data on mount
  useEffect(() => {
    const loadVehicleData = async () => {
      try {
        const [baseVehiclesRes, makesRes, modelsRes] = await Promise.all([
          fetch('/data/BaseVehicle.json'),
          fetch('/data/Make.json'),
          fetch('/data/Model.json')
        ]);
        
        const baseVehiclesData = await baseVehiclesRes.json();
        const makesData = await makesRes.json();
        const modelsData = await modelsRes.json();
        
        setBaseVehicles(baseVehiclesData);
        setMakes(makesData);
        setModels(modelsData);
      } catch (error) {
        console.error('Error loading vehicle data:', error);
        alert('Failed to load vehicle database');
      } finally {
        setVehicleDataLoading(false);
      }
    };
    loadVehicleData();
  }, []);

  // Create vehicle lookup map
  const vehicleLookup = useMemo(() => {
    const map = new Map<number, VehicleInfo>();
    const makeMap = new Map(makes.map(m => [m.MakeID, m.MakeName]));
    const modelMap = new Map(models.map(m => [m.ModelID, m.ModelName]));
    
    baseVehicles.forEach(bv => {
      map.set(bv.BaseVehicleID, {
        id: bv.BaseVehicleID,
        make: makeMap.get(bv.MakeID) || 'Unknown',
        model: modelMap.get(bv.ModelID) || 'Unknown',
        year: bv.YearID
      });
    });
    
    return map;
  }, [baseVehicles, makes, models]);

  // Get unique makes sorted
  const uniqueMakes = useMemo(() => {
    return makes
      .map(m => m.MakeName)
      .sort((a, b) => a.localeCompare(b));
  }, [makes]);

  // Get models for selected make
  const modelsForMake = useMemo(() => {
    if (!selectedMake) return [];
    
    const makeId = makes.find(m => m.MakeName === selectedMake)?.MakeID;
    if (!makeId) return [];
    
    const modelIds = new Set(
      baseVehicles
        .filter(bv => bv.MakeID === makeId)
        .map(bv => bv.ModelID)
    );
    
    return models
      .filter(m => modelIds.has(m.ModelID))
      .map(m => m.ModelName)
      .sort((a, b) => a.localeCompare(b));
  }, [selectedMake, makes, models, baseVehicles]);

  // Get years for selected make + model
  const yearsForMakeModel = useMemo(() => {
    if (!selectedMake || !selectedModel) return [];
    
    const makeId = makes.find(m => m.MakeName === selectedMake)?.MakeID;
    const modelId = models.find(m => m.ModelName === selectedModel)?.ModelID;
    
    if (!makeId || !modelId) return [];
    
    const years = baseVehicles
      .filter(bv => bv.MakeID === makeId && bv.ModelID === modelId)
      .map(bv => ({ year: bv.YearID, id: bv.BaseVehicleID }));
    
    return years.sort((a, b) => b.year - a.year);
  }, [selectedMake, selectedModel, makes, models, baseVehicles]);

  // Load template data
  const loadTemplate = async (template: TemplateOption) => {
    setLoading(true);
    try {
      const response = await fetch(template.filePath);
      const data = await response.json();
      // Convert strings to numbers and sort
      const ids = data.map((id: string | number) => typeof id === 'string' ? parseInt(id) : id);
      setVehicleIds(ids.sort((a: number, b: number) => a - b));
      setSelectedTemplate(template);
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template data');
    } finally {
      setLoading(false);
    }
  };

  // Add vehicles from selection
  const handleAddFromSelection = () => {
    if (selectedYears.length === 0) {
      alert('Please select at least one year');
      return;
    }
    
    const newIds = selectedYears.filter(id => !vehicleIds.includes(id));
    if (newIds.length === 0) {
      alert('All selected vehicles already exist in template');
      return;
    }
    
    setVehicleIds([...vehicleIds, ...newIds].sort((a, b) => a - b));
    setSelectedYears([]);
    alert(`Added ${newIds.length} vehicles`);
  };

  // Add multiple IDs from bulk input
  const handleBulkAdd = () => {
    const lines = bulkIdInput.split(/[\n,]/).map(line => line.trim()).filter(Boolean);
    const newIds: number[] = [];
    
    for (const line of lines) {
      const id = parseInt(line);
      if (!isNaN(id) && !vehicleIds.includes(id)) {
        newIds.push(id);
      }
    }
    
    if (newIds.length === 0) {
      alert('No valid new IDs found');
      return;
    }
    
    setVehicleIds([...vehicleIds, ...newIds].sort((a, b) => a - b));
    setBulkIdInput("");
    alert(`Added ${newIds.length} new vehicle IDs`);
  };

  // Remove vehicle ID
  const handleRemoveId = (id: number) => {
    if (!confirm(`Remove this vehicle?`)) return;
    setVehicleIds(vehicleIds.filter(vid => vid !== id));
  };

  // Download updated template JSON
  const handleDownloadJson = () => {
    if (!selectedTemplate) return;
    
    const jsonContent = JSON.stringify(vehicleIds, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.id}-ids.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate and download ACES XML
  const handleGenerateXml = () => {
    if (!selectedTemplate) return;
    
    if (vehicleIds.length === 0) {
      alert('No vehicles in this template. Please add vehicles first.');
      return;
    }

    // Build XML directly using current vehicle IDs
    const currentDate = new Date().toISOString().split('T')[0];
    const brandAaiaId = 'GFLT';
    const partTypeId = '1316';
    const partNumber = selectedTemplate.id;

    const header = `<?xml version="1.0" encoding="utf-8"?>
<ACES version="3.2">
  <Header>
    <Company>BDK Auto</Company>
    <SenderName>BDK User</SenderName>
    <SenderPhone>000-000-0000</SenderPhone>
    <TransferDate>${currentDate}</TransferDate>
    <BrandAAIAID>${brandAaiaId}</BrandAAIAID>
    <DocumentTitle>${partNumber}</DocumentTitle>
    <EffectiveDate>${currentDate}</EffectiveDate>
    <ApprovedFor>US</ApprovedFor>
    <SubmissionType>FULL</SubmissionType>
    <VcdbVersionDate>2022-06-24</VcdbVersionDate>
    <QdbVersionDate>2015-05-26</QdbVersionDate>
    <PcdbVersionDate>2022-07-08</PcdbVersionDate>
  </Header>`;

    // ACES Delete Template generates delete actions; everything else adds
    const acesAction = selectedTemplate.category === "ACES Delete Template" ? "D" : "A";
    const apps = vehicleIds.map((baseVehicleId, index) => {
      return `    <App action="${acesAction}" id="${index + 1}">
      <BaseVehicle id="${baseVehicleId}" />
      <Note />
      <Qty>1</Qty>
      <PartType id="${partTypeId}" />
      <Part>${partNumber}</Part>
    </App>`;
    }).join('\n');

    const recordCount = vehicleIds.length;
    const footer = `\n  <Footer>\n    <RecordCount>${recordCount}</RecordCount>\n  </Footer>\n</ACES>`;
    const xmlContent = header + '\n' + apps + footer;

    try {
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.id}-${currentDate}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating XML:', error);
      alert('Failed to generate XML');
    }
  };

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, TemplateOption[]> = {};
    TEMPLATES.forEach(t => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, []);

  // Get vehicle info with search
  const vehiclesWithInfo = useMemo(() => {
    return vehicleIds
      .map(id => vehicleLookup.get(id))
      .filter((v): v is VehicleInfo => v !== undefined)
      .filter(v => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          v.make.toLowerCase().includes(term) ||
          v.model.toLowerCase().includes(term) ||
          v.year.toString().includes(term) ||
          v.id.toString().includes(term)
        );
      });
  }, [vehicleIds, vehicleLookup, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent" style={{ letterSpacing: '-0.04em' }}>
              Template Editor
            </h1>
            <p className="text-gray-500 mt-2">Add or remove vehicles from templates</p>
          </div>
          <Link href="/" className="apple-btn apple-btn-secondary px-6 py-3">
            ← Back to Home
          </Link>
        </div>

        {vehicleDataLoading ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading vehicle database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Template Selection */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-3xl p-6">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Select Template</h2>
                <div className="space-y-5">
                  {Object.entries(groupedTemplates).map(([category, templates]) => (
                    <div key={category}>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{category}</p>
                      <div className="space-y-1">
                        {templates.map(template => {
                          const isSelected = selectedTemplate?.id === template.id;
                          return (
                            <button
                              key={template.id}
                              onClick={() => loadTemplate(template)}
                              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                                isSelected
                                  ? 'bg-blue-500 text-white shadow-md'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              <p className="font-semibold text-sm leading-tight">{template.name}</p>
                              {(template.description || template.coverSize || template.vehicleType) && (
                                <p className={`text-xs mt-0.5 leading-snug truncate ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                  {[template.coverSize, template.vehicleType, template.description].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Editor */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="glass-card rounded-3xl p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                  <p className="mt-4 text-gray-600">Loading template...</p>
                </div>
              ) : selectedTemplate ? (
                <div className="space-y-6">
                  {/* Header with stats */}
                  <div className="glass-card rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">{selectedTemplate.category}</p>
                        <h2 className="text-3xl font-semibold text-gray-900">{selectedTemplate.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-gray-500">{vehicleIds.length} vehicles</p>
                          {selectedTemplate.coverSize && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">{selectedTemplate.coverSize}</span>
                          )}
                          {selectedTemplate.vehicleType && (
                            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium border border-green-100">{selectedTemplate.vehicleType}</span>
                          )}
                        </div>
                        {selectedTemplate.description && (
                          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{selectedTemplate.description}</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleDownloadJson}
                          className="apple-btn apple-btn-secondary px-6 py-3"
                        >
                          💾 Save JSON
                        </button>
                        <button
                          onClick={handleGenerateXml}
                          className="apple-btn apple-btn-primary px-6 py-3"
                        >
                          📄 Generate XML
                        </button>
                      </div>
                    </div>

                    {/* Vehicle Selector */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">Add Vehicle by Selection</label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                          className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                          value={selectedMake}
                          onChange={e => {
                            setSelectedMake(e.target.value);
                            setSelectedModel("");
                            setSelectedYears([]);
                          }}
                        >
                          <option value="">Select Make</option>
                          {uniqueMakes.map(make => (
                            <option key={make} value={make}>{make}</option>
                          ))}
                        </select>

                        <select
                          className="px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                          value={selectedModel}
                          onChange={e => {
                            setSelectedModel(e.target.value);
                            setSelectedYears([]);
                          }}
                          disabled={!selectedMake}
                        >
                          <option value="">Select Model</option>
                          {modelsForMake.map(model => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>

                      {yearsForMakeModel.length > 0 && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-sm font-medium text-gray-700 mb-3">Select Years:</p>
                          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                            {yearsForMakeModel.map(({ year, id }) => {
                              const isAlreadyAdded = vehicleIds.includes(id);
                              return (
                                <label
                                  key={id}
                                  className={`flex items-center justify-center px-3 py-2 rounded-lg transition-all ${
                                    isAlreadyAdded
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : selectedYears.includes(id)
                                      ? 'bg-blue-500 text-white cursor-pointer'
                                      : 'bg-white text-gray-700 hover:bg-gray-100 cursor-pointer'
                                  } border border-gray-200`}
                                >
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedYears.includes(id)}
                                    disabled={isAlreadyAdded}
                                    onChange={e => {
                                      if (e.target.checked) {
                                        setSelectedYears([...selectedYears, id]);
                                      } else {
                                        setSelectedYears(selectedYears.filter(y => y !== id));
                                      }
                                    }}
                                  />
                                  <span className="text-sm font-medium">{year}</span>
                                </label>
                              );
                            })}
                          </div>
                          <button
                            onClick={handleAddFromSelection}
                            className="mt-4 w-full apple-btn apple-btn-primary px-6 py-3"
                            disabled={selectedYears.length === 0}
                          >
                            Add Selected ({selectedYears.length})
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bulk Add */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Add by ID (one per line or comma-separated)</label>
                      <textarea
                        className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 font-mono text-sm resize-none"
                        placeholder="123, 456, 789"
                        value={bulkIdInput}
                        onChange={e => setBulkIdInput(e.target.value)}
                      />
                      <button
                        onClick={handleBulkAdd}
                        className="mt-3 apple-btn apple-btn-secondary px-6 py-3"
                      >
                        Bulk Add
                      </button>
                    </div>
                  </div>

                  {/* Vehicle List */}
                  <div className="glass-card rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-gray-900">Vehicles in Template</h3>
                      <input
                        type="text"
                        placeholder="Search make, model, year..."
                        className="px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 text-sm w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {vehiclesWithInfo.map(vehicle => (
                        <div
                          key={vehicle.id}
                          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 hover:border-red-300 transition-all group"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-xs text-gray-500">ID: {vehicle.id}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveId(vehicle.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 font-bold transition-opacity px-3 py-1 rounded-lg hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {vehiclesWithInfo.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        {searchTerm ? 'No vehicles found matching your search' : 'No vehicles in this template'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-8 text-center">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a template</h3>
                  <p className="text-gray-500">Choose a template from the left to start editing</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
