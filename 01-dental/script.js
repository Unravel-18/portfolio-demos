/* ===== Odra Dental — interactions ===== */
(function () {
  "use strict";

  /* ---------- i18n ---------- */
  const I18N = {
    nav_services:["Usługi","Services"], nav_doctors:["Lekarze","Doctors"],
    nav_prices:["Cennik","Prices"], nav_faq:["FAQ","FAQ"], nav_contact:["Kontakt","Contact"],
    nav_book:["Umów wizytę","Book now"],
    hero_eyebrow:["Stomatologia rodzinna · Wrocław, Krzyki","Family dentistry · Wrocław, Krzyki"],
    hero_title:["Twój dentysta na Krzykach. Bez czekania, bez stresu.","Your dentist in Wrocław. No waiting, no stress."],
    hero_sub:["Nowoczesna stomatologia dla całej rodziny. Umów wizytę online w 2 minuty — także wieczorem i w weekend.","Modern dental care for the whole family. Book online in 2 minutes — our team speaks English."],
    hero_cta1:["Umów wizytę online","Book an appointment"], hero_cta2:["Zobacz cennik","See prices"],
    hero_rating:["4,9 / 5 — 320+ opinii w Google","4.9 / 5 — 320+ Google reviews"],
    fc_book_t:["Rezerwacja online 24/7","Online booking 24/7"], fc_book_s:["Potwierdzenie e-mailem","Email confirmation"],
    fc_lang_t:["We speak English","We speak English"], fc_lang_s:["Expat-friendly clinic","Expat-friendly clinic"],
    trust_years:["lat doświadczenia","years of experience"], trust_docs:["lekarzy specjalistów","specialist dentists"],
    trust_lang:["obsługa po angielsku","English-speaking team"], trust_park:["parking przy klinice","parking at the clinic"],
    services_eyebrow:["Nasze usługi","Our services"], services_title:["Kompleksowa opieka pod jednym dachem","Complete care under one roof"],
    svc1_t:["Stomatologia zachowawcza","General dentistry"],
    svc1_d:["Leczenie próchnicy i kanałowe pod mikroskopem, bez bólu i w jednej wizycie, gdy to możliwe.","Cavity and root canal treatment under a microscope, pain-free and in a single visit whenever possible."],
    svc2_t:["Higienizacja i wybielanie","Hygiene & whitening"],
    svc2_d:["Profesjonalne czyszczenie i bezpieczne wybielanie, dzięki którym uśmiech wygląda zdrowo i naturalnie.","Professional cleaning and safe whitening for a smile that looks healthy and natural."],
    svc3_t:["Ortodoncja — nakładki","Clear aligners"],
    svc3_d:["Prostowanie zębów bez metalowego aparatu, z planem leczenia widocznym od pierwszej wizyty.","Straighten your teeth without metal braces, with a treatment plan you see from day one."],
    svc4_t:["Stomatologia dziecięca","Kids' dentistry"],
    svc4_d:["Pierwsze wizyty bez strachu: adaptacja, kolorowe wypełnienia i lekarze, którzy lubią dzieci.","First visits without fear: gentle adaptation and dentists who genuinely like kids."],
    from:["od","from"], book_short:["Umów →","Book →"],
    doctors_eyebrow:["Nasz zespół","Our team"], doctors_title:["Lekarze, do których wracasz","Dentists you come back to"],
    doc1_spec:["Stomatologia zachowawcza, endodoncja","General dentistry, endodontics"],
    doc2_spec:["Ortodoncja, nakładki przezroczyste","Orthodontics, clear aligners"],
    doc3_spec:["Stomatologia dziecięca","Pediatric dentistry"],
    doc4_spec:["Higiena, wybielanie, protetyka","Hygiene, whitening, prosthetics"],
    doc_kids:["👶 Przyjazna dzieciom","👶 Kid-friendly"],
    about_eyebrow:["O klinice","About us"],
    about_title:["Gabinet, do którego bez stresu przyprowadzisz dziecko","A clinic you can bring your kids to, stress-free"],
    about_p1:["Od 2013 roku leczymy rodziny z Krzyków i całego Wrocławia. Stawiamy na spokojne tempo, leczenie pod mikroskopem i jasne, uczciwe wyceny — zanim zaczniemy, wiesz dokładnie, ile i za co zapłacisz.","Since 2013 we've cared for families in Krzyki and across Wrocław. We work at a calm pace, treat under a microscope, and give clear, honest quotes — before we start, you know exactly what you'll pay and why."],
    about_l1:["Znieczulenie komputerowe — zabieg bez bólu i stresu","Computer-controlled anaesthesia — pain-free, stress-free treatment"],
    about_l2:["Nowoczesny sprzęt i sterylizacja klasy medycznej","Modern equipment and medical-grade sterilisation"],
    about_l3:["Zespół mówiący po polsku, angielsku i ukraińsku","A team speaking Polish, English and Ukrainian"],
    reviews_eyebrow:["Opinie pacjentów","Patient reviews"], reviews_title:["4,9 / 5 w Google — i wiemy dlaczego","4.9 / 5 on Google — and we know why"],
    rev1:["„Zapisałam siebie i syna wieczorem przez telefon, w 2 minuty. Bez dzwonienia i czekania na infolinię. Pani doktor cudownie podeszła do dziecka.”","“I booked myself and my son one evening, on my phone, in 2 minutes. No calling, no hold music. The dentist was wonderful with my child.”"],
    rev1_meta:["Wrocław · 2 tyg. temu","Wrocław · 2 weeks ago"],
    rev2:["„As an expat I was worried about the language — no issues at all. Booked online in English, the dentist explained everything clearly.”","“As an expat I was worried about the language — no issues at all. Booked online in English, the dentist explained everything clearly.”"],
    rev2_meta:["Wrocław · 1 mies. temu","Wrocław · 1 month ago"],
    rev3:["„Wreszcie gabinet, gdzie ceny są jasne od początku. Leczenie kanałowe pod mikroskopem, bez bólu. Polecam całą rodziną.”","“Finally a clinic where prices are clear from the start. Root canal under a microscope, painless. The whole family recommends it.”"],
    rev3_meta:["Wrocław · 3 tyg. temu","Wrocław · 3 weeks ago"],
    prices_eyebrow:["Cennik","Prices"], prices_title:["Przejrzyste ceny, bez ukrytych kosztów","Transparent prices, no hidden costs"],
    p1:["Konsultacja z przeglądem","Consultation with check-up"],
    p2:["Wypełnienie (leczenie próchnicy)","Filling (cavity treatment)"],
    p3:["Leczenie kanałowe pod mikroskopem","Root canal under a microscope"],
    p4:["Higienizacja (skaling + piaskowanie)","Hygiene (scaling + sandblasting)"],
    p5:["Wybielanie zębów","Teeth whitening"],
    p6:["Nakładki ortodontyczne (pełne leczenie)","Clear aligners (full treatment)"],
    p7:["Wizyta adaptacyjna dziecka","Child adaptation visit"],
    p8:["Przegląd kontrolny","Routine check-up"],
    price_note:["* Ostateczny koszt ustalamy po badaniu i przedstawiamy przed rozpoczęciem leczenia. Płatność gotówką, kartą lub BLIK.","* The final cost is set after examination and shown before treatment begins. Pay by cash, card or BLIK."],
    prices_cta:["Umów wizytę","Book now"],
    faq_eyebrow:["FAQ","FAQ"], faq_title:["Najczęstsze pytania","Frequently asked questions"],
    faq1_q:["Czy mogę umówić wizytę bez dzwonienia?","Can I book without calling?"],
    faq1_a:["Tak. Rezerwacja online działa 24/7 — wybierasz usługę, lekarza i termin, a potwierdzenie dostajesz e-mailem wraz z przypomnieniem na 24 godziny przed wizytą.","Yes. Online booking works 24/7 — pick a service, a dentist and a time, and get an email confirmation plus a reminder 24 hours before your visit."],
    faq2_q:["Ile kosztuje pierwsza wizyta?","How much is the first visit?"],
    faq2_a:["Konsultacja z przeglądem kosztuje 150 zł. Pełny cennik znajdziesz na stronie — bez ukrytych kosztów i niespodzianek.","A consultation with a check-up costs 150 PLN. The full price list is on our website — no hidden costs or surprises."],
    faq3_q:["Boję się dentysty. Co możecie zrobić?","I'm afraid of the dentist. What can you do?"],
    faq3_a:["Dużo. Znieczulenie komputerowe, spokojne tempo i możliwość przerwania zabiegu w każdej chwili. Napisz o lęku w uwagach do rezerwacji — przygotujemy się.","A lot. Computer-controlled anaesthesia, a calm pace and the option to pause at any moment. Mention your anxiety in the booking notes — we'll be ready."],
    faq4_q:["Czy przyjmujecie dzieci?","Do you treat children?"],
    faq4_a:["Tak, mamy osobny gabinet dziecięcy i lekarzy specjalizujących się w stomatologii dziecięcej. Pierwsza wizyta to spokojna adaptacja, bez leczenia na siłę.","Yes — we have a separate kids' room and dentists specialising in pediatric care. The first visit is a calm adaptation session, with no forced treatment."],
    contact_eyebrow:["Kontakt","Contact"], contact_title:["Odwiedź nas na Krzykach","Visit us in Krzyki"],
    ci_addr:["Adres","Address"], ci_hours:["Godziny","Hours"],
    ci_hours_v:["Pon–Pt 8:00–20:00 · Sob 9:00–14:00","Mon–Fri 8:00–20:00 · Sat 9:00–14:00"],
    ci_phone:["Telefon","Phone"], contact_cta:["Umów wizytę online","Book online"],
    footer_tag:["Nowoczesna stomatologia rodzinna we Wrocławiu.","Modern family dentistry in Wrocław."],
    footer_nav:["Nawigacja","Navigation"], footer_contact:["Kontakt","Contact"], footer_legal:["Informacje","Legal"],
    footer_privacy:["Polityka prywatności","Privacy policy"], footer_rodo:["RODO","GDPR"],
    footer_rights:["Wszelkie prawa zastrzeżone.","All rights reserved."],
    footer_credit:["Projekt i realizacja: Klarmint","Design & build: Klarmint"],
    mbb_sub:["online · 24/7","online · 24/7"],
    step1:["Usługa","Service"], step2:["Lekarz","Dentist"], step3:["Termin","Date"], step4:["Dane","Details"],
    b_step1_h:["Jaką usługę wybierasz?","What are you booking?"],
    b_dontknow:["Nie wiem / konsultacja","Not sure / consultation"],
    b_step2_h:["Wybierz lekarza","Choose a dentist"],
    b_step3_h:["Wybierz termin","Choose a date & time"],
    b_pick_day:["Wybierz dzień, aby zobaczyć wolne godziny.","Pick a day to see available times."],
    b_step4_h:["Twoje dane","Your details"],
    f_name:["Imię i nazwisko *","Full name *"], e_name:["Podaj imię i nazwisko.","Please enter your full name."],
    f_phone:["Telefon *","Phone *"], e_phone:["Podaj numer w formacie +48 600 000 000.","Enter a number like +48 600 000 000."],
    f_email:["E-mail *","Email *"], e_email:["Podaj poprawny adres e-mail.","Enter a valid email address."],
    f_first:["Czy to pierwsza wizyta? *","Is this your first visit? *"], f_yes:["Tak","Yes"], f_no:["Nie","No"],
    f_notes:["Uwagi (np. ból, lęk przed dentystą)","Notes (e.g. pain, dental anxiety)"],
    f_rodo:["Wyrażam zgodę na przetwarzanie danych w celu realizacji rezerwacji. *","I consent to my data being processed for this booking. *"],
    b_success_h:["Rezerwacja potwierdzona!","Booking confirmed!"],
    b_success_s:["Do zobaczenia 🦷 Szczegóły wysłaliśmy na Twój e-mail.","See you soon 🦷 We've emailed you the details."],
    b_ics:["Dodaj do kalendarza","Add to calendar"], b_close:["Wróć na stronę","Back to site"],
    b_back:["Wstecz","Back"], b_next:["Dalej","Next"], b_confirm:["Potwierdź rezerwację","Confirm booking"],
    b_cancel:["Zamknij","Close"],
    taken_h:["Ten termin został właśnie zajęty.","This slot was just taken."],
    taken_s:["Wybierz jeden z najbliższych wolnych terminów:","Pick one of the next available times:"],
    // dynamic
    any_doc:["Dowolny lekarz — najszybszy termin","Any dentist — earliest slot"],
    sum_service:["Usługa","Service"], sum_doctor:["Lekarz","Dentist"], sum_date:["Termin","Date & time"],
  };

  const SERVICE_LABELS = {
    zachowawcza:"svc1_t", higiena:"svc2_t", ortodoncja:"svc3_t", dziecieca:"svc4_t",
    konsultacja:"b_dontknow"
  };

  const DOCTORS = [
    {id:"ak",name:"dr Anna Kowalczyk",initials:"AK",spec:"doc1_spec",services:["zachowawcza","konsultacja"],en:true},
    {id:"mw",name:"dr Marek Wiśniewski",initials:"MW",spec:"doc2_spec",services:["ortodoncja","konsultacja"],en:true},
    {id:"jz",name:"dr Julia Zając",initials:"JZ",spec:"doc3_spec",services:["dziecieca","konsultacja"],en:false},
    {id:"pn",name:"dr Piotr Nowak",initials:"PN",spec:"doc4_spec",services:["higiena","konsultacja"],en:true},
  ];

  const $ = (s,c)=>(c||document).querySelector(s);
  const $$ = (s,c)=>Array.from((c||document).querySelectorAll(s));

  let lang = "pl";
  const t = (k)=> (I18N[k] ? I18N[k][lang==="en"?1:0] : k);

  function applyLang(){
    document.documentElement.lang = lang;
    document.body.setAttribute("data-lang",lang);
    $$("[data-i18n]").forEach(el=>{ const k=el.getAttribute("data-i18n"); if(I18N[k]) el.textContent=t(k); });
    // refresh dynamic bits if booking open
    if(state.step===2) renderDoctors();
    if(state.step>=3) { renderSummary($("#bookingSummary")); }
    updateFoot();
  }

  /* ---------- Header / nav ---------- */
  const header = $(".site-header");
  window.addEventListener("scroll",()=>{ header.classList.toggle("scrolled",window.scrollY>10); });
  $("#langToggle").addEventListener("click",()=>{ lang = lang==="pl"?"en":"pl"; applyLang(); });
  const burger = $("#burger");
  burger.addEventListener("click",()=>{
    const open = header.classList.toggle("nav-open");
    burger.setAttribute("aria-expanded",open);
  });
  $$(".main-nav a").forEach(a=>a.addEventListener("click",()=>header.classList.remove("nav-open")));

  /* ---------- Scroll reveal ---------- */
  $$(".section, .trust, .hero-visual").forEach(el=>el.classList.add("reveal"));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
  },{threshold:.12});
  $$(".reveal").forEach(el=>io.observe(el));

  /* ---------- Booking state ---------- */
  const state = { step:1, service:null, doctor:null, date:null, time:null, first:"yes", raceShown:false };
  const overlay = $("#booking");
  const fill = $("#bpFill");
  const btnNext = $("#btnNext");
  const btnBack = $("#btnBack");
  const foot = $("#bookingFoot");

  function openBooking(preselect){
    resetBooking();
    if(preselect){ state.service=preselect; markSelected("#serviceChoices",preselect); goStep(2); }
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden","false");
    document.body.classList.add("no-scroll");
  }
  function closeBooking(){
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden","true");
    document.body.classList.remove("no-scroll");
  }
  function resetBooking(){
    Object.assign(state,{step:1,service:null,doctor:null,date:null,time:null,first:"yes",raceShown:false});
    $$(".choice.is-selected").forEach(c=>c.classList.remove("is-selected"));
    $("#bookingForm").reset();
    $$(".field.has-error").forEach(f=>f.classList.remove("has-error"));
    $$(".tg-opt").forEach((o,i)=>o.classList.toggle("is-active",i===0));
    foot.classList.remove("hidden");
    showPanel("1");
    updateProgress();
  }

  function showPanel(name){
    $$(".booking-step").forEach(p=>p.classList.toggle("is-active",p.getAttribute("data-panel")===name));
  }
  function updateProgress(){
    const pct = {1:25,2:50,3:75,4:100}[state.step]||100;
    fill.style.width = pct+"%";
    $$(".bp-step").forEach(s=>{
      const n=+s.getAttribute("data-step");
      s.classList.toggle("is-active",n===state.step);
      s.classList.toggle("is-done",n<state.step);
    });
  }
  function updateFoot(){
    btnBack.classList.toggle("show",state.step>1);
    btnNext.textContent = state.step===4 ? t("b_confirm") : t("b_next");
    let ok=false;
    if(state.step===1) ok=!!state.service;
    else if(state.step===2) ok=!!state.doctor;
    else if(state.step===3) ok=!!(state.date&&state.time);
    else ok=true;
    btnNext.disabled=!ok;
  }
  function goStep(n){
    state.step=n;
    showPanel(String(n));
    if(n===2) renderDoctors();
    if(n===3) { renderCalendar(); }
    if(n===4) renderSummary($("#bookingSummary"));
    updateProgress(); updateFoot();
    $(".booking-body").scrollTop=0;
  }

  /* ---------- Step 1: service ---------- */
  function markSelected(container,val){
    $$(".choice",$(container)).forEach(c=>c.classList.toggle("is-selected",c.getAttribute("data-value")===val));
  }
  $$("#serviceChoices .choice").forEach(c=>{
    c.addEventListener("click",()=>{
      state.service=c.getAttribute("data-value");
      markSelected("#serviceChoices",state.service);
      updateFoot();
    });
  });

  /* ---------- Step 2: doctors ---------- */
  function renderDoctors(){
    const wrap=$("#doctorChoices"); wrap.innerHTML="";
    const list=DOCTORS.filter(d=>!state.service||d.services.includes(state.service));
    const pool=list.length?list:DOCTORS;
    // Any doctor option
    const any=document.createElement("button");
    any.className="choice choice-doc choice--wide"+(state.doctor==="any"?" is-selected":"");
    any.innerHTML=`<span class="cd-avatar">★</span><span class="cd-meta"><strong>${t("any_doc")}</strong></span>`;
    any.addEventListener("click",()=>selectDoctor("any"));
    wrap.appendChild(any);
    pool.forEach(d=>{
      const b=document.createElement("button");
      b.className="choice choice-doc"+(state.doctor===d.id?" is-selected":"");
      b.innerHTML=`<span class="cd-avatar">${d.initials}</span><span class="cd-meta"><strong>${d.name}</strong><span>${t(d.spec)}</span>${d.en?'<span class="cd-en">🇬🇧 Speaks English</span>':''}</span>`;
      b.addEventListener("click",()=>selectDoctor(d.id));
      wrap.appendChild(b);
    });
  }
  function selectDoctor(id){
    state.doctor=id;
    $$("#doctorChoices .choice").forEach(c=>c.classList.remove("is-selected"));
    renderDoctors(); updateFoot();
  }

  /* ---------- Step 3: calendar + slots ---------- */
  const SLOT_POOL=["09:00","10:30","12:00","14:00","15:30","17:00","18:30"];
  // deterministic pseudo-random from a seed
  function seeded(n){ let x=Math.sin(n)*10000; return x-Math.floor(x); }
  function daySlots(d){
    const seed=d.getFullYear()*372+ (d.getMonth()+1)*31 + d.getDate();
    if(d.getDay()===0) return []; // Sunday closed
    return SLOT_POOL.filter((_,i)=> seeded(seed+i*7) > 0.42);
  }
  function renderCalendar(){
    const cal=$("#calendar"); cal.innerHTML="";
    const dows = lang==="en"?["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]:["Pon","Wt","Śr","Czw","Pt","Sob","Nd"];
    dows.forEach(x=>{ const el=document.createElement("div"); el.className="cal-dow"; el.textContent=x; cal.appendChild(el); });
    const today=new Date(); today.setHours(0,0,0,0);
    const start=new Date(today);
    // leading blanks (Mon-first)
    let lead=(start.getDay()+6)%7;
    for(let i=0;i<lead;i++){ const e=document.createElement("div"); e.className="cal-empty"; cal.appendChild(e); }
    for(let i=0;i<14;i++){
      const d=new Date(today); d.setDate(today.getDate()+i);
      const btn=document.createElement("button");
      btn.className="cal-day"; btn.type="button";
      const free=daySlots(d).length;
      const label=d.getDate();
      btn.innerHTML=`${label}${free?`<small>${free} ${lang==="en"?"free":"wolne"}</small>`:""}`;
      if(!free){ btn.disabled=true; }
      else{
        btn.addEventListener("click",()=>{
          state.date=d; state.time=null;
          $$(".cal-day").forEach(x=>x.classList.remove("is-selected"));
          btn.classList.add("is-selected");
          renderSlots(d); updateFoot();
        });
      }
      if(state.date && d.toDateString()===state.date.toDateString()) btn.classList.add("is-selected");
      cal.appendChild(btn);
    }
    if(state.date) renderSlots(state.date); else $("#slots").innerHTML=`<p class="slots-hint">${t("b_pick_day")}</p>`;
  }
  function renderSlots(d){
    const box=$("#slots"); box.innerHTML="";
    daySlots(d).forEach(time=>{
      const s=document.createElement("button"); s.type="button"; s.className="slot";
      s.textContent=time;
      if(state.time===time) s.classList.add("is-selected");
      s.addEventListener("click",()=>{
        state.time=time;
        $$(".slot").forEach(x=>x.classList.remove("is-selected"));
        s.classList.add("is-selected"); updateFoot();
      });
      box.appendChild(s);
    });
  }

  /* ---------- Summary ---------- */
  function fmtDate(d){
    if(!d) return "—";
    return d.toLocaleDateString(lang==="en"?"en-GB":"pl-PL",{weekday:"long",day:"numeric",month:"long"});
  }
  function serviceName(){ return state.service? t(SERVICE_LABELS[state.service]) : "—"; }
  function doctorName(){
    if(state.doctor==="any") return t("any_doc");
    const d=DOCTORS.find(x=>x.id===state.doctor); return d?d.name:"—";
  }
  function renderSummary(box){
    if(!box) return;
    box.innerHTML=`
      <div class="bs-row"><span>${t("sum_service")}</span><span>${serviceName()}</span></div>
      <div class="bs-row"><span>${t("sum_doctor")}</span><span>${doctorName()}</span></div>
      <div class="bs-row"><span>${t("sum_date")}</span><span>${fmtDate(state.date)}${state.time?`, ${state.time}`:""}</span></div>`;
  }

  /* ---------- Step 4: first visit toggle ---------- */
  $$("#firstVisit .tg-opt").forEach(o=>{
    o.addEventListener("click",()=>{
      $$("#firstVisit .tg-opt").forEach(x=>x.classList.remove("is-active"));
      o.classList.add("is-active"); state.first=o.getAttribute("data-value");
    });
  });

  /* ---------- Validation ---------- */
  function validateForm(){
    const form=$("#bookingForm"); let ok=true;
    const setErr=(field,bad)=>{ field.classList.toggle("has-error",bad); if(bad) ok=false; };
    const name=form.name.value.trim();
    setErr(form.name.closest(".field"), name.length<3);
    const phone=form.phone.value.trim();
    setErr(form.phone.closest(".field"), !/^\+?\d[\d\s]{7,}$/.test(phone));
    const email=form.email.value.trim();
    setErr(form.email.closest(".field"), !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    const rodo=form.rodo.checked;
    form.rodo.closest(".checkbox").classList.toggle("has-error",!rodo);
    if(!rodo) ok=false;
    if(!ok){ const first=$(".has-error input"); if(first) first.focus(); }
    return ok;
  }

  /* ---------- Race condition ---------- */
  function altSlots(){
    const all=daySlots(state.date).filter(x=>x!==state.time);
    return all.slice(0,3);
  }
  function showTaken(){
    const modal=$("#takenModal"); const box=$("#takenSlots"); box.innerHTML="";
    const alts=altSlots();
    if(!alts.length){ // fallback: just proceed
      finalize(); return;
    }
    alts.forEach(time=>{
      const b=document.createElement("button"); b.className="btn btn-ghost"; b.textContent=`${fmtDate(state.date)}, ${time}`;
      b.addEventListener("click",()=>{
        state.time=time; modal.classList.remove("is-open"); modal.setAttribute("aria-hidden","true");
        finalize();
      });
      box.appendChild(b);
    });
    modal.classList.add("is-open"); modal.setAttribute("aria-hidden","false");
  }

  function finalize(){
    renderSummary($("#successSummary"));
    showPanel("success");
    foot.classList.add("hidden");
    fill.style.width="100%";
  }

  /* ---------- Nav buttons ---------- */
  btnNext.addEventListener("click",()=>{
    if(state.step<4){ goStep(state.step+1); return; }
    // step 4 -> confirm
    if(!validateForm()) return;
    if(!state.raceShown && seeded(state.date.getDate()+ (state.time?state.time.length:0)*3 + 1)>0.55){
      state.raceShown=true; showTaken(); return;
    }
    finalize();
  });
  btnBack.addEventListener("click",()=>{ if(state.step>1) goStep(state.step-1); });

  /* ---------- ICS download ---------- */
  $("#icsBtn").addEventListener("click",()=>{
    if(!state.date||!state.time) return;
    const [h,m]=state.time.split(":");
    const dt=new Date(state.date); dt.setHours(+h,+m,0,0);
    const end=new Date(dt); end.setMinutes(end.getMinutes()+30);
    const fmt=x=>x.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
    const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Odra Dental//Booking//PL","BEGIN:VEVENT",
      "UID:"+Date.now()+"@odradental.pl","DTSTAMP:"+fmt(new Date()),"DTSTART:"+fmt(dt),"DTEND:"+fmt(end),
      "SUMMARY:Odra Dental — "+serviceName(),
      "LOCATION:ul. Powstańców Śląskich 95, Wrocław",
      "DESCRIPTION:"+doctorName(),"END:VEVENT","END:VCALENDAR"].join("\r\n");
    const blob=new Blob([ics],{type:"text/calendar"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="odra-dental.ics"; a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ---------- Open/close wiring ---------- */
  $$("[data-book-open]").forEach(b=>b.addEventListener("click",()=>openBooking(b.getAttribute("data-preselect"))));
  $$("[data-book-close]").forEach(b=>b.addEventListener("click",closeBooking));
  overlay.addEventListener("click",e=>{ if(e.target===overlay) closeBooking(); });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&overlay.classList.contains("is-open")) closeBooking(); });

  /* ---------- init ---------- */
  applyLang();
})();
