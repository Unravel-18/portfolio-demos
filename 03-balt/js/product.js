/* Bałt Palarnia — product detail (produkt.html?id=). */
(function () {
  "use strict";

  function T(pl, en) { return Store.lang === "pl" ? pl : en; }

  const SPEC = {
    etiopia: { region: { pl: "Gedeb, Yirgacheffe", en: "Gedeb, Yirgacheffe" }, alt: "1900–2100", var: { pl: "Heirloom", en: "Heirloom" }, proc: { pl: "Myta", en: "Washed" } },
    kenia: { region: { pl: "Nyeri", en: "Nyeri" }, alt: "1700–1900", var: "SL28 · SL34", proc: { pl: "Myta", en: "Washed" } },
    kolumbia: { region: { pl: "Huila", en: "Huila" }, alt: "1500–1800", var: { pl: "Caturra", en: "Caturra" }, proc: { pl: "Myta", en: "Washed" } },
    brazylia: { region: { pl: "Cerrado", en: "Cerrado" }, alt: "1000–1200", var: { pl: "Mundo Novo", en: "Mundo Novo" }, proc: { pl: "Naturalna", en: "Natural" } },
    gwatemala: { region: { pl: "Antigua", en: "Antigua" }, alt: "1500–1700", var: { pl: "Bourbon", en: "Bourbon" }, proc: { pl: "Myta", en: "Washed" } },
    honduras: { region: { pl: "Marcala", en: "Marcala" }, alt: "1300–1600", var: { pl: "Catuaí", en: "Catuaí" }, proc: { pl: "Myta", en: "Washed" } },
    peru: { region: { pl: "Cajamarca", en: "Cajamarca" }, alt: "1600–1900", var: { pl: "Typica", en: "Typica" }, proc: { pl: "Bezkofeinowa EA", en: "EA decaf" } }
  };

  function lastTuesday() {
    const d = new Date();
    const day = d.getDay();
    const diff = (day - 2 + 7) % 7;
    d.setDate(d.getDate() - diff);
    return d.toLocaleDateString(Store.lang === "pl" ? "pl-PL" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  let p, weight = 250, grind = "ziarna", qty = 1;

  function priceNow() {
    let base = weight === 1000 && p.price1000 ? p.price1000 : p.price250;
    if (p.promo) base = base * (1 - p.promo);
    return Math.round(base);
  }
  function perKg() {
    const g = weight === 1000 ? p.price1000 : p.price250 * 4;
    return Math.round((weight === 1000 ? p.price1000 : p.price250 * 4));
  }

  function renderPrice() {
    const el = document.querySelector("#pPrice");
    const now = priceNow();
    const wasBase = Math.round(weight === 1000 && p.price1000 ? p.price1000 : p.price250);
    let perkgBase = weight === 1000 ? p.price1000 : p.price250 * 4;
    if (p.promo) perkgBase = perkgBase * (1 - p.promo);
    const perkg = `<span class="perkg">${Store.money(Math.round(perkgBase))} / kg</span>`;
    if (p.promo) {
      el.innerHTML = `<s class="was">${Store.money(wasBase)}</s> <span class="now">${Store.money(now)}</span>`
        + ` <span class="save-tag">−${Math.round(p.promo * 100)}%</span> ${perkg}`;
    } else {
      el.innerHTML = `${Store.money(now)} ${perkg}`;
    }
    el.classList.toggle("is-sale", !!p.promo);
    el.classList.remove("blink"); void el.offsetWidth; el.classList.add("blink");
    const kg = document.querySelector("#perKgNote");
    if (kg) kg.innerHTML = p.promo
      ? `<span class="save-note">${Store.lang === "pl" ? "Oszczędzasz" : "You save"} ${Store.money(wasBase - now)}</span>`
      : "";
  }

  function build() {
    const t = Store.t, L = Store.lang;
    document.title = p.name + " — Bałt Palarnia";
    document.querySelector("#crumbName").textContent = p.name;
    document.querySelector("#pLot").textContent = `LOT ${p.lot} · ${p.originLabel[L].toUpperCase()}`;
    document.querySelector("#pName").textContent = p.name;
    renderBadges();
    document.querySelector("#pNotes").innerHTML = p.notes[L].split(" · ").map((n) => `<span class="chip-note">${n}</span>`).join("");
    document.querySelector("#pRoast").innerHTML = Store.roastDots(p.roast);
    document.querySelector("#pDesc").textContent = p.desc[L];

    // gallery
    const main = document.querySelector("#gMain");
    main.innerHTML = galleryView("front");
    document.querySelectorAll(".gthumb").forEach((th) => {
      const v = th.dataset.v; const file = v === "beans" ? "beans" : v === "cup" ? "cup" : Store.imgFor(p);
      th.innerHTML = `<img src="img/${file}.webp" alt="" style="width:100%;height:100%;object-fit:cover">`;
    });
    document.querySelectorAll(".gthumb").forEach((th) => th.addEventListener("click", () => {
      document.querySelectorAll(".gthumb").forEach((x) => x.classList.remove("on"));
      th.classList.add("on");
      main.style.opacity = "0";
      setTimeout(() => { main.innerHTML = galleryView(th.dataset.v); main.style.opacity = "1"; }, 120);
    }));

    // weight
    const wWrap = document.querySelector("#pWeight");
    if (p.price1000 && !p.boxOnly) {
      const save = p.price250 * 4 - p.price1000;
      const w250 = Math.round(p.promo ? p.price250 * (1 - p.promo) : p.price250);
      const w1000 = Math.round(p.promo ? p.price1000 * (1 - p.promo) : p.price1000);
      wWrap.innerHTML = `
        <button class="wopt on" data-w="250">250 g · ${Store.money(w250)}</button>
        <button class="wopt" data-w="1000">1000 g · ${Store.money(w1000)} <b>${L === "pl" ? "−" : "save "}${Store.money(save)}</b></button>`;
      wWrap.querySelectorAll(".wopt").forEach((b) => b.addEventListener("click", () => {
        wWrap.querySelectorAll(".wopt").forEach((x) => x.classList.remove("on")); b.classList.add("on");
        weight = +b.dataset.w; renderPrice();
      }));
    } else { wWrap.style.display = "none"; document.querySelector("#pWeightLbl").style.display = "none"; }

    // grind
    const gSel = document.querySelector("#pGrind");
    if (p.boxOnly) { document.querySelector("#grindField").style.display = "none"; }
    else {
      const grinds = ["ziarna", "przelew", "drip", "espresso", "kawiarka", "french"];
      gSel.innerHTML = grinds.map((g) => `<option value="${g}">${Store.grindLabel(g)}</option>`).join("");
      gSel.addEventListener("change", () => { grind = gSel.value; });
    }

    // qty
    const q = document.querySelector("#pQty");
    q.querySelector("[data-inc]").addEventListener("click", () => { qty = Math.min(10, qty + 1); q.querySelector("span").textContent = qty; });
    q.querySelector("[data-dec]").addEventListener("click", () => { qty = Math.max(1, qty - 1); q.querySelector("span").textContent = qty; });

    // add
    const addBtn = document.querySelector("#pAdd");
    if (p.soldOut) {
      addBtn.textContent = L === "pl" ? "Powiadom mnie" : "Notify me";
      addBtn.classList.remove("btn-primary"); addBtn.classList.add("btn-ghost");
      document.querySelector("#stickyAdd").textContent = addBtn.textContent;
    } else {
      const doAdd = () => {
        Store.add({ id: p.id, weight: p.boxOnly ? 250 : weight, grind: p.boxOnly ? "drip" : grind, qty });
        Store.openDrawer();
      };
      addBtn.addEventListener("click", doAdd);
      document.querySelector("#stickyAdd").addEventListener("click", doAdd);
    }

    renderPrice();
    const fresh = document.querySelector("#pFresh"); if (fresh) fresh.innerHTML = Store.freshnessWidget();
    const cupLink = document.querySelector("#pCupLink"); if (cupLink) cupLink.href = "cupping.html?id=" + p.id;
    buildSpec();
    // related
    const rel = PRODUCTS.filter((x) => x.id !== p.id && !x.soldOut && (x.roast === p.roast || (x.profile || []).some((pr) => (p.profile || []).includes(pr)))).slice(0, 4);
    const relList = rel.length >= 3 ? rel : rel.concat(PRODUCTS.filter((x) => x.badges.includes("bestseller") && x.id !== p.id)).slice(0, 4);
    Store.renderInto("#related", relList.slice(0, 4));

    // sticky mobile bar price
    document.querySelector("#stickyName").textContent = p.name;
    document.querySelector("#stickyPrice").textContent = Store.money(priceNow());
  }

  function renderBadges() {
    const box = document.querySelector("#pBadges");
    if (!box) return;
    const map = {
      bestseller: ["tag-espresso", { pl: "Bestseller", en: "Bestseller" }],
      nowosc: ["tag-amber", { pl: "Nowość", en: "New" }],
      promo: ["tag-cherry", { pl: "Promocja −" + Math.round((p.promo || 0.15) * 100) + "%", en: "Sale −" + Math.round((p.promo || 0.15) * 100) + "%" }],
      limitowane: ["tag-amber", { pl: "Limitowane", en: "Limited" }],
      wyprzedane: ["tag-out", { pl: "Wyprzedane", en: "Sold out" }]
    };
    box.innerHTML = (p.badges || []).map((b) => {
      const m = map[b]; return m ? `<span class="tag ${m[0]}">${m[1][Store.lang]}</span>` : "";
    }).join("");
  }

  function galleryView(v) {
    const file = v === "beans" ? "beans" : v === "cup" ? "cup" : Store.imgFor(p);
    const stamp = v === "front" ? `<div class="stamp-date">${T("PALONE", "ROASTED")}: ${lastTuesday()}</div>` : "";
    return `<img src="img/${file}.webp" alt="${p.name}" style="width:100%;aspect-ratio:1/1;object-fit:cover;display:block">${stamp}`;
  }

  function buildSpec() {
    const L = Store.lang;
    const base = p.origin.split("-")[0];
    const s = SPEC[base];
    const rows = [];
    const tr = (k, v) => rows.push(`<div class="spec-row"><span>${k}</span><span>${v}</span></div>`);
    tr(L === "pl" ? "Pochodzenie" : "Origin", p.originLabel[L] + (s ? " · " + txt(s.region) : ""));
    if (s) tr(L === "pl" ? "Wysokość" : "Altitude", s.alt + " m n.p.m.");
    if (s) tr(L === "pl" ? "Odmiana" : "Variety", txt(s.var));
    if (s) tr(L === "pl" ? "Obróbka" : "Process", txt(s.proc));
    tr(L === "pl" ? "Stopień palenia" : "Roast", Store.t("roast." + p.roast));
    tr(L === "pl" ? "Ocena SCA" : "SCA score", `<b class="serif" style="font-size:19px;color:var(--amber-dk)">${p.sca}</b>`);
    tr(L === "pl" ? "Data ostatniego wypału" : "Last roast date", lastTuesday());
    document.querySelector("#pSpec").innerHTML = rows.join("");
    function txt(o) { return typeof o === "string" ? o : o[L]; }
  }

  window.onLangChange = function () { build(); };

  document.addEventListener("DOMContentLoaded", function () {
    const id = new URLSearchParams(location.search).get("id");
    p = Store.byId(id) || PRODUCTS[0];
    build();
  });
})();
