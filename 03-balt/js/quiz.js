/* Bałt Palarnia — subscription builder quiz (subskrypcja.html). */
(function () {
  "use strict";

  const answers = { brew: null, flavors: [], volume: null };
  let step = 1, freq = "month", picks = [], swapIdx = [0, 0];

  function T(pl, en) { return Store.lang === "pl" ? pl : en; }

  const VOLUMES = { "500": { g: 500, disc: 0.10, lbl: { pl: "1–2 filiżanki dziennie", en: "1–2 cups a day" } }, "1000": { g: 1000, disc: 0.12, lbl: { pl: "Dzbanek dziennie", en: "A pot a day" } }, "2000": { g: 2000, disc: 0.15, lbl: { pl: "Rodzina / biuro", en: "Family / office" } } };

  function blendName() {
    const b = answers.brew, f = answers.flavors[0];
    if (b === "espresso" && (f === "czekoladowe" || f === "mocne")) return T("Stocznia Blend", "Shipyard Blend");
    if (b === "przelew" && (f === "owocowe")) return T("Bałtycki Poranek", "Baltic Morning");
    if (f === "karmelowe") return T("Poranna Zmiana", "Morning Shift");
    if (b === "french" || b === "kawiarka") return T("Port i Kotwica", "Port & Anchor");
    return T("Twój Bałt", "Your Bałt");
  }

  function candidates() {
    const wantDark = answers.brew === "espresso" || answers.brew === "kawiarka" || answers.brew === "french";
    const flavProfiles = [];
    answers.flavors.forEach((f) => {
      if (f === "owocowe") flavProfiles.push("owocowa", "kwiatowa");
      if (f === "czekoladowe") flavProfiles.push("czekoladowa", "orzechowa");
      if (f === "karmelowe") flavProfiles.push("karmelowa");
      if (f === "mocne") flavProfiles.push("czekoladowa");
    });
    let list = PRODUCTS.filter((p) => !p.soldOut && !p.boxOnly);
    let scored = list.map((p) => {
      let s = 0;
      if (wantDark && p.roast >= 3) s += 2; if (!wantDark && p.roast <= 2) s += 2;
      (p.profile || []).forEach((pr) => { if (flavProfiles.includes(pr)) s += 2; });
      return { p, s };
    }).sort((a, b) => b.s - a.s);
    return scored.map((x) => x.p);
  }

  function computePicks() {
    const c = candidates();
    picks = [c[swapIdx[0] % c.length], c[(swapIdx[1] + 1) % c.length]];
    if (picks[0].id === picks[1].id) picks[1] = c[(swapIdx[1] + 2) % c.length];
    return c;
  }

  function priceInfo() {
    const v = VOLUMES[answers.volume] || VOLUMES["1000"];
    const gramsEach = v.g / 2;
    const value = picks.reduce((sum, p) => sum + p.price250 * (gramsEach / 250), 0);
    const disc = value * v.disc;
    return { value: Math.round(value), disc: Math.round(disc), total: Math.round(value - disc), pct: Math.round(v.disc * 100), grams: v.g };
  }

  function setStep(n) {
    step = n;
    document.querySelectorAll(".q-step").forEach((s) => s.classList.toggle("on", +s.dataset.q === n));
    document.querySelectorAll(".q-progress i").forEach((i, idx) => i.classList.toggle("done", idx < n - 1));
    const cur = document.querySelector("#qCurrent"); if (cur) cur.textContent = n;
  }

  function renderResult() {
    const cands = computePicks();
    const info = priceInfo();
    const L = Store.lang;
    const box = document.querySelector("#result");
    box.innerHTML = `<div class="result-label">
      <div class="kicker">${T("Twój box", "Your box")} · Bałt</div>
      <h2>„${blendName()}"</h2>
      <p style="font-size:14px;color:var(--espresso-2);margin-bottom:8px">${T("Dobrane do tego, jak parzysz i co lubisz:", "Matched to how you brew and what you like:")}</p>
      ${picks.map((p, i) => `<div class="result-coffee">${Store.sack(p)}<div class="rc-body"><div class="rc-name">${p.name}</div><div class="rc-sub">${p.notes[L]} · ${Store.roastDots ? "" : ""}${Store.t("roast." + p.roast)}</div></div><button class="swap" data-swap="${i}">${T("Wymień", "Swap")} ⟳</button></div>`).join("")}
      <div class="freq-toggle">
        <button data-freq="week" class="${freq === "week" ? "on" : ""}">${T("Co 2 tygodnie", "Every 2 weeks")}</button>
        <button data-freq="month" class="${freq === "month" ? "on" : ""}">${T("Co miesiąc", "Monthly")}</button>
      </div>
      <div class="result-price">
        <div class="row"><span>${T("Wartość kaw", "Coffee value")} (${info.grams} g)</span><span>${Store.money(info.value)}</span></div>
        <div class="row disc"><span>${T("Rabat subskrybenta", "Subscriber discount")} −${info.pct}%</span><span>−${Store.money(info.disc)}</span></div>
        <div class="row"><span>${T("Dostawa", "Shipping")}</span><span>0 zł</span></div>
        <div class="total"><span>${T("Razem", "Total")}</span><b>${Store.money(info.total)} <span style="font-family:var(--ff);font-size:14px;color:var(--espresso-2)">${T("/ dostawę", "/ delivery")}</span></b></div>
      </div>
      <button class="btn btn-primary btn-block" id="addBox" style="margin-top:18px">${T("Dodaj box do koszyka", "Add box to basket")}</button>
      <p class="demo-note">${T("Demo: subskrypcja trafia do koszyka jak zwykłe zamówienie.", "Demo: the subscription goes to the basket like a normal order.")}</p>
      <p style="text-align:center;margin-top:10px"><button id="restart" style="font-size:13px;color:var(--amber-dk);font-weight:700">${T("Zmień odpowiedzi", "Change answers")}</button></p>
    </div>`;

    box.querySelectorAll("[data-swap]").forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.swap; swapIdx[i]++; renderResult(); }));
    box.querySelectorAll("[data-freq]").forEach((b) => b.addEventListener("click", () => { freq = b.dataset.freq; renderResult(); }));
    box.querySelector("#addBox").addEventListener("click", () => {
      const info2 = priceInfo();
      Store.add({ id: "sub-box", custom: info2.total, qty: 1, name: "„" + blendName() + "”", optLabel: `${info2.grams} g · ${T(freq === "week" ? "co 2 tyg." : "co miesiąc", freq === "week" ? "every 2 wks" : "monthly")}` });
      Store.openDrawer();
    });
    box.querySelector("#restart").addEventListener("click", () => {
      document.querySelector("#quizFlow").style.display = "block";
      box.style.display = "none"; setStep(1);
    });

    localStorage.setItem("balt_quiz", JSON.stringify({ answers, blend: blendName() }));
  }

  function finish() {
    document.querySelector("#quizFlow").style.display = "none";
    const box = document.querySelector("#result"); box.style.display = "block";
    renderResult();
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Q1 single, auto-advance
    document.querySelectorAll('[data-q="1"] .qopt').forEach((o) => o.addEventListener("click", () => {
      document.querySelectorAll('[data-q="1"] .qopt').forEach((x) => x.classList.remove("on"));
      o.classList.add("on"); answers.brew = o.dataset.v;
      setTimeout(() => setStep(2), 350);
    }));
    // Q2 multi (1-2)
    document.querySelectorAll('[data-q="2"] .qopt').forEach((o) => o.addEventListener("click", () => {
      const v = o.dataset.v; const i = answers.flavors.indexOf(v);
      if (i >= 0) { answers.flavors.splice(i, 1); o.classList.remove("on"); }
      else { if (answers.flavors.length >= 2) return Store.toast(T("Wybierz maks. 2", "Pick max 2")); answers.flavors.push(v); o.classList.add("on"); }
      document.querySelector("#to2q").disabled = answers.flavors.length === 0;
    }));
    // Q3 single, finish
    document.querySelectorAll('[data-q="3"] .qopt').forEach((o) => o.addEventListener("click", () => {
      document.querySelectorAll('[data-q="3"] .qopt').forEach((x) => x.classList.remove("on"));
      o.classList.add("on"); answers.volume = o.dataset.v;
      setTimeout(finish, 300);
    }));

    document.querySelector("#startQuiz").addEventListener("click", () => document.querySelector("#quizFlow").scrollIntoView({ behavior: "smooth" }));
    document.querySelector("#to2q").addEventListener("click", () => setStep(3));
    document.querySelector("#back1q").addEventListener("click", () => setStep(1));
    document.querySelector("#back2q").addEventListener("click", () => setStep(2));

    window.onLangChange = function () { if (document.querySelector("#result").style.display === "block") renderResult(); };
  });
})();
