/* Bałt Palarnia — 3-step checkout (zamowienie.html). */
(function () {
  "use strict";

  let step = 1;
  const data = { delivery: "inpost", locker: "", customer: {} };

  const LOCKERS = ["GDA01M · Świętojańska 5", "GDA12A · Długa 44", "GDA22N · Grunwaldzka 120", "GDA31P · Kołobrzeska 41", "SOP04K · Bohaterów Monte Cassino 3"];

  function T(pl, en) { return Store.lang === "pl" ? pl : en; }

  function renderSummary() {
    const box = document.querySelector("#osItems");
    box.innerHTML = Store.cart.items.map((it) => {
      const p = Store.byId(it.id) || {};
      return `<div class="os-item">${it.custom ? Store.sack({ roast: 3, lot: "SUB", originLabel: { pl: "Sub", en: "Sub" }, name: it.name }) : Store.sack(p)}
        <div><b>${it.custom ? it.name : p.name}</b><div style="color:var(--espresso-2)">${it.qty} × ${it.custom ? (it.optLabel || "") : it.weight + " g"}</div></div>
        <div class="tabnum" style="font-weight:700">${Store.money(Store.priceOf(it) * it.qty)}</div></div>`;
    }).join("");
    const sub = Store.subtotal(), disc = Store.discount(), ship = Store.shipping();
    document.querySelector("#osTotals").innerHTML = `
      <div class="row"><span>${Store.t("cart.sub2")}</span><span class="dots"></span><span>${Store.money(sub)}</span></div>
      ${disc > 0 ? `<div class="row disc"><span>${Store.t("cart.disc")}</span><span class="dots"></span><span>−${Store.money(disc)}</span></div>` : ""}
      <div class="row"><span>${Store.t("cart.ship")}</span><span class="dots"></span><span>${ship === 0 ? Store.t("ship.free") : Store.money(ship)}</span></div>
      <div class="total"><span>${Store.t("cart.total")}</span><b>${Store.money(Store.grandTotal())}</b></div>`;
  }

  function setStep(n) {
    step = n;
    document.querySelectorAll(".co-step").forEach((s) => s.classList.toggle("on", +s.dataset.step === n));
    document.querySelectorAll(".stamp-step").forEach((s) => {
      const sn = +s.dataset.step;
      s.classList.toggle("active", sn === n);
      s.classList.toggle("done", sn < n);
    });
    if (n === 3) buildRecap();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleLocker() {
    document.querySelector("#lockerField").style.display = data.delivery === "inpost" ? "block" : "none";
    document.querySelector("#courierAddr").style.display = data.delivery === "kurier" ? "grid" : "none";
  }

  function validateStep2() {
    let ok = true;
    const req = ["name", "email", "phone"];
    if (data.delivery === "kurier") req.push("street", "postal", "city");
    if (document.querySelector("#wantInvoice").checked) req.push("nip");
    let firstBad = null;
    document.querySelectorAll("#form2 .field").forEach((f) => f.classList.remove("err"));
    req.forEach((name) => {
      const inp = document.querySelector(`[name="${name}"]`);
      if (!inp) return;
      const field = inp.closest(".field");
      let bad = !inp.value.trim();
      if (name === "email" && inp.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value)) bad = true;
      if (name === "postal" && inp.value && !/^\d{2}-\d{3}$/.test(inp.value)) bad = true;
      if (bad) { ok = false; if (field) { field.classList.add("err"); const e = field.querySelector(".field-err"); if (e) e.textContent = T("Uzupełnij poprawnie", "Please fill in correctly"); } if (!firstBad) firstBad = inp; }
    });
    if (!document.querySelector("#rodo").checked) { ok = false; document.querySelector("#rodoField").classList.add("err"); if (!firstBad) firstBad = document.querySelector("#rodo"); }
    if (firstBad) { firstBad.scrollIntoView({ behavior: "smooth", block: "center" }); firstBad.focus({ preventScroll: true }); }
    return ok;
  }

  function collect() {
    ["name", "email", "phone", "street", "postal", "city", "nip", "company"].forEach((k) => {
      const inp = document.querySelector(`[name="${k}"]`); if (inp) data.customer[k] = inp.value.trim();
    });
  }

  function buildRecap() {
    collect();
    const d = data.delivery === "inpost"
      ? `InPost Paczkomat — ${data.locker || LOCKERS[0]}`
      : `${T("Kurier DPD", "DPD courier")} — ${data.customer.street}, ${data.customer.postal} ${data.customer.city}`;
    document.querySelector("#recapDeliv").innerHTML = d;
    document.querySelector("#recapData").innerHTML = `${data.customer.name}<br>${data.customer.email} · ${data.customer.phone}`;
  }

  function rnd4() { return String(1000 + Math.floor((performance.now() * 7) % 9000)); }

  function placeOrder() {
    collect();
    const ordno = "BP-2026-" + rnd4();
    const total = Store.grandTotal();
    localStorage.setItem("balt_last_order", JSON.stringify({ ordno, total, name: data.customer.name, email: data.customer.email }));
    const main = document.querySelector("#coMain");
    main.innerHTML = `<div class="thankyou">
      <span class="paid-stamp">${T("OPŁACONE · DEMO", "PAID · DEMO")}</span>
      <h1>${T("Dziękujemy", "Thank you")}, ${data.customer.name.split(" ")[0] || ""}!</h1>
      <p style="color:var(--espresso-2)">${T("Potwierdzenie poleciało na", "Confirmation flew to")} <b>${data.customer.email}</b> ${T("(no, poleciałoby 😉)", "(well, it would 😉)")}</p>
      <div class="receipt-print">
        <div class="ordno" style="font-size:13px;color:var(--espresso-2)">${T("Numer zamówienia", "Order number")}</div>
        <div class="serif" style="font-size:26px;margin:4px 0 14px">${ordno}</div>
        <div class="receipt-sum" id="tyTotals"></div>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="sklep.html" class="btn btn-ghost">${T("Wróć do sklepu", "Back to shop")}</a>
        <a href="subskrypcja.html" class="btn btn-primary">${T("Zobacz subskrypcję", "See subscription")}</a>
      </div>
    </div>`;
    document.querySelector("#tyTotals").innerHTML = `<div class="total"><span>${Store.t("cart.total")}</span><b>${Store.money(total)}</b></div>`;
    const osCol = document.querySelector("#osCol"); if (osCol) osCol.style.display = "none";
    Store.clearCart();
  }

  function boot() {
    if (!Store.cart.items.length) {
      document.querySelector("#coMain").innerHTML = `<div style="text-align:center;padding:60px 0">
        <h2 style="font-size:26px;margin-bottom:10px">${T("Koszyk jest pusty", "Your basket is empty")}</h2>
        <p style="color:var(--espresso-2);margin-bottom:18px">${T("Najpierw dorzuć trochę kawy.", "Add some coffee first.")}</p>
        <a href="sklep.html" class="btn btn-primary">${Store.t("cart.toShop")}</a></div>`;
      document.querySelector("#stamps").style.display = "none";
      document.querySelector("#osCol").style.display = "none";
      return;
    }
    renderSummary();

    // lockers
    const lsel = document.querySelector("#lockerSel");
    lsel.innerHTML = LOCKERS.map((l) => `<option>${l}</option>`).join("");
    lsel.addEventListener("change", () => { data.locker = lsel.value; });
    data.locker = LOCKERS[0];

    // delivery cards
    document.querySelectorAll(".deliv-card").forEach((c) => c.addEventListener("click", () => {
      document.querySelectorAll(".deliv-card").forEach((x) => x.classList.remove("on"));
      c.classList.add("on"); data.delivery = c.dataset.d; toggleLocker(); renderSummary();
    }));
    toggleLocker();

    // invoice toggle
    document.querySelector("#wantInvoice").addEventListener("change", (e) => {
      document.querySelector("#invoiceFields").style.display = e.target.checked ? "grid" : "none";
    });
    document.querySelector("#rodo").addEventListener("change", () => document.querySelector("#rodoField").classList.remove("err"));

    // nav buttons
    document.querySelector("#to2").addEventListener("click", () => setStep(2));
    document.querySelector("#to3").addEventListener("click", () => { if (validateStep2()) setStep(3); });
    document.querySelector("#back1").addEventListener("click", () => setStep(1));
    document.querySelector("#back2").addEventListener("click", () => setStep(2));
    document.querySelector("#placeOrder").addEventListener("click", placeOrder);
    document.querySelectorAll(".stamp-step").forEach((s) => s.addEventListener("click", () => { if (s.classList.contains("done")) setStep(+s.dataset.step); }));

    window.onLangChange = function () { renderSummary(); if (step === 3) buildRecap(); };
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (Store.cart.items.length) return boot();
    // storage may hydrate a tick late (e.g. preview sandboxes) — re-read once
    setTimeout(function () {
      try { var c = JSON.parse(localStorage.getItem("balt_cart")); if (c && c.items) Store.cart = c; } catch (e) {}
      Store.refreshBadge();
      boot();
    }, 250);
  });
})();
