(() => {
  "use strict";
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let lang = "pl";

  function applyLang() {
    document.documentElement.lang = lang;
    $$("[data-pl]").forEach((el) => { el.textContent = el.dataset[lang] ?? el.textContent; });
    $$(".langtog span").forEach((s) => s.classList.toggle("on", s.dataset.l === lang));
    document.title = document.querySelector("[data-title-" + lang + "]")?.getAttribute("data-title-" + lang) || document.title;
  }

  // lighthouse rings
  function rings() {
    const C = 2 * Math.PI * 28;
    $$(".lh-ring").forEach((r) => {
      const score = +r.dataset.score;
      const fg = r.querySelector(".fg");
      const col = score >= 90 ? "var(--pos)" : score >= 50 ? "var(--warn,#ffb84d)" : "#ff6a6a";
      fg.style.stroke = col;
      fg.setAttribute("stroke-dasharray", C.toFixed(1));
      fg.setAttribute("stroke-dashoffset", C.toFixed(1));
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fg.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)";
        fg.setAttribute("stroke-dashoffset", (C * (1 - score / 100)).toFixed(1));
      }));
    });
  }

  // reveal on scroll
  function reveals() {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("rv"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    $$("[data-rv]").forEach((el) => io.observe(el));
  }

  function init() {
    applyLang();
    rings();
    reveals();
    document.querySelector(".langtog")?.addEventListener("click", (e) => {
      const s = e.target.closest("span[data-l]"); if (!s) return;
      lang = s.dataset.l; applyLang();
    });
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
