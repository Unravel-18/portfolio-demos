/* Kamienica Letnica — building data (single source of truth).
   28 apartments · 5 levels (Parter + 4 piętra) · layout 4+6+6+6+6.
   Prices in PLN, computed from metraż × zł/m² (rises with floor) + bay-view premium. */

/* ---- levels: index 0 = Parter (bottom) … 4 = penthouse (top) ---- */
const FLOORS = [
  { pietro: 0, name: { pl: "Parter",     en: "Ground floor" },        ppm2: 10800 },
  { pietro: 1, name: { pl: "Piętro 1",   en: "1st floor" },           ppm2: 11500 },
  { pietro: 2, name: { pl: "Piętro 2",   en: "2nd floor" },           ppm2: 12100 },
  { pietro: 3, name: { pl: "Piętro 3",   en: "3rd floor" },           ppm2: 12800 },
  { pietro: 4, name: { pl: "Piętro 4 · penthouse", en: "4th floor · penthouse" }, ppm2: 14200 }
];

/* ---- ~8 plan types; rooms are [x, y, w, h, typeKey] in a 100×76 schematic box ---- */
const PLANS = {
  S1:  { pokoje: 1, rooms: [[0,0,62,76,"salon"],[62,0,38,40,"lazienka"],[62,40,38,36,"hol"]] },
  D2a: { pokoje: 2, rooms: [[0,0,56,44,"salon"],[0,44,56,32,"kuchnia"],[56,0,44,44,"sypialnia"],[56,44,44,20,"lazienka"],[56,64,44,12,"hol"]] },
  D2b: { pokoje: 2, rooms: [[0,0,52,48,"salon"],[0,48,52,28,"kuchnia"],[52,0,48,46,"sypialnia"],[52,46,48,18,"lazienka"],[52,64,48,12,"hol"]] },
  T3a: { pokoje: 3, rooms: [[0,0,50,44,"salon"],[0,44,50,32,"kuchnia"],[50,0,50,30,"sypialnia"],[50,30,50,26,"sypialnia"],[50,56,30,20,"lazienka"],[80,56,20,20,"hol"]] },
  T3b: { pokoje: 3, rooms: [[0,0,52,46,"salon"],[0,46,52,30,"kuchnia"],[52,0,48,28,"sypialnia"],[52,28,48,26,"sypialnia"],[52,54,28,22,"lazienka"],[80,54,20,22,"wc"]] },
  Q4:  { pokoje: 4, rooms: [[0,0,48,42,"salon"],[0,42,48,34,"kuchnia"],[48,0,52,24,"sypialnia"],[48,24,26,26,"sypialnia"],[74,24,26,26,"sypialnia"],[48,50,30,26,"lazienka"],[78,50,22,26,"wc"]] },
  PH:  { pokoje: 4, rooms: [[0,0,46,40,"salon"],[0,40,46,36,"kuchnia"],[46,0,54,22,"sypialnia"],[46,22,27,26,"sypialnia"],[73,22,27,26,"sypialnia"],[46,48,28,28,"lazienka"],[74,48,26,28,"garderoba"]] },
  G3:  { pokoje: 3, rooms: [[0,0,54,44,"salon"],[0,44,54,32,"kuchnia"],[54,0,46,28,"sypialnia"],[54,28,46,26,"sypialnia"],[54,54,28,22,"lazienka"],[82,54,18,22,"hol"]] }
};

/* orientacja + balkon are codes → labels live in the i18n dictionary (app.js) */
/* raw apartment rows: [id, pietro, plan, metraz, orient, balkon, status]           */
const RAW = [
  // Parter (4) — flats with private gardens
  ["M01", 0, "D2b", 54, "pdw", "ogrodek", "wolne"],
  ["M02", 0, "G3",  72, "pdz", "ogrodek", "wolne"],
  ["M03", 0, "G3",  70, "pnw", "ogrodek", "rezerwacja"],
  ["M04", 0, "D2b", 48, "pnz", "ogrodek", "sprzedane"],
  // Piętro 1 (6)
  ["M05", 1, "S1",  30, "pnw", "loggia", "wolne"],
  ["M06", 1, "D2a", 44, "pnw", "balkon", "wolne"],
  ["M07", 1, "D2b", 50, "pdw", "balkon", "rezerwacja"],
  ["M08", 1, "T3a", 60, "pdz", "balkon", "wolne"],
  ["M09", 1, "T3b", 66, "pdz", "balkon", "wolne"],
  ["M10", 1, "Q4",  82, "pdw", "loggia", "rezerwacja"],
  // Piętro 2 (6)
  ["M11", 2, "S1",  30, "pnw", "loggia", "wolne"],
  ["M12", 2, "D2a", 44, "pnw", "balkon", "wolne"],
  ["M13", 2, "D2b", 50, "pdw", "balkon", "wolne"],
  ["M14", 2, "T3a", 60, "pdz", "balkon", "rezerwacja"],
  ["M15", 2, "T3b", 66, "pdz", "balkon", "wolne"],
  ["M16", 2, "Q4",  82, "pdw", "loggia", "sprzedane"],
  // Piętro 3 (6)
  ["M17", 3, "S1",  32, "pnw", "loggia", "wolne"],
  ["M18", 3, "D2a", 46, "pnw", "balkon", "rezerwacja"],
  ["M19", 3, "D2b", 52, "pdw", "balkon", "wolne"],
  ["M20", 3, "T3a", 62, "pdz", "balkon", "wolne"],
  ["M21", 3, "T3b", 68, "pdz", "balkon", "rezerwacja"],
  ["M22", 3, "Q4",  84, "pdw", "loggia", "sprzedane"],
  // Piętro 4 · penthouse (6)
  ["M23", 4, "D2b", 52, "pnw", "taras", "wolne"],
  ["M24", 4, "T3a", 64, "pnw", "taras", "wolne"],
  ["M25", 4, "PH",  70, "pdz", "taras", "rezerwacja"],
  ["M26", 4, "PH",  88, "pdz", "taras", "wolne"],
  ["M27", 4, "PH",  94, "pdz", "taras", "wolne"],
  ["M28", 4, "Q4",  90, "pdw", "taras", "rezerwacja"]
];

const VIEW_MULT = { pdz: 1.09, pdw: 1.03, pd: 1.02, pnw: 1.0, pnz: 1.0 };

function buildApartments() {
  // column index within each floor (left→right) for the SVG facade layout
  const perFloorCount = {};
  return RAW.map((r) => {
    const [id, pietro, plan, metraz, orient, balkon, status] = r;
    const col = (perFloorCount[pietro] = (perFloorCount[pietro] || 0)) ;
    perFloorCount[pietro]++;
    const ppm2 = FLOORS[pietro].ppm2;
    const cena = Math.round(metraz * ppm2 * (VIEW_MULT[orient] || 1) / 1000) * 1000;
    return {
      id, pietro, col, plan,
      pokoje: PLANS[plan].pokoje,
      metraz, orient, balkon, status, cena,
      ppm2Eff: Math.round(cena / metraz),
      bay: orient === "pdz"
    };
  });
}

const APARTMENTS = buildApartments();

/* count per floor (for the comb) */
const FLOOR_COUNTS = APARTMENTS.reduce((m, a) => { (m[a.pietro] = m[a.pietro] || []).push(a); return m; }, {});

if (typeof window !== "undefined") {
  window.FLOORS = FLOORS;
  window.PLANS = PLANS;
  window.APARTMENTS = APARTMENTS;
  window.FLOOR_COUNTS = FLOOR_COUNTS;
}
