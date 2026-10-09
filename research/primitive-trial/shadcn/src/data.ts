export const REFERENCE_DATE = "2026-10-09";

export const REGIONS = [
  "Alpine", "Barwon South West", "Bass Coast", "Bendigo", "Central Highlands", "Central West",
  "Darling Downs", "Eyre Peninsula", "Far North Coast", "Flinders", "Gippsland East", "Goldfields",
  "Hunter", "Illawarra", "Kangaroo Island", "Kimberley", "Lachlan", "Mallee", "Mid North Coast",
  "Murray", "Northern Rivers", "Otways", "Pilbara", "Riverina", "South East Forests",
  "Southern Highlands", "Sunshine Coast", "Tablelands", "Upper Hunter", "Wimmera",
];

export const BANDS = ["No rating", "Moderate", "High", "Extreme", "Catastrophic"] as const;
export type Band = (typeof BANDS)[number];

export type Incident = { name: string; band: Band; area: number; updated: string };

export const INCIDENTS: Incident[] = [
  { name: "Black Creek", band: "High", area: 412, updated: "2026-10-08" },
  { name: "Corryong Ridge", band: "Extreme", area: 5230, updated: "2026-10-09" },
  { name: "Dunmore Flat", band: "Moderate", area: 38, updated: "2026-10-07" },
  { name: "Eagle Gully", band: "Catastrophic", area: 18400, updated: "2026-10-09" },
  { name: "Frenchmans Track", band: "No rating", area: 4, updated: "2026-10-02" },
  { name: "Granite Spur", band: "High", area: 960, updated: "2026-10-08" },
  { name: "Hawker Reserve", band: "Moderate", area: 120, updated: "2026-10-06" },
  { name: "Ironbark Creek", band: "Extreme", area: 2750, updated: "2026-10-09" },
  { name: "Jarrah Gully", band: "High", area: 305, updated: "2026-10-05" },
  { name: "Kookaburra Bend", band: "No rating", area: 11, updated: "2026-09-30" },
  { name: "Lyrebird Track", band: "Moderate", area: 77, updated: "2026-10-04" },
  { name: "Mount Terrible", band: "Extreme", area: 3100, updated: "2026-10-08" },
];
