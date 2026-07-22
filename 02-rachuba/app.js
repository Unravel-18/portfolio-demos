/* ============================================================
   RACHUBA — demo logic (vanilla JS, no deps)
   Fixed "today" for deterministic tax countdowns.
   ============================================================ */
(() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NOW = new Date(2026, 6, 20); // 20 July 2026 (Mon)

  /* ---------------- i18n ---------------- */
  const I18N = {
    concept:   ["Projekt: Klarmint", "By Klarmint"],
    nav_main:  ["Nawigacja", "Menu"],
    nav_dashboard:["Pulpit","Dashboard"], nav_invoices:["Faktury","Invoices"],
    nav_clients:["Klienci","Clients"], nav_expenses:["Koszty","Expenses"],
    nav_taxes:["Podatki","Taxes"], nav_more:["Więcej","More"],
    nav_reports:["Raporty","Reports"], nav_settings:["Ustawienia","Settings"],
    plan_free:["Plan Start","Start plan"], plan_hint:["18/20 faktur w tym miesiącu","18/20 invoices this month"],
    crumb_root:["Rachuba","Rachuba"],
    search_ph:["Szukaj faktur, klientów…","Search invoices, clients…"],
    new_invoice:["Nowa faktura","New invoice"],
    hello:["Dzień dobry","Good morning"],
    page_sub:["Poniedziałek, 20 lipca 2026 · masz 2 faktury po terminie","Monday, 20 July 2026 · you have 2 overdue invoices"],
    p_week:["Tydzień","Week"], p_month:["Miesiąc","Month"], p_quarter:["Kwartał","Quarter"], p_year:["Rok","Year"],
    kpi_income:["Przychód","Revenue"], kpi_income_note:["vs 42 900 zł","vs 42,900 zł"],
    kpi_due:["Do zapłaty","Outstanding"], kpi_overdue:["po terminie","overdue"],
    kpi_costs:["Koszty","Costs"], kpi_costs_note:["ZUS, software, biuro","ZUS, software, office"],
    kpi_profit:["Zysk netto","Net profit"], kpi_margin:["Marża 80,6% · po odliczeniu kosztów","Margin 80.6% · after costs"],
    cf_title:["Przepływy pieniężne","Cash flow"], cf_sub:["Przychody vs koszty · ostatnie 6 miesięcy","Income vs costs · last 6 months"],
    cf_in:["Przychód","Income"], cf_out:["Koszty","Costs"],
    tax_title:["Terminy podatkowe","Tax deadlines"], tax_all:["Wszystkie","All"],
    cost_title:["Struktura kosztów","Cost breakdown"],
    inv_title:["Ostatnie faktury","Recent invoices"], inv_sub:["Kliknij wiersz, aby zobaczyć szczegóły","Click a row for details"],
    f_all:["Wszystkie","All"], f_paid:["Opłacone","Paid"], f_pending:["Oczekujące","Pending"], f_overdue:["Po terminie","Overdue"],
    th_no:["Numer","Number"], th_client:["Klient","Client"], th_amount:["Kwota brutto","Gross amount"],
    th_due:["Termin","Due"], th_status:["Status","Status"],
    empty:["Brak faktur w tym filtrze","No invoices in this filter"],
    foot:["© 2026 Klarmint · IT-Tech — Illia Barych","© 2026 Klarmint · IT-Tech — Illia Barych"],
    foot_about:["O projekcie","About"],
    st_paid:["Opłacona","Paid"], st_pending:["Oczekuje","Pending"], st_overdue:["Po terminie","Overdue"],
    d_new_title:["Nowa faktura","New invoice"], d_client:["Klient","Client"],
    d_issue:["Data wystawienia","Issue date"], d_term:["Termin płatności","Payment term"],
    d_items:["Pozycje","Line items"], d_add_item:["Dodaj","Add"], d_vat:["Stawka VAT","VAT rate"],
    d_netto:["Netto","Net"], d_tax:["VAT","VAT"], d_brutto:["Do zapłaty (brutto)","Total (gross)"],
    d_cancel:["Anuluj","Cancel"], d_issue_btn:["Wystaw fakturę","Issue invoice"],
    dtl_pdf:["Pobierz PDF","Download PDF"], dtl_pay:["Oznacz jako opłaconą","Mark as paid"],
    cmdk_ph:["Szukaj lub wpisz polecenie…","Search or type a command…"],
    t_issued_t:["Faktura wystawiona","Invoice issued"], t_issued_d:["Dodano do listy · wysłano do klienta","Added to list · sent to client"],
    t_paid_t:["Oznaczono jako opłaconą","Marked as paid"], t_paid_d:["Płatność zaksięgowana","Payment recorded"],
    t_pdf_t:["Generowanie PDF","Generating PDF"], t_pdf_d:["W wersji demo plik nie jest pobierany","No file in this demo"],
    t_theme_t:["Zmieniono motyw","Theme switched"], t_soon_t:["Wkrótce","Coming soon"],
    t_soon_d:["Ten widok jest częścią pełnej wersji","This screen is part of the full build"],
    it_ph:["Nazwa usługi","Service name"],
    v_faktury_sub:["Wszystkie wystawione faktury","All issued invoices"],
    v_klienci_sub:["Twoi klienci i ich salda","Your clients and their balances"],
    v_koszty_sub:["Wydatki firmowe w tym miesiącu","Business expenses this month"],
    v_podatki_sub:["Zobowiązania wobec US i ZUS","Liabilities to the tax office & ZUS"],
    v_raporty_sub:["Przychody, koszty i zysk","Revenue, costs and profit"],
    v_ustawienia_sub:["Firma, faktury i preferencje","Company, invoices and preferences"],
    search_inv:["Szukaj po numerze lub kliencie…","Search by number or client…"],
    s_issued:["Wystawione","Issued"], s_paid_sum:["Opłacone","Paid"], s_open:["Do zapłaty","Outstanding"], s_overdue_sum:["Po terminie","Overdue"],
    th_issue:["Wystawiono","Issued"], th_net:["Netto","Net"],
    kl_invoices:["faktur","invoices"], kl_billed:["Rozliczono","Billed"], kl_open:["Zaległości","Outstanding"], kl_last:["Ostatnia","Last"],
    ko_add:["Dodaj koszt","Add expense"], ko_total:["Koszty w lipcu 2026","Expenses July 2026"], th_cat:["Kategoria","Category"], th_date:["Data","Date"],
    ko_rec_only:["Cykliczne","Recurring"], ko_all:["Wszystkie","All"], recurring:["cykliczny","recurring"],
    pod_zus:["Składki ZUS","ZUS contributions"], pod_vat:["VAT do zapłaty","VAT payable"], pod_pit:["Zaliczka PIT","PIT advance"],
    pod_vat_out:["VAT należny","Output VAT"], pod_vat_in:["VAT naliczony","Input VAT"], pod_base:["Podstawa","Base"],
    pod_year:["Cykliczne terminy miesięczne","Recurring monthly deadlines"], pod_pay:["Zapłać","Pay"], pod_soc:["Społeczne","Social"], pod_health:["Zdrowotna","Health"],
    rap_rev:["Przychód wg miesięcy","Revenue by month"], rap_cli:["Przychód wg klientów","Revenue by client"], rap_pl:["Rachunek wyników (YTD)","P&L (YTD)"],
    pl_income:["Przychód","Revenue"], pl_costs:["Koszty","Costs"], pl_profit:["Zysk brutto","Gross profit"],
    pl_tax:["Podatek (szac. 19% + ZUS)","Tax (est. 19% + ZUS)"], pl_net:["Na rękę (szac.)","Take-home (est.)"],
    set_profile:["Profil","Profile"], set_company:["Dane do faktur","Invoice details"], set_prefs:["Preferencje","Preferences"], set_plan:["Plan i płatności","Plan & billing"],
    set_name:["Imię i nazwisko","Full name"], set_company_name:["Nazwa firmy","Company name"], set_nip:["NIP","Tax ID"],
    set_addr:["Adres","Address"], set_num:["Numeracja faktur","Invoice numbering"], set_defvat:["Domyślny VAT","Default VAT"], set_defterm:["Domyślny termin","Default term"],
    set_theme:["Motyw","Theme"], set_lang:["Język","Language"], set_dark:["Ciemny","Dark"], set_light:["Jasny","Light"],
    set_save:["Zapisz zmiany","Save changes"], set_saved_t:["Zapisano","Saved"], set_saved_d:["Ustawienia zaktualizowane","Settings updated"],
    set_plan_name:["Plan Start — 0 zł","Start plan — 0 zł"], set_plan_desc:["20 faktur / miesiąc","20 invoices / month"], set_upgrade:["Przejdź na Pro — 39 zł/mies","Upgrade to Pro — 39 zł/mo"],
    view_all:["Zobacz wszystkie","View all"], per_month:["/ mies","/ mo"],
    days_today:["Dziś","Today"], days_1:["jutro","tomorrow"], days_in:["za %d dni","in %d days"], days_ago:["%d dni temu","%d days ago"],
    zus_name:["ZUS — składki","ZUS — contributions"], zus_when:["Składki społeczne i zdrowotne","Social & health"],
    pit_name:["Zaliczka PIT","PIT advance"], pit_when:["Podatek liniowy 19%","Flat tax 19%"],
    vat_name:["JPK_V7 (VAT)","JPK_V7 (VAT)"], vat_when:["Deklaracja + płatność","Return + payment"],
  };
  let LANG = "pl";
  const t = (k) => (I18N[k] ? I18N[k][LANG === "pl" ? 0 : 1] : k);

  /* ---------------- data ---------------- */
  const CLIENTS = [
    { key:"nord", name:"Nord Logistics",        short:"NL", color:"var(--accent)" },
    { key:"vinci",name:"Studio Vinci",          short:"SV", color:"var(--info)"   },
    { key:"mila", name:"Café Mila",             short:"CM", color:"var(--pos)"    },
    { key:"mkt",  name:"MarketPay Sp. z o.o.",  short:"MP", color:"var(--neg)"    },
    { key:"klos", name:"Piekarnia Złoty Kłos",  short:"ZK", color:"var(--warn)"   },
    { key:"med",  name:"Wrocław Med Center",    short:"WM", color:"#b79cff"        },
  ];
  const cli = (k) => CLIENTS.find((c) => c.key === k);

  // netto line items → brutto computed at 23% VAT
  let INVOICES = [
    { no:"FV/2026/07/07", client:"nord",  status:"pending", due:"26.07.2026", issue:"12.07.2026",
      items:[{n:"Projekt UI panelu spedycyjnego",q:1,p:4300}] },
    { no:"FV/2026/07/06", client:"vinci", status:"overdue", due:"17.07.2026", issue:"03.07.2026",
      items:[{n:"Strona internetowa — realizacja",q:1,p:2400},{n:"Sesja UX / warsztaty",q:2,p:300}] },
    { no:"FV/2026/07/05", client:"mila",  status:"overdue", due:"12.07.2026", issue:"28.06.2026",
      items:[{n:"Identyfikacja wizualna",q:1,p:2000}] },
    { no:"FV/2026/07/04", client:"mkt",   status:"pending", due:"24.07.2026", issue:"10.07.2026",
      items:[{n:"Integracja bramki płatności",q:1,p:2650}] },
    { no:"FV/2026/06/12", client:"klos",  status:"paid",    due:"30.06.2026", issue:"16.06.2026",
      items:[{n:"Landing page + wdrożenie",q:1,p:3500}] },
    { no:"FV/2026/06/09", client:"med",   status:"paid",    due:"28.06.2026", issue:"14.06.2026",
      items:[{n:"Portal pacjenta — sprint 2",q:1,p:8100}] },
    { no:"FV/2026/06/05", client:"nord",  status:"paid",    due:"20.06.2026", issue:"06.06.2026",
      items:[{n:"Wsparcie produktu (retainer)",q:1,p:6000}] },
  ];
  const netto  = (inv) => inv.items.reduce((s, i) => s + i.q * i.p, 0);
  const brutto = (inv) => Math.round(netto(inv) * 1.23 * 100) / 100;

  const CASHFLOW = [
    { m:["Lut","Feb"], in:31200, out:8100 },
    { m:["Mar","Mar"], in:38400, out:7600 },
    { m:["Kwi","Apr"], in:35900, out:9200 },
    { m:["Maj","May"], in:44100, out:8400 },
    { m:["Cze","Jun"], in:46700, out:9900 },
    { m:["Lip","Jul"], in:48250, out:9340 },
  ];

  const TAXES = [
    { nameK:"zus_name", whenK:"zus_when", due:new Date(2026,6,20), amount:1646.47 },
    { nameK:"pit_name", whenK:"pit_when", due:new Date(2026,6,22), amount:2380.00 },
    { nameK:"vat_name", whenK:"vat_when", due:new Date(2026,6,27), amount:3240.00 },
  ];

  const CAT = {
    zus:  { pl:"ZUS i podatki",     en:"ZUS & taxes",      color:"var(--accent)" },
    soft: { pl:"Software / narzędzia", en:"Software / tools", color:"var(--info)" },
    sub:  { pl:"Podwykonawcy",      en:"Subcontractors",   color:"var(--pos)" },
    biuro:{ pl:"Biuro / coworking", en:"Office / coworking", color:"var(--warn)" },
    hw:   { pl:"Sprzęt",            en:"Equipment",         color:"var(--tx-3)" },
  };
  let EXPENSES = [
    { name:"ZUS — składki społeczne i zdrowotne", nameEn:"ZUS — social & health", cat:"zus",  amount:1646.47, date:"20.07.2026", rec:true },
    { name:"Księgowość online (wFirma)", nameEn:"Online accounting", cat:"zus",  amount:99.00,  date:"05.07.2026", rec:true },
    { name:"Adobe Creative Cloud",  nameEn:"Adobe Creative Cloud", cat:"soft", amount:259.00, date:"03.07.2026", rec:true },
    { name:"Figma Organization",    nameEn:"Figma Organization",   cat:"soft", amount:180.00, date:"01.07.2026", rec:true },
    { name:"Hosting + domeny (OVH)",nameEn:"Hosting + domains",    cat:"soft", amount:129.00, date:"05.07.2026", rec:true },
    { name:"GitHub Team",           nameEn:"GitHub Team",          cat:"soft", amount:88.00,  date:"07.07.2026", rec:true },
    { name:"Coworking Wrocław",     nameEn:"Coworking Wrocław",    cat:"biuro",amount:650.00, date:"02.07.2026", rec:true },
    { name:"Internet + telefon",    nameEn:"Internet + phone",     cat:"biuro",amount:145.00, date:"04.07.2026", rec:true },
    { name:"Podwykonawca — dev (React)", nameEn:"Subcontractor — dev", cat:"sub", amount:2400.00, date:"11.07.2026", rec:false },
    { name:"Podwykonawca — copywriting", nameEn:"Subcontractor — copy", cat:"sub", amount:900.00, date:"09.07.2026", rec:false },
    { name:"Monitor 4K Dell U2723", nameEn:"4K monitor Dell",      cat:"hw",   amount:1890.00, date:"08.07.2026", rec:false },
    { name:"Akcesoria (klawiatura, hub)", nameEn:"Accessories",    cat:"hw",   amount:468.00, date:"08.07.2026", rec:false },
  ];
  const expTotal = () => EXPENSES.reduce((s, e) => s + e.amount, 0);

  const SETTINGS = {
    companyName: "Kowalczyk Studio",
    nip: "894-000-00-00",
    address: "ul. Ruska 12, 50-079 Wrocław",
    numbering: "FV/RRRR/MM/NN",
    defVat: "23",
    defTerm: "14",
    name: "Michał Kowalczyk",
  };

  // period → [Przychód, Do zapłaty, Koszty, Zysk netto] + podtytuł
  const PERIODS = {
    week:    { v:[11800, 14780, 2140, 9660],   pl:"Ten tydzień · 14–20 lipca 2026",       en:"This week · 14–20 Jul 2026" },
    month:   { v:[48250, 14780, 9340, 38910],  pl:"Lipiec 2026 · masz 2 faktury po terminie", en:"July 2026 · you have 2 overdue invoices" },
    quarter: { v:[139900, 14780, 27600, 112300],pl:"Q3 2026 · lipiec–wrzesień",            en:"Q3 2026 · Jul–Sep" },
    year:    { v:[244550, 14780, 52540, 192010],pl:"2026 · narastająco (YTD)",             en:"2026 · year to date" },
  };
  let curPeriod = "month";

  /* ---------------- format ---------------- */
  const fmt = (n, dec = 0) => {
    const s = Number(n).toFixed(dec);
    let [int, frac] = s.split(".");
    int = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return frac ? `${int},${frac}` : int;
  };
  const money = (n, dec = 2) => `${fmt(n, dec)} zł`;
  // Polish plural for "faktura": 1→faktura, 2-4→faktury, 5+→faktur (with 12-14 exception)
  const faktur = (n) => {
    if (LANG !== "pl") return `${n} ${n === 1 ? "invoice" : "invoices"}`;
    const d = n % 10, h = n % 100;
    const w = n === 1 ? "faktura" : (d >= 2 && d <= 4 && !(h >= 12 && h <= 14)) ? "faktury" : "faktur";
    return `${n} ${w}`;
  };

  /* ---------------- i18n apply ---------------- */
  function applyLang() {
    document.documentElement.lang = LANG;
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    // dynamic bits
    renderTaxes(); renderTable(); refreshFilterCounts(); syncOverdueChip();
    renderDonut(); if (chartReady) renderChart();
    if (typeof curView !== "undefined" && curView !== "pulpit" && viewRenderers[curView]) viewRenderers[curView]();
    if (typeof curPeriod !== "undefined" && curPeriod !== "month")
      $("#pageSub").textContent = PERIODS[curPeriod][LANG === "pl" ? "pl" : "en"];
    $("#cmdkInput") && ($("#cmdkInput").placeholder = t("cmdk_ph"));
  }

  /* ---------------- KPI count-up + sparklines ---------------- */
  function countUp(el) {
    const target = +el.dataset.count, suf = el.dataset.suffix || "";
    const dur = 1100, start = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = fmt(Math.round(target * ease(p))) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function applyPeriod(p) {
    const d = PERIODS[p]; if (!d) return;
    curPeriod = p;
    $$("#view-pulpit .kpis .kpi-val[data-count]").forEach((el, i) => {
      el.dataset.count = d.v[i]; countUp(el);
    });
    $("#pageSub").textContent = LANG === "pl" ? d.pl : d.en;
  }
  function buildSpark(svg) {
    const pts = svg.dataset.spark.split(" ").map((p) => p.split(",").map(Number));
    const line = pts.map((p) => p.join(",")).join(" ");
    const area = `8,34 ${line} 120,34`;
    svg.innerHTML =
      `<polygon class="fill" points="${area}"/><polyline points="${line}" fill="none"/>`;
    // apply stroke via CSS (.spark path targets path; use polyline style)
    const pl = svg.querySelector("polyline");
    pl.style.stroke = svg.classList.contains("spark-mut") ? "var(--tx-3)" : "var(--pos)";
    pl.style.strokeWidth = "2.4";
  }

  /* ---------------- cashflow chart ---------------- */
  let chartReady = false;
  function renderChart() {
    const host = $("#chart"); if (!host) return;
    host.querySelector("svg")?.remove();          // rebuild cleanly on re-render
    const tip = $("#chartTip");
    const W = 620, H = 250, padL = 8, padR = 8, padT = 14, padB = 26;
    const max = Math.max(...CASHFLOW.map((d) => d.in)) * 1.08;
    const plotH = H - padT - padB, plotW = W - padL - padR;
    const groups = CASHFLOW.length, gw = plotW / groups;
    const bw = 15, gap = 6;

    let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`;
    // grid lines + y labels (rough)
    for (let i = 0; i <= 4; i++) {
      const y = padT + (plotH * i) / 4;
      svg += `<line class="grid-line" x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}"/>`;
    }
    CASHFLOW.forEach((d, i) => {
      const cx = padL + gw * i + gw / 2;
      const hIn = (d.in / max) * plotH, hOut = (d.out / max) * plotH;
      const x1 = cx - bw - gap / 2, x2 = cx + gap / 2;
      const yIn = padT + plotH - hIn, yOut = padT + plotH - hOut;
      const delay = (i * 0.08 + 0.15).toFixed(2);
      svg += `<g class="bar-grp" data-i="${i}">
        <rect class="bar-out" x="${x2}" y="${yOut}" width="${bw}" height="${hOut}" rx="4"
              style="transition:transform .8s var(--ease-out) ${delay}s;transform-box:fill-box;transform-origin:bottom;transform:scaleY(0)"/>
        <rect class="bar-in" x="${x1}" y="${yIn}" width="${bw}" height="${hIn}" rx="4"
              style="transition:transform .8s var(--ease-out) ${delay}s;transform-box:fill-box;transform-origin:bottom;transform:scaleY(0)"/>
        <rect class="hit" x="${padL + gw * i}" y="${padT}" width="${gw}" height="${plotH}" fill="transparent"/>
        <text class="axis-t" x="${cx}" y="${H - 8}" text-anchor="middle">${d.m[LANG === "pl" ? 0 : 1]}</text>
      </g>`;
    });
    svg += `</svg>`;
    host.insertAdjacentHTML("afterbegin", svg);

    // draw animation
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$(".bar-in,.bar-out", host).forEach((r) => (r.style.transform = "scaleY(1)"));
    }));

    // tooltip
    $$(".bar-grp", host).forEach((g) => {
      const d = CASHFLOW[+g.dataset.i];
      g.addEventListener("mousemove", (e) => {
        const box = host.getBoundingClientRect();
        tip.hidden = false;
        tip.style.left = e.clientX - box.left + "px";
        tip.style.top  = e.clientY - box.top + "px";
        tip.innerHTML =
          `<div class="tip-m">${d.m[LANG === "pl" ? 0 : 1]} 2026</div>
           <div class="tip-row"><i style="background:var(--accent)"></i>${t("cf_in")}<b>${money(d.in,0)}</b></div>
           <div class="tip-row"><i style="background:var(--tx-3)"></i>${t("cf_out")}<b>${money(d.out,0)}</b></div>`;
      });
      g.addEventListener("mouseleave", () => (tip.hidden = true));
    });
  }

  /* ---------------- tax deadlines ---------------- */
  function daysLabel(diff) {
    if (diff === 0) return t("days_today");
    if (diff === 1) return t("days_1");
    if (diff > 0)   return t("days_in").replace("%d", diff);
    return t("days_ago").replace("%d", -diff);
  }
  function renderTaxes() {
    const ul = $("#taxList"); if (!ul) return;
    const circ = 2 * Math.PI * 15;
    ul.innerHTML = TAXES.map((tx) => {
      const diff = Math.round((tx.due - NOW) / 86400000);
      const urgency = diff <= 1 ? "red" : diff <= 6 ? "amber" : "green";
      const frac = Math.max(0.06, Math.min(1, (14 - diff) / 14));
      const off = circ * (1 - frac);
      const dd = String(tx.due.getDate()).padStart(2, "0");
      const mm = String(tx.due.getMonth() + 1).padStart(2, "0");
      return `<li class="tax-item">
        <div class="tax-ring">
          <svg viewBox="0 0 36 36">
            <circle class="tr-bg" cx="18" cy="18" r="15"/>
            <circle class="tr-fg stroke-${urgency}" cx="18" cy="18" r="15"
                    stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
          </svg>
          <span class="tr-days u-${urgency}">${diff <= 0 ? "!" : diff}</span>
        </div>
        <div class="tax-meta">
          <div class="tax-name">${t(tx.nameK)}</div>
          <div class="tax-when">${t(tx.whenK)} · <span class="u-${urgency}">${daysLabel(diff)}</span> · ${dd}.${mm}</div>
        </div>
        <div class="tax-amt">${money(tx.amount)}</div>
      </li>`;
    }).join("");
  }

  /* ---------------- cost donut ---------------- */
  function costSegments() {
    const totals = {}; EXPENSES.forEach((e) => totals[e.cat] = (totals[e.cat] || 0) + e.amount);
    const tot = expTotal();
    return Object.keys(CAT).filter((k) => totals[k]).map((k) => ({
      label: LANG === "pl" ? CAT[k].pl : CAT[k].en, color: CAT[k].color,
      pct: Math.round(totals[k] / tot * 100), amount: totals[k],
    }));
  }
  function paintDonut(svgSel, legSel, segs) {
    const svg = $(svgSel), leg = $(legSel); if (!svg) return;
    let acc = 25; // start at top (rotate handled by CSS -90)
    svg.innerHTML = segs.map((s) => {
      const el = `<circle r="15.915" cx="21" cy="21" stroke="${s.color}"
                    stroke-dasharray="${s.pct} ${100 - s.pct}" stroke-dashoffset="${acc}"/>`;
      acc -= s.pct; return el;
    }).join("");
    if (leg) leg.innerHTML = segs.map((s) =>
      `<div class="dl-row"><i style="background:${s.color}"></i>
        <span>${s.label}</span><b>${s.pct}%</b></div>`).join("");
  }
  function renderDonut() { paintDonut("#donut", "#donutLegend", costSegments()); }

  /* ---------------- invoices table ---------------- */
  let curFilter = "all", sortKey = null, sortDir = 1;
  function statusClass(s){ return s==="paid"?"st-paid":s==="pending"?"st-pending":"st-overdue"; }

  function filtered() {
    let rows = INVOICES.filter((i) => curFilter === "all" || i.status === curFilter);
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        let va, vb;
        if (sortKey === "amount") { va = brutto(a); vb = brutto(b); }
        else if (sortKey === "client") { va = cli(a.client).name; vb = cli(b.client).name; }
        else if (sortKey === "due")   { va = a.due.split(".").reverse().join(""); vb = b.due.split(".").reverse().join(""); }
        else { va = a.no; vb = b.no; }
        return va < vb ? -sortDir : va > vb ? sortDir : 0;
      });
    }
    return rows;
  }
  function invoiceRowsHTML(rows) {
    return rows.map((inv) => {
      const c = cli(inv.client);
      return `<tr data-no="${inv.no}">
        <td class="td-no" data-label="${t("th_no")}">${inv.no}</td>
        <td data-label="${t("th_client")}"><div class="td-client"><span class="cli-dot" style="background:${c.color}">${c.short}</span>${c.name}</div></td>
        <td class="num" data-label="${t("th_amount")}">${money(brutto(inv))}</td>
        <td class="td-due" data-label="${t("th_due")}">${inv.due}</td>
        <td data-label="${t("th_status")}"><span class="st ${statusClass(inv.status)}">${t("st_"+inv.status)}</span></td>
        <td class="td-act"><span class="row-go"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></span></td>
      </tr>`;
    }).join("");
  }
  const attachRowClicks = (tb) => $$("tr", tb).forEach((tr) => tr.onclick = () => openDetail(tr.dataset.no));

  function renderTable() {
    const tb = $("#tbody"), empty = $("#tblEmpty"); if (!tb) return;
    const rows = filtered();
    empty.hidden = rows.length > 0;
    tb.innerHTML = invoiceRowsHTML(rows);
    attachRowClicks(tb);
  }
  function refreshFilterCounts() {
    const cnt = (f) => f === "all" ? INVOICES.length : INVOICES.filter((i) => i.status === f).length;
    $$("#filters .fpill").forEach((p) => { p.querySelector("em").textContent = cnt(p.dataset.f); });
    $("#navInvCount").textContent = INVOICES.length;
  }
  function syncOverdueChip() {
    const od = INVOICES.filter((i) => i.status === "overdue");
    const sum = od.reduce((s, i) => s + brutto(i), 0);
    const chip = $(".kpi .chip-red");
    if (chip) chip.textContent = `${od.length} ${t("kpi_overdue")} · ${money(sum, 0)}`;
    const badge = $("#dueBadge");
    const unpaid = INVOICES.filter((i)=>i.status!=="paid").length;
    if (badge) badge.textContent = faktur(unpaid);
  }

  /* ---------------- detail drawer ---------------- */
  function openDetail(no) {
    const inv = INVOICES.find((i) => i.no === no); if (!inv) return;
    const c = cli(inv.client);
    $("#dtlNo").textContent = inv.no;
    $("#dtlClient").textContent = c.name;
    const diff = Math.round((new Date(inv.due.split(".").reverse().join("-")) - NOW) / 86400000);
    $("#dtlBody").innerHTML = `
      <div class="dtl-hero">
        <span class="st ${statusClass(inv.status)}">${t("st_"+inv.status)}</span>
        <div class="dtl-amount">${money(brutto(inv))}</div>
        <div class="dtl-line"><span>${t("d_client")}</span><b>${c.name}</b></div>
        <div class="dtl-line"><span>${t("d_issue")}</span><b>${inv.issue}</b></div>
        <div class="dtl-line"><span>${t("th_due")}</span><b>${inv.due} · ${daysLabel(diff)}</b></div>
      </div>
      <div class="dtl-items">
        ${inv.items.map((it) => `<div class="di"><span>${it.n} ${it.q>1?`· ${it.q}×`:""}</span><b>${money(it.q*it.p)}</b></div>`).join("")}
        <div class="dtl-line" style="margin-top:8px"><span>${t("d_netto")}</span><b>${money(netto(inv))}</b></div>
        <div class="dtl-line"><span>${t("d_tax")} 23%</span><b>${money(brutto(inv)-netto(inv))}</b></div>
      </div>`;
    // toggle pay button by status
    const payBtn = $("#dtlPay");
    payBtn.style.display = inv.status === "paid" ? "none" : "inline-flex";
    payBtn.onclick = () => {
      inv.status = "paid";
      closeDrawers(); refreshViews();
      toast("ok", t("t_paid_t"), t("t_paid_d"));
    };
    $("#dtlPdf").onclick = () => toast("info", t("t_pdf_t"), t("t_pdf_d"));
    openDrawer($("#detailDrawer"));
  }

  /* ---------------- new invoice drawer ---------------- */
  let items = [];
  const fillPattern = (seq) => SETTINGS.numbering
    .replace("RRRR", "2026").replace("MM", "07")
    .replace("NN", String(seq).padStart(2, "0"));
  function nextNo() {
    const base = SETTINGS.numbering.replace("RRRR", "2026").replace("MM", "07").replace("NN", "");
    const seqs = INVOICES.map((i) => i.no).filter((n) => n.startsWith(base))
      .map((n) => +n.slice(base.length)).filter((x) => !isNaN(x));
    return fillPattern(Math.max(0, ...seqs) + 1);
  }
  function itemRow(it, idx) {
    return `<div class="item-row" data-idx="${idx}">
      <input class="it-name" type="text" placeholder="${t("it_ph")}" value="${it.n}"/>
      <input class="it-qty"  type="number" min="1" value="${it.q}"/>
      <input class="it-price" type="number" min="0" step="50" value="${it.p}"/>
      <button class="it-del" aria-label="usuń"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    </div>`;
  }
  function renderItems() {
    $("#items").innerHTML = items.map(itemRow).join("");
    $$("#items .item-row").forEach((row) => {
      const idx = +row.dataset.idx;
      row.querySelector(".it-name").oninput  = (e) => { items[idx].n = e.target.value; };
      row.querySelector(".it-qty").oninput   = (e) => { items[idx].q = Math.max(1, +e.target.value || 1); calcTotals(); };
      row.querySelector(".it-price").oninput = (e) => { items[idx].p = Math.max(0, +e.target.value || 0); calcTotals(); };
      row.querySelector(".it-del").onclick   = () => { items.splice(idx, 1); if(!items.length) items.push({n:"",q:1,p:0}); renderItems(); calcTotals(); };
    });
  }
  function calcTotals() {
    const net = items.reduce((s, i) => s + i.q * i.p, 0);
    const rateRaw = $("#fVat").value;
    const rate = rateRaw === "zw" ? 0 : +rateRaw;
    const vat = net * rate / 100;
    $("#tNetto").textContent = money(net);
    $("#tVatRate").textContent = rateRaw === "zw" ? "zw." : rate;
    $("#tVat").textContent = money(vat);
    $("#tBrutto").textContent = money(net + vat);
  }
  function openNewInvoice() {
    items = [{ n:"", q:1, p:0 }];
    $("#drawerNo").textContent = nextNo();
    $("#fVat").value = SETTINGS.defVat;
    $("#fTerm").value = SETTINGS.defTerm;
    // fill client select
    $("#fClient").innerHTML = CLIENTS.map((c) => `<option value="${c.key}">${c.name}</option>`).join("");
    renderItems(); calcTotals();
    openDrawer($("#invoiceDrawer"));
    setTimeout(() => $("#items .it-name")?.focus(), 350);
  }
  function issueInvoice() {
    const net = items.reduce((s, i) => s + i.q * i.p, 0);
    if (net <= 0 || !items.some((i) => i.n.trim())) {
      toast("info", LANG==="pl"?"Uzupełnij pozycje":"Fill in line items",
                    LANG==="pl"?"Dodaj nazwę i kwotę":"Add a name and amount");
      return;
    }
    const term = +$("#fTerm").value;
    const due = new Date(NOW); due.setDate(due.getDate() + term);
    const dstr = `${String(due.getDate()).padStart(2,"0")}.${String(due.getMonth()+1).padStart(2,"0")}.${due.getFullYear()}`;
    INVOICES.unshift({
      no: $("#drawerNo").textContent, client: $("#fClient").value,
      status: "pending", due: dstr, issue: "20.07.2026",
      items: items.filter((i)=>i.n.trim()).map((i) => ({ n:i.n, q:i.q, p:i.p })),
    });
    curFilter = "all";
    $$("#filters .fpill").forEach((p)=>p.classList.toggle("is-on", p.dataset.f==="all"));
    closeDrawers(); refreshViews();
    toast("ok", t("t_issued_t"), t("t_issued_d"));
  }

  /* ---------------- drawers plumbing ---------------- */
  function openDrawer(d) { $("#scrim").hidden = false; d.classList.add("is-open"); d.removeAttribute("inert"); d.setAttribute("aria-hidden","false"); }
  function closeDrawers() {
    $$(".drawer").forEach((d) => { d.classList.remove("is-open"); d.setAttribute("inert",""); d.setAttribute("aria-hidden","true"); });
    $("#scrim").hidden = true;
  }

  /* ---------------- toasts ---------------- */
  function toast(kind, title, desc) {
    const icon = kind === "ok"
      ? `<path d="M20 6 9 17l-5-5"/>` : `<path d="M12 8v5M12 16h.01M12 3l9 16H3z"/>`;
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<div class="toast-ic ${kind}"><svg viewBox="0 0 24 24" fill="none">${icon}</svg></div>
      <div class="toast-body"><strong>${title}</strong><span>${desc}</span></div>`;
    $("#toasts").appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, 3400);
  }

  /* ---------------- command palette ---------------- */
  const CMDS = () => [
    { k:"new", en:"New invoice", pl:"Nowa faktura", hint:"⌘N", icon:`<path d="M12 5v14M5 12h14"/>`, run: openNewInvoice },
    { k:"faktury", en:"Go to Invoices", pl:"Przejdź: Faktury", hint:"", icon:`<path d="M6 2h9l5 5v13H6z"/>`, run: () => go("faktury") },
    { k:"klienci", en:"Go to Clients", pl:"Przejdź: Klienci", hint:"", icon:`<path d="M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0"/>`, run: () => go("klienci") },
    { k:"podatki", en:"Go to Taxes", pl:"Przejdź: Podatki", hint:"", icon:`<path d="M12 3v18M7 7h10M7 17h10"/>`, run: () => go("podatki") },
    { k:"theme", en:"Toggle theme", pl:"Przełącz motyw", hint:"", icon:`<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>`, run: toggleTheme },
    { k:"lang", en:"Switch language", pl:"Zmień język", hint:"", icon:`<path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>`, run: toggleLang },
  ];
  let cmdSel = 0, cmdFiltered = [];
  function openCmdk() {
    $("#cmdk").hidden = false;
    $("#cmdkInput").value = ""; cmdSel = 0;
    renderCmdk(""); setTimeout(() => $("#cmdkInput").focus(), 30);
  }
  function closeCmdk() { $("#cmdk").hidden = true; }
  function renderCmdk(q) {
    const ql = q.toLowerCase();
    cmdFiltered = CMDS().filter((c) => (LANG==="pl"?c.pl:c.en).toLowerCase().includes(ql));
    const list = $("#cmdkList");
    if (!cmdFiltered.length) { list.innerHTML = `<div class="cmdk-empty">${LANG==="pl"?"Brak wyników":"No results"}</div>`; return; }
    if (cmdSel >= cmdFiltered.length) cmdSel = 0;
    list.innerHTML = cmdFiltered.map((c, i) =>
      `<li class="cmdk-it ${i===cmdSel?"is-sel":""}" data-i="${i}">
        <svg viewBox="0 0 24 24" fill="none">${c.icon}</svg>${LANG==="pl"?c.pl:c.en}
        ${c.hint?`<span class="ci-hint">${c.hint}</span>`:""}</li>`).join("");
    $$("#cmdkList .cmdk-it").forEach((li) => {
      li.onmouseenter = () => { cmdSel = +li.dataset.i; renderCmdk($("#cmdkInput").value); };
      li.onclick = () => { closeCmdk(); cmdFiltered[+li.dataset.i].run(); };
    });
  }

  /* ============================================================
     SECONDARY VIEWS
     ============================================================ */
  const viewHead = (titleK, subK, action = "") =>
    `<div class="page-head reveal"><div><h1 class="hello">${t(titleK)}</h1>
      <p class="page-sub">${t(subK)}</p></div>${action}</div>`;
  const miniStat = (label, val, cls = "") =>
    `<article class="kpi stat"><span class="kpi-label">${label}</span><div class="kpi-val ${cls}">${val}</div></article>`;

  // ---------- FAKTURY ----------
  const fk = { filter:"all", sort:null, dir:1, q:"" };
  function fkRows() {
    let r = INVOICES.filter((i) => fk.filter === "all" || i.status === fk.filter);
    if (fk.q) { const q = fk.q.toLowerCase();
      r = r.filter((i) => i.no.toLowerCase().includes(q) || cli(i.client).name.toLowerCase().includes(q)); }
    if (fk.sort) r = [...r].sort((a, b) => {
      let va, vb;
      if (fk.sort === "amount") { va = brutto(a); vb = brutto(b); }
      else if (fk.sort === "client") { va = cli(a.client).name; vb = cli(b.client).name; }
      else if (fk.sort === "due") { va = a.due.split(".").reverse().join(""); vb = b.due.split(".").reverse().join(""); }
      else { va = a.no; vb = b.no; }
      return va < vb ? -fk.dir : va > vb ? fk.dir : 0;
    });
    return r;
  }
  function fkRedraw() {
    const tb = $("#tbody2"); if (!tb) return;
    const rows = fkRows();
    tb.innerHTML = invoiceRowsHTML(rows); attachRowClicks(tb);
    $("#empty2").hidden = rows.length > 0;
  }
  function renderFakturyView() {
    const el = $("#view-faktury");
    const sum = (f) => INVOICES.filter(f).reduce((s, i) => s + brutto(i), 0);
    el.innerHTML = viewHead("nav_invoices", "v_faktury_sub",
      `<button class="btn btn-primary" id="fkNew"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>${t("new_invoice")}</button>`)
    + `<section class="kpis reveal" style="--d:1">
        ${miniStat(t("s_issued"), money(sum(() => true), 0))}
        ${miniStat(t("s_paid_sum"), money(sum((i) => i.status === "paid"), 0), "u-green")}
        ${miniStat(t("s_open"), money(sum((i) => i.status !== "paid"), 0), "u-amber")}
        ${miniStat(t("s_overdue_sum"), money(sum((i) => i.status === "overdue"), 0), "u-red")}
      </section>
      <section class="card table-card reveal" style="--d:2">
        <header class="card-head">
          <div class="search search-in"><svg viewBox="0 0 24 24"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3"/></svg><input id="fkSearch" placeholder="${t("search_inv")}"/></div>
          <div class="filters" id="fkFilters">
            ${["all","paid","pending","overdue"].map((f) => `<button class="fpill ${f===fk.filter?"is-on":""}" data-f="${f}"><span>${t("f_"+f)}</span></button>`).join("")}
          </div>
        </header>
        <div class="table-scroll"><table class="tbl">
          <thead><tr>
            <th class="sortable" data-sort="no">${t("th_no")}</th>
            <th class="sortable" data-sort="client">${t("th_client")}</th>
            <th class="sortable num" data-sort="amount">${t("th_amount")}</th>
            <th class="sortable" data-sort="due">${t("th_due")}</th>
            <th>${t("th_status")}</th><th class="th-act"></th>
          </tr></thead><tbody id="tbody2"></tbody></table></div>
        <div class="empty" id="empty2" hidden><svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v13H6z"/></svg><p>${t("empty")}</p></div>
      </section>`;
    fkRedraw();
    $("#fkNew").onclick = openNewInvoice;
    $("#fkSearch").oninput = (e) => { fk.q = e.target.value; fkRedraw(); };
    $$("#fkFilters .fpill").forEach((p) => p.onclick = () => {
      $$("#fkFilters .fpill").forEach((x) => x.classList.remove("is-on")); p.classList.add("is-on");
      fk.filter = p.dataset.f; fkRedraw();
    });
    $$("#view-faktury th.sortable").forEach((th) => th.onclick = () => {
      const k = th.dataset.sort; if (fk.sort === k) fk.dir *= -1; else { fk.sort = k; fk.dir = 1; }
      $$("#view-faktury th.sortable").forEach((x) => x.classList.remove("sort-asc","sort-desc"));
      th.classList.add(fk.dir === 1 ? "sort-asc" : "sort-desc"); fkRedraw();
    });
  }

  // ---------- KLIENCI ----------
  function clientStat(key) {
    const inv = INVOICES.filter((i) => i.client === key);
    const billed = inv.reduce((s, i) => s + brutto(i), 0);
    const open = inv.filter((i) => i.status !== "paid").reduce((s, i) => s + brutto(i), 0);
    const dates = inv.map((i) => i.issue).sort((a, b) => a.split(".").reverse().join("") < b.split(".").reverse().join("") ? 1 : -1);
    return { count: inv.length, billed, open, last: dates[0] || "—" };
  }
  function renderKlienciView() {
    const cards = CLIENTS.map((c, i) => { const s = clientStat(c.key);
      return `<article class="client-card reveal" data-key="${c.key}" style="--d:${i+1}">
        <div class="cc-top"><span class="cli-dot lg" style="background:${c.color}">${c.short}</span>
          <div class="cc-id"><strong>${c.name}</strong><span>${faktur(s.count)} · ${t("kl_last")} ${s.last}</span></div>
          <span class="cc-go"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></span></div>
        <div class="cc-stats">
          <div><span>${t("kl_billed")}</span><b>${money(s.billed,0)}</b></div>
          <div><span>${t("kl_open")}</span><b class="${s.open>0?"u-amber":"u-green"}">${money(s.open,0)}</b></div>
        </div></article>`; }).join("");
    $("#view-klienci").innerHTML = viewHead("nav_clients", "v_klienci_sub") + `<section class="client-grid">${cards}</section>`;
    $$("#view-klienci .client-card").forEach((card) => card.onclick = () => openClient(card.dataset.key));
  }
  function openClient(key) {
    const c = cli(key), s = clientStat(key);
    const inv = INVOICES.filter((i) => i.client === key);
    $("#clName").textContent = c.name;
    $("#clSub").textContent = `${faktur(s.count)} · ${t("kl_billed")} ${money(s.billed, 0)}`;
    $("#clBody").innerHTML = `
      <div class="dtl-hero">
        <div class="cl-hero-top"><span class="cli-dot lg" style="background:${c.color}">${c.short}</span>
          <div><strong>${c.name}</strong><span class="cl-meta">${t("kl_last")} ${s.last}</span></div></div>
        <div class="cl-stats3">
          <div><span>${t("kl_billed")}</span><b>${money(s.billed,0)}</b></div>
          <div><span>${t("s_paid_sum")}</span><b class="u-green">${money(s.billed-s.open,0)}</b></div>
          <div><span>${t("kl_open")}</span><b class="${s.open>0?"u-amber":"u-green"}">${money(s.open,0)}</b></div>
        </div>
      </div>
      <div class="cl-inv-title">${t("nav_invoices")}</div>
      <div class="cl-invs">${inv.map((i) => `<div class="cl-inv" data-no="${i.no}">
        <div><b>${i.no}</b><span>${i.issue}</span></div>
        <div class="cl-inv-right"><b class="mono">${money(brutto(i))}</b><span class="st ${statusClass(i.status)}">${t("st_"+i.status)}</span></div>
      </div>`).join("")}</div>`;
    $$("#clBody .cl-inv").forEach((r) => r.onclick = () => { $("#clientDrawer").classList.remove("is-open"); openDetail(r.dataset.no); });
    $("#clNew").onclick = openNewInvoice;
    openDrawer($("#clientDrawer"));
  }

  // ---------- KOSZTY ----------
  const catBadge = (cat) => { const c = CAT[cat]; return `<span class="cat-badge" style="--c:${c.color}">${LANG==="pl"?c.pl:c.en}</span>`; };
  function koRenderRows() {
    const tb = $("#koBody"); if (!tb) return;
    tb.innerHTML = EXPENSES.map((e) => `<tr>
      <td data-label="${t("th_cat")}">${catBadge(e.cat)}</td>
      <td class="ko-name" data-label="${LANG==="pl"?"Opis":"Description"}">${LANG==="pl"?e.name:e.nameEn}${e.rec?`<em class="rec-tag">${t("recurring")}</em>`:""}</td>
      <td class="td-due" data-label="${t("th_date")}">${e.date}</td>
      <td class="num" data-label="${t("th_amount")}">${money(e.amount)}</td></tr>`).join("");
  }
  function koToggleQuick() {
    const q = $("#koQuick"); if (!q) return;
    if (!q.hidden) { q.hidden = true; q.innerHTML = ""; return; }
    q.hidden = false;
    q.innerHTML = `<input id="koN" placeholder="${LANG==="pl"?"Opis kosztu":"Expense name"}"/>
      <input id="koA" type="number" min="0" placeholder="0"/>
      <div class="select-wrap sm"><select id="koC">${Object.keys(CAT).map((k)=>`<option value="${k}">${LANG==="pl"?CAT[k].pl:CAT[k].en}</option>`).join("")}</select><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></div>
      <button class="btn btn-primary" id="koSave"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></button>`;
    $("#koN").focus();
    $("#koSave").onclick = () => {
      const n = $("#koN").value.trim(), a = +$("#koA").value;
      if (!n || a <= 0) { toast("info", LANG==="pl"?"Uzupełnij dane":"Fill in fields", ""); return; }
      EXPENSES.unshift({ name:n, nameEn:n, cat:$("#koC").value, amount:a, date:"20.07.2026", rec:false });
      renderKosztyView(); renderDonut();
      toast("ok", LANG==="pl"?"Dodano koszt":"Expense added", money(a));
    };
  }
  function renderKosztyView() {
    $("#view-koszty").innerHTML = viewHead("nav_expenses", "v_koszty_sub",
      `<button class="btn btn-primary" id="koAdd"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>${t("ko_add")}</button>`)
    + `<section class="grid-2 reveal" style="--d:1">
        <article class="card">
          <header class="card-head"><div><h2 class="card-title">${t("ko_total")}</h2><p class="card-sub">${EXPENSES.length} ${LANG==="pl"?"pozycji":"items"}</p></div>
            <div class="ko-sum">${money(expTotal())}</div></header>
          <div id="koQuick" class="ko-quick" hidden></div>
          <div class="table-scroll"><table class="tbl"><thead><tr>
            <th>${t("th_cat")}</th><th>${LANG==="pl"?"Opis":"Description"}</th><th>${t("th_date")}</th><th class="num">${t("th_amount")}</th>
          </tr></thead><tbody id="koBody"></tbody></table></div>
        </article>
        <div class="side-col">
          <article class="card donut-card"><header class="card-head tight"><h2 class="card-title">${t("cost_title")}</h2></header>
            <div class="donut-wrap"><svg class="donut" viewBox="0 0 42 42" id="donut2"></svg><div class="donut-legend" id="donutLegend2"></div></div></article>
        </div>
      </section>`;
    koRenderRows(); paintDonut("#donut2", "#donutLegend2", costSegments());
    $("#koAdd").onclick = koToggleQuick;
  }

  // ---------- PODATKI ----------
  function renderPodatkiView() {
    const zusSoc = 1418.48, zusHealth = 227.99;
    const vatOut = 4132.00, vatIn = 892.00, vatDue = vatOut - vatIn;
    const pitBase = 12526.32, pitDue = Math.round(pitBase * 0.19 * 100) / 100;
    const cards = [
      { ic:`<path d="M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0"/>`, name:t("pod_zus"), due:"20.07.2026", amount:zusSoc+zusHealth, urg:"red",
        rows:[[t("pod_soc"),zusSoc],[t("pod_health"),zusHealth]] },
      { ic:`<path d="M3 10h18M6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"/>`, name:t("pod_vat"), due:"27.07.2026", amount:vatDue, urg:"amber",
        rows:[[t("pod_vat_out"),vatOut],[t("pod_vat_in"),-vatIn]] },
      { ic:`<path d="M12 3v18M7 7h10M7 17h10"/>`, name:t("pod_pit"), due:"22.07.2026", amount:pitDue, urg:"red",
        rows:[[t("pod_base"),pitBase],["× 19%",null]] },
    ];
    const cardsHTML = cards.map((c, i) => `<article class="card tax-big reveal" style="--d:${i+1}">
      <div class="tb-head"><span class="tb-ic u-${c.urg}"><svg viewBox="0 0 24 24">${c.ic}</svg></span>
        <div><h2 class="card-title">${c.name}</h2><p class="card-sub">${t("th_due")}: ${c.due}</p></div></div>
      <div class="tb-amt u-${c.urg}">${money(c.amount)}</div>
      <div class="tb-rows">${c.rows.map((r) => `<div class="tb-row"><span>${r[0]}</span>${r[1]!=null?`<b class="${r[1]<0?"u-green":""}">${money(r[1])}</b>`:""}</div>`).join("")}</div>
      <button class="btn btn-soft tb-pay">${t("pod_pay")}</button></article>`).join("");
    const monthly = [["ZUS","20."],["JPK_V7 (VAT)","25."],["Zaliczka PIT","20."]];
    $("#view-podatki").innerHTML = viewHead("nav_taxes", "v_podatki_sub")
      + `<section class="tax-grid">${cardsHTML}</section>
        <article class="card reveal" style="--d:4"><header class="card-head tight"><h2 class="card-title">${t("pod_year")}</h2></header>
          <ul class="rec-list">${monthly.map((m) => `<li><span class="rec-dot"></span><b>${m[0]}</b><span class="rec-day">${LANG==="pl"?"do":"by"} ${m[1]}</span></li>`).join("")}</ul>
        </article>`;
    $$("#view-podatki .tb-pay").forEach((b) => b.onclick = () => toast("ok", t("t_paid_t"), t("t_paid_d")));
  }

  // ---------- RAPORTY ----------
  function renderRaportyView() {
    const revYTD = CASHFLOW.reduce((s, m) => s + m.in, 0);
    const costYTD = CASHFLOW.reduce((s, m) => s + m.out, 0);
    const profit = revYTD - costYTD, tax = Math.round(profit * 0.19), net = profit - tax;
    const maxRev = Math.max(...CASHFLOW.map((m) => m.in));
    const revBars = CASHFLOW.map((m) => `<div class="rbar-row"><span class="rbar-lbl">${m.m[LANG==="pl"?0:1]}</span>
      <div class="rbar-track"><i style="width:${(m.in/maxRev*100).toFixed(0)}%"></i></div><b>${money(m.in,0)}</b></div>`).join("");
    const byCli = CLIENTS.map((c) => ({ c, v: INVOICES.filter((i) => i.client === c.key).reduce((s, i) => s + brutto(i), 0) }))
      .filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
    const maxCli = Math.max(...byCli.map((x) => x.v));
    const cliBars = byCli.map((x) => `<div class="rbar-row"><span class="rbar-lbl">${x.c.name}</span>
      <div class="rbar-track"><i style="width:${(x.v/maxCli*100).toFixed(0)}%;background:${x.c.color}"></i></div><b>${money(x.v,0)}</b></div>`).join("");
    const pl = [[t("pl_income"),revYTD,""],[t("pl_costs"),-costYTD,"u-red"],[t("pl_profit"),profit,""],[t("pl_tax"),-tax,"u-red"],[t("pl_net"),net,"u-green"]];
    $("#view-raporty").innerHTML = viewHead("nav_reports", "v_raporty_sub")
      + `<section class="grid-2 reveal" style="--d:1">
          <article class="card"><header class="card-head"><h2 class="card-title">${t("rap_rev")}</h2></header><div class="rbars">${revBars}</div></article>
          <article class="card"><header class="card-head"><h2 class="card-title">${t("rap_cli")}</h2></header><div class="rbars">${cliBars}</div></article>
        </section>
        <article class="card reveal" style="--d:2"><header class="card-head"><h2 class="card-title">${t("rap_pl")}</h2></header>
          <div class="pl-table">${pl.map((r, i) => `<div class="pl-row ${i>=2?"pl-strong":""} ${i===4?"pl-final":""}"><span>${r[0]}</span><b class="${r[2]}">${money(r[1],0)}</b></div>`).join("")}</div>
        </article>`;
  }

  // ---------- USTAWIENIA ----------
  const setField = (lbl, val, id, extra = "") => `<label class="field"><span class="field-lbl">${lbl}</span><input type="text" id="${id}" value="${val}" ${extra}/></label>`;
  function renderUstawieniaView() {
    $("#view-ustawienia").innerHTML = viewHead("nav_settings", "v_ustawienia_sub")
      + `<section class="grid-2 reveal" style="--d:1">
          <article class="card set-card"><header class="card-head tight"><h2 class="card-title">${t("set_company")}</h2></header>
            <div class="set-body">
              ${setField(t("set_company_name"),SETTINGS.companyName,"setCompany")}
              ${setField(t("set_nip"),SETTINGS.nip,"setNip")}
              ${setField(t("set_addr"),SETTINGS.address,"setAddr")}
              ${setField(t("set_num"),SETTINGS.numbering,"setNumbering")}
              <div class="field-row">${setField(t("set_defvat"),SETTINGS.defVat+"%","setVat")}${setField(t("set_defterm"),SETTINGS.defTerm+" dni","setTerm")}</div>
            </div></article>
          <div class="side-col">
            <article class="card set-card"><header class="card-head tight"><h2 class="card-title">${t("set_profile")}</h2></header>
              <div class="set-body"><div class="set-profile"><div class="avatar lg">MK</div><div class="sp-id"><strong id="setNamePreview">${SETTINGS.name}</strong><span>michal@kowalczyk.studio</span></div></div>
                ${setField(t("set_name"),SETTINGS.name,"setName")}</div></article>
            <article class="card set-card"><header class="card-head tight"><h2 class="card-title">${t("set_prefs")}</h2></header>
              <div class="set-body">
                <div class="set-row"><span>${t("set_theme")}</span><button class="seg" id="setTheme"><span class="seg-opt" data-th="dark">${t("set_dark")}</span><span class="seg-opt" data-th="light">${t("set_light")}</span></button></div>
                <div class="set-row"><span>${t("set_lang")}</span><button class="seg" id="setLang"><span class="seg-opt" data-l="pl">PL</span><span class="seg-opt" data-l="en">EN</span></button></div>
              </div></article>
            <article class="card set-card plan-card reveal"><div class="set-body plan-inner">
              <div><strong>${t("set_plan_name")}</strong><span class="plan-desc">${t("set_plan_desc")}</span></div>
              <button class="btn btn-primary" id="setUpgrade">${t("set_upgrade")}</button></div></article>
          </div>
        </section>
        <button class="btn btn-primary set-save" id="setSave"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>${t("set_save")}</button>`;
    $$("#setTheme .seg-opt").forEach((o) => o.classList.toggle("is-on", o.dataset.th === document.documentElement.dataset.theme));
    $$("#setLang .seg-opt").forEach((o) => o.classList.toggle("is-on", o.dataset.l === LANG));
    $("#setName").oninput = (e) => $("#setNamePreview").textContent = e.target.value || "—";
    $("#setTheme").onclick = () => { toggleTheme(); renderUstawieniaView(); };
    $("#setLang").onclick = toggleLang;
    $("#setUpgrade").onclick = () => toast("info", LANG==="pl"?"Plan Pro":"Pro plan", t("set_upgrade"));
    $("#setSave").onclick = () => {
      SETTINGS.companyName = $("#setCompany").value.trim() || SETTINGS.companyName;
      SETTINGS.nip = $("#setNip").value.trim();
      SETTINGS.address = $("#setAddr").value.trim();
      const num = $("#setNumbering").value.trim();
      SETTINGS.numbering = /NN/.test(num) ? num : SETTINGS.numbering;   // keep a valid pattern
      SETTINGS.defVat = ($("#setVat").value.match(/\d+/) || [SETTINGS.defVat])[0];
      SETTINGS.defTerm = ($("#setTerm").value.match(/\d+/) || [SETTINGS.defTerm])[0];
      SETTINGS.name = $("#setName").value.trim() || SETTINGS.name;
      // reflect name in sidebar
      const un = $("#userCard .user-meta strong"); if (un) un.textContent = SETTINGS.name;
      renderUstawieniaView();
      toast("ok", t("set_saved_t"), t("set_saved_d"));
    };
  }

  /* ---------------- view switch (nav) ---------------- */
  const viewRenderers = {
    faktury: renderFakturyView, klienci: renderKlienciView, koszty: renderKosztyView,
    podatki: renderPodatkiView, raporty: renderRaportyView, ustawienia: renderUstawieniaView,
  };
  let curView = "pulpit";
  function go(view) {
    curView = view;
    $$(".nav-item").forEach((n) => n.classList.toggle("is-active", n.dataset.view === view));
    const label = { pulpit:"nav_dashboard", faktury:"nav_invoices", klienci:"nav_clients",
      koszty:"nav_expenses", podatki:"nav_taxes", raporty:"nav_reports", ustawienia:"nav_settings" }[view];
    $("#crumbHere").textContent = t(label);
    $("#sidebar").classList.remove("is-open");
    $$(".view").forEach((v) => v.hidden = (v.id !== "view-" + view));
    if (viewRenderers[view]) viewRenderers[view]();
    $("#canvas").scrollTop = 0;
  }
  function refreshViews() {
    renderTable(); refreshFilterCounts(); syncOverdueChip();
    if (curView !== "pulpit" && viewRenderers[curView]) viewRenderers[curView]();
  }

  /* ---------------- theme + lang ---------------- */
  function toggleTheme() {
    const cur = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = cur === "dark" ? "light" : "dark";
    toast("info", t("t_theme_t"), document.documentElement.dataset.theme === "dark" ? "Dark" : "Light");
  }
  function toggleLang() {
    LANG = LANG === "pl" ? "en" : "pl";
    $$("#langToggle .seg-opt").forEach((o) => o.classList.toggle("is-on", o.dataset.lang === LANG));
    applyLang();
  }

  /* ---------------- init ---------------- */
  function init() {
    applyLang();
    $$(".kpi-val[data-count]").forEach(countUp);
    $$(".spark").forEach(buildSpark);
    renderChart(); chartReady = true; renderTaxes(); renderDonut();
    renderTable(); refreshFilterCounts(); syncOverdueChip();

    // topbar
    $("#newInvoiceBtn").onclick = openNewInvoice;
    $("#themeToggle").onclick = toggleTheme;
    $("#langToggle").onclick = toggleLang;
    $("#searchBtn").onclick = openCmdk;
    $("#bellBtn").onclick = () => toast("info", LANG==="pl"?"3 powiadomienia":"3 notifications", LANG==="pl"?"2 faktury po terminie · ZUS dziś":"2 invoices overdue · ZUS today");
    $("#burger").onclick = () => {
      if (window.innerWidth <= 900) $("#sidebar").classList.toggle("is-open");
      else $("#app").classList.toggle("nav-collapsed");
    };
    $("#sideCollapse").onclick = () => {
      if (window.innerWidth <= 900) $("#sidebar").classList.remove("is-open");
      else $("#app").classList.toggle("nav-collapsed");
    };
    $("#upgradeBtn").onclick = () => toast("info", LANG==="pl"?"Plan Pro":"Pro plan", LANG==="pl"?"Nielimitowane faktury · 39 zł/mies":"Unlimited invoices · 39 zł/mo");
    $("#userCard").onclick = () => toast("info", "Michał Kowalczyk", "JDG · NIP 894-XXX-XX-XX");
    /* #aboutLink now links to klarmint.com — no handler */

    // nav
    $$(".nav-item").forEach((n) => n.addEventListener("click", (e) => { e.preventDefault(); go(n.dataset.view); }));
    $$("[data-view='podatki'].link").forEach((a)=>a.addEventListener("click",(e)=>{e.preventDefault();go("podatki");}));
    $(".tax-card .link")?.addEventListener("click", (e)=>{ e.preventDefault(); go("podatki"); });

    // period → updates KPI figures + subtitle
    $$("#period .period-opt").forEach((b) => b.onclick = () => {
      $$("#period .period-opt").forEach((x) => x.classList.remove("is-on"));
      b.classList.add("is-on");
      applyPeriod(b.dataset.p);
    });

    // filters + sort
    $$("#filters .fpill").forEach((p) => p.onclick = () => {
      $$("#filters .fpill").forEach((x) => x.classList.remove("is-on"));
      p.classList.add("is-on"); curFilter = p.dataset.f; renderTable();
    });
    $$(".tbl th.sortable").forEach((th) => th.onclick = () => {
      const k = th.dataset.sort;
      if (sortKey === k) sortDir *= -1; else { sortKey = k; sortDir = 1; }
      $$(".tbl th.sortable").forEach((x) => x.classList.remove("sort-asc","sort-desc"));
      th.classList.add(sortDir === 1 ? "sort-asc" : "sort-desc");
      renderTable();
    });

    // drawers
    $$("[data-drawer-close]").forEach((b) => b.onclick = closeDrawers);
    $("#scrim").onclick = closeDrawers;
    $("#addItem").onclick = () => { items.push({ n:"", q:1, p:0 }); renderItems(); calcTotals(); };
    $("#fVat").onchange = calcTotals;
    $("#issueBtn").onclick = issueInvoice;

    // command palette — click on backdrop closes
    $("#cmdk").addEventListener("mousedown", (e) => { if (e.target === $("#cmdk")) closeCmdk(); });
    $("#cmdkInput").addEventListener("input", (e) => { cmdSel = 0; renderCmdk(e.target.value); });
    $("#cmdkInput").addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); cmdSel = Math.min(cmdSel+1, cmdFiltered.length-1); renderCmdk($("#cmdkInput").value); }
      else if (e.key === "ArrowUp") { e.preventDefault(); cmdSel = Math.max(cmdSel-1, 0); renderCmdk($("#cmdkInput").value); }
      else if (e.key === "Enter" && cmdFiltered[cmdSel]) { closeCmdk(); cmdFiltered[cmdSel].run(); }
    });

    // global keys
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#cmdk").hidden ? openCmdk() : closeCmdk(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") { e.preventDefault(); openNewInvoice(); }
      else if (e.key === "Escape") { closeCmdk(); closeDrawers(); }
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init) : init();
})();
