/* Bałt Palarnia — shared store logic: cart, drawer, i18n, sack art, toast. */
(function () {
  "use strict";

  /* ---------------- i18n ---------------- */
  const DICT = {
    pl: {
      "nav.sklep": "Sklep", "nav.sub": "Subskrypcja", "nav.about": "O nas", "nav.contact": "Kontakt",
      "cart.title": "MANIFEST ŁADUNKOWY", "cart.sub": "port Gdańsk · demo", "cart.empty": "Ładownia pusta — żaden worek nie wszedł jeszcze na pokład.",
      "cart.toShop": "Do sklepu", "cart.promoQ": "Masz kod rabatowy?", "cart.apply": "Zastosuj",
      "cart.badPromo": "Nie znamy tego kodu.", "cart.sub2": "Suma częściowa", "cart.disc": "Rabat",
      "cart.ship": "Dostawa", "cart.total": "Razem", "cart.toOrder": "Przejdź do zamówienia",
      "cart.free": "Masz darmową dostawę! 🎉", "cart.toFree": "Do darmowej dostawy brakuje",
      "cart.noPay": "To demo — nie pobierzemy płatności.", "cart.remove": "usuń",
      "add.done": "Dodano ✓", "add.do": "Do koszyka",
      "ship.free": "0 zł", "unit.mo": "/ miesiąc",
      "toast.max2": "Porównujesz maks. 2 pozycje",
      "roast.1": "Jasne", "roast.2": "Jasne", "roast.3": "Średnie", "roast.4": "Ciemne", "roast.5": "Ciemne"
    },
    en: {
      "nav.sklep": "Shop", "nav.sub": "Subscription", "nav.about": "About", "nav.contact": "Contact",
      "cart.title": "CARGO MANIFEST", "cart.sub": "port of Gdańsk · demo", "cart.empty": "The hold is empty — no sack has come aboard yet.",
      "cart.toShop": "To the shop", "cart.promoQ": "Have a promo code?", "cart.apply": "Apply",
      "cart.badPromo": "We don't know that code.", "cart.sub2": "Subtotal", "cart.disc": "Discount",
      "cart.ship": "Shipping", "cart.total": "Total", "cart.toOrder": "Go to checkout",
      "cart.free": "Free shipping unlocked! 🎉", "cart.toFree": "For free shipping add",
      "cart.noPay": "It's a demo — no payment is taken.", "cart.remove": "remove",
      "add.done": "Added ✓", "add.do": "Add to basket",
      "ship.free": "0 zł", "unit.mo": "/ month",
      "toast.max2": "You can compare max 2 items",
      "roast.1": "Light", "roast.2": "Light", "roast.3": "Medium", "roast.4": "Dark", "roast.5": "Dark"
    }
  };

  const Store = {};
  Store.lang = localStorage.getItem("balt_lang") || "pl";
  Store.t = (k) => (DICT[Store.lang][k] != null ? DICT[Store.lang][k] : k);
  Store.byId = (id) => (window.PRODUCTS || []).find((p) => p.id === id);

  /* ---------------- money ---------------- */
  const RATE_EUR = 4.3;
  Store.money = (pln) => {
    const s = new Intl.NumberFormat(Store.lang === "pl" ? "pl-PL" : "en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(pln));
    return s + " zł";
  };

  /* ---------------- product imagery (real photos) ---------------- */
  const IMG = {
    "baltyk-espresso": "bag-dark", "stocznia-dark": "bag-dark",
    "brazylia-cerrado": "bag-medium", "kolumbia-huila": "bag-medium", "gwatemala-antigua": "bag-medium",
    "honduras-marcala": "bag-terra", "peru-decaf": "bag-terra", "kenia-nyeri": "bag-terra",
    "etiopia-yirgacheffe": "bag-light", "mewa-filter": "bag-light", "kolumbia-geisha": "bag-light",
    "drip-box": "drip"
  };
  Store.imgFor = function (p) {
    return IMG[p.id] || (p.boxOnly ? "drip" : p.roast >= 4 ? "bag-dark" : p.roast === 3 ? "bag-medium" : "bag-light");
  };
  Store.sack = function (p, cls) {
    return `<img class="sack ${cls || ""}" src="img/${Store.imgFor(p)}.webp" alt="${p.name}" loading="lazy">`;
  };

  Store.roastDots = function (roast) {
    let d = "";
    for (let i = 1; i <= 5; i++) d += `<i class="${i <= roast ? "on" : ""}"></i>`;
    return `<span class="roast">${d}<span class="lbl">${Store.t("roast." + roast)}</span></span>`;
  };

  /* ---------------- cart state ---------------- */
  function readCart() {
    try { return JSON.parse(localStorage.getItem("balt_cart")) || { items: [], promo: null }; }
    catch (e) { return { items: [], promo: null }; }
  }
  function writeCart(c) { localStorage.setItem("balt_cart", JSON.stringify(c)); }
  Store.cart = readCart();

  Store.lineKey = (it) => `${it.id}|${it.weight}|${it.grind || "-"}`;

  Store.priceOf = function (it) {
    const p = Store.byId(it.id);
    if (!p) return 0;
    let base = it.weight === 1000 && p.price1000 ? p.price1000 : p.price250;
    if (it.custom) base = it.custom;         // subscription box carries its own price
    if (p.promo && !it.custom) base = base * (1 - p.promo);
    return base;
  };

  Store.count = () => Store.cart.items.reduce((n, it) => n + it.qty, 0);
  Store.subtotal = () => Store.cart.items.reduce((s, it) => s + Store.priceOf(it) * it.qty, 0);

  const PROMOS = { BALT10: { type: "pct", val: 0.10 }, DARMOWA: { type: "ship" } };
  Store.discount = function () {
    const sub = Store.subtotal();
    const pr = Store.cart.promo && PROMOS[Store.cart.promo];
    if (pr && pr.type === "pct") return sub * pr.val;
    return 0;
  };
  Store.FREE_FROM = 120;
  Store.shipping = function () {
    const sub = Store.subtotal();
    if (sub === 0) return 0;
    if (Store.cart.promo === "DARMOWA") return 0;
    if (sub - Store.discount() >= Store.FREE_FROM) return 0;
    return 12.99;
  };
  Store.grandTotal = () => Math.max(0, Store.subtotal() - Store.discount()) + Store.shipping();

  Store.add = function (item) {
    const key = Store.lineKey(item);
    const existing = Store.cart.items.find((it) => Store.lineKey(it) === key);
    if (existing) existing.qty += item.qty;
    else Store.cart.items.push(item);
    writeCart(Store.cart);
    Store.refreshBadge(true);
  };
  Store.setQty = function (key, qty) {
    const it = Store.cart.items.find((x) => Store.lineKey(x) === key);
    if (!it) return;
    it.qty = Math.max(1, Math.min(10, qty));
    writeCart(Store.cart); Store.renderDrawer(); Store.refreshBadge();
  };
  Store.remove = function (key) {
    Store.cart.items = Store.cart.items.filter((x) => Store.lineKey(x) !== key);
    if (!Store.cart.items.length) Store.cart.promo = null;
    writeCart(Store.cart); Store.refreshBadge();
  };
  Store.applyPromo = function (code) {
    code = (code || "").trim().toUpperCase();
    if (PROMOS[code]) { Store.cart.promo = code; writeCart(Store.cart); Store.renderDrawer(); Store.refreshBadge(); return true; }
    return false;
  };
  Store.clearPromo = function () { Store.cart.promo = null; writeCart(Store.cart); Store.renderDrawer(); };
  Store.clearCart = function () { Store.cart = { items: [], promo: null }; writeCart(Store.cart); Store.refreshBadge(); };

  /* ---------------- badge ---------------- */
  Store.refreshBadge = function (pop) {
    const b = document.querySelector(".cart-badge");
    if (!b) return;
    const n = Store.count();
    b.textContent = n; b.setAttribute("data-n", n);
    if (pop && n > 0) { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  };

  /* ---------------- drawer ---------------- */
  Store.renderDrawer = function () {
    const body = document.querySelector(".drawer-body");
    const foot = document.querySelector(".drawer-foot");
    if (!body || !foot) return;
    const c = Store.cart;
    if (!c.items.length) {
      body.innerHTML = `<div class="drawer-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 7h16l-1.5 12.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/></svg>
        <p>${Store.t("cart.empty")}</p>
        <button class="btn btn-primary" data-close-drawer>${Store.t("cart.toShop")}</button>
      </div>`;
      foot.innerHTML = "";
      return;
    }
    let rows = "";
    c.items.forEach((it) => {
      const p = Store.byId(it.id) || {};
      const key = Store.lineKey(it);
      const opt = it.custom ? (it.optLabel || "") : `${it.weight} g · ${Store.grindLabel(it.grind)}`;
      rows += `<div class="citem" data-key="${key}">
        ${it.custom ? Store.sack({ roast: 3, lot: "SUB", originLabel: { pl: "Subskrypcja", en: "Subscription" }, name: it.name }, "") : Store.sack(p, "")}
        <div>
          <div class="citem-name">${it.custom ? it.name : p.name}</div>
          <div class="citem-opt">${opt}</div>
          <div class="stepper"><button data-dec aria-label="−">−</button><span>${it.qty}</span><button data-inc aria-label="+">+</button></div>
        </div>
        <div>
          <div class="citem-price">${Store.money(Store.priceOf(it) * it.qty)}</div>
          <button class="citem-rm" data-rm aria-label="${Store.t("cart.remove")}" title="${Store.t("cart.remove")}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M10 4h4a1 1 0 0 1 1 1v2H9V5a1 1 0 0 1 1-1z"/><path d="M6 7l1 12.4A2 2 0 0 0 9 21h6a2 2 0 0 0 2-1.6L18 7"/><path d="M10 11v6M14 11v6"/></svg></button>
        </div>
      </div>`;
    });
    body.innerHTML = rows;

    const sub = Store.subtotal(), disc = Store.discount(), ship = Store.shipping(), total = Store.grandTotal();
    const remain = Store.FREE_FROM - (sub - disc);
    const promoRow = c.promo
      ? `<span class="chip">${c.promo} <button data-clear-promo aria-label="remove code">×</button></span>`
      : `<button class="promo-toggle" data-promo-toggle>${Store.t("cart.promoQ")}</button>
         <div class="promo-in"><input type="text" placeholder="BALT10" aria-label="promo code"><button class="btn btn-ghost btn-sm" data-promo-apply>${Store.t("cart.apply")}</button></div>
         <div class="promo-msg"></div>`;

    foot.innerHTML = `
      <div class="promo-row">${promoRow}</div>
      <div class="ship-bar">
        ${ship === 0 && sub > 0 ? Store.t("cart.free") : `${Store.t("cart.toFree")} <b class="tabnum">${Store.money(Math.max(0, remain))}</b>`}
        <div class="track"><div class="fill" style="width:${Math.min(100, ((sub - disc) / Store.FREE_FROM) * 100)}%"></div></div>
      </div>
      <div class="receipt-sum">
        <div class="row"><span>${Store.t("cart.sub2")}</span><span class="dots"></span><span>${Store.money(sub)}</span></div>
        ${disc > 0 ? `<div class="row disc"><span>${Store.t("cart.disc")}</span><span class="dots"></span><span>−${Store.money(disc)}</span></div>` : ""}
        <div class="row"><span>${Store.t("cart.ship")}</span><span class="dots"></span><span>${ship === 0 ? Store.t("ship.free") : Store.money(ship)}</span></div>
        <div class="total"><span>${Store.t("cart.total")}</span><b>${Store.money(total)}</b></div>
      </div>
      <a href="zamowienie.html" class="btn btn-primary btn-block" style="margin-top:14px">${Store.t("cart.toOrder")}</a>
      <p class="demo-note">${Store.t("cart.noPay")}</p>`;
  };

  Store.grindLabel = function (g) {
    const m = { ziarna: { pl: "Ziarna", en: "Whole bean" }, przelew: { pl: "Przelew", en: "Pour-over" }, drip: { pl: "Drip", en: "Drip" }, espresso: { pl: "Espresso", en: "Espresso" }, kawiarka: { pl: "Kawiarka", en: "Moka pot" }, french: { pl: "French press", en: "French press" } };
    return (m[g] && m[g][Store.lang]) || (m.ziarna[Store.lang]);
  };

  Store.openDrawer = function () {
    Store.renderDrawer();
    document.querySelector(".scrim").classList.add("open");
    document.querySelector(".drawer").classList.add("open");
    document.body.style.overflow = "hidden";
  };
  Store.closeDrawer = function () {
    document.querySelector(".scrim").classList.remove("open");
    document.querySelector(".drawer").classList.remove("open");
    document.body.style.overflow = "";
  };

  /* ---------------- toast ---------------- */
  let toastT;
  Store.toast = function (msg) {
    let el = document.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2200);
  };

  /* ---------------- i18n apply ---------------- */
  Store.applyI18n = function () {
    document.documentElement.lang = Store.lang;
    const set = (el, val) => { if (val == null) return; if (val.indexOf("<") >= 0) el.innerHTML = val; else el.textContent = val; };
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      const pl = el.getAttribute("data-pl"), en = el.getAttribute("data-en");
      if (pl != null || en != null) set(el, Store.lang === "pl" ? pl : en);
      else if (DICT[Store.lang][k] != null) el.textContent = DICT[Store.lang][k];
    });
    document.querySelectorAll("[data-pl][data-en]").forEach((el) => {
      if (el.hasAttribute("data-i18n")) return;
      set(el, Store.lang === "pl" ? el.getAttribute("data-pl") : el.getAttribute("data-en"));
    });
    document.querySelectorAll(".lang button").forEach((b) => b.classList.toggle("on", b.dataset.lang === Store.lang));
  };
  Store.setLang = function (l) {
    Store.lang = l; localStorage.setItem("balt_lang", l);
    Store.applyI18n(); Store.refreshBadge(); Store.renderDrawer();
    if (window.onLangChange) window.onLangChange();
  };

  /* ---------------- wire header/drawer/menu ---------------- */
  Store.initChrome = function () {
    Store.refreshBadge();
    Store.applyI18n();

    const cartBtn = document.querySelector(".cart-btn");
    if (cartBtn) cartBtn.addEventListener("click", Store.openDrawer);
    const scrim = document.querySelector(".scrim");
    if (scrim) scrim.addEventListener("click", Store.closeDrawer);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { Store.closeDrawer(); closeMenu(); } });

    const drawer = document.querySelector(".drawer");
    if (drawer) {
      drawer.addEventListener("click", (e) => {
        const t = e.target;
        if (t.closest(".drawer-close") || t.closest("[data-close-drawer]")) { Store.closeDrawer(); return; }
        const row = t.closest(".citem");
        if (row) {
          const key = row.dataset.key;
          if (t.closest("[data-inc]")) Store.setQty(key, qtyOf(key) + 1);
          if (t.closest("[data-dec]")) Store.setQty(key, qtyOf(key) - 1);
          if (t.closest("[data-rm]")) { row.classList.add("removing"); setTimeout(() => Store.remove(key) || Store.renderDrawer(), 240); }
        }
        if (t.closest("[data-promo-toggle]")) { document.querySelector(".promo-in").classList.toggle("open"); }
        if (t.closest("[data-promo-apply]")) {
          const box = t.closest(".promo-in"); const val = box.querySelector("input").value;
          if (Store.applyPromo(val)) { /* re-render handled */ }
          else { box.classList.add("err"); const m = document.querySelector(".promo-msg"); if (m) { m.textContent = Store.t("cart.badPromo"); m.classList.add("err"); } }
        }
        if (t.closest("[data-clear-promo]")) Store.clearPromo();
      });
    }
    function qtyOf(key) { const it = Store.cart.items.find((x) => Store.lineKey(x) === key); return it ? it.qty : 1; }

    // lang
    document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => Store.setLang(b.dataset.lang)));

    // mobile menu
    const burger = document.querySelector(".burger");
    const mmenu = document.querySelector(".mmenu");
    function openMenu() { if (mmenu) { mmenu.classList.add("open"); document.body.style.overflow = "hidden"; } }
    function closeMenu() { if (mmenu) { mmenu.classList.remove("open"); document.body.style.overflow = ""; } }
    Store._closeMenu = closeMenu;
    if (burger) burger.addEventListener("click", openMenu);
    if (mmenu) mmenu.addEventListener("click", (e) => { if (e.target.closest(".mmenu-close") || e.target.tagName === "A") closeMenu(); });

    // newsletter (footer) demo
    const news = document.querySelector(".news");
    if (news) news.addEventListener("submit", (e) => { e.preventDefault(); news.innerHTML = `<p style="color:#E9B872;font-size:14px">${Store.lang === "pl" ? "Dzięki! Sprawdź skrzynkę ☕" : "Thanks! Check your inbox ☕"}</p>`; });
  };

  /* ---------------- freshness (Zegar Świeżości) ---------------- */
  // Deterministic roast schedule: every Tuesday (2) and Friday (5).
  Store.WINDOW = 30;
  Store.roastInfo = function () {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const roastDays = [2, 5];
    const last = new Date(today);
    for (let i = 0; i < 8 && !roastDays.includes(last.getDay()); i++) last.setDate(last.getDate() - 1);
    const next = new Date(today); next.setDate(next.getDate() + 1);
    for (let i = 0; i < 8 && !roastDays.includes(next.getDay()); i++) next.setDate(next.getDate() + 1);
    const day = 86400000;
    return { last: last, next: next, daysSince: Math.round((today - last) / day), daysToNext: Math.round((next - today) / day) };
  };
  Store.fmtDate = function (d, long) {
    return d.toLocaleDateString(Store.lang === "pl" ? "pl-PL" : "en-GB", long ? { day: "numeric", month: "long" } : { day: "2-digit", month: "2-digit", year: "numeric" });
  };
  Store.fmtWeekday = function (d) {
    return d.toLocaleDateString(Store.lang === "pl" ? "pl-PL" : "en-GB", { weekday: "long" });
  };
  Store.freshness = function (daysSince) {
    const pct = Math.max(0, Math.min(1, 1 - daysSince / Store.WINDOW));
    let k;
    if (daysSince <= 2) k = { key: "degas", pl: "Odgazowuje się — najlepsza za kilka dni", en: "Degassing — best in a few days", col: "var(--amber-dk)" };
    else if (daysSince <= 16) k = { key: "peak", pl: "Szczyt świeżości — pij teraz", en: "Peak freshness — drink now", col: "var(--ok)" };
    else if (daysSince <= 25) k = { key: "good", pl: "Wciąż świeża", en: "Still fresh", col: "var(--amber-dk)" };
    else k = { key: "soon", pl: "Pij niebawem", en: "Drink soon", col: "var(--cherry)" };
    return { pct: pct, daysSince: daysSince, status: k };
  };
  // freshness arc widget (SVG gauge)
  Store.freshnessWidget = function () {
    const ri = Store.roastInfo();
    const f = Store.freshness(ri.daysSince);
    const R = 26, C = 2 * Math.PI * R, off = C * (1 - f.pct) * 0.75; // 3/4 arc
    const arcLen = C * 0.75;
    return `<div class="fresh">
      <svg viewBox="0 0 64 64" class="fresh-gauge" aria-hidden="true">
        <circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--line)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${arcLen} ${C}" transform="rotate(135 32 32)"/>
        <circle cx="32" cy="32" r="${R}" fill="none" stroke="${f.status.col}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${arcLen * f.pct} ${C}" transform="rotate(135 32 32)"/>
        <text x="32" y="30" text-anchor="middle" font-family="var(--fd)" font-size="15" fill="var(--espresso)">${ri.daysSince}</text>
        <text x="32" y="42" text-anchor="middle" font-family="var(--ff)" font-size="7" fill="var(--espresso-2)">${Store.lang === "pl" ? "dni" : "days"}</text>
      </svg>
      <div class="fresh-body">
        <div class="fresh-status" style="color:${f.status.col}">${f.status[Store.lang]}</div>
        <div class="fresh-date">${Store.lang === "pl" ? "Palone" : "Roasted"}: <b>${Store.fmtDate(ri.last, true)}</b> · ${Store.lang === "pl" ? "wysyłamy świeżo" : "shipped fresh"}</div>
      </div>
    </div>`;
  };

  /* ---------------- product card ---------------- */
  Store.cardHTML = function (p) {
    const out = p.soldOut;
    const badges = (p.badges || []).map((b) => {
      const map = {
        bestseller: ["tag-espresso", { pl: "Bestseller", en: "Bestseller" }],
        nowosc: ["tag-amber", { pl: "Nowość", en: "New" }],
        promo: ["tag-cherry", { pl: "Promocja −15%", en: "Sale −15%" }],
        limitowane: ["tag-amber", { pl: "Limitowane", en: "Limited" }],
        wyprzedane: ["tag-out", { pl: "Wyprzedane", en: "Sold out" }]
      };
      const m = map[b]; return m ? `<span class="tag ${m[0]}">${m[1][Store.lang]}</span>` : "";
    }).join(" ");
    let priceHTML;
    if (p.promo) {
      const now = Math.round(p.price250 * (1 - p.promo));
      priceHTML = `<span class="from" data-pl="od" data-en="from">${Store.lang === "pl" ? "od" : "from"}</span> <s>${Store.money(p.price250)}</s><span class="sale">${Store.money(now)}</span>`;
    } else if (p.boxOnly) {
      priceHTML = `${Store.money(p.price250)}`;
    } else {
      priceHTML = `<span class="from">${Store.lang === "pl" ? "od" : "from"}</span> ${Store.money(p.price250)}`;
    }
    const cta = out
      ? `<button class="btn btn-ghost btn-sm" disabled>${Store.lang === "pl" ? "Powiadom mnie" : "Notify me"}</button>`
      : `<button class="btn btn-primary btn-sm" data-add="${p.id}">${Store.t("add.do")}</button>`;
    return `<article class="pcard ${out ? "is-out" : ""}">
      <a class="cover" href="produkt.html?id=${p.id}" aria-label="${p.name}"></a>
      <div class="pcard-top"><span class="pcard-lot">LOT ${p.lot}</span><span class="pcard-origin">${(p.originLabel[Store.lang]).toUpperCase()}</span></div>
      <div class="pcard-art">${badges ? `<div class="pcard-badges">${badges}</div>` : ""}${Store.sack(p, "")}</div>
      <div class="pcard-body">
        <h3>${p.name}</h3>
        <div class="pcard-notes">${p.notes[Store.lang]}</div>
        <div class="pcard-roast">${Store.roastDots(p.roast)}</div>
        <div class="pcard-foot"><span class="pcard-price">${priceHTML}</span>${cta}</div>
      </div>
    </article>`;
  };

  Store.renderInto = function (sel, list) {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = list.map(Store.cardHTML).join("");
  };

  // global add-to-cart delegation (cards use default 250g / ziarna)
  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const p = Store.byId(btn.getAttribute("data-add"));
    if (!p || p.soldOut) return;
    Store.add({ id: p.id, weight: p.boxOnly ? 250 : 250, grind: "ziarna", qty: 1 });
    const orig = btn.textContent;
    btn.textContent = Store.t("add.done"); btn.classList.add("btn-added");
    Store.openDrawer();
    setTimeout(() => { btn.textContent = orig; btn.classList.remove("btn-added"); }, 1200);
  });

  window.Store = Store;
  document.addEventListener("DOMContentLoaded", Store.initChrome);
})();
