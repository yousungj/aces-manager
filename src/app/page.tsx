'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { getTemplateForSubcategory } from "../templates/template-registry";

type TemplateVersion = { id: string; label: string; description?: string };
type Subcategory = { id: string; name: string; description?: string; versions?: TemplateVersion[] };
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
  { code: "BVTL", name: "Caterpillar" },
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
  { name: "Sunshade", id: "12353" },
  { name: "Truck Bed Liner", id: "1008" },
  { name: "Hubcap", id: "10026" },
];

const DEFAULT_TREE: Folder[] = [
  { id: "mega", name: "1. Seat Cover", children: [
      { id: "mega-super", name: "Mega Super", versions: [
          { id: "mega-super-sep2026", label: "Sep 2026 update (latest)", description: "11,153 BVs. VCdb 2026-09-24 기준 sync: 주요 32개 브랜드 2024-2027 신규 143개 (2027MY 다수 + 신규 차종 Kia EV5, BMW iX5, INFINITI QX65, Nissan Kait, Genesis GV60 Magma, Subaru Trailseeker/Uncharted 2027, Sprinter 2025-26 등) + 기존 차종 연도 공백(≤4년) 90개 채움 (Audi A4 2021-23, BMW 320i 2020-23, Yaris 2021-23 등). VCdb에서 삭제된 stale ID 10개 제거." },
          { id: "mega-super", label: "Jun 2026 (previous)", description: "10,930 BVs. VCdb 2026-05-28 sync 버전 (stale ID 10개 포함)." },
        ]},
      { id: "mega-wo-int", name: "Seat Cover WO IHR", versions: [
          { id: "sc-wo-ihr-sep2026", label: "Sep 2026 update (latest)", description: "14,019 BVs. Jun 2026 + VCdb 2026-09-24 신규 연도 118개 (기존 차종만, 대부분 2027MY; Kona Electric 2026 공백 포함). 6월에 IHR로 제외한 차종(BMW M3/M4/M5/M440i, Audi RS3, BRZ, Charger 2024-25)은 계속 제외. stale ID 16개 제거." },
          { id: "sc-wo-ihr-jun2026", label: "Jun 2026 update", description: "13,917 BVs. Deduped + curated 2024-2027 expansion. Excludes Tesla 3/S/X/Y, Cybertruck, Audi Q6/SQ6 e-tron, Porsche 911/718/Taycan, BMW M-series, Mercedes AMG, Audi RS, Toyota GR, BRZ, Nissan Z, MX-5, Ioniq N. Includes Mercedes S/EQS/EQE non-AMG, BMW iX/i5 non-M, Lexus RZ, Cadillac EVs, Audi A7 2016-2017, Chrysler Pacifica 2004-2008." },
          { id: "mega-wo-int", label: "Legacy (original)", description: "13,568 BVs (with 43 dups). Original template before Jun 2026 audit." },
        ]},
      { id: "sc-fronts-2026", name: "SC-Fronts-Reduced-2026" },
      { id: "sc-fronts-2026-joven", name: "SC-Fronts-Reduced-2026-Joven" },
      { id: "sc-full-bench-2026", name: "SC-Full_withBench_Reduced-2026" },
    ]},
  { id: "swc", name: "2. Steering Wheel Cover", children: [
      { id: "swc-m", name: "SWC 15 inch", versions: [
          { id: "swc-15inch-sep2026", label: "Sep 2026 update (latest)", description: "1,644 BVs. Jun 2026 + VCdb 2026-09-24 신규 2027MY 11개 (Civic, Compass, Grand Cherokee, Wrangler, RX350, Altima, Sienna, Santa Fe, G70, GV70, Transit-150). 핸들 사이즈 재확인: 신형 세대 중 15/16 경계를 넘은 차종 없음 (Compass 2027은 MP carryover, Grand Cherokee WL 15\")." },
          { id: "swc-15inch-jun2026", label: "Jun 2026 update", description: "1,633 unique BVs. Deduped (305 dups removed), year-by-year reassigned per SWC_template_by_year.xlsx, +2026/2027 new years from VCdb 2026-05-28." },
          { id: "swc-m", label: "Legacy (original)", description: "1,884 raw entries (1,579 unique, 305 dups). Pre-Jun 2026 audit." },
        ]},
      { id: "swc-l", name: "SWC 16 inch", versions: [
          { id: "swc-16inch-sep2026", label: "Sep 2026 update (latest)", description: "746 BVs. Jun 2026 + VCdb 2026-09-24 신규 2027MY 14개 (F-150, Sierra 1500, Ram 3500, Sequoia, LX600, Gladiator, Grand Cherokee L, Range Rover, Discovery, Bronco Sport, Express/Savana 2500·3500). Grand Cherokee 2024-2026 중복 제거 (SWC 15와 겹쳤음, 엑셀 15¼\" → SWC 15). ⚠ Sierra/Silverado 1500 2027은 신형 5세대, 핸들 지름 미확인." },
          { id: "swc-16inch-jun2026", label: "Jun 2026 update", description: "735 BVs. Excel-authoritative year assignments (overlap models reassigned to/from SWC 15) + 2026/2027 new years from VCdb 2026-05-28." },
          { id: "swc-l", label: "Legacy (original)", description: "791 BVs. Pre-Jun 2026 audit, contained Jeep Wrangler 2007-2016 (since moved to SWC 15)." },
        ]},
    ]},
  { id: "car-cover", name: "3. Car Cover", children: [
      { id: "cc-s", name: "Small (CC1)", versions: [
          { id: "cc-s-aug2026", label: "Aug 2026 update (latest)", description: "704 BVs (≤157in). Deduped (8 dups removed), +39 new model-years from VCdb 2026-05-28 (Miata 2025-26, Mini Cooper 2026, Swift 2007-2026, Prius C 2021, Yaris hatch 등). Aveo 2012+/Mazda2 2015+/Yaris 2022+/Countryman 2025+는 사이즈 초과로 CC2/CC3로 이동 배정." },
          { id: "cc-s", label: "Legacy (original)", description: "673 raw entries (665 unique). Pre-Aug 2026 audit." },
        ]},
      { id: "cc-m", name: "Medium (CC2)", versions: [
          { id: "cc-m-aug2026", label: "Aug 2026 update (latest)", description: "1,017 BVs (≤170in). +62 new model-years: Z4 2025-26, Nissan Z 2024-27, BRZ 2026-27, 718 Boxster 2025 + size-guide 이동분(Aveo 2012+, Mazda2 2015+, Yaris 2022+)." },
          { id: "cc-m", label: "Legacy (original)", description: "955 BVs. Pre-Aug 2026 audit." },
        ]},
      { id: "cc-l", name: "Large (CC3)", versions: [
          { id: "cc-l-aug2026", label: "Aug 2026 update (latest)", description: "4,485 BVs (≤190in). Deduped (46 dups), stale ID 1개 제거, +216 new model-years: Audi A4 2021-25/A5 2015-26, 911 2025-26, IS350 2025-27, SL 2025-26, Sentra/Altima 2026-27, WRX 2026, 2027MY 다수 + 이동분(320i/323i G20·E90 CC4→CC3, Forte5, Countryman)." },
          { id: "cc-l", label: "Legacy (original)", description: "4,316 raw entries (4,270 unique). Pre-Aug 2026 audit." },
        ]},
      { id: "cc-xl1", name: "XL1 (CC4)", versions: [
          { id: "cc-xl1-aug2026", label: "Aug 2026 update (latest)", description: "4,108 BVs (≤210in). Deduped (15 dups), stale ID 6개 제거, +164 new model-years: A6 2020-26, K5 2025-27, Panamera 2024-26, Taycan 2025-27, S/E-Class 2025-26, AMG GT 2024-26, 7-Series 2024-27, Camry/Accord 2027, 신형 Vanquish 2025-27(CC3→CC4) 등." },
          { id: "cc-xl1", label: "Legacy (original)", description: "3,965 raw entries (3,950 unique). Pre-Aug 2026 audit." },
        ]},
      { id: "cc-xl2", name: "XL2 (CC5)", versions: [
          { id: "cc-xl2-aug2026", label: "Aug 2026 update (latest)", description: "1,633 BVs (≤228in). +32 new model-years: Maybach S580/S680 2024-27, Ghost 2024-27, Flying Spur 2025-27, LS500 2025-26, G80/Charger 2027 + Phantom 2024-27 (227in, CC4→CC5 이동)." },
          { id: "cc-xl2", label: "Legacy (original)", description: "1,601 BVs. Pre-Aug 2026 audit." },
        ]},
      { id: "cc3-cc4", name: "CC3+CC4", description: "Large + XL1 통합 (≤210in). Aug 2026 데이터 기준 8,593 BVs, 중복 없음." },
    ]},
  { id: "suv-cover", name: "4. Vehicle Cover", children: [
      { id: "suv-l", name: "Small (VC0)" },
      { id: "suv-xl1", name: "Medium (VC1)" },
      { id: "suv-xl2", name: "Large (VC2)" },
      { id: "suv-xl3", name: "XL (VC3)" },
    ]},
  { id: "windshield", name: "5. Windshield Cover", children: [
      { id: "as-small", name: "AS-SMALL", description: 'W-28.5" x L-59"' },
      { id: "as-medium", name: "AS-MEDIUM", description: 'W-32" x L-61"' },
      { id: "as-large", name: "AS-LARGE", description: 'W-33.5" x L-64"' },
      { id: "as-xlarge", name: "AS-XLARGE", description: 'W-36" x L-66"' },
      { id: "as-58-24", name: "AS-58-24" },
      { id: "as-66-27", name: "AS-66-27" },
    ]},
  { id: "tonneau", name: "6. Tonneau Cover", children: [
      { id: "mbtn-1111-bf", name: "MBTN-1111-BF", description: "Ford F150 2015-2026 | 5.5ft" },
      { id: "mbtn-1155-bf", name: "MBTN-1155-BF", description: "Ford F150 2009-2026 | 6.4ft" },
      { id: "mbtn-1466-bf", name: "MBTN-1466-BF", description: "Ford F250/F350 1999-2016 | 6.8ft" },
      { id: "mbtn-1476-bf", name: "MBTN-1476-BF", description: "Ford F250/F350 2017-2026 | 6.8ft" },
      { id: "mbtn-2223-bf", name: "MBTN-2223-BF", description: "Ram/Dodge 2002-2026 | 6.4ft" },
      { id: "mbtn-2243-bf", name: "MBTN-2243-BF", description: "Ram/Dodge New Body 2019-2026 | 6.4ft" },
      { id: "mbtn-2254-bf", name: "MBTN-2254-BF", description: "Ram/Dodge 2009-2026 | 5.7ft" },
      { id: "mbtn-3332-bf", name: "MBTN-3332-BF", description: "Chevy/GMC 2007-2018 | 5.8ft" },
      { id: "mbtn-3342-bf", name: "MBTN-3342-BF", description: "Chevy/GMC 2019-2026 | 5.8ft" },
      { id: "mbtn-3587-bf", name: "MBTN-3587-BF", description: "Chevy/GMC 2014-2018 | 6.6ft" },
      { id: "mbtn-3687-bf", name: "MBTN-3687-BF", description: "Chevy/GMC 2500HD 2014-2018 | 6.6ft" },
      { id: "mbtn-3710-bf", name: "MBTN-3710-BF", description: "Colorado/Canyon 2015-2026 | 5.2ft" },
      { id: "mbtn-3f-2223-bf", name: "MBTN-3F-2223-BF", description: "Ram/Dodge 2002-2026 | 6.4ft" },
      { id: "mbtn-4820-bf", name: "MBTN-4820-BF", description: "Nissan Frontier 2005-2026 | 5.0ft" },
      { id: "mbtn-5910-bf", name: "MBTN-5910-BF", description: "Toyota Tacoma 2016-2023 | 5.0ft" },
    ]},
  { id: "floormat", name: "7. Floor Mat", children: [
      { id: "camt-3103", name: "CAMT-3103", description: "Ford F-150 SuperCrew Cab 2015-2026" },
      { id: "camt-3143-bk", name: "CAMT-3143-BK", description: "Ford Bronco Sport 2021-2026" },
      { id: "camt-3201-bk", name: "CAMT-3201-BK", description: "Tesla Model Y 2020-2024" },
      { id: "camt-3202-bk", name: "CAMT-3202-BK", description: "Tesla Model 3 2017-2023" },
      { id: "camt-3301-bk", name: "CAMT-3301-BK", description: "Jeep Wrangler JL 2018-2027" },
      { id: "camt-3302-bk", name: "CAMT-3302-BK", description: "Jeep Gladiator JT 2020-2027 | 2 Front" },
      { id: "camt-3303-bk", name: "CAMT-3303-BK", description: "Jeep Wrangler 4xe 4 Door 2021-2026" },
      { id: "camt-3304-bk", name: "CAMT-3304-BK", description: "Jeep Gladiator JT 2020-2027 | Full Set" },
      { id: "camt-3401-bk", name: "CAMT-3401-BK", description: "Ram 1500/2500/3500 Crew Cab 2009-2018 & 1500 Classic" },
      { id: "camt-3501-bk", name: "CAMT-3501-BK", description: "Silverado/Sierra Bench 2019-2026" },
      { id: "camt-3502-bk", name: "CAMT-3502-BK", description: "Silverado/Sierra Front 2019-2026" },
      { id: "camt-3523-bk", name: "CAMT-3523-BK", description: "Chevy Equinox / GMC Terrain 2018-2024" },
      { id: "camt-3603-bk", name: "CAMT-3603-BK", description: "Toyota Tacoma 2016-2023 Double Cab" },
      { id: "camt-3613-bk", name: "CAMT-3613-BK", description: "Toyota RAV4 2019-2025" },
      { id: "camt-3624-bk", name: "CAMT-3624-BK", description: "Toyota Highlander 2020-2027" },
      { id: "camt-3703-bk", name: "CAMT-3703-BK", description: "Honda Civic 2022-2027 / Acura Integra 2023-2026" },
      { id: "camt-3713-bk", name: "CAMT-3713-BK", description: "Honda CR-V 2023-2027" },
      { id: "camt-3111-bk", name: "CAMT-3111-BK", description: "Ford F-250/F-350 Super Duty Crew Cab 2017-2027 | Rear" },
      { id: "camt-3112-bk", name: "CAMT-3112-BK", description: "Ford F-250/F-350 Super Duty Crew Cab 2017-2027 | Front" },
      { id: "camt-3121-bk", name: "CAMT-3121-BK", description: "Ford F-150 Crew Cab 2010-2014 | Rear" },
      { id: "camt-3122-bk", name: "CAMT-3122-BK", description: "Ford F-150 Crew Cab 2010-2014 | Front" },
      { id: "camt-3131-bk", name: "CAMT-3131-BK", description: "Ford F-150 SuperCab (Extended) 2015-2027 | Rear" },
      { id: "camt-3132-bk", name: "CAMT-3132-BK", description: "Ford F-150 SuperCab (Extended) 2015-2027 | Front" },
      { id: "camt-3148-bk", name: "CAMT-3148-BK", description: "Ford Bronco Sport 2021-2026 | Full Set w/ trunk" },
      { id: "camt-3153-bk", name: "CAMT-3153-BK", description: "Ford Bronco 4-Door 2021-2027 | Full Set" },
      { id: "camt-3163-bk", name: "CAMT-3163-BK", description: "Ford Maverick Hybrid 2022-2027" },
      { id: "camt-3173-bk", name: "CAMT-3173-BK", description: "Ford Mustang 2015-2026 | Full Set" },
      { id: "camt-3183-bk", name: "CAMT-3183-BK", description: "Ford Ranger Crew 2019-2023 | Full Set" },
      { id: "camt-3184-bk", name: "CAMT-3184-BK", description: "Ford Ranger SuperCrew 2024-Present | Full Set" },
      { id: "camt-3193-bk", name: "CAMT-3193-BK", description: "Ford F-150 SuperCrew 2015-2023 | Full Set" },
      { id: "camt-3213-bk", name: "CAMT-3213-BK", description: "Tesla Model Y 2025-2027 | Full Set" },
      { id: "camt-3218-bk", name: "CAMT-3218-BK", description: "Tesla Model Y 2024-Present | Full Set w/ trunk" },
      { id: "camt-3223-bk", name: "CAMT-3223-BK", description: "Tesla Model 3 2024-2027 | Full Set" },
      { id: "camt-3308-bk", name: "CAMT-3308-BK", description: "Jeep Wrangler 4WD 2018-2027 | Full Set w/ trunk" },
      { id: "camt-3333-bk", name: "CAMT-3333-BK", description: "Jeep Grand Cherokee 5-Seat 2022-2027 | Full Set" },
      { id: "camt-3334-bk", name: "CAMT-3334-BK", description: "Jeep Grand Cherokee L 7-Seat 2021-2027 | Full Set" },
      { id: "camt-3338-bk", name: "CAMT-3338-BK", description: "Jeep Grand Cherokee 5-Seat 2022-2027 | Full Set w/ trunk" },
      { id: "camt-3413-bk", name: "CAMT-3413-BK", description: "Ram 1500 Crew Cab 2019-Present | Full Set" },
      { id: "camt-3414-bk", name: "CAMT-3414-BK", description: "Ram 1500 Crew Cab 2019-Present | Full Set" },
      { id: "camt-3423-bk", name: "CAMT-3423-BK", description: "Dodge Charger 2011-2023 | Full Set" },
      { id: "camt-3511-bk", name: "CAMT-3511-BK", description: "Chevy Silverado 1500 Double Cab 2014-2018 | Rear" },
      { id: "camt-3512-bk", name: "CAMT-3512-BK", description: "Chevy Silverado 1500 Regular Cab 2014-2018 | Front" },
      { id: "camt-3521-bk", name: "CAMT-3521-BK", description: "Chevy Silverado 1500 Crew Cab 2014-2018 | Rear" },
      { id: "camt-3533-bk", name: "CAMT-3533-BK", description: "Chevy Colorado / GMC Canyon Crew Cab 2023-2027" },
      { id: "camt-3534-bk", name: "CAMT-3534-BK", description: "Chevy Colorado / GMC Canyon Crew Cab 2015-2022 | Full Set" },
      { id: "camt-3542-bk", name: "CAMT-3542-BK", description: "Chevy Tahoe / GMC Yukon 2015-2022" },
      { id: "camt-3544-bk", name: "CAMT-3544-BK", description: "Chevy Tahoe / GMC Yukon 2021-2027" },
      { id: "camt-3604-bk", name: "CAMT-3604-BK", description: "Toyota Tacoma 4th Gen Double Cab 2024-2027 | Full Set" },
      { id: "camt-3618-bk", name: "CAMT-3618-BK", description: "Toyota RAV4 2019-2025 | Full Set w/ trunk" },
      { id: "camt-3633-bk", name: "CAMT-3633-BK", description: "Toyota Camry 2025-2027" },
      { id: "camt-3634-bk", name: "CAMT-3634-BK", description: "Toyota Camry 2018-2024 | Full Set" },
      { id: "camt-3638-bk", name: "CAMT-3638-BK", description: "Toyota Camry 2025-2027 | Full Set w/ trunk" },
      { id: "camt-3643-bk", name: "CAMT-3643-BK", description: "Toyota Tundra Crew 2014-2021 | Full Set" },
      { id: "camt-3644-bk", name: "CAMT-3644-BK", description: "Toyota Tundra 3rd Gen CrewMax 2022-2026 | Full Set" },
      { id: "camt-3648-bk", name: "CAMT-3648-BK", description: "Toyota Tundra 3rd Gen CrewMax 2022-2026 | Full Set w/ trunk" },
      { id: "camt-3654-bk", name: "CAMT-3654-BK", description: "Toyota Sienna 2013-2020 | Full Set" },
      { id: "camt-3655-bk", name: "CAMT-3655-BK", description: "Toyota Sienna 2021-2026 | Full Set" },
      { id: "camt-3658-bk", name: "CAMT-3658-BK", description: "Toyota Sienna 2021-2026 | Full Set w/ trunk" },
      { id: "camt-3663-bk", name: "CAMT-3663-BK", description: "Toyota 4Runner 2013-2024 | Full Set" },
      { id: "camt-3664-bk", name: "CAMT-3664-BK", description: "Toyota 4Runner 2025-2027" },
      { id: "camt-3673-bk", name: "CAMT-3673-BK", description: "Toyota Corolla Cross AWD XLE 2022-2026 | Full Set" },
      { id: "camt-3683-bk", name: "CAMT-3683-BK", description: "Toyota Corolla Sedan 2020-2027 | Full Set" },
      { id: "camt-3693-bk", name: "CAMT-3693-BK", description: "Toyota Prius 2016-2022 | Full Set" },
      { id: "camt-3694-bk", name: "CAMT-3694-BK", description: "Toyota Prius 2023-2027 | Full Set" },
      { id: "camt-3718-bk", name: "CAMT-3718-BK", description: "Honda CR-V 2023-2027 | Full Set w/ trunk" },
      { id: "camt-3724-bk", name: "CAMT-3724-BK", description: "Honda Ridgeline Crew Cab 2017-2026" },
      { id: "camt-3734-bk", name: "CAMT-3734-BK", description: "Honda Odyssey 2018-2027 | Full Set" },
      { id: "camt-3803-bk", name: "CAMT-3803-BK", description: "Lexus GX 550 / Toyota Land Cruiser 2024-2026 | Full Set" },
      { id: "camt-3904-bk", name: "CAMT-3904-BK", description: "Kia Sorento 2021-2027 | Full Set" },
      { id: "camt-3905-bk", name: "CAMT-3905-BK", description: "Kia Sorento 2016-2020 | Full Set" },
      { id: "camt-3913-bk", name: "CAMT-3913-BK", description: "Kia Sportage 2023-2027 (Gas only, not Hybrid) | Full Set" },
      { id: "camt-4104-bk", name: "CAMT-4104-BK", description: "Ford Expedition 2018-2024 | Full Set" },
      { id: "camt-4113-bk", name: "CAMT-4113-BK", description: "Ford Edge 2015-2024 | Full Set" },
      { id: "camt-4123-bk", name: "CAMT-4123-BK", description: "Ford Escape 2020-2026 | Full Set" },
      { id: "camt-4135-bk", name: "CAMT-4135-BK", description: "Ford Explorer 2020-2026 | Full Set" },
      { id: "camt-4138-bk", name: "CAMT-4138-BK", description: "Ford Explorer 2020-2026 | Full Set w/ trunk" },
      { id: "camt-4203-bk", name: "CAMT-4203-BK", description: "Mazda CX-5 2017-2025 | Full Set" },
      { id: "camt-4303-bk", name: "CAMT-4303-BK", description: "Volkswagen Jetta 2019-2026" },
    ]},
  { id: "truckbedmat", name: "8. Truck Bed Mat", children: [
      { id: "camt-3519", name: "CAMT-3519", description: "Chevy Silverado 5.8ft 2010-2018" },
    ]},
  { id: "hubcap", name: "9. Hubcap", children: [
      { id: "uma2025-kt16", name: "UMA2025-KT16" },
    ]},
  { id: "wiper", name: "10. Wiper", children: [
      { id: "wiper-13x13", name: "WIPER-13x13" },
      { id: "wiper-15x15", name: "WIPER-15x15" },
      { id: "wiper-16x16", name: "WIPER-16x16" },
      { id: "wiper-17x17", name: "WIPER-17x17" },
      { id: "wiper-18x15", name: "WIPER-18x15" },
      { id: "wiper-18x17", name: "WIPER-18x17" },
      { id: "wiper-18x18", name: "WIPER-18x18" },
      { id: "wiper-19x17", name: "WIPER-19x17" },
      { id: "wiper-19x18", name: "WIPER-19x18" },
      { id: "wiper-19x19", name: "WIPER-19x19" },
      { id: "wiper-20x16", name: "WIPER-20x16" },
      { id: "wiper-20x17", name: "WIPER-20x17" },
      { id: "wiper-20x18", name: "WIPER-20x18" },
      { id: "wiper-20x19", name: "WIPER-20x19" },
      { id: "wiper-20x20", name: "WIPER-20x20" },
      { id: "wiper-21x17", name: "WIPER-21x17" },
      { id: "wiper-21x18", name: "WIPER-21x18" },
      { id: "wiper-21x19", name: "WIPER-21x19" },
      { id: "wiper-21x20", name: "WIPER-21x20" },
      { id: "wiper-21x21", name: "WIPER-21x21" },
      { id: "wiper-22x14", name: "WIPER-22x14" },
      { id: "wiper-22x16", name: "WIPER-22x16" },
      { id: "wiper-22x17", name: "WIPER-22x17" },
      { id: "wiper-22x18", name: "WIPER-22x18" },
      { id: "wiper-22x19", name: "WIPER-22x19" },
      { id: "wiper-22x20", name: "WIPER-22x20" },
      { id: "wiper-22x21", name: "WIPER-22x21" },
      { id: "wiper-22x22", name: "WIPER-22x22" },
      { id: "wiper-24x14", name: "WIPER-24x14" },
      { id: "wiper-24x15", name: "WIPER-24x15" },
      { id: "wiper-24x16", name: "WIPER-24x16" },
      { id: "wiper-24x17", name: "WIPER-24x17" },
      { id: "wiper-24x18", name: "WIPER-24x18" },
      { id: "wiper-24x19", name: "WIPER-24x19" },
      { id: "wiper-24x20", name: "WIPER-24x20" },
      { id: "wiper-24x21", name: "WIPER-24x21" },
      { id: "wiper-24x22", name: "WIPER-24x22" },
      { id: "wiper-24x24", name: "WIPER-24x24" },
      { id: "wiper-26x14", name: "WIPER-26x14" },
      { id: "wiper-26x15", name: "WIPER-26x15" },
      { id: "wiper-26x16", name: "WIPER-26x16" },
      { id: "wiper-26x17", name: "WIPER-26x17" },
      { id: "wiper-26x18", name: "WIPER-26x18" },
      { id: "wiper-26x19", name: "WIPER-26x19" },
      { id: "wiper-26x20", name: "WIPER-26x20" },
      { id: "wiper-26x21", name: "WIPER-26x21" },
      { id: "wiper-26x22", name: "WIPER-26x22" },
      { id: "wiper-26x24", name: "WIPER-26x24" },
      { id: "wiper-26x26", name: "WIPER-26x26" },
      { id: "wiper-28x12", name: "WIPER-28x12" },
      { id: "wiper-28x14", name: "WIPER-28x14" },
      { id: "wiper-28x15", name: "WIPER-28x15" },
      { id: "wiper-28x16", name: "WIPER-28x16" },
      { id: "wiper-28x17", name: "WIPER-28x17" },
      { id: "wiper-28x18", name: "WIPER-28x18" },
      { id: "wiper-28x20", name: "WIPER-28x20" },
      { id: "wiper-28x21", name: "WIPER-28x21" },
      { id: "wiper-28x24", name: "WIPER-28x24" },
      { id: "wiper-28x26", name: "WIPER-28x26" },
      { id: "wiper-28x28", name: "WIPER-28x28" },
    ]},
  { id: "aces-delete-cat", name: "11. ACES Delete Template", children: [
      { id: "aces-delete", name: "ACES Delete Template", description: "action=\"D\" over all prior BaseVehicleIDs" },
    ]},
  { id: "vehicle-type-cat", name: "12. Vehicle Type", children: [
      { id: "truck-all", name: "Truck (All)", description: "All trucks (VehicleTypeID=6) from VCdb 2026-04-30 — 9,833 BaseVehicleIDs" },
    ]},
  { id: "truck-cover", name: "13. Truck Cover", children: [
      { id: "catc-843", name: "Regular Cab (CATC-843)", description: "컴팩트/미드사이즈 레귤러캡. 208x70x65, max bed 90in. 500 apps (Ranger·S10·Tacoma reg 등). 캡별 BodyType + 롱베드 BedLength 분리 적용." },
      { id: "catc-844", name: "Extended & Crew Cab (CATC-844)", description: "컴팩트/미드사이즈 확장·크루캡. 232x75x65, max bed 84in. 527 apps (Tacoma Double·Colorado Crew·Maverick·Gladiator JT 등)." },
      { id: "catc-845", name: "Full Size Regular Cab (CATC-845)", description: "풀사이즈 레귤러캡. 230x75x65, max bed 96in. 1,735 apps (F-150/250/350·Silverado·Ram reg + Dakota/T100 롱베드 승격분)." },
      { id: "catc-846", name: "Full Size Extended Cab (CATC-846)", description: "풀사이즈 확장캡·쿼드캡. 250x80x65, max bed 96in. 773 apps (SuperCab·Double Cab·Quad Cab + Avalanche/Cybertruck/R1T 등 short crew)." },
      { id: "catc-847", name: "Full Size Crew Cab (CATC-847)", description: "풀사이즈 크루캡. 264x80x65, max bed 96in. 791 apps (SuperCrew·Crew/Mega Cab·CrewMax·Lightning 등). Hummer EV 폭 초과로 제외." },
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
      // v10 bumped when adding Sep 2026 update versions (Mega Super, WO IHR, SWC 15/16)
      const saved = localStorage.getItem("aces_tree_v10");
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
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
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

  // Reset version selection when the parent template changes; default to first (latest) version
  React.useEffect(() => {
    if (selectedTemplate?.versions && selectedTemplate.versions.length > 0) {
      setSelectedVersionId(selectedTemplate.versions[0].id);
    } else {
      setSelectedVersionId(null);
    }
  }, [selectedTemplate]);

  // Effective version (the one actually used for XML generation + history)
  const effectiveVersion = useMemo(() => {
    if (!selectedTemplate?.versions) return null;
    return selectedTemplate.versions.find(v => v.id === selectedVersionId) || selectedTemplate.versions[0] || null;
  }, [selectedTemplate, selectedVersionId]);

  // The actual template id to use for XML generation and history tracking.
  // If versions array is present, use the selected version's id; otherwise use the subcategory's own id.
  const effectiveTemplateId = effectiveVersion?.id || selectedTemplate?.id || null;
  const effectiveTemplateName = effectiveVersion
    ? `${selectedTemplate?.name} — ${effectiveVersion.label}`
    : (selectedTemplate?.name || "");

  const selectedBulkBrandName = BRAND_OPTIONS.find(b => b.code === bulkBrandCode)?.name || "";
  const selectedBulkPartTypeName = PART_TYPE_OPTIONS.find(p => p.id === bulkPartTypeId)?.name || "";

  const previewGeneration = () => {
    // 미리보기 로직 (기존 그대로)
    const rows: GenerateRow[] = mode === "single" 
      ? [{ partNumber: singlePartNumber, brandAaiaId: singleBrandCode, partTypeId: singlePartTypeId }]
      : parseBulkParts(bulkText).map(pn => ({ partNumber: pn, brandAaiaId: bulkBrandCode, partTypeId: bulkPartTypeId }));
    
    setLastPreview({
      templateId: effectiveTemplateId || path.level2 || "unknown",
      templateName: effectiveTemplateName || selectedTemplate?.name || "Unknown",
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

    // Get the template function for the EFFECTIVE template (respects version selection)
    const templateLookupId = effectiveTemplateId || selectedTemplate.id;
    const templateFunc = getTemplateForSubcategory(templateLookupId);
    if (!templateFunc) {
      alert(`No template configured for ${effectiveTemplateName || selectedTemplate.name}. Please contact administrator.`);
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

    // Show save prompt — use the EFFECTIVE template id so history is tracked per version
    setPendingSubmission({ templateId: templateLookupId, templateName: effectiveTemplateName || selectedTemplate.name, rows });
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
            <Link
              href="/walmart-checker"
              className="apple-btn apple-btn-primary px-6 py-3 whitespace-nowrap"
            >
              🛒 Walmart Checker
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
                    {effectiveTemplateId && submissionHistory[effectiveTemplateId]?.length > 0 && (
                      <button
                        onClick={() => setShowHistory(true)}
                        className="apple-btn apple-btn-secondary px-4 py-2 text-sm"
                      >
                        📋 View History ({submissionHistory[effectiveTemplateId].length})
                      </button>
                    )}
                  </div>

                  {/* Version selector: appears only for templates that have multiple versions */}
                  {selectedTemplate.versions && selectedTemplate.versions.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">Version:</span>
                          <select
                            className="px-4 py-2 rounded-xl border border-blue-300 bg-white text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                            value={selectedVersionId || ""}
                            onChange={e => setSelectedVersionId(e.target.value)}
                          >
                            {selectedTemplate.versions.map(v => (
                              <option key={v.id} value={v.id}>{v.label}</option>
                            ))}
                          </select>
                        </div>
                        {effectiveVersion?.description && (
                          <p className="text-xs text-gray-600 flex-1 min-w-0">{effectiveVersion.description}</p>
                        )}
                      </div>
                    </div>
                  )}

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
                Submission History: {effectiveTemplateName || selectedTemplate.name}
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {effectiveTemplateId && submissionHistory[effectiveTemplateId]?.length > 0 ? (
              <>
                <div className="mb-4">
                  <button
                    onClick={() => handleClearHistory(effectiveTemplateId)}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear All History
                  </button>
                </div>
                <div className="space-y-3">
                  {submissionHistory[effectiveTemplateId]
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
