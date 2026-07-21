/* Illume — main.js (vanilla, 0 dependencies) */
(function () {
  "use strict";

  /* ---- mobile menu ---- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- contacts (assembled in JS so the address isn't in raw HTML) ---- */
  // TODO: uzupełnić realne uchwyty (Telegram / WhatsApp / LinkedIn)
  var CONTACT = {
    mail: "mailto:" + ["barich2002", "gmail.com"].join("@") + "?subject=" + encodeURIComponent("Zapytanie ze strony Illume"),
    tg: null,   // np. "https://t.me/nick"
    wa: null,   // np. "https://wa.me/48XXXXXXXXX"
    in: null    // np. "https://www.linkedin.com/in/..."
  };
  document.querySelectorAll("[data-ct]").forEach(function (el) {
    var key = el.getAttribute("data-ct");
    if (CONTACT[key]) {
      el.setAttribute("href", CONTACT[key]);
    } else if (key !== "mail") {
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("title", "Wkrótce");
    }
  });
})();
