export const REGIONS = ['Alpine','Barwon South West','Bass Coast','Bendigo','Central Highlands','Central West','Darling Downs','Eyre Peninsula','Far North Coast','Flinders','Gippsland East','Goldfields','Hunter','Illawarra','Kangaroo Island','Kimberley','Lachlan','Mallee','Mid North Coast','Murray','Northern Rivers','Otways','Pilbara','Riverina','South East Forests','Southern Highlands','Sunshine Coast','Tablelands','Upper Hunter','Wimmera'];
export const BANDS = ['No rating', 'Moderate', 'High', 'Extreme', 'Catastrophic'] as const;
export type Band = (typeof BANDS)[number];
export type Incident = { id: number; name: string; band: Band; area: number; updated: string };
const rows: [string, Band, number, string][] = [
  ['Black Creek','High',412,'2026-10-08'],['Corryong Ridge','Extreme',5230,'2026-10-09'],
  ['Dunmore Flat','Moderate',38,'2026-10-07'],['Eagle Gully','Catastrophic',18400,'2026-10-09'],
  ['Frenchmans Track','No rating',4,'2026-10-02'],['Granite Spur','High',960,'2026-10-08'],
  ['Hawker Reserve','Moderate',120,'2026-10-06'],['Ironbark Creek','Extreme',2750,'2026-10-09'],
  ['Jarrah Gully','High',305,'2026-10-05'],['Kookaburra Bend','No rating',11,'2026-09-30'],
  ['Lyrebird Track','Moderate',77,'2026-10-04'],['Mount Terrible','Extreme',3100,'2026-10-08'],
];
export const INCIDENTS: Incident[] = rows.map(([name, band, area, updated], i) => ({ id: i + 1, name, band, area, updated }));
