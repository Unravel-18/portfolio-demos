/* Bałt Palarnia — catalog filtering (sklep.html). */
(function () {
  "use strict";

  const ROAST_GROUP = (r) => (r <= 2 ? "jasne" : r === 3 ? "srednie" : "ciemne");
  const originTokens = (p) => p.origin.split("-");

  const FILTER_LABELS = {
    roast: { jasne: { pl: "Jasne", en: "Light" }, srednie: { pl: "Średnie", en: "Medium" }, ciemne: { pl: "Ciemne", en: "Dark" } },
    origin: {
      etiopia: { pl: "Etiopia", en: "Ethiopia" }, kenia: { pl: "Kenia", en: "Kenya" }, kolumbia: { pl: "Kolumbia", en: "Colombia" },
      brazylia: { pl: "Brazylia", en: "Brazil" }, gwatemala: { pl: "Gwatemala", en: "Guatemala" }, honduras: { pl: "Honduras", en: "Honduras" },
      peru: { pl: "Peru", en: "Peru" }, indie: { pl: "Indie", en: "India" }, mix: { pl: "Mieszanka", en: "Blend" }
    },
    profile: {
      owocowa: { pl: "Owocowa", en: "Fruity" }, czekoladowa: { pl: "Czekoladowa", en: "Chocolatey" }, orzechowa: { pl: "Orzechowa", en: "Nutty" },
      kwiatowa: { pl: "Kwiatowa", en: "Floral" }, karmelowa: { pl: "Karmelowa", en: "Caramel" }
    },
    format: { ziarna: { pl: "Ziarna", en: "Whole bean" }, drip: { pl: "Drip packi", en: "Drip packs" }, bezkofeinowa: { pl: "Bezkofeinowa", en: "Decaf" } }
  };
  const GROUPS = [
    ["roast", { pl: "Stopień palenia", en: "Roast level" }, ["jasne", "srednie", "ciemne"]],
    ["origin", { pl: "Pochodzenie", en: "Origin" }, ["etiopia", "kenia", "kolumbia", "brazylia", "gwatemala", "honduras", "peru", "indie", "mix"]],
    ["profile", { pl: "Profil smaku", en: "Flavour" }, ["owocowa", "czekoladowa", "orzechowa", "kwiatowa", "karmelowa"]],
    ["format", { pl: "Format", en: "Format" }, ["ziarna", "drip", "bezkofeinowa"]]
  ];

  const state = { roast: [], origin: [], profile: [], format: [], sort: "featured" };

  function parseURL() {
    const q = new URLSearchParams(location.search);
    ["roast", "origin", "profile", "format"].forEach((k) => { const v = q.get(k); if (v) state[k] = v.split(","); });
    if (q.get("sort")) state.sort = q.get("sort");
  }
  function writeURL() {
    const q = new URLSearchParams();
    ["roast", "origin", "profile", "format"].forEach((k) => { if (state[k].length) q.set(k, state[k].join(",")); });
    if (state.sort !== "featured") q.set("sort", state.sort);
    history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q.toString() : ""));
  }

  function match(p) {
    if (state.roast.length && !state.roast.includes(ROAST_GROUP(p.roast))) return false;
    if (state.origin.length && !originTokens(p).some((o) => state.origin.includes(o))) return false;
    if (state.profile.length && !(p.profile || []).some((o) => state.profile.includes(o))) return false;
    if (state.format.length && !state.format.includes(p.format)) return false;
    return true;
  }
  function sorted(list) {
    const l = list.slice();
    if (state.sort === "price-asc") l.sort((a, b) => a.price250 - b.price250);
    else if (state.sort === "price-desc") l.sort((a, b) => b.price250 - a.price250);
    else if (state.sort === "new") l.sort((a, b) => (b.badges.includes("nowosc") ? 1 : 0) - (a.badges.includes("nowosc") ? 1 : 0));
    return l;
  }

  function render() {
    const list = sorted(PRODUCTS.filter(match));
    const grid = document.querySelector("#catalog");
    const t = Store.t;
    grid.style.opacity = ".3";
    setTimeout(() => {
      if (!list.length) {
        grid.innerHTML = `<div class="empty" style="grid-column:1/-1;text-align:center;padding:50px 10px">
          <svg viewBox="0 0 48 48" width="80" height="80" fill="none" stroke="var(--line)" stroke-width="2" style="margin:0 auto 14px"><path d="M14 20h20l-2 16a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4L14 20Z"/><path d="M18 20v-2a6 6 0 0 1 12 0v2" transform="rotate(180 24 21)"/></svg>
          <h3 style="font-size:24px;margin-bottom:6px">${Store.lang === "pl" ? "Nic z tego nie zaparzymy…" : "Nothing brews from that…"}</h3>
          <p style="color:var(--espresso-2);margin-bottom:16px">${Store.lang === "pl" ? "Spróbuj poluzować filtry — dobra kawa lubi otwartość." : "Try loosening the filters — good coffee likes an open mind."}</p>
          <button class="btn btn-ghost" data-clear-all>${Store.lang === "pl" ? "Wyczyść filtry" : "Clear filters"}</button>
        </div>`;
      } else {
        grid.innerHTML = list.map(Store.cardHTML).join("");
      }
      grid.style.opacity = "1";
    }, 130);

    // count
    const cnt = document.querySelector("#count");
    if (cnt) cnt.textContent = (Store.lang === "pl" ? "Znaleziono: " : "Found: ") + list.length + (Store.lang === "pl" ? " kaw" : " coffees");
    // chips
    renderChips();
    // mobile filter count
    const fc = document.querySelector("#filterCount");
    const active = state.roast.length + state.origin.length + state.profile.length + state.format.length;
    if (fc) fc.textContent = active ? " (" + active + ")" : "";
    // clear button visibility
    const clr = document.querySelector("#clearFilters");
    if (clr) clr.style.display = active ? "inline" : "none";
  }

  function renderChips() {
    const wrap = document.querySelector("#chips");
    if (!wrap) return;
    let html = "";
    ["roast", "origin", "profile", "format"].forEach((g) => {
      state[g].forEach((v) => {
        const lbl = FILTER_LABELS[g][v] ? FILTER_LABELS[g][v][Store.lang] : v;
        html += `<span class="chip">${lbl} <button data-remove="${g}:${v}" aria-label="remove">×</button></span>`;
      });
    });
    wrap.innerHTML = html;
  }

  function buildFilters() {
    const box = document.querySelector("#filters");
    let html = "";
    GROUPS.forEach(([key, label, vals]) => {
      html += `<div class="fgroup"><div class="fgroup-h">${label[Store.lang]}</div>`;
      vals.forEach((v) => {
        const checked = state[key].includes(v) ? "checked" : "";
        html += `<label class="chk fopt"><input type="checkbox" data-f="${key}:${v}" ${checked}><span class="box"></span><span>${FILTER_LABELS[key][v][Store.lang]}</span></label>`;
      });
      html += `</div>`;
    });
    box.innerHTML = html;
    syncSortLabels();
  }

  function syncSortLabels() {
    const sel = document.querySelector("#sort");
    if (!sel) return;
    const opts = { featured: { pl: "Polecane", en: "Featured" }, "price-asc": { pl: "Cena rosnąco", en: "Price ↑" }, "price-desc": { pl: "Cena malejąco", en: "Price ↓" }, "new": { pl: "Nowości", en: "Newest" } };
    sel.innerHTML = Object.keys(opts).map((k) => `<option value="${k}" ${state.sort === k ? "selected" : ""}>${opts[k][Store.lang]}</option>`).join("");
  }

  function toggle(key, val) {
    const arr = state[key];
    const i = arr.indexOf(val);
    if (i >= 0) arr.splice(i, 1); else arr.push(val);
    writeURL(); buildFilters(); render();
  }
  function clearAll() {
    state.roast = []; state.origin = []; state.profile = []; state.format = [];
    writeURL(); buildFilters(); render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    parseURL();
    buildFilters();
    render();

    document.querySelector("#filters").addEventListener("change", (e) => {
      const cb = e.target.closest("[data-f]"); if (!cb) return;
      const [k, v] = cb.getAttribute("data-f").split(":"); toggle(k, v);
    });
    document.querySelector("#chips").addEventListener("click", (e) => {
      const b = e.target.closest("[data-remove]"); if (!b) return;
      const [k, v] = b.getAttribute("data-remove").split(":"); toggle(k, v);
    });
    document.querySelector("#catalog").addEventListener("click", (e) => { if (e.target.closest("[data-clear-all]")) clearAll(); });
    const clr = document.querySelector("#clearFilters"); if (clr) clr.addEventListener("click", clearAll);
    const sel = document.querySelector("#sort"); if (sel) sel.addEventListener("change", () => { state.sort = sel.value; writeURL(); render(); });

    // mobile filter sheet
    const openF = document.querySelector("#openFilters"), sheet = document.querySelector("#filtersSide"), sheetScrim = document.querySelector("#sheetScrim");
    function closeSheet() { sheet.classList.remove("open"); sheetScrim.classList.remove("open"); document.body.style.overflow = ""; }
    if (openF) openF.addEventListener("click", () => { sheet.classList.add("open"); sheetScrim.classList.add("open"); document.body.style.overflow = "hidden"; });
    if (sheetScrim) sheetScrim.addEventListener("click", closeSheet);
    const closeBtn = document.querySelector("#closeSheet"); if (closeBtn) closeBtn.addEventListener("click", closeSheet);
    const showBtn = document.querySelector("#sheetShow"); if (showBtn) showBtn.addEventListener("click", closeSheet);

    window.onLangChange = function () { buildFilters(); syncSortLabels(); render(); };
  });
})();
