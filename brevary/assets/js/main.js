/* Brevary — main.js (vanilla, 0 dependencies) */
(function () {
  "use strict";

  var MAIL = ["barich2002", "gmail.com"].join("@");
  var WEB3_KEY = ""; // TODO: klucz Web3Forms — gdy będzie, wysyłka POST zamiast mailto

  /* ---- mobile menu ---- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---- contacts (assembled in JS so the address isn't in raw HTML) ---- */
  // TODO: uzupełnić realne uchwyty (Telegram / WhatsApp / LinkedIn)
  var CONTACT = {
    mail: "mailto:" + MAIL + "?subject=" + encodeURIComponent("Zapytanie ze strony Brevary"),
    tg: null,   // np. "https://t.me/nick"
    wa: null,   // np. "https://wa.me/48XXXXXXXXX"
    in: null    // np. "https://www.linkedin.com/in/..."
  };
  document.querySelectorAll("[data-ct]").forEach(function (el) {
    var key = el.getAttribute("data-ct");
    if (CONTACT[key]) el.setAttribute("href", CONTACT[key]);
    else if (key !== "mail") { el.setAttribute("aria-disabled", "true"); el.setAttribute("title", "Wkrótce"); }
  });

  /* ---- contact form ---- */
  var cform = document.getElementById("contactForm");
  if (cform) {
    cform.addEventListener("submit", function (e) {
      e.preventDefault();
      var gotcha = cform.querySelector('[name="_gotcha"]');
      if (gotcha && gotcha.value) return; // honeypot -> silent drop
      var email = document.getElementById("cEmail"), rodo = document.getElementById("cRodo");
      var fE = document.getElementById("cfEmail"), fR = document.getElementById("cfRodo");
      var okE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      fE.classList.toggle("invalid", !okE);
      fR.classList.toggle("invalid", !rodo.checked);
      if (!okE) { email.focus(); return; }
      if (!rodo.checked) { rodo.focus(); return; }

      var status = document.getElementById("cStatus"), btn = document.getElementById("cSend");
      function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }
      var body = "Nowe zapytanie ze strony Brevary\n\n" +
        "Imię: " + (v("cName") || "-") + "\nE-mail: " + email.value.trim() +
        "\nRodzaj: " + (v("cType") || "-") + "\nBudżet: " + (v("cBudget") || "-") +
        "\n\nWiadomość:\n" + (v("cMsg") || "-");

      function done() { status.className = "form-status ok"; status.textContent = "Dziękuję! Wiadomość wysłana — odpowiadam do 24h."; cform.reset(); btn.disabled = false; btn.textContent = "Wyślij wiadomość →"; }
      function fail() { status.className = "form-status bad"; status.textContent = "Coś poszło nie tak. Napisz proszę bezpośrednio na e-mail: " + MAIL; btn.disabled = false; btn.textContent = "Wyślij wiadomość →"; }

      if (WEB3_KEY) {
        btn.disabled = true; btn.textContent = "Wysyłam…";
        fetch("https://api.web3forms.com/submit", {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: WEB3_KEY, subject: "Zapytanie ze strony Brevary", from_name: v("cName") || "Brevary kontakt", email: email.value.trim(), message: body, _template: "table" })
        }).then(function (r) { return r.json(); }).then(function (j) { if (j.success) done(); else fail(); }).catch(fail);
      } else {
        window.location.href = "mailto:" + MAIL + "?subject=" + encodeURIComponent("Zapytanie ze strony Brevary") + "&body=" + encodeURIComponent(body);
        status.className = "form-status ok"; status.textContent = "Otwieram Twój program pocztowy z gotową wiadomością…";
      }
    });
  }
})();
