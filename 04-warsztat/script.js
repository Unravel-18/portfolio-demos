(() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;

  /* =====================================================
     1) ERA SWITCH (2010 ⇄ 2026), state in URL hash
     ===================================================== */
  const toastEl = $("#era-toast");
  let toastT;
  function toast(html) {
    if (!toastEl) return;
    toastEl.innerHTML = html;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  function setEra(era, announce) {
    era = era === "2010" ? "2010" : "2026";
    body.classList.toggle("era-2010", era === "2010");
    body.classList.toggle("era-2026", era === "2026");
    $$(".era-pill").forEach((p) =>
      p.setAttribute("aria-pressed", String(p.dataset.era === era))
    );
    $("#site-2010").setAttribute("aria-hidden", String(era !== "2010"));
    $("#site-2026").setAttribute("aria-hidden", String(era === "2010"));
    if (era === "2010" && location.hash !== "#2010") history.replaceState(null, "", "#2010");
    if (era === "2026" && location.hash === "#2010") history.replaceState(null, "", location.pathname);
    if (announce) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (era === "2026") toast("To samo, <b>odświeżone</b> — mobilnie, z wyceną i śledzeniem naprawy.");
      else toast("Wersja z <b>2010</b> roku. Tak wyglądała strona przed redesignem.");
    }
  }
  $$(".era-pill").forEach((p) =>
    p.addEventListener("click", () => setEra(p.dataset.era, true))
  );
  setEra(location.hash === "#2010" ? "2010" : "2026", false);

  /* =====================================================
     2) RETRO 2010 interactions (menu pages, fake music)
     ===================================================== */
  $$("#site-2010 .r-btn[data-r]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.preventDefault();
      const page = b.dataset.r;
      const target = $(`#site-2010 .r-page[data-page="${page}"]`);
      if (!target) { toast("Podstrona „" + b.textContent + "” w budowie… 🚧"); return; }
      $$("#site-2010 .r-page").forEach((p) => (p.hidden = true));
      target.hidden = false;
    })
  );
  $$("#site-2010 .r-music-link").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      toast(a.dataset.music === "on"
        ? "♪ <b>MIDI</b>: „Eye of the Tiger” (na szczęście to tylko koncept 😄)"
        : "Muzyka wyłączona. Uff.");
    })
  );

  /* =====================================================
     3) KALKULATOR WYCENY
     ===================================================== */
  const CLASS = {
    miejskie: { label: "Miejskie", k: 1.0 },
    kompakt:  { label: "Kompakt",  k: 1.15 },
    suv:      { label: "SUV / VAN", k: 1.4 },
    premium:  { label: "Premium",  k: 1.7 },
  };
  // base = [lo, hi, hours]; opts add flat (not ×class) or multiply
  const SERV = {
    przeglad:    { label: "Przegląd",    base: [150, 200, 1],
      opts: [{ id: "skp", label: "Przegląd rejestracyjny (SKP)", add: [99, 99], h: 0.5 }] },
    klima:       { label: "Klimatyzacja", base: [180, 240, 1.5],
      opts: [{ id: "grzyb", label: "Odgrzybianie", add: [80, 120], h: 0.5 }] },
    hamulce:     { label: "Hamulce",     base: [260, 360, 2],
      opts: [{ id: "os2", label: "Przód + tył", mult: 1.8, h: 1 },
             { id: "plyn", label: "Wymiana płynu", add: [50, 70], h: 0.3 }] },
    zawieszenie: { label: "Zawieszenie", base: [300, 500, 3],
      opts: [{ id: "geo", label: "Geometria kół", add: [120, 160], h: 0.5 }] },
    diagnostyka: { label: "Diagnostyka", base: [120, 160, 1], opts: [] },
    opony:       { label: "Opony",       base: [80, 120, 0.5],
      opts: [{ id: "wyw", label: "Wyważanie", add: [40, 60] },
             { id: "sez", label: "Przechowanie opon", add: [60, 80] }] },
  };

  const calc = { klasa: "miejskie", usluga: "przeglad", opcje: new Set() };
  const optsWrap = $(".m-opts");

  function renderOpts() {
    const serv = SERV[calc.usluga];
    optsWrap.innerHTML = "";
    if (!serv.opts.length) {
      optsWrap.innerHTML = '<span class="m-opt-none">Brak opcji dodatkowych dla tej usługi.</span>';
      return;
    }
    serv.opts.forEach((o) => {
      const on = calc.opcje.has(o.id);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "m-opt" + (on ? " is-on" : "");
      b.dataset.opt = o.id;
      b.innerHTML = `<span class="m-opt-box">✓</span> ${o.label}`;
      b.addEventListener("click", () => {
        calc.opcje.has(o.id) ? calc.opcje.delete(o.id) : calc.opcje.add(o.id);
        renderOpts();
        priceUp();
      });
      optsWrap.appendChild(b);
    });
  }

  function compute() {
    const k = CLASS[calc.klasa].k;
    const s = SERV[calc.usluga];
    let lo = s.base[0] * k, hi = s.base[1] * k, h = s.base[2];
    s.opts.forEach((o) => {
      if (!calc.opcje.has(o.id)) return;
      if (o.mult) { lo *= o.mult; hi *= o.mult; }
      if (o.add) { lo += o.add[0]; hi += o.add[1]; }
      if (o.h) h += o.h;
    });
    const round = (n) => Math.round(n / 10) * 10;
    return { lo: round(lo), hi: round(hi), h };
  }

  function fmtTime(h) {
    const s = (h % 1 === 0 ? String(h) : h.toFixed(1)).replace(".", ",");
    return "~" + s + " godz.";
  }

  const loEl = $("#calc-lo"), hiEl = $("#calc-hi"), timeEl = $("#calc-time"), vehEl = $("#calc-veh");
  let animT;
  function countTo(el, target) {
    const from = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
    const start = performance ? 0 : 0; // no Date/random; use rAF steps
    const steps = 16; let i = 0;
    const step = () => {
      i++;
      const v = Math.round(from + (target - from) * (i / steps));
      el.textContent = v;
      if (i < steps) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }
  function priceUp() {
    const r = compute();
    countTo(loEl, r.lo);
    countTo(hiEl, r.hi);
    timeEl.textContent = fmtTime(r.h);
    vehEl.textContent = CLASS[calc.klasa].label;
  }

  // choice groups
  $$('.m-choices[data-group], .m-choices-2[data-group]').forEach((grp) => {
    const key = grp.dataset.group; // "klasa" | "usluga"
    grp.addEventListener("click", (e) => {
      const btn = e.target.closest(".m-choice");
      if (!btn) return;
      $$(".m-choice", grp).forEach((c) => c.classList.toggle("is-on", c === btn));
      calc[key] = btn.dataset.val;
      if (key === "usluga") { calc.opcje.clear(); renderOpts(); }
      priceUp();
    });
  });
  renderOpts();
  priceUp();

  // "Umów z tą wyceną" → prefill contact form
  $("#calc-book").addEventListener("click", () => {
    const r = compute();
    const serv = SERV[calc.usluga].label;
    const optNames = SERV[calc.usluga].opts
      .filter((o) => calc.opcje.has(o.id)).map((o) => o.label);
    const optTxt = optNames.length ? " (" + optNames.join(", ") + ")" : "";
    const msg = `Proszę o wycenę: ${serv}${optTxt}. Pojazd: ${CLASS[calc.klasa].label}. ` +
                `Kalkulator: ${r.lo}–${r.hi} zł, ${fmtTime(r.h)}.`;
    const ta = $('#book-form [name="msg"]');
    if (ta) ta.value = msg;
    toast("Wycena przeniesiona do formularza — uzupełnij dane kontaktowe.");
  });

  /* =====================================================
     4) ŚLEDZENIE NAPRAWY
     ===================================================== */
  const STAGES = ["Przyjęte", "Diagnoza", "Wycena zaakceptowana", "W naprawie", "Gotowe do odbioru"];
  const ORDERS = {
    "GLW-2481": { car: "VW Golf 2016 · 1.4 TSI", stage: 3,
      times: ["19.07 08:40", "19.07 09:15", "19.07 10:00", "dziś 09:30", ""] },
    "GLW-2490": { car: "Ford Focus 2014 · 1.6", stage: 4,
      times: ["18.07 11:20", "18.07 12:05", "18.07 13:30", "19.07 15:00", "dziś 08:10"] },
    "GLW-2503": { car: "Opel Astra 2019 · 1.5 CDTI", stage: 1,
      times: ["dziś 07:50", "dziś 08:20", "", "", ""] },
  };
  const trackIn = $("#track-in"), trackRes = $("#track-result");

  function renderOrder(no) {
    const key = no.trim().toUpperCase();
    const o = ORDERS[key];
    if (!o) {
      trackRes.hidden = false;
      trackRes.innerHTML =
        `<p class="m-tr-empty">Nie znaleziono zlecenia „${key || "—"}”. Sprawdź numer z karty przyjęcia lub użyj numeru demo poniżej.</p>`;
      return;
    }
    const done = o.stage === STAGES.length - 1;
    const badge = done
      ? `<span class="m-tr-badge done">✓ Gotowe do odbioru</span>`
      : `<span class="m-tr-badge active">W toku: ${STAGES[o.stage]}</span>`;
    const items = STAGES.map((s, i) => {
      const cls = i < o.stage ? "done" : i === o.stage ? "active" : "pending";
      const ic = i < o.stage ? "✓" : i === o.stage ? "●" : "";
      const t = o.times[i] || "";
      return `<li class="${cls}"><span class="m-tl-ic">${ic}</span>
        <span class="m-tl-tx"><b>${s}</b>${i === o.stage && !done ? "<span>w tej chwili</span>" : ""}</span>
        <span class="m-tl-time">${t}</span></li>`;
    }).join("");
    trackRes.hidden = false;
    trackRes.innerHTML =
      `<div class="m-tr-head"><div><div class="m-tr-no">${key}</div>
        <div class="m-tr-car">${o.car}</div></div>${badge}</div>
       <ul class="m-tl">${items}</ul>`;
  }

  $("#track-form").addEventListener("submit", (e) => {
    e.preventDefault();
    renderOrder(trackIn.value);
  });
  $$(".m-chip[data-order]").forEach((c) =>
    c.addEventListener("click", () => { trackIn.value = c.dataset.order; renderOrder(c.dataset.order); })
  );

  /* =====================================================
     5) BOOKING FORM (validate, no real send)
     ===================================================== */
  $("#book-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    let ok = true;
    ["name", "phone"].forEach((n) => {
      const el = f[n];
      const bad = !el.value.trim();
      el.classList.toggle("bad", bad);
      if (bad) ok = false;
    });
    if (!ok) { toast("Uzupełnij imię i telefon."); return; }
    f.reset();
    toast("Dziękujemy! To wersja demo — <b>oddzwonilibyśmy w tym samym dniu</b>.");
  });
})();
