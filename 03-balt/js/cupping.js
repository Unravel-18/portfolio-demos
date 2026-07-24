/* Bałt Palarnia — Karta Cuppingu: interactive flavour radar + branded PNG export. */
(function () {
  "use strict";

  function T(pl, en) { return Store.lang === "pl" ? pl : en; }

  const AXES = [
    { key: "aromat", pl: "Aromat", en: "Aroma" },
    { key: "kwasowosc", pl: "Kwasowość", en: "Acidity" },
    { key: "slodycz", pl: "Słodycz", en: "Sweetness" },
    { key: "cialo", pl: "Ciało", en: "Body" },
    { key: "finisz", pl: "Finisz", en: "Finish" },
    { key: "czystosc", pl: "Czystość", en: "Clean cup" }
  ];
  const NOTES = [
    { k: "czekolada", pl: "czekolada", en: "chocolate" }, { k: "karmel", pl: "karmel", en: "caramel" },
    { k: "orzech", pl: "orzech", en: "nut" }, { k: "owoce", pl: "owoce", en: "fruit" },
    { k: "jagody", pl: "jagody", en: "berries" }, { k: "cytrusy", pl: "cytrusy", en: "citrus" },
    { k: "kwiaty", pl: "kwiaty", en: "florals" }, { k: "jasmin", pl: "jaśmin", en: "jasmine" },
    { k: "miod", pl: "miód", en: "honey" }, { k: "sliwka", pl: "śliwka", en: "plum" },
    { k: "wanilia", pl: "wanilia", en: "vanilla" }, { k: "przyprawy", pl: "przyprawy", en: "spice" }
  ];

  const CX = 160, CY = 160, R = 112, N = AXES.length;
  const values = AXES.map(() => 3);
  const notes = new Set();
  let lot = null, noteText = "";

  function ang(i) { return (-90 + i * (360 / N)) * Math.PI / 180; }
  function pt(i, v) { const a = ang(i), r = v / 5 * R; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; }

  /* ---------- radar editor (SVG) ---------- */
  function buildRadar() {
    const svg = document.querySelector("#radar");
    let rings = "";
    for (let lvl = 1; lvl <= 5; lvl++) {
      let pts = "";
      for (let i = 0; i < N; i++) { const p = pt(i, lvl); pts += `${p[0].toFixed(1)},${p[1].toFixed(1)} `; }
      rings += `<polygon class="ring" points="${pts.trim()}"/>`;
    }
    let axes = "", labels = "";
    for (let i = 0; i < N; i++) {
      const e = pt(i, 5);
      axes += `<line class="axis" x1="${CX}" y1="${CY}" x2="${e[0].toFixed(1)}" y2="${e[1].toFixed(1)}"/>`;
      const lp = pt(i, 5.7); const a = ang(i);
      const anchor = Math.abs(Math.cos(a)) < 0.3 ? "middle" : (Math.cos(a) > 0 ? "start" : "end");
      labels += `<text class="alabel" x="${lp[0].toFixed(1)}" y="${(lp[1] + 3).toFixed(1)}" text-anchor="${anchor}">${AXES[i][Store.lang]}</text>`;
    }
    svg.innerHTML = `<g>${rings}${axes}</g><polygon class="poly" id="radarPoly"/><g id="radarHandles"></g>${labels}`;
    updateRadar();
  }
  function updateRadar() {
    let pts = "";
    for (let i = 0; i < N; i++) { const p = pt(i, values[i]); pts += `${p[0].toFixed(1)},${p[1].toFixed(1)} `; }
    document.querySelector("#radarPoly").setAttribute("points", pts.trim());
    const hg = document.querySelector("#radarHandles");
    hg.innerHTML = "";
    for (let i = 0; i < N; i++) {
      const p = pt(i, values[i]);
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("class", "handle"); c.setAttribute("cx", p[0]); c.setAttribute("cy", p[1]); c.setAttribute("r", 7);
      c.setAttribute("data-i", i); c.setAttribute("tabindex", "0"); c.setAttribute("role", "slider");
      c.setAttribute("aria-label", AXES[i][Store.lang]); c.setAttribute("aria-valuenow", values[i]);
      hg.appendChild(c);
    }
  }

  let activeAxis = -1;
  function svgCoords(evt) {
    const svg = document.querySelector("#radar"); const rect = svg.getBoundingClientRect();
    const cx = (evt.touches ? evt.touches[0].clientX : evt.clientX);
    const cy = (evt.touches ? evt.touches[0].clientY : evt.clientY);
    return [(cx - rect.left) / rect.width * 320, (cy - rect.top) / rect.height * 320];
  }
  function setFromPointer(evt) {
    if (activeAxis < 0) return;
    const [x, y] = svgCoords(evt);
    const a = ang(activeAxis);
    const dist = (x - CX) * Math.cos(a) + (y - CY) * Math.sin(a); // projection onto axis
    let v = dist / R * 5;
    v = Math.max(0.5, Math.min(5, Math.round(v * 2) / 2));
    values[activeAxis] = v;
    updateRadar(); render();
  }

  function wireRadar() {
    const svg = document.querySelector("#radar");
    svg.addEventListener("pointerdown", (e) => {
      const h = e.target.closest(".handle"); if (!h) return;
      activeAxis = +h.dataset.i; svg.setPointerCapture(e.pointerId); e.preventDefault();
    });
    svg.addEventListener("pointermove", (e) => { if (activeAxis >= 0) { setFromPointer(e); e.preventDefault(); } });
    svg.addEventListener("pointerup", () => { activeAxis = -1; });
    svg.addEventListener("pointercancel", () => { activeAxis = -1; });
    svg.addEventListener("keydown", (e) => {
      const h = e.target.closest(".handle"); if (!h) return;
      const i = +h.dataset.i;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") { values[i] = Math.min(5, values[i] + 0.5); updateRadar(); render(); e.preventDefault(); }
      if (e.key === "ArrowDown" || e.key === "ArrowLeft") { values[i] = Math.max(0.5, values[i] - 0.5); updateRadar(); render(); e.preventDefault(); }
    });
  }

  /* ---------- chips ---------- */
  function buildChips() {
    const box = document.querySelector("#noteChips");
    box.innerHTML = NOTES.map((n) => `<button class="note-chip ${notes.has(n.k) ? "on" : ""}" data-k="${n.k}">${n[Store.lang]}</button>`).join("");
    box.querySelectorAll(".note-chip").forEach((c) => c.addEventListener("click", () => {
      const k = c.dataset.k;
      if (notes.has(k)) { notes.delete(k); c.classList.remove("on"); }
      else { if (notes.size >= 6) return Store.toast(T("Wybierz maks. 6 nut", "Pick up to 6 notes")); notes.add(k); c.classList.add("on"); }
      render();
    }));
  }

  /* ---------- canvas render (live preview + export) ---------- */
  const S = 1080;
  let fontsReady = false;

  function drawCard(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, S, S);
    // bg
    ctx.fillStyle = "#F6EEDF"; ctx.fillRect(0, 0, S, S);
    // double border
    ctx.strokeStyle = "#D8C7A9"; ctx.lineWidth = 3; ctx.strokeRect(34, 34, S - 68, S - 68);
    ctx.lineWidth = 1.5; ctx.strokeRect(46, 46, S - 92, S - 92);
    ctx.textAlign = "center";

    // header mono
    ctx.fillStyle = "#5C4A3A"; ctx.font = "600 22px Karla, sans-serif";
    ctx.fillText((T("KARTA CUPPINGU", "CUPPING CARD")).toUpperCase().split("").join(" "), S / 2, 108);
    // lot name
    ctx.fillStyle = "#33241A"; ctx.font = "44px Fraunces, serif";
    const title = lot ? lot.name : T("Moja kawa", "My coffee");
    ctx.fillText(title, S / 2, 168);
    // meta line
    ctx.fillStyle = "#5C4A3A"; ctx.font = "20px Karla, sans-serif";
    const ri = Store.roastInfo();
    ctx.fillText("Bałt Palarnia · " + Store.fmtDate(new Date(), false), S / 2, 200);

    // radar
    drawCanvasRadar(ctx, S / 2, 470, 190);

    // notes
    if (notes.size) {
      ctx.font = "600 22px Karla, sans-serif";
      const labels = Array.from(notes).map((k) => { const n = NOTES.find((x) => x.k === k); return n[Store.lang]; });
      // layout chips centered across up to 2 rows
      let rows = [[]], w = 0, maxW = S - 220;
      labels.forEach((l) => { const cw = ctx.measureText(l).width + 46; if (w + cw > maxW && rows[rows.length - 1].length) { rows.push([]); w = 0; } rows[rows.length - 1].push({ l, cw }); w += cw + 12; });
      let y = 720;
      rows.forEach((row) => {
        const total = row.reduce((s, c) => s + c.cw + 12, -12);
        let x = (S - total) / 2;
        row.forEach((c) => {
          ctx.fillStyle = "#E7D9C2"; roundRect(ctx, x, y - 24, c.cw, 34, 17); ctx.fill();
          ctx.strokeStyle = "#D8C7A9"; ctx.lineWidth = 1.5; roundRect(ctx, x, y - 24, c.cw, 34, 17); ctx.stroke();
          ctx.fillStyle = "#5C4A3A"; ctx.textAlign = "center"; ctx.fillText(c.l, x + c.cw / 2, y);
          x += c.cw + 12;
        });
        y += 46;
      });
    }

    // tasting note
    if (noteText.trim()) {
      ctx.fillStyle = "#33241A"; ctx.font = "italic 24px Fraunces, serif"; ctx.textAlign = "center";
      wrapText(ctx, "„" + noteText.trim() + "”", S / 2, notes.size ? 838 : 760, S - 220, 32);
    }

    // postmark bottom
    drawPostmark(ctx, S / 2, 960, 46);
    ctx.textAlign = "left";
  }

  function drawCanvasRadar(ctx, cx, cy, rad) {
    const n = N;
    const A = (i) => (-90 + i * (360 / n)) * Math.PI / 180;
    const P = (i, v) => [cx + (v / 5 * rad) * Math.cos(A(i)), cy + (v / 5 * rad) * Math.sin(A(i))];
    // rings
    ctx.strokeStyle = "#D8C7A9"; ctx.lineWidth = 1;
    for (let lvl = 1; lvl <= 5; lvl++) { ctx.beginPath(); for (let i = 0; i < n; i++) { const p = P(i, lvl); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.closePath(); ctx.stroke(); }
    // axes + labels
    ctx.fillStyle = "#5C4A3A"; ctx.font = "600 19px Karla, sans-serif";
    for (let i = 0; i < n; i++) {
      const e = P(i, 5); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(e[0], e[1]); ctx.stroke();
      const l = P(i, 5.9); const a = A(i);
      ctx.textAlign = Math.abs(Math.cos(a)) < 0.3 ? "center" : (Math.cos(a) > 0 ? "left" : "right");
      ctx.fillText(AXES[i][Store.lang], l[0], l[1] + 6);
    }
    // polygon
    ctx.beginPath(); for (let i = 0; i < n; i++) { const p = P(i, values[i]); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.closePath();
    ctx.fillStyle = "rgba(201,127,44,0.20)"; ctx.fill();
    ctx.strokeStyle = "#A9661D"; ctx.lineWidth = 3; ctx.stroke();
    // vertices
    for (let i = 0; i < n; i++) { const p = P(i, values[i]); ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, 7); ctx.fillStyle = "#A9661D"; ctx.fill(); }
  }

  function drawPostmark(ctx, cx, cy, r) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.12);
    ctx.strokeStyle = "#A03D2D"; ctx.fillStyle = "#A03D2D";
    ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, r - 8, 0, 7); ctx.stroke();
    ctx.setLineDash([1.6, 3]); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, r - 4, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = "20px Fraunces, serif"; ctx.textAlign = "center"; ctx.fillText("BAŁT", 0, 4);
    ctx.font = "600 9px Karla, sans-serif"; ctx.fillText("★ GDAŃSK · 1987 ★", 0, r - 15);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function wrapText(ctx, text, x, y, maxW, lh) {
    const words = text.split(" "); let line = "", yy = y;
    for (const w of words) { const t = line + w + " "; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line.trim(), x, yy); line = w + " "; yy += lh; } else line = t; }
    ctx.fillText(line.trim(), x, yy);
  }

  function render() {
    const canvas = document.querySelector("#cupCanvas");
    if (fontsReady) drawCard(canvas);
  }

  /* ---------- download + journal ---------- */
  function download() {
    const canvas = document.querySelector("#cupCanvas");
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = "karta-cuppingu-" + (lot ? lot.id : "bałt") + ".png"; a.click();
    saveJournal(url);
  }
  function saveJournal(url) {
    let j; try { j = JSON.parse(localStorage.getItem("balt_cupping")) || []; } catch (e) { j = []; }
    j.unshift(url); j = j.slice(0, 8);
    localStorage.setItem("balt_cupping", JSON.stringify(j));
    renderJournal();
  }
  function renderJournal() {
    const strip = document.querySelector("#journalStrip");
    let j; try { j = JSON.parse(localStorage.getItem("balt_cupping")) || []; } catch (e) { j = []; }
    if (!j.length) { strip.innerHTML = `<div class="journal-empty">${T("Twoje zapisane karty pojawią się tutaj.", "Your saved cards will appear here.")}</div>`; return; }
    strip.innerHTML = j.map((u) => `<img src="${u}" alt="Karta cuppingu">`).join("");
  }

  /* ---------- seed from product ---------- */
  function seed(p) {
    lot = p;
    document.querySelector("#lotName").value = p.name;
    // seed radar from profile/roast
    const has = (x) => (p.profile || []).indexOf(x) >= 0;
    values[0] = 4;                                   // aromat
    values[1] = has("owocowa") || has("kwiatowa") ? 4.5 : 2.5; // kwasowość
    values[2] = has("karmelowa") || has("owocowa") ? 4 : 3;    // słodycz
    values[3] = p.roast >= 4 ? 4.5 : p.roast === 3 ? 3.5 : 2.5; // ciało
    values[4] = p.roast >= 4 ? 4 : 3;                // finisz
    values[5] = 4;                                   // czystość
    (p.notes[Store.lang] || "").split(" · ").forEach((w) => {
      const m = NOTES.find((n) => n.pl === w || n.en === w); if (m && notes.size < 6) notes.add(m.k);
    });
  }

  window.onLangChange = function () { buildRadar(); buildChips(); render(); };

  document.addEventListener("DOMContentLoaded", function () {
    const id = new URLSearchParams(location.search).get("id");
    const p = id && Store.byId(id);
    if (p) seed(p);

    buildRadar(); wireRadar(); buildChips(); renderJournal();
    const canvas = document.querySelector("#cupCanvas"); canvas.width = S; canvas.height = S;
    document.querySelector("#lotName").addEventListener("input", (e) => { lot = { id: lot ? lot.id : "custom", name: e.target.value }; render(); });
    document.querySelector("#cupNote").addEventListener("input", (e) => { noteText = e.target.value; render(); });
    document.querySelector("#cupDownload").addEventListener("click", download);
    document.querySelector("#cupReset").addEventListener("click", () => { for (let i = 0; i < N; i++) values[i] = 3; notes.clear(); noteText = ""; document.querySelector("#cupNote").value = ""; buildChips(); updateRadar(); render(); });

    // load fonts then first render
    if (document.fonts && document.fonts.load) {
      Promise.all([document.fonts.load("44px Fraunces"), document.fonts.load("20px Karla"), document.fonts.load("600 20px Karla")])
        .then(() => { fontsReady = true; render(); })
        .catch(() => { fontsReady = true; render(); });
      setTimeout(() => { if (!fontsReady) { fontsReady = true; render(); } }, 1200);
    } else { fontsReady = true; render(); }
  });
})();
