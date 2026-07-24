/* Bałt Palarnia — Dziennik Portowy: real world map (Natural Earth 110m, equirectangular)
   with animated shipping routes converging on the port of Gdańsk. */
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const XLINK = "http://www.w3.org/1999/xlink";
  const M = window.BALT_MAP || { W: 1000, H: 482, LON_MIN: -128, LAT_MAX: 72, S: 4.386, land: "", grat: "" };

  function proj(lon, lat) { return { x: +((lon - M.LON_MIN) * M.S).toFixed(1), y: +((M.LAT_MAX - lat) * M.S).toFixed(1) }; }
  function el(name, attrs) { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }

  const PORT = { lon: 18.65, lat: 54.35, name: "Gdańsk" };
  const ORIGINS = [
    { key: "etiopia",   lon: 38.20, lat:   6.20, name: { pl: "Etiopia",   en: "Ethiopia"  }, dx:  12, dy:  4, anchor: "start" },
    { key: "kenia",     lon: 36.95, lat:  -0.42, name: { pl: "Kenia",     en: "Kenya"     }, dx:  12, dy: 13, anchor: "start" },
    { key: "kolumbia",  lon: -74.0, lat:   4.00, name: { pl: "Kolumbia",  en: "Colombia"  }, dx: -12, dy: -4, anchor: "end"   },
    { key: "peru",      lon: -78.5, lat:  -7.16, name: { pl: "Peru",      en: "Peru"      }, dx: -12, dy:  7, anchor: "end"   },
    { key: "brazylia",  lon: -47.0, lat: -15.60, name: { pl: "Brazylia",  en: "Brazil"    }, dx:  12, dy:  5, anchor: "start" },
    { key: "gwatemala", lon: -90.7, lat:  14.56, name: { pl: "Gwatemala", en: "Guatemala" }, dx: -12, dy: -7, anchor: "end"   },
    { key: "honduras",  lon: -88.0, lat:  14.16, name: { pl: "Honduras",  en: "Honduras"  }, dx:  11, dy: 15, anchor: "start" }
  ];

  const port = proj(PORT.lon, PORT.lat);
  ORIGINS.forEach((n) => { const p = proj(n.lon, n.lat); n.x = p.x; n.y = p.y; });

  function arcPath(n) {
    const mx = (n.x + port.x) / 2, my = (n.y + port.y) / 2;
    const dist = Math.hypot(port.x - n.x, port.y - n.y);
    const cy = my - dist * 0.17 - 12;            // bow the route northward, like a great-circle arc
    return `M${n.x} ${n.y} Q${mx.toFixed(1)} ${cy.toFixed(1)} ${port.x} ${port.y}`;
  }

  function lotsFor(key) {
    return (window.PRODUCTS || []).filter((p) => !p.boxOnly && p.origin.split("-").indexOf(key) >= 0);
  }

  function renderManifest(n) {
    const box = document.querySelector("#manifest");
    if (!n) {
      box.innerHTML = `<div class="m-kicker">${Store.lang === "pl" ? "Dziennik portowy" : "Port log"}</div>
        <h3>${Store.lang === "pl" ? "Skąd płynie kawa" : "Where the coffee sails from"}</h3>
        <div class="m-empty">${Store.lang === "pl"
          ? "Najedź na kraj na mapie — pokażemy, które lofty przypłynęły z niego do Gdańska i jaką trasą."
          : "Hover a country on the map — we'll show which lots sailed from it to Gdańsk, and by which route."}</div>`;
      return;
    }
    const lots = lotsFor(n.key);
    box.innerHTML = `<div class="m-kicker">${Store.lang === "pl" ? "Trasa do Gdańska" : "Route to Gdańsk"}</div>
      <h3>${n.name[Store.lang]}</h3>
      <div class="m-meta">${lots.length} ${Store.lang === "pl" ? (lots.length === 1 ? "lot w ofercie" : "loty w ofercie") : (lots.length === 1 ? "lot in stock" : "lots in stock")}</div>
      ${lots.map((p) => `<a class="m-lot" href="produkt.html?id=${p.id}">
        ${Store.sack(p)}
        <div class="ml-body"><div class="ml-name">${p.name}</div><div class="ml-notes">${p.notes[Store.lang]}</div></div>
        <div class="ml-price">${Store.money(p.price250)}</div>
      </a>`).join("")}
      <a class="btn btn-primary btn-block m-cta" href="sklep.html?origin=${n.key}">${Store.lang === "pl" ? "Zobacz w sklepie" : "See in the shop"}</a>`;
  }

  let active = null;
  function makeShip(key) {
    const g = el("g", { class: "ship", "data-ship": key });
    const c = el("circle", { r: 3.2, cx: 0, cy: 0 });
    const am = document.createElementNS(NS, "animateMotion");
    am.setAttribute("dur", "2.6s"); am.setAttribute("repeatCount", "indefinite"); am.setAttribute("rotate", "auto");
    const mp = document.createElementNS(NS, "mpath");
    mp.setAttributeNS(XLINK, "xlink:href", "#rp-" + key); mp.setAttribute("href", "#rp-" + key);
    am.appendChild(mp); g.appendChild(c); g.appendChild(am);
    return g;
  }

  function activate(n) {
    active = n;
    document.querySelectorAll(".route").forEach((r) => r.classList.toggle("on", n && r.dataset.key === n.key));
    document.querySelectorAll(".mk").forEach((m) => {
      m.classList.toggle("on", n && m.dataset.key === n.key);
      m.classList.toggle("dim", n && m.dataset.key !== n.key);
    });
    const ships = document.querySelector("#ships");
    ships.innerHTML = "";
    if (n) ships.appendChild(makeShip(n.key));
    renderManifest(n);
  }

  function build() {
    const landG = document.querySelector("#land");
    const grat = document.querySelector("#grat");
    const routes = document.querySelector("#routes");
    const markers = document.querySelector("#markers");
    landG.innerHTML = ""; routes.innerHTML = ""; markers.innerHTML = "";
    document.querySelector("#ships").innerHTML = "";

    grat.setAttribute("d", M.grat);
    landG.appendChild(el("path", { class: "coast", d: M.land }));
    landG.appendChild(el("path", { class: "land", d: M.land }));

    // routes
    ORIGINS.forEach((n) => {
      routes.appendChild(el("path", { id: "rp-" + n.key, class: "route", d: arcPath(n), "data-key": n.key }));
    });

    // port hub — Gdańsk
    const pg = el("g", { class: "mk port", "aria-hidden": "true" });
    pg.appendChild(el("circle", { class: "halo", cx: port.x, cy: port.y, r: 13 }));
    pg.appendChild(el("path", { class: "star", d: starPath(port.x, port.y, 6.5, 2.6) }));
    const pl = el("text", { class: "lbl", x: port.x, y: port.y - 15, "text-anchor": "middle" });
    pl.textContent = PORT.name;
    pg.appendChild(pl);
    markers.appendChild(pg);

    // origin markers
    ORIGINS.forEach((n) => {
      const g = el("g", { class: "mk", "data-key": n.key, tabindex: "0", role: "button", "aria-label": n.name[Store.lang] });
      g.appendChild(el("circle", { class: "ring", cx: n.x, cy: n.y, r: 9 }));
      g.appendChild(el("circle", { class: "dot", cx: n.x, cy: n.y, r: 4 }));
      g.appendChild(el("circle", { cx: n.x, cy: n.y, r: 18, fill: "transparent" })); // hit area
      const t = el("text", { class: "lbl", x: n.x + n.dx, y: n.y + n.dy, "text-anchor": n.anchor });
      t.textContent = n.name[Store.lang];
      g.appendChild(t);
      const on = () => activate(n);
      g.addEventListener("mouseenter", on);
      g.addEventListener("focus", on);
      g.addEventListener("click", on);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); on(); } });
      markers.appendChild(g);
    });

    renderManifest(active);
    if (active) requestAnimationFrame(() => activate(ORIGINS.find((x) => x.key === active.key)));
  }

  function starPath(cx, cy, R, r) {
    let d = "";
    for (let i = 0; i < 8; i++) {
      const ang = (Math.PI / 4) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? R : r;
      d += (i === 0 ? "M" : "L") + (cx + Math.cos(ang) * rad).toFixed(1) + " " + (cy + Math.sin(ang) * rad).toFixed(1);
    }
    return d + "Z";
  }

  function wireFullscreen() {
    const chart = document.querySelector(".chart");
    const btn = document.querySelector(".map-expand");
    if (!chart || !btn) return;
    function setFull(on) {
      chart.classList.toggle("is-full", on);
      document.body.classList.toggle("map-open", on);
      const lbl = on ? (Store.lang === "pl" ? "Zamknij" : "Close") : (Store.lang === "pl" ? "Pełny ekran" : "Fullscreen");
      btn.setAttribute("aria-label", lbl); btn.setAttribute("title", lbl);
    }
    btn.addEventListener("click", () => setFull(!chart.classList.contains("is-full")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && chart.classList.contains("is-full")) setFull(false); });
  }

  window.onLangChange = function () { build(); };
  document.addEventListener("DOMContentLoaded", function () { build(); wireFullscreen(); });
})();
