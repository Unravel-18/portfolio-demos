/* Kamienica Letnica — PRZEKRÓJ: persistent elevation as configurator spine. */
(function () {
  "use strict";

  /* ===================== i18n ===================== */
  const DICT = {
    pl: { "u.metraz": "Metraż", "u.pokoje": "Pokoje", "u.pietro": "Piętro", "u.orient": "Orientacja",
      "u.outdoor": "Przestrzeń zewn.", "u.cena": "Cena", "u.pm2": "Cena za m²", "u.rooms": "pok.",
      "u.ask": "Zapytaj o mieszkanie", "u.compare": "Dodaj do porównania", "u.plan": "Rzut mieszkania", "u.free": "wolne",
      "u.pickHint": "Kliknij okno na elewacji albo wybierz z listy, aby zobaczyć rzut i szczegóły.",
      "list.id": "Nr", "list.floor": "Piętro", "list.rooms": "Pokoje", "list.area": "Metraż", "list.orient": "Widok", "list.price": "Cena",
      "cmp.title": "Porównanie mieszkań", "cmp.pick": "Zaznacz dwa mieszkania, aby je porównać.",
      "toast.cmpFull": "Możesz porównać maks. 2 mieszkania.", "toast.enq": "Dziękujemy! To wersja demonstracyjna — zapytanie nie zostało wysłane.",
      "toast.askSet": "Wybrano mieszkanie {id} w formularzu.", "calc.note": "Dla {price} i najmu {rent}/mies.",
      "st.wolne": "wolne", "st.rezerwacja": "rezerwacja", "st.sprzedane": "sprzedane", "view": "Zobacz" },
    en: { "u.metraz": "Area", "u.pokoje": "Rooms", "u.pietro": "Floor", "u.orient": "Aspect",
      "u.outdoor": "Outdoor space", "u.cena": "Price", "u.pm2": "Price per m²", "u.rooms": "rm",
      "u.ask": "Enquire about this flat", "u.compare": "Add to comparison", "u.plan": "Floor plan", "u.free": "available",
      "u.pickHint": "Click a window on the elevation or pick from the list to see the plan and details.",
      "list.id": "No.", "list.floor": "Floor", "list.rooms": "Rooms", "list.area": "Area", "list.orient": "View", "list.price": "Price",
      "cmp.title": "Compare apartments", "cmp.pick": "Select two flats to compare them.",
      "toast.cmpFull": "You can compare up to 2 flats.", "toast.enq": "Thank you! This is a demo — the enquiry was not sent.",
      "toast.askSet": "Flat {id} selected in the form.", "calc.note": "For {price} and {rent}/mo rent.",
      "st.wolne": "available", "st.rezerwacja": "reserved", "st.sprzedane": "sold", "view": "View" }
  };
  const ORIENT = { pl: { pdz: "płd-zach · widok na Zatokę", pdw: "płd-wsch", pnz: "płn-zach", pnw: "płn-wsch", pd: "południe" },
    en: { pdz: "SW · Bay view", pdw: "SE", pnz: "NW", pnw: "NE", pd: "South" } };
  const ORIENT_SHORT = { pl: { pdz: "Zatoka", pdw: "płd-wsch", pnz: "płn-zach", pnw: "płn-wsch", pd: "płd" },
    en: { pdz: "Bay", pdw: "SE", pnz: "NW", pnw: "NE", pd: "S" } };
  const OUTDOOR = { pl: { ogrodek: "Ogródek", balkon: "Balkon", loggia: "Loggia", taras: "Taras" },
    en: { ogrodek: "Garden", balkon: "Balcony", loggia: "Loggia", taras: "Terrace" } };
  const ROOMLBL = { pl: { salon: "Salon", kuchnia: "Kuchnia", sypialnia: "Sypialnia", lazienka: "Łazienka", wc: "WC", hol: "Hol", garderoba: "Garderoba" },
    en: { salon: "Living", kuchnia: "Kitchen", sypialnia: "Bedroom", lazienka: "Bath", wc: "WC", hol: "Hall", garderoba: "Wardrobe" } };
  const ROOMCAT = { salon: "live", kuchnia: "util", sypialnia: "sleep", lazienka: "wet", wc: "wet", hol: "util", garderoba: "util" };

  let lang = localStorage.getItem("letnica_lang") || "pl";
  const t = (k) => (DICT[lang][k] != null ? DICT[lang][k] : k);
  const money = (n) => new Intl.NumberFormat("pl-PL").format(n) + " zł";
  const eur = (n) => "≈ " + new Intl.NumberFormat("de-DE").format(Math.round(n / 4.32 / 1000) * 1000) + " €";
  const floorName = (p) => FLOORS[p].name[lang];

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const byId = (id) => APARTMENTS.find((a) => a.id === id);
  const NS = "http://www.w3.org/2000/svg";
  const mk = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };

  const state = { view: "plan", selected: null,
    filters: { pokoje: new Set(), priceMax: 0, areaMin: 0, wolne: false },
    compare: JSON.parse(localStorage.getItem("letnica_compare") || "[]").slice(0, 2),
    sort: { key: "id", dir: 1 } };

  /* ===================== elevation ===================== */
  const APTX = [87, 148, 209, 271, 332, 393];      // 6 bay centres
  const FLOORY = { 4: 98, 3: 170, 2: 242, 1: 314 }; // window top-Y per piętro
  const PARTER_BAYS = [0, 1, 4, 5];                 // which bays the 4 parter flats use

  function winChildren(g, rail) {
    const add = (n, a) => g.appendChild(mk(n, a));
    add("rect", { x: -4, y: -7, width: 44, height: 6, rx: 1.5, fill: "#E4D2B7" });
    add("path", { d: "M14 -7 L22 -7 L24.5 -1 L11.5 -1 Z", fill: "#F1E2CC" });
    add("rect", { x: 0, y: -1, width: 36, height: 52, rx: 2, fill: "#7E5030" });
    add("rect", { x: 2.4, y: 1.4, width: 31.2, height: 47, rx: 1.5, fill: "#EEDBC1" });
    add("rect", { class: "glass", x: 5, y: 4, width: 26, height: 42, rx: 1.2 });
    add("rect", { x: 5, y: 4, width: 26, height: 42, rx: 1.2, fill: "url(#glassSheen)" });
    add("line", { x1: 18, y1: 4, x2: 18, y2: 46, stroke: "#EEDBC1", "stroke-width": 2.2 });
    add("line", { x1: 5, y1: 25, x2: 31, y2: 25, stroke: "#EEDBC1", "stroke-width": 2.2 });
    add("rect", { x: -4, y: 49, width: 44, height: 5, rx: 1.4, fill: "#E4D2B7" });
    add("rect", { x: -4, y: 54, width: 44, height: 2.2, fill: "#B0824F", opacity: .55 });
    if (rail) {
      add("rect", { x: -6, y: 30, width: 48, height: 2.4, rx: 1, fill: "#6E3B22" });
      add("rect", { x: -6, y: 47, width: 48, height: 2.4, rx: 1, fill: "#6E3B22" });
      [-2, 6, 14, 22, 30, 38].forEach((bx) => add("line", { x1: bx, y1: 32, x2: bx, y2: 47, stroke: "#7A3B24", "stroke-width": 1.5 }));
    }
  }
  function archChildren(g) {
    const add = (n, a) => g.appendChild(mk(n, a));
    add("path", { d: "M0 66 V22 A22 22 0 0 1 44 22 V66 Z", fill: "#7E5030" });
    add("path", { d: "M3 66 V22 A19 19 0 0 1 41 22 V66 Z", fill: "#EEDBC1" });
    add("path", { class: "glass", d: "M6 66 V23 A16 16 0 0 1 38 23 V66 Z" });
    add("path", { d: "M6 66 V23 A16 16 0 0 1 38 23 V66 Z", fill: "url(#glassSheen)" });
    add("path", { d: "M18 2 L26 2 L28 10 L16 10 Z", fill: "#F1E2CC" });
    add("line", { x1: 22, y1: 24, x2: 22, y2: 66, stroke: "#EEDBC1", "stroke-width": 2 });
    add("rect", { x: -3, y: 63, width: 50, height: 5, rx: 1.4, fill: "#E4D2B7" });
    add("rect", { x: -2, y: 60, width: 48, height: 5, rx: 2, fill: "#8AA06A" });
  }

  function makeApt(a) {
    const outer = mk("g", {});
    let x, y, rx, ry, rw, rh;
    const g = mk("g", { class: "apt " + a.status, "data-id": a.id, role: "button",
      tabindex: a.status === "sprzedane" ? "-1" : "0", "aria-label": a.id + " · " + t("st." + a.status) });
    if (a.pietro >= 1) {
      x = APTX[a.col] - 18; y = FLOORY[a.pietro];
      outer.setAttribute("transform", "translate(" + x + " " + y + ")");
      winChildren(g, a.pietro === 2 || a.pietro === 3);
      rx = x - 6; ry = y - 8; rw = 46; rh = 60;
    } else {
      x = APTX[PARTER_BAYS[a.col]] - 22; y = 404;
      outer.setAttribute("transform", "translate(" + x + " " + y + ")");
      archChildren(g);
      rx = x - 4; ry = y - 6; rw = 52; rh = 76;
    }
    g.dataset.rx = rx; g.dataset.ry = ry; g.dataset.rw = rw; g.dataset.rh = rh;
    const sel = () => select(a.id);
    g.addEventListener("click", sel);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sel(); } });
    g.addEventListener("mouseenter", () => showTip(a, g));
    g.addEventListener("mouseleave", hideTip);
    outer.appendChild(g);
    return outer;
  }

  function buildElevation() {
    const apts = $("#apts"); apts.innerHTML = "";
    let dd = ""; for (let x = 70; x <= 406; x += 16) dd += '<rect x="' + x + '" y="86" width="6" height="6"/>';
    $("#dentils").innerHTML = dd;
    let qq = ""; [118, 176, 234, 292, 350, 408].forEach((y) => { qq += '<rect x="66" y="' + y + '" width="12" height="3"/><rect x="402" y="' + y + '" width="12" height="3"/>'; });
    $("#quoinLines").innerHTML = qq;
    APARTMENTS.forEach((a) => apts.appendChild(makeApt(a)));
    // investor glow over a few available upper flats; roof glow over one penthouse flat
    const glowIds = ["M08", "M12", "M20"], roofId = "M26";
    const glowRect = (id, fill, op) => { const a = byId(id); const x = APTX[a.col] - 18, y = FLOORY[a.pietro]; return mk("rect", { x: x + 5, y: y + 4, width: 26, height: 42, rx: 2, fill: fill, opacity: op }); };
    const gl = $("#glowLayer"); gl.innerHTML = ""; glowIds.forEach((id) => gl.appendChild(glowRect(id, "#FFE9B8", .75)));
    const rg = $("#roofglowLayer"); rg.innerHTML = ""; rg.appendChild(glowRect(roofId, "#FFF0CB", 1));
  }

  /* ===================== zones ===================== */
  function wireZones() {
    const rail = $$(".rail a");
    const cap = { intro: { pl: "Elewacja · zawsze na ekranie", en: "Elevation · always on screen" },
      lokalizacja: { pl: "Budynek w kontekście okolicy", en: "The building in context" },
      kamienica: { pl: "Zbliżenie · detale i materiały", en: "Close-up · details & materials" },
      mieszkania: { pl: "Kliknij okno →", en: "Click a window →" },
      inwestorzy: { pl: "Wynajęte okna świecą", en: "Rented windows glow" },
      kontakt: { pl: "Światło na górze", en: "Light up top" } };
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { const z = e.target.dataset.zone; document.body.dataset.zone = z;
        const c = cap[z]; $("#paneCap").textContent = c ? c[lang] : "";
        rail.forEach((a) => a.classList.toggle("on", a.dataset.z === z)); }
    }), { rootMargin: "-45% 0px -45% 0px" });
    $$(".chapter").forEach((s) => io.observe(s));
  }

  /* ===================== filters ===================== */
  function matchApt(a) {
    const f = state.filters;
    if (f.pokoje.size && !f.pokoje.has(a.pokoje)) return false;
    if (f.priceMax && a.cena > f.priceMax) return false;
    if (f.areaMin && a.metraz < f.areaMin) return false;
    if (f.wolne && a.status !== "wolne") return false;
    return true;
  }
  function applyFilters() {
    let n = 0;
    APARTMENTS.forEach((a) => { const ok = matchApt(a); if (ok) n++;
      const el = $('.apt[data-id="' + a.id + '"]'); if (el) el.classList.toggle("dim", !ok); });
    $("#cCount").textContent = n;
    $$('#filters .pill[data-f="pokoje"]').forEach((p) => p.classList.toggle("on", state.filters.pokoje.has(+p.dataset.v)));
    $('.pill[data-f="wolne"]').classList.toggle("on", state.filters.wolne);
    if (state.view === "lista") buildLista();
    writeParams();
  }
  function wireFilters() {
    $$('#filters .pill[data-f="pokoje"]').forEach((p) => p.addEventListener("click", () => {
      const v = +p.dataset.v; state.filters.pokoje.has(v) ? state.filters.pokoje.delete(v) : state.filters.pokoje.add(v); applyFilters(); }));
    $('.pill[data-f="wolne"]').addEventListener("click", () => { state.filters.wolne = !state.filters.wolne; applyFilters(); });
    $("#fPrice").addEventListener("change", (e) => { state.filters.priceMax = +e.target.value; applyFilters(); });
    $("#fArea").addEventListener("change", (e) => { state.filters.areaMin = +e.target.value; applyFilters(); });
    $("#fClear").addEventListener("click", () => { state.filters = { pokoje: new Set(), priceMax: 0, areaMin: 0, wolne: false };
      $("#fPrice").value = "0"; $("#fArea").value = "0"; applyFilters(); });
  }

  /* ===================== flat card ===================== */
  function miniPlan(a) {
    let r = '<svg viewBox="-2 -2 104 80" role="img" aria-label="' + t("u.plan") + " " + a.id + '">';
    PLANS[a.plan].rooms.forEach((rm) => { const [x, y, w, h, type] = rm;
      r += '<rect class="mp-room ' + ROOMCAT[type] + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2"/>';
      r += '<text class="mp-lbl" x="' + (x + w / 2) + '" y="' + (y + h / 2 + 2) + '" text-anchor="middle">' + ROOMLBL[lang][type] + "</text>"; });
    return r + "</svg>";
  }
  function renderCard() {
    const box = $("#flatcard");
    const a = state.selected && byId(state.selected);
    if (!a) { box.innerHTML = '<div class="fc-empty"><svg viewBox="0 0 24 24"><path d="M4 21V10l8-6 8 6v11"/><path d="M9 21v-6h6v6"/></svg><p>' + t("u.pickHint") + "</p></div>"; return; }
    const inCmp = state.compare.includes(a.id);
    const price = '<span class="z">' + money(a.cena) + "</span>" + (lang === "en" ? '<span class="eur">' + eur(a.cena) + "</span>" : "") + '<span class="pm">' + money(a.ppm2Eff) + " / m²</span>";
    box.innerHTML =
      '<div class="fc-head"><div><div class="fc-id">' + a.id + '</div><div class="fc-floor">' + floorName(a.pietro) + " · " + a.pokoje + " " + t("u.rooms") + '</div></div><span class="status ' + a.status + '"><span class="d"></span>' + t("st." + a.status) + "</span></div>" +
      '<div class="miniplan">' + miniPlan(a) + "</div>" +
      '<div class="fc-specs">' +
        '<div class="fc-row"><span>' + t("u.metraz") + "</span><span>" + String(a.metraz).replace(".", ",") + " m²</span></div>" +
        '<div class="fc-row"><span>' + t("u.pokoje") + "</span><span>" + a.pokoje + "</span></div>" +
        '<div class="fc-row"><span>' + t("u.orient") + "</span><span>" + ORIENT[lang][a.orient] + "</span></div>" +
        '<div class="fc-row"><span>' + t("u.outdoor") + "</span><span>" + OUTDOOR[lang][a.balkon] + "</span></div></div>" +
      '<div class="fc-price">' + price + "</div>" +
      '<div class="fc-actions"><button class="btn btn-primary" data-ask ' + (a.status === "sprzedane" ? "disabled style=opacity:.5" : "") + ">" + t("u.ask") + "</button></div>" +
      '<div class="fc-nav"><button data-fc-prev>‹ ' + (lang === "pl" ? "Poprzednie" : "Prev") + '</button><span class="spacer"></span><button data-fc-next>' + (lang === "pl" ? "Następne" : "Next") + " ›</button></div>" +
      '<label class="cmp-check"><input type="checkbox" data-cmp ' + (inCmp ? "checked" : "") + " " + (a.status === "sprzedane" ? "disabled" : "") + "> " + t("u.compare") + "</label>";
    const ask = $("[data-ask]", box); if (ask && a.status !== "sprzedane") ask.addEventListener("click", () => askAbout(a.id));
    const cmp = $("[data-cmp]", box); if (cmp) cmp.addEventListener("change", () => toggleCompare(a.id));
    $("[data-fc-prev]", box).addEventListener("click", () => selectAdjacent(-1));
    $("[data-fc-next]", box).addEventListener("click", () => selectAdjacent(1));
  }
  function select(id) {
    const a = byId(id); if (!a) return;
    state.selected = id;
    const el = $('.apt[data-id="' + id + '"]');
    $$(".apt").forEach((x) => x.classList.remove("sel"));
    if (el) { el.classList.add("sel"); const ring = $("#selRing");
      ring.setAttribute("x", el.dataset.rx); ring.setAttribute("y", el.dataset.ry);
      ring.setAttribute("width", el.dataset.rw); ring.setAttribute("height", el.dataset.rh); ring.style.opacity = 1; }
    renderCard(); writeParams();
    showPopover(a, el);
  }
  function selectAdjacent(dir) {
    const i = APARTMENTS.findIndex((x) => x.id === state.selected);
    if (i < 0) return;
    select(APARTMENTS[(i + dir + APARTMENTS.length) % APARTMENTS.length].id);
  }

  /* ---- popover anchored to the model ---- */
  let curEl = null;
  const metaLine = (a) => floorName(a.pietro) + " · " + String(a.metraz).replace(".", ",") + " m² · " + a.pokoje + " " + t("u.rooms") + " · " + ORIENT_SHORT[lang][a.orient];
  function positionPop() {
    const pop = $("#aptPop"); if (pop.hidden || !curEl) return;
    const r = curEl.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight, m = 12, vw = window.innerWidth, vh = window.innerHeight;
    let left = (r.right + m + pw <= vw - 8) ? r.right + m : r.left - m - pw;
    left = Math.max(8, Math.min(left, vw - 8 - pw));
    let top = Math.max(64, Math.min(r.top + r.height / 2 - ph / 2, vh - 8 - ph));
    pop.style.left = left + "px"; pop.style.top = top + "px";
  }
  function hidePopover() { $("#aptPop").hidden = true; curEl = null; }
  function showPopover(a, el) {
    if (!el) { hidePopover(); return; }
    curEl = el;
    const pop = $("#aptPop"), inCmp = state.compare.includes(a.id);
    const priceLine = a.status === "sprzedane"
      ? '<div class="pop-price">' + t("st.sprzedane") + "</div>"
      : '<div class="pop-price">' + money(a.cena) + (lang === "en" ? '<span class="eur">' + eur(a.cena) + "</span>" : "") + "</div>";
    pop.innerHTML =
      '<button class="pop-x" aria-label="close">×</button>' +
      '<div class="pop-head"><button class="pop-nav" data-pp="-1" aria-label="prev">‹</button><span class="pop-id">' + a.id + '</span><button class="pop-nav" data-pp="1" aria-label="next">›</button></div>' +
      '<div style="text-align:center"><span class="status ' + a.status + '"><span class="d"></span>' + t("st." + a.status) + "</span></div>" +
      '<div class="pop-meta">' + metaLine(a) + "</div>" + priceLine +
      '<div class="pop-actions"><button class="btn btn-primary" data-pp-det>' + (lang === "pl" ? "Szczegóły →" : "Details →") + "</button>" +
      (a.status !== "sprzedane" ? '<button class="btn btn-ghost" data-pp-cmp>' + (inCmp ? (lang === "pl" ? "Usuń" : "Remove") : (lang === "pl" ? "Porównaj" : "Compare")) + "</button>" : "") + "</div>";
    pop.hidden = false; pop.style.visibility = "hidden"; positionPop(); pop.style.visibility = "visible";
    $(".pop-x", pop).addEventListener("click", hidePopover);
    $$(".pop-nav", pop).forEach((b) => b.addEventListener("click", () => selectAdjacent(+b.dataset.pp)));
    $("[data-pp-det]", pop).addEventListener("click", () => { hidePopover(); $("#c-mieszkania").scrollIntoView({ behavior: "smooth", block: "start" }); });
    const cmpB = $("[data-pp-cmp]", pop); if (cmpB) cmpB.addEventListener("click", () => { toggleCompare(a.id); showPopover(a, el); });
    hideTip();
  }

  /* ---- hover tooltip ---- */
  const canHover = window.matchMedia("(hover:hover)").matches;
  function showTip(a, el) {
    if (!canHover || !$("#aptPop").hidden) return;
    const tip = $("#aptTip");
    const dot = a.status === "wolne" ? "var(--ok)" : a.status === "rezerwacja" ? "var(--mid2)" : "#573A29";
    const val = a.status === "sprzedane" ? t("st.sprzedane") : money(a.cena);
    tip.innerHTML = "<b>" + a.id + "</b>" + val + '<span class="st-dot" style="background:' + dot + '"></span>';
    tip.hidden = false;
    const r = el.getBoundingClientRect();
    tip.style.left = (r.left + r.width / 2) + "px"; tip.style.top = (r.top + 4) + "px";
  }
  function hideTip() { $("#aptTip").hidden = true; }

  /* ===================== lista ===================== */
  function buildLista() {
    const box = $("#lista");
    const rows = APARTMENTS.filter(matchApt).slice();
    const s = state.sort;
    rows.sort((a, b) => { let va = a[s.key], vb = b[s.key]; if (s.key === "id") { va = +a.id.slice(1); vb = +b.id.slice(1); } return (va > vb ? 1 : va < vb ? -1 : 0) * s.dir; });
    const th = (k, l, r) => '<th data-k="' + k + '" class="' + (s.key === k ? "sorted" : "") + '" style="' + (r ? "text-align:right" : "") + '">' + l + ' <span class="ar">' + (s.key === k ? (s.dir > 0 ? "▲" : "▼") : "↕") + "</span></th>";
    let h = '<table class="ltable"><thead><tr>' + th("id", t("list.id")) + th("pietro", t("list.floor")) + th("pokoje", t("list.rooms")) + th("metraz", t("list.area")) + "<th>" + t("list.orient") + "</th>" + th("cena", t("list.price"), 1) + "<th></th></tr></thead><tbody>";
    rows.forEach((a) => { h += '<tr class="' + (a.status === "sprzedane" ? "row-sold" : "") + '"><td><span class="lid">' + a.id + '</span></td><td>' + (a.pietro === 0 ? (lang === "pl" ? "Parter" : "Ground") : (lang === "pl" ? "p. " + a.pietro : a.pietro)) + "</td><td>" + a.pokoje + "</td><td>" + String(a.metraz).replace(".", ",") + ' m²</td><td>' + ORIENT_SHORT[lang][a.orient] + '</td><td style="text-align:right"><span class="lprice">' + money(a.cena) + '</span></td><td style="text-align:right"><button class="lbtn" data-open="' + a.id + '">' + (a.status === "sprzedane" ? t("st.sprzedane") : t("view")) + "</button></td></tr>"; });
    box.innerHTML = h + "</tbody></table>";
    $$("#lista th[data-k]").forEach((el) => el.addEventListener("click", () => { const k = el.dataset.k; if (state.sort.key === k) state.sort.dir *= -1; else { state.sort.key = k; state.sort.dir = 1; } buildLista(); }));
    $$("#lista [data-open]").forEach((b) => b.addEventListener("click", () => { setView("plan"); select(b.dataset.open); }));
  }
  function setView(v) { state.view = v; $("#cfg").classList.toggle("is-lista", v === "lista");
    $$(".viewtog button").forEach((b) => b.classList.toggle("on", b.dataset.view === v)); if (v === "lista") buildLista(); writeParams(); }

  /* ===================== compare ===================== */
  function toggleCompare(id) {
    const i = state.compare.indexOf(id);
    if (i >= 0) state.compare.splice(i, 1);
    else { if (state.compare.length >= 2) { toast(t("toast.cmpFull")); renderCard(); return; } state.compare.push(id); }
    localStorage.setItem("letnica_compare", JSON.stringify(state.compare)); renderCard(); renderCmpBar();
  }
  function renderCmpBar() {
    const bar = $("#cmpBar"); if (!state.compare.length) { bar.classList.remove("show"); return; }
    bar.classList.add("show");
    $("#cmpSlots").innerHTML = [0, 1].map((i) => { const id = state.compare[i];
      return id ? '<span class="slot">' + id + ' <button data-rm="' + id + '" aria-label="remove">×</button></span>' : '<span class="slot empty">—</span>'; }).join("");
    $$("#cmpSlots [data-rm]").forEach((b) => b.addEventListener("click", () => toggleCompare(b.dataset.rm)));
    $("#cmpGo").disabled = state.compare.length < 2; $("#cmpGo").style.opacity = state.compare.length < 2 ? ".5" : "1";
  }
  function openCompare() {
    if (state.compare.length < 2) { toast(t("cmp.pick")); return; }
    const A = byId(state.compare[0]), B = byId(state.compare[1]);
    const best = { metraz: A.metraz >= B.metraz ? "a" : "b", pokoje: A.pokoje >= B.pokoje ? "a" : "b", cena: A.cena <= B.cena ? "a" : "b", ppm2Eff: A.ppm2Eff <= B.ppm2Eff ? "a" : "b", bay: A.bay === B.bay ? "" : A.bay ? "a" : "b" };
    const col = (ap, side) => { const row = (k, val, bk) => '<div class="crow ' + (bk && best[bk] === side ? "best" : "") + '"><span>' + t("u." + k) + "</span><b>" + val + "</b></div>";
      return '<div class="cmp-col"><div class="cid">' + ap.id + '</div><div class="crow"><span>' + t("u.pietro") + "</span><b>" + floorName(ap.pietro) + "</b></div>" +
        row("metraz", String(ap.metraz).replace(".", ",") + " m²", "metraz") + row("pokoje", ap.pokoje, "pokoje") +
        '<div class="crow ' + (best.bay === side ? "best" : "") + '"><span>' + t("u.orient") + "</span><b>" + ORIENT_SHORT[lang][ap.orient] + "</b></div>" +
        '<div class="crow"><span>' + t("u.outdoor") + "</span><b>" + OUTDOOR[lang][ap.balkon] + "</b></div>" +
        row("pm2", money(ap.ppm2Eff), "ppm2Eff") + row("cena", money(ap.cena), "cena") + "</div>"; };
    $("#cmpBody").innerHTML = '<span class="eyebrow">' + t("cmp.title") + '</span><h2 style="font-size:26px;margin:6px 0 4px">' + A.id + ' <span style="color:var(--muted)">/</span> ' + B.id + '</h2><div class="cmp-cols">' + col(A, "a") + col(B, "b") + "</div>";
    $("#cmpOverlay").classList.add("open");
  }

  /* ===================== static sections ===================== */
  const LOC = [
    { ic: "wave", t: { pl: "Zatoka Gdańska", en: "Bay of Gdańsk" }, d: { pl: "plaża i promenada", en: "beach & promenade" }, dist: "300 m" },
    { ic: "tram", t: { pl: "Przystanek tramwajowy", en: "Tram stop" }, d: { pl: "do centrum 12 min", en: "12 min to centre" }, dist: "150 m" },
    { ic: "pin", t: { pl: "Stadion / SKM", en: "Stadium / rail" }, d: { pl: "kolej miejska", en: "city rail" }, dist: "1,2 km" },
    { ic: "car", t: { pl: "Obwodnica", en: "Ring road" }, d: { pl: "wyjazd z miasta", en: "city exit" }, dist: "4 km" },
    { ic: "plane", t: { pl: "Lotnisko Gdańsk", en: "Gdańsk airport" }, d: { pl: "samochodem", en: "by car" }, dist: "12 km" }
  ];
  const LOC_IC = { wave: '<path d="M3 14c2 0 2-2 4.5-2S9 14 12 14s2-2 4.5-2 1.5 2 4.5 2"/><path d="M3 18c2 0 2-2 4.5-2S9 18 12 18s2-2 4.5-2 1.5 2 4.5 2"/>',
    tram: '<rect x="6" y="4" width="12" height="13" rx="2"/><path d="M8 21l2-4M16 21l-2-4M6 10h12"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    car: '<path d="M3 13l2-5h14l2 5v5H3z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
    plane: '<path d="M10 21l2-6 8-3-8-1-2-8-2 8-4 1 4 3z"/>' };
  function buildLoc() { $("#locList").innerHTML = LOC.map((l) => '<div class="loc-item"><span class="ic"><svg viewBox="0 0 24 24">' + LOC_IC[l.ic] + '</svg></span><div><div class="t">' + l.t[lang] + '</div><div class="d">' + l.d[lang] + '</div></div><span class="dist">' + l.dist + "</span></div>").join(""); }

  const GAL = [
    '<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#D08B5E"/><path d="M40 170v-70a60 60 0 0 1 120 0v70z" fill="#B4552E"/><path d="M70 170v-40a30 30 0 0 1 60 0v40z" fill="#57271A"/><rect x="92" y="140" width="4" height="30" fill="#D08B5E"/></svg>',
    '<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#C87F4E"/><g fill="#57271A" opacity=".85"><rect x="26" y="30" width="44" height="54" rx="4"/><rect x="82" y="30" width="44" height="54" rx="4"/><rect x="138" y="30" width="36" height="54" rx="4"/><rect x="26" y="100" width="44" height="54" rx="4"/><rect x="82" y="100" width="44" height="54" rx="4"/><rect x="138" y="100" width="36" height="54" rx="4"/></g></svg>',
    '<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#E9CDB6"/><circle cx="100" cy="120" r="58" fill="#8AA06A"/><path d="M100 120c0-30 18-52 0-78-18 26 0 48 0 78z" fill="#6E8551"/><rect x="40" y="160" width="120" height="16" rx="6" fill="#B4552E"/></svg>',
    '<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#B4552E"/><g stroke="#8f3f1c" stroke-width="3"><line x1="0" y1="50" x2="200" y2="50"/><line x1="0" y1="100" x2="200" y2="100"/><line x1="0" y1="150" x2="200" y2="150"/><line x1="50" y1="0" x2="50" y2="200"/><line x1="100" y1="0" x2="100" y2="200"/><line x1="150" y1="0" x2="150" y2="200"/></g></svg>',
    '<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#D08B5E"/><rect x="30" y="30" width="140" height="140" rx="70 70 8 8" fill="#57271A"/><rect x="46" y="60" width="108" height="110" rx="54 54 4 4" fill="#EFD9C2"/></svg>',
    '<svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#C1774A"/><rect x="0" y="0" width="200" height="200" fill="#57271A" opacity=".08"/><g fill="none" stroke="#57271A" stroke-width="3" opacity=".5"><path d="M40 160V80l60-40 60 40v80"/><path d="M80 160v-40a20 20 0 0 1 40 0v40"/></g></svg>'
  ];
  function buildGallery() {
    $("#gallery").innerHTML = GAL.map((s, i) => '<button class="gtile" data-lb="' + i + '" aria-label="Zdjęcie ' + (i + 1) + '">' + s + "</button>").join("");
    $$("#gallery .gtile").forEach((b) => b.addEventListener("click", () => { $("#lbBody").innerHTML = GAL[+b.dataset.lb].replace('viewBox="0 0 200 200"', 'viewBox="0 0 200 200" style="width:min(80vw,560px);height:auto"'); $("#lightbox").classList.add("open"); }));
  }

  const STD = {
    dev: [ { ic: "wall", pl: ["Ściany i tynki", "Wygładzone, gotowe pod malowanie. Wylewki pod dowolną podłogę."], en: ["Walls & plaster", "Smoothed, ready to paint. Screeds ready for any flooring."] },
      { ic: "bolt", pl: ["Instalacje", "Elektryka, woda, ogrzewanie podłogowe rozprowadzone i odebrane."], en: ["Utilities", "Wiring, water and underfloor heating routed and signed off."] },
      { ic: "window", pl: ["Okna i drzwi", "Okna dębowe z ciepłym montażem, drzwi antywłamaniowe."], en: ["Windows & doors", "Oak windows, warm-fitted; anti-burglary doors."] } ],
    klucz: [ { ic: "brush", pl: ["Wykończenie pod klucz", "Podłogi, malowanie, biały montaż i oświetlenie w cenie."], en: ["Turnkey finish", "Floors, painting, sanitary ware and lighting included."] },
      { ic: "sofa", pl: ["Pakiety materiałów", "Trzy spójne palety w duchu palonej ziemi do wyboru."], en: ["Material packages", "Three curated palettes in the burnt-earth spirit."] },
      { ic: "key", pl: ["Wejdź i mieszkaj", "Odbierasz klucze do gotowego mieszkania. Bez ekip."], en: ["Move straight in", "You get keys to a finished flat. No crews."] } ]
  };
  const STD_IC = { wall: '<path d="M3 6h18M3 12h18M3 18h18M8 6v6M16 12v6M12 6v-3"/>', bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
    window: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M12 4v16M4 12h16"/>', brush: '<path d="M4 20s1-4 4-4 3-3 3-3M14 4l6 6-7 4-3-3z"/>',
    sofa: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 11h18v6H3zM6 17v2M18 17v2"/>', key: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v4M15 12v3"/>' };
  function buildStd(tab) { $("#stdGrid").innerHTML = STD[tab].map((s) => '<div class="std-item"><span class="ic"><svg viewBox="0 0 24 24">' + STD_IC[s.ic] + '</svg></span><div><h4>' + s[lang][0] + "</h4><p>" + s[lang][1] + "</p></div></div>").join(""); }

  const TL = [ { q: "IV 2025", st: "done", pl: ["Pozwolenie na budowę", "Prawomocna decyzja, pełna dokumentacja."], en: ["Building permit", "Final decision, full documentation."] },
    { q: "II 2026", st: "done", pl: ["Stan surowy", "Konstrukcja i dach zamknięte."], en: ["Shell complete", "Structure and roof closed."] },
    { q: "IV 2026", st: "now", pl: ["Elewacja i instalacje", "Cegła licowa, rozprowadzenie mediów."], en: ["Facade & utilities", "Face brick, services routed."] },
    { q: "III 2027", st: "", pl: ["Odbiory i klucze", "Zakończenie i przekazanie mieszkań."], en: ["Handover", "Completion and keys."] } ];
  function buildTimeline() { $("#timeline").innerHTML = TL.map((s) => '<div class="tl-step ' + s.st + '"><div class="dot"></div><div class="q">' + s.q + "</div><h4>" + s[lang][0] + "</h4><p>" + s[lang][1] + "</p></div>").join(""); }

  const FAQ = [ { pl: ["Czy ceny zawierają miejsce postojowe?", "Do mieszkań można dokupić miejsce w hali garażowej oraz komórkę lokatorską. To wersja demonstracyjna — ceny są poglądowe."], en: ["Do prices include parking?", "A spot in the underground garage and a storage unit can be added. This is a demo — prices are illustrative."] },
    { pl: ["Jak wygląda proces rezerwacji?", "Po wyborze mieszkania podpisujemy umowę rezerwacyjną, potem deweloperską u notariusza. W demie zapytanie nie jest wysyłane."], en: ["How does reserving work?", "After picking a flat we sign a reservation agreement, then a developer contract at a notary. In the demo the enquiry isn't sent."] },
    { pl: ["Czy mogę połączyć dwa mieszkania?", "Na etapie stanu surowego wybrane sąsiadujące lokale można połączyć. Zapytaj przez formularz."], en: ["Can I combine two flats?", "At the shell stage selected adjacent units can be merged. Ask via the form."] },
    { pl: ["Kiedy odbiór kluczy?", "Planowane zakończenie to III kwartał 2027. Aktualny etap widać w harmonogramie."], en: ["When are keys handed over?", "Completion is planned for Q3 2027. The current stage is in the timeline."] } ];
  function buildFaq() {
    $("#faqList").innerHTML = FAQ.map((f) => '<div class="faq-item"><button class="faq-q">' + f[lang][0] + '<span class="pm">+</span></button><div class="faq-a"><p>' + f[lang][1] + "</p></div></div>").join("");
    $$("#faqList .faq-item").forEach((it) => $(".faq-q", it).addEventListener("click", () => { const open = it.classList.contains("open");
      $$("#faqList .faq-item").forEach((x) => { x.classList.remove("open"); $(".faq-a", x).style.maxHeight = null; });
      if (!open) { it.classList.add("open"); $(".faq-a", it).style.maxHeight = $(".faq-a", it).scrollHeight + "px"; } }));
  }

  function calc() { const price = +$("#calcPrice").value, rent = +$("#calcRent").value;
    $("#calcPriceL").textContent = money(price); $("#calcRentL").textContent = money(rent);
    $("#calcYield").textContent = ((rent * 12) / price * 100).toFixed(1).replace(".", ",") + "%";
    $("#calcNote").textContent = t("calc.note").replace("{price}", money(price)).replace("{rent}", money(rent)); }

  function askAbout(id) { $("#kFlat").value = id; localStorage.setItem("letnica_enquiry", id);
    $("#c-kontakt").scrollIntoView({ behavior: "smooth", block: "start" }); toast(t("toast.askSet").replace("{id}", id)); }

  /* ===================== params ===================== */
  function writeParams() {
    const f = state.filters, p = new URLSearchParams();
    if (f.pokoje.size) p.set("pok", [...f.pokoje].sort().join(","));
    if (f.priceMax) p.set("cena", f.priceMax); if (f.areaMin) p.set("m2", f.areaMin);
    if (f.wolne) p.set("wolne", "1"); if (state.view === "lista") p.set("widok", "lista");
    if (state.selected) p.set("mieszkanie", state.selected);
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : "") + location.hash);
  }
  function readParams() {
    const p = new URLSearchParams(location.search);
    if (p.get("pok")) p.get("pok").split(",").forEach((v) => state.filters.pokoje.add(+v));
    if (p.get("cena")) state.filters.priceMax = +p.get("cena");
    if (p.get("m2")) state.filters.areaMin = +p.get("m2");
    if (p.get("wolne")) state.filters.wolne = true;
    if (p.get("widok") === "lista") state.view = "lista";
    if (p.get("mieszkanie") && byId(p.get("mieszkanie"))) state.selected = p.get("mieszkanie");
    const fp = $("#fPrice"); if (fp && state.filters.priceMax) fp.value = String(state.filters.priceMax);
    const fa = $("#fArea"); if (fa && state.filters.areaMin) fa.value = String(state.filters.areaMin);
  }

  /* ===================== i18n apply + lang ===================== */
  function applyI18n() {
    $$("[data-pl]").forEach((n) => { const v = n.getAttribute(lang === "pl" ? "data-pl" : "data-en"); if (v == null) return;
      if (v.indexOf("<") >= 0) n.innerHTML = v; else n.textContent = v; });
    document.documentElement.lang = lang;
    $$(".lang button").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
  }
  function setLang(l) {
    if (l === lang) return; lang = l; localStorage.setItem("letnica_lang", l);
    hidePopover();
    applyI18n();
    $$(".apt").forEach((el) => { const a = byId(el.dataset.id); el.setAttribute("aria-label", a.id + " · " + t("st." + a.status)); });
    renderCard(); if (state.view === "lista") buildLista();
    buildLoc(); buildStd($(".tabs button.on").dataset.tab); buildTimeline(); buildFaq(); renderCmpBar(); calc();
    const c = { intro: 1 }; const z = document.body.dataset.zone; // refresh caption
    const capMap = { intro: ["Elewacja · zawsze na ekranie", "Elevation · always on screen"], lokalizacja: ["Budynek w kontekście okolicy", "The building in context"], kamienica: ["Zbliżenie · detale i materiały", "Close-up · details & materials"], mieszkania: ["Kliknij okno →", "Click a window →"], inwestorzy: ["Wynajęte okna świecą", "Rented windows glow"], kontakt: ["Światło na górze", "Light up top"] };
    if (capMap[z]) $("#paneCap").textContent = capMap[z][lang === "pl" ? 0 : 1];
  }

  /* ===================== misc ===================== */
  let toastT; function toast(msg) { const e = $("#toast"); e.textContent = msg; e.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove("show"), 2600); }
  function countUp() { $$(".k .n[data-count]").forEach((n) => { const target = +n.dataset.count, suf = n.dataset.suffix || ""; let cur = 0; const step = Math.max(1, Math.round(target / 34));
    const iv = setInterval(() => { cur += step; if (cur >= target) { cur = target; clearInterval(iv); } n.textContent = cur + suf; }, 26); }); }

  /* ===================== init ===================== */
  document.addEventListener("DOMContentLoaded", function () {
    readParams(); applyI18n();
    buildElevation(); wireFilters();
    buildLoc(); buildGallery(); buildStd("dev"); buildTimeline(); buildFaq();
    renderCard(); renderCmpBar(); calc(); applyFilters();
    if (state.selected) { select(state.selected); hidePopover(); }
    setView(state.view);
    wireZones();

    $$(".viewtog button").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
    $("#cmpGo").addEventListener("click", openCompare);
    $("#cmpClose").addEventListener("click", () => $("#cmpOverlay").classList.remove("open"));
    $("#cmpOverlay").addEventListener("click", (e) => { if (e.target.id === "cmpOverlay") $("#cmpOverlay").classList.remove("open"); });
    $(".lb-close").addEventListener("click", () => $("#lightbox").classList.remove("open"));
    $("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox") $("#lightbox").classList.remove("open"); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { $("#cmpOverlay").classList.remove("open"); $("#lightbox").classList.remove("open"); hidePopover(); } });
    window.addEventListener("scroll", () => { positionPop(); hideTip(); }, { passive: true });
    window.addEventListener("resize", positionPop);
    document.addEventListener("click", (e) => { if (!$("#aptPop").hidden && !e.target.closest("#aptPop") && !e.target.closest(".apt")) hidePopover(); });
    $$("#stdTabs button").forEach((b) => b.addEventListener("click", () => { $$("#stdTabs button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); buildStd(b.dataset.tab); }));
    $("#calcPrice").addEventListener("input", calc); $("#calcRent").addEventListener("input", calc);
    $$(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
    $("#kForm").addEventListener("submit", (e) => { e.preventDefault(); toast(t("toast.enq")); });
    const sf = localStorage.getItem("letnica_enquiry"); if (sf && byId(sf)) $("#kFlat").value = sf;
    const mm = $(".mmenu");
    $(".burger").addEventListener("click", () => { mm.classList.add("open"); document.body.style.overflow = "hidden"; });
    $(".mmenu-close").addEventListener("click", () => { mm.classList.remove("open"); document.body.style.overflow = ""; });
    $$(".mmenu a").forEach((a) => a.addEventListener("click", () => { mm.classList.remove("open"); document.body.style.overflow = ""; }));

    const heroIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { countUp(); heroIO.disconnect(); } }), { threshold: .4 });
    heroIO.observe($("#c-intro .k"));
  });
})();
