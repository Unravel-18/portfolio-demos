/* Illume — quiz-brief «Wycena w 2 minuty» (vanilla, 0 deps) */
(function () {
  "use strict";
  var form = document.getElementById("quiz");
  if (!form) return;

  var TOTAL = 5;
  var LABELS = { 1: "Typ projektu", 2: "Zakres", 3: "Stan projektu", 4: "Termin", 5: "Kontakt" };
  var MAIL = ["barich2002", "gmail.com"].join("@");
  var WEB3_KEY = ""; // TODO: klucz Web3Forms — gdy będzie, wysyłka POST zamiast mailto

  var steps = Array.prototype.slice.call(form.querySelectorAll(".step"));
  var qNum = document.getElementById("qNum"), qLabel = document.getElementById("qLabel"), qBar = document.getElementById("qBar");
  var backBtn = document.getElementById("qBack"), nextBtn = document.getElementById("qNext");
  var result = document.getElementById("result");
  var cur = 1;

  /* shared inline error for radio steps */
  var stepErr = document.createElement("p");
  stepErr.style.cssText = "color:#C1121F;font-size:13.5px;margin-top:14px;display:none;font-weight:600";
  stepErr.textContent = "Wybierz opcję, żeby przejść dalej.";
  form.querySelector(".q-nav").before(stepErr);

  /* ---- persistence ---- */
  var KEY = "illume_quiz_v1";
  function save() {
    try {
      var d = { cur: cur, data: serialize() };
      sessionStorage.setItem(KEY, JSON.stringify(d));
    } catch (e) {}
  }
  function serialize() {
    var o = { feat: [] };
    form.querySelectorAll("input,select").forEach(function (el) {
      if (el.type === "radio") { if (el.checked) o[el.name] = el.value; }
      else if (el.type === "checkbox") { if (el.name === "feat" && el.checked) o.feat.push(el.value); else if (el.id) o[el.id] = el.checked; }
      else if (el.name || el.id) o[el.name || el.id] = el.value;
    });
    return o;
  }
  function restore() {
    try {
      var raw = sessionStorage.getItem(KEY); if (!raw) return;
      var d = JSON.parse(raw), o = d.data || {};
      form.querySelectorAll("input,select").forEach(function (el) {
        if (el.type === "radio") { if (o[el.name] === el.value) { el.checked = true; markSel(el); } }
        else if (el.type === "checkbox") { if (el.name === "feat") { if (o.feat && o.feat.indexOf(el.value) > -1) { el.checked = true; markSel(el); } } }
        else if (o[el.name || el.id] != null) el.value = o[el.name || el.id];
      });
    } catch (e) {}
  }

  /* ---- selected visual ---- */
  function markSel(el) {
    var label = el.closest(".opt"); if (!label) return;
    if (el.type === "radio") {
      form.querySelectorAll('input[name="' + el.name + '"]').forEach(function (r) {
        var l = r.closest(".opt"); if (l) l.classList.toggle("sel", r.checked);
      });
    } else { label.classList.toggle("sel", el.checked); }
  }
  form.addEventListener("change", function (e) {
    if (e.target.matches(".opt input")) markSel(e.target);
    if (e.target.name && ["type", "state", "term"].indexOf(e.target.name) > -1) stepErr.style.display = "none";
    save();
  });
  form.addEventListener("input", save);

  /* ---- navigation ---- */
  function show(n) {
    cur = n;
    steps.forEach(function (s) { s.classList.toggle("active", +s.dataset.step === n); });
    qNum.textContent = n; qLabel.textContent = LABELS[n]; qBar.style.width = (n / TOTAL * 100) + "%";
    backBtn.style.visibility = n === 1 ? "hidden" : "visible";
    nextBtn.textContent = n === TOTAL ? "Zobacz wycenę →" : "Dalej →";
    stepErr.style.display = "none";
    save();
    var h = steps[n - 1].querySelector("h2"); if (h) h.setAttribute("tabindex", "-1"), h.focus({ preventScroll: false });
  }
  function validate(n) {
    if (n === 1) return req("type");
    if (n === 3) return req("state");
    if (n === 4) return req("term");
    if (n === 5) return validContact();
    return true;
  }
  function req(name) {
    var ok = !!form.querySelector('input[name="' + name + '"]:checked');
    stepErr.style.display = ok ? "none" : "block";
    return ok;
  }
  function validContact() {
    var email = document.getElementById("email"), rodo = document.getElementById("rodo");
    var fE = document.getElementById("fEmail"), fR = document.getElementById("fRodo");
    var okE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    fE.classList.toggle("invalid", !okE);
    fR.classList.toggle("invalid", !rodo.checked);
    if (!okE) email.focus(); else if (!rodo.checked) rodo.focus();
    return okE && rodo.checked;
  }
  nextBtn.addEventListener("click", function () {
    if (!validate(cur)) return;
    if (cur < TOTAL) show(cur + 1); else finish();
  });
  backBtn.addEventListener("click", function () { if (cur > 1) show(cur - 1); });

  /* ---- pricing ---- */
  var BASE = { strona: 3500, serwis: 8000, mvp: 14000, niewiem: 4000 };
  var PAGES = { "1": 1.0, "5": 1.35, "10": 1.9, "20": 2.7 };
  var FEAT = { formularze: 500, platnosci: 2500, cms: 1800, i18n: 1500, integracje: 3500, panel: 3000, blog: 1200, animacje: 1500 };
  var STATE = { projekt: 0.9, tresci: 1.0, zera: 1.15, redesign: 1.05 };
  var TERMF = { asap: 1.2, "1m": 1.05, "3m": 1.0, flex: 0.95 };
  var WEEKS = { strona: 2, serwis: 4, mvp: 8, niewiem: 3 };
  function round100(n) { return Math.round(n / 100) * 100; }

  function compute(o) {
    var type = o.type || "niewiem";
    var base = BASE[type];
    var pf = (type === "strona" || type === "serwis") ? (PAGES[o.pages] || 1) : 1;
    var feats = o.feat || [];
    var featSum = feats.reduce(function (s, f) { return s + (FEAT[f] || 0); }, 0);
    var sf = STATE[o.state] || 1, tf = TERMF[o.term] || 1;
    var low = round100(base * pf * sf * tf + featSum);
    var high = round100(low * 1.35);
    var wl = WEEKS[type] + (feats.length >= 3 ? 1 : 0) + (o.pages === "10" || o.pages === "20" ? 1 : 0);
    var wh = wl + 2 + Math.floor(feats.length / 2);
    return { low: low, high: high, wl: wl, wh: wh, type: type, feats: feats };
  }
  function included(r) {
    var inc = ["Projekt UI (dizajn)", "Kod bez zależności", "Wdrożenie + domena", "Lighthouse 90+", "Wersja mobilna (RWD)", "2 rundy poprawek"];
    var m = { i18n: "Wersje językowe PL/EN", cms: "Panel edycji treści", platnosci: "Płatności online", integracje: "Integracje API", panel: "Logowanie / panel", blog: "Blog", formularze: "Formularze kontaktowe", animacje: "Zaawansowane animacje" };
    r.feats.forEach(function (f) { if (m[f]) inc.push(m[f]); });
    return inc;
  }
  function fmt(n) { return n.toLocaleString("pl-PL"); }

  function finish() {
    var o = serialize();
    var r = compute(o);
    var priceEl = document.getElementById("resPrice"), termEl = document.getElementById("resTerm"), incEl = document.getElementById("resInc");
    if (r.type === "mvp" || r.type === "niewiem") {
      priceEl.textContent = "od " + fmt(r.low) + " zł";
    } else {
      priceEl.textContent = fmt(r.low) + " – " + fmt(r.high) + " zł";
    }
    termEl.textContent = "≈ " + r.wl + "–" + r.wh + " tygodni realizacji";
    incEl.innerHTML = included(r).map(function (i) { return "<li>" + i + "</li>"; }).join("");

    // brief -> mailto (or Web3Forms when key set)
    var brief = buildBrief(o, r);
    var send = document.getElementById("resSend");
    send.setAttribute("href", "mailto:" + MAIL + "?subject=" + encodeURIComponent("Brief z wyceny — Illume") + "&body=" + encodeURIComponent(brief));
    if (WEB3_KEY) {
      send.addEventListener("click", function (e) {
        e.preventDefault();
        postWeb3(o, r, brief, send);
      });
    }
    form.style.display = "none";
    result.classList.add("show");
    document.querySelector(".sec-head").scrollIntoView({ behavior: "smooth", block: "start" });
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  function buildBrief(o, r) {
    var TYPE = { strona: "Strona pod klucz", serwis: "Złożony serwis", mvp: "MVP / aplikacja", niewiem: "Do ustalenia" };
    var STATEN = { projekt: "mam projekt graficzny", tresci: "mam treści", zera: "od zera", redesign: "redesign" };
    var TERMN = { asap: "jak najszybciej", "1m": "w miesiąc", "3m": "1–3 mies.", flex: "elastycznie" };
    var lines = [
      "Nowy brief z wyceny Illume", "",
      "Typ: " + (TYPE[o.type] || "-"),
      "Podstrony: " + (o.pages || "-"),
      "Funkcje: " + ((o.feat && o.feat.length) ? o.feat.join(", ") : "brak"),
      "Stan: " + (STATEN[o.state] || "-"),
      "Termin: " + (TERMN[o.term] || "-"),
      "", "Orientacyjna wycena: " + (r.type === "mvp" || r.type === "niewiem" ? "od " + fmt(r.low) : fmt(r.low) + "–" + fmt(r.high)) + " zł · " + r.wl + "–" + r.wh + " tyg.",
      "", "Kontakt: " + (o.email || "-") + (o.name ? " (" + o.name + ")" : ""),
      o.msg ? "Uwagi: " + o.msg : ""
    ];
    return lines.join("\n");
  }

  function postWeb3(o, r, brief, btn) {
    var sent = document.getElementById("resSent");
    btn.textContent = "Wysyłam…";
    fetch("https://api.web3forms.com/submit", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: WEB3_KEY, subject: "Brief z wyceny — Illume", from_name: "Illume wycena", email: o.email, message: brief, _template: "table" })
    }).then(function (x) { return x.json(); }).then(function (j) {
      if (j.success) { sent.style.display = "block"; sent.textContent = "Dzięki! Brief wysłany — odpowiadam do 24h."; btn.style.display = "none"; }
      else fallback();
    }).catch(fallback);
    function fallback() { btn.textContent = "Wyślij brief →"; window.location.href = btn.getAttribute("href"); }
  }

  document.getElementById("resRestart").addEventListener("click", function () {
    form.querySelectorAll("input").forEach(function (el) { if (el.type === "radio" || el.type === "checkbox") { el.checked = false; var l = el.closest(".opt"); if (l) l.classList.remove("sel"); } else el.value = ""; });
    document.getElementById("pages").value = "5";
    result.classList.remove("show"); form.style.display = "";
    show(1);
  });

  /* ---- init ---- */
  restore();
  show(cur);
})();
