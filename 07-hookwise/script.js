/* ============================================================
   Hookwise — interactive demo logic (vanilla, 0 dependencies)
   1. Hero event ticker
   2. Delivery Simulator  (WOW #1)
   3. Build-vs-buy calculator (WOW #2)
   4. DX code tabs + copy
   ============================================================ */
(function () {
  "use strict";
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, "0");
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

  /* ---------------------------------------------------------
     1. HERO TICKER
     --------------------------------------------------------- */
  (function ticker() {
    const el = $("#ticker");
    if (!el) return;
    const EVENTS = ["invoice.paid", "user.created", "payment.failed", "order.shipped",
      "subscription.renewed", "refund.issued", "checkout.completed", "ticket.updated"];
    const hex = () => Math.floor(Math.random() * 16).toString(16);
    const id = () => "evt_" + Array.from({ length: 6 }, hex).join("");
    const ms = () => (60 + Math.floor(Math.random() * 240)) + "ms";
    const MAX = 6;

    function row() {
      const li = document.createElement("li");
      li.innerHTML =
        '<span class="t-id">' + id() + '</span>' +
        '<span class="t-ev">' + EVENTS[Math.floor(Math.random() * EVENTS.length)] + '</span>' +
        '<span class="t-ok">→ 200 · ' + ms() + '</span>';
      return li;
    }
    // seed
    for (let i = 0; i < MAX; i++) el.appendChild(row());
    if (REDUCED) return; // static list, no looping
    setInterval(function () {
      el.appendChild(row());
      while (el.children.length > MAX) el.removeChild(el.firstChild);
    }, 1900);
  })();

  /* ---------------------------------------------------------
     2. DELIVERY SIMULATOR
     --------------------------------------------------------- */
  (function simulator() {
    const sendBtn = $("#simSend");
    if (!sendBtn) return;
    const resetBtn = $("#simReset");
    const logEl = $("#simLog");
    const metaEl = $("#simMeta");
    const packet = $("#simPacket");
    const stations = { source: $('[data-station="source"]'), queue: $('[data-station="queue"]'), dest: $('[data-station="dest"]') };
    const retryBadge = $("#simRetry");
    const retryN = $("#simRetryN");
    const retryT = $("#simRetryT");
    const doneBadge = $("#simDone");
    const outcome = $("#simOutcome");
    const outcomeTitle = $("#outcomeTitle");
    const outcomeSub = $("#outcomeSub");

    // nominal backoff shown to the user (real product cadence)
    const BACKOFF = ["30s", "2m", "10m", "1h", "6h"];
    // deterministic attempt scripts per scenario
    const SCENARIOS = {
      ok:      { attempts: [{ ok: true, code: 200, ms: 141 }] },
      down:    { attempts: [{ err: "ECONNREFUSED" }, { err: "ECONNREFUSED" }, { ok: true, code: 200, ms: 128 }] },
      timeout: { attempts: [{ err: "ETIMEDOUT", code: 504 }, { ok: true, code: 200, ms: 173 }] },
      burst:   { attempts: [{ code: 503 }, { code: 500 }, { code: 503 }, { ok: true, code: 200, ms: 156 }] },
    };
    const STEP = REDUCED ? 0 : 1000;   // ms between visual steps
    let timers = [];
    let clock;

    function schedule(fn, delay) { timers.push(setTimeout(fn, delay)); }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function tstamp() {
      const h = pad(clock.h), m = pad(clock.m), s = pad(clock.s);
      clock.s += 2 + Math.floor(Math.random() * 3);
      if (clock.s >= 60) { clock.s -= 60; clock.m++; }
      if (clock.m >= 60) { clock.m -= 60; clock.h++; }
      return h + ":" + m + ":" + s;
    }

    function log(bodyHTML, cls) {
      const li = document.createElement("div");
      li.innerHTML = '<span class="lg-t">' + tstamp() + '</span>' +
        '<span class="lg-body ' + (cls || "") + '">' + bodyHTML + '</span>';
      logEl.appendChild(li);
      logEl.scrollTop = logEl.scrollHeight;
    }

    function setStations(state) {
      Object.values(stations).forEach((s) => s && s.classList.remove("is-active", "is-fail", "is-done"));
      if (state.source) stations.source.classList.add(state.source);
      if (state.queue) stations.queue.classList.add(state.queue);
      if (state.dest) stations.dest.classList.add(state.dest);
    }
    function movePacket(pos, fail) {
      packet.classList.add("is-visible");
      packet.classList.toggle("is-fail", !!fail);
      packet.style.left = pos + "%";
    }

    function resetVisual() {
      clearTimers();
      logEl.innerHTML = "";
      setStations({});
      packet.className = "sim-packet";
      packet.style.left = "0%";
      retryBadge.hidden = true;
      doneBadge.hidden = true;
      outcome.hidden = true;
      metaEl.textContent = "idle";
    }

    function run(key) {
      resetVisual();
      clock = { h: 14, m: 2, s: 7 };
      const scenario = SCENARIOS[key];
      const attempts = scenario.attempts;
      const total = attempts.length;
      sendBtn.disabled = true;
      resetBtn.hidden = true;
      metaEl.textContent = "running…";

      // intro: app -> queue
      let t = 0;
      schedule(() => { setStations({ source: "is-active" }); movePacket(3); log("POST /v1/events → 202 <span class=\"lg-ok\">accepted</span> · queued", ""); }, t += STEP * 0.2);
      schedule(() => { setStations({ source: "is-done", queue: "is-active" }); movePacket(50); log("event signed <span class=\"lg-body\">HMAC-SHA256</span> · idempotency evt_8f2c1a", ""); }, t += STEP * 0.7);

      attempts.forEach((att, i) => {
        const attemptNo = i + 1;
        const last = i === total - 1;
        // deliver attempt: queue -> dest
        schedule(() => {
          setStations({ source: "is-done", queue: "is-done", dest: "is-active" });
          movePacket(97, false);
          metaEl.textContent = "attempt " + attemptNo + "/" + total;
        }, t += STEP);

        if (att.ok) {
          schedule(() => {
            setStations({ source: "is-done", queue: "is-done", dest: "is-done" });
            movePacket(97, false);
            log("POST /hooks → <span class=\"lg-ok\">" + att.code + " OK</span> · " + att.ms + "ms · attempt " + attemptNo, "");
            finish(total);
          }, t += STEP * 0.55);
        } else {
          const label = att.err ? att.err : att.code;
          const nice = att.err ? att.err + (att.code ? " (" + att.code + ")" : "") : att.code + " Server Error";
          const backoff = BACKOFF[i] || "6h";
          schedule(() => {
            setStations({ source: "is-done", queue: "is-active", dest: "is-fail" });
            movePacket(50, true);   // bounce back to queue
            log("POST /hooks → <span class=\"lg-err\">" + nice + "</span> · attempt " + attemptNo +
              " · <span class=\"lg-warn\">retry in " + backoff + "</span>", "");
            retryBadge.hidden = false;
            retryN.textContent = attemptNo + "/" + total;
            retryT.textContent = backoff;
          }, t += STEP * 0.55);
        }
      });
    }

    function finish(total) {
      retryBadge.hidden = true;
      doneBadge.hidden = false;
      metaEl.textContent = "done";
      outcome.hidden = false;
      outcomeTitle.textContent = total === 1 ? "Delivered first try" : "Delivered after retry";
      outcomeSub.textContent = "0 events lost · " + total + (total === 1 ? " attempt" : " attempts");
      sendBtn.disabled = false;
      resetBtn.hidden = false;
    }

    sendBtn.addEventListener("click", function () {
      const key = ($('input[name="scenario"]:checked') || {}).value || "down";
      run(key);
    });
    resetBtn.addEventListener("click", resetVisual);
  })();

  /* ---------------------------------------------------------
     3. BUILD-VS-BUY CALCULATOR
     --------------------------------------------------------- */
  (function calculator() {
    const evEl = $("#calcEvents");
    if (!evEl) return;
    const rateEl = $("#calcRate");
    const evOut = $("#calcEventsOut");
    const rateOut = $("#calcRateOut");
    const diyEl = $("#calcDiy");
    const usEl = $("#calcUs");
    const tierEl = $("#calcTier");
    const saveEl = $("#calcSave");

    const EV_MIN = 10000, EV_MAX = 5000000;
    // slider 0..100 -> log scale events
    function events() {
      const v = Number(evEl.value) / 100;
      return Math.round(EV_MIN * Math.pow(EV_MAX / EV_MIN, v));
    }
    function fmtEvents(n) {
      if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + "M";
      return n.toLocaleString("en-US");
    }
    // Hookwise monthly price (illustrative)
    function usPrice(ev) {
      if (ev <= 50000) return { price: 0, tier: "Free tier" };
      if (ev <= 1000000) return { price: 49, tier: "Growth plan" };
      const extra = Math.ceil((ev - 1000000) / 1000000);
      return { price: 49 + extra * 40, tier: "Scale plan" };
    }
    // DIY monthly cost: build 120h amortized /12mo + 6h/mo upkeep + infra scaling
    function diyPrice(ev, rate) {
      const buildAmortized = (120 * rate) / 12;
      const upkeep = 6 * rate;
      const infra = (ev / 1e6) * 120;
      return buildAmortized + upkeep + infra;
    }

    let raf = 0;
    function animateVal(el, to) {
      if (REDUCED) { el.textContent = money(to); return; }
      const from = Number(String(el.dataset.v || 0));
      const start = performance.now(), dur = 420;
      function frame(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = from + (to - from) * eased;
        el.textContent = money(val);
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      el.dataset.v = to;
    }

    function render() {
      const ev = events();
      const rate = Number(rateEl.value) || 0;
      evOut.textContent = fmtEvents(ev) + " events";
      rateOut.textContent = "$" + rate + "/h";

      const us = usPrice(ev);
      const diy = diyPrice(ev, rate);
      // NaN-safety
      const usP = isFinite(us.price) ? us.price : 0;
      const diyP = isFinite(diy) ? diy : 0;

      animateVal(usEl, usP);
      animateVal(diyEl, diyP);
      tierEl.textContent = us.tier + (usP === 0 ? "" : " · " + money(usP) + "/mo");

      const save = diyP - usP;
      if (save > 5) {
        saveEl.textContent = "You save ≈ " + money(save) + "/mo — and one on-call rotation.";
        saveEl.style.color = "var(--ok)";
      } else {
        saveEl.textContent = "About even on cost — but you skip weeks of building and the pager.";
        saveEl.style.color = "var(--ink-2)";
      }
    }

    evEl.addEventListener("input", render);
    rateEl.addEventListener("input", render);
    render();
  })();

  /* ---------------------------------------------------------
     4. DX CODE TABS + COPY
     --------------------------------------------------------- */
  (function codeTabs() {
    const block = $("#codeBlock");
    if (!block) return;
    const code = block.querySelector("code");
    const copyBtn = $("#codeCopy");
    const tabs = $$(".code-tab");

    const SNIPPETS = {
      curl: {
        text:
`curl -X POST https://api.hookwise.dev/v1/events \\
  -H "Authorization: Bearer $HOOKWISE_KEY" \\
  -H "Idempotency-Key: evt_8f2c1a" \\
  -d '{
    "destination": "https://acme.com/webhooks",
    "event": "invoice.paid",
    "data": { "id": "in_9021", "amount": 4900 }
  }'`,
        html:
`<span class="tok-fn">curl</span> -X POST <span class="tok-str">https://api.hookwise.dev/v1/events</span> \\
  -H <span class="tok-str">"Authorization: Bearer $HOOKWISE_KEY"</span> \\
  -H <span class="tok-str">"Idempotency-Key: evt_8f2c1a"</span> \\
  -d <span class="tok-str">'{
    "destination": "https://acme.com/webhooks",
    "event": "invoice.paid",
    "data": { "id": "in_9021", "amount": 4900 }
  }'</span>`
      },
      node: {
        text:
`import { Hookwise } from "hookwise";

const hw = new Hookwise(process.env.HOOKWISE_KEY);

await hw.events.send({
  destination: "https://acme.com/webhooks",
  event: "invoice.paid",
  idempotencyKey: "evt_8f2c1a",
  data: { id: "in_9021", amount: 4900 },
});
// -> { id: "evt_8f2c1a", status: "queued" }`,
        html:
`<span class="tok-key">import</span> { Hookwise } <span class="tok-key">from</span> <span class="tok-str">"hookwise"</span>;

<span class="tok-key">const</span> hw = <span class="tok-key">new</span> <span class="tok-fn">Hookwise</span>(process.env.HOOKWISE_KEY);

<span class="tok-key">await</span> hw.events.<span class="tok-fn">send</span>({
  destination: <span class="tok-str">"https://acme.com/webhooks"</span>,
  event: <span class="tok-str">"invoice.paid"</span>,
  idempotencyKey: <span class="tok-str">"evt_8f2c1a"</span>,
  data: { id: <span class="tok-str">"in_9021"</span>, amount: <span class="tok-str">4900</span> },
});
<span class="tok-cm">// -> { id: "evt_8f2c1a", status: "queued" }</span>`
      },
      python: {
        text:
`import hookwise, os

hw = hookwise.Client(os.environ["HOOKWISE_KEY"])

hw.events.send(
    destination="https://acme.com/webhooks",
    event="invoice.paid",
    idempotency_key="evt_8f2c1a",
    data={"id": "in_9021", "amount": 4900},
)
# -> {"id": "evt_8f2c1a", "status": "queued"}`,
        html:
`<span class="tok-key">import</span> hookwise, os

hw = hookwise.<span class="tok-fn">Client</span>(os.environ[<span class="tok-str">"HOOKWISE_KEY"</span>])

hw.events.<span class="tok-fn">send</span>(
    destination=<span class="tok-str">"https://acme.com/webhooks"</span>,
    event=<span class="tok-str">"invoice.paid"</span>,
    idempotency_key=<span class="tok-str">"evt_8f2c1a"</span>,
    data={<span class="tok-str">"id"</span>: <span class="tok-str">"in_9021"</span>, <span class="tok-str">"amount"</span>: <span class="tok-str">4900</span>},
)
<span class="tok-cm"># -> {"id": "evt_8f2c1a", "status": "queued"}</span>`
      }
    };

    let current = "curl";
    function show(lang) {
      current = lang;
      code.innerHTML = SNIPPETS[lang].html;
      tabs.forEach((t) => {
        const on = t.dataset.lang === lang;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-pressed", on ? "true" : "false");
      });
      copyBtn.classList.remove("is-copied");
      copyBtn.textContent = "Copy";
    }
    tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.lang)));

    copyBtn.addEventListener("click", function () {
      const text = SNIPPETS[current].text;
      const done = () => { copyBtn.textContent = "Copied ✓"; copyBtn.classList.add("is-copied");
        setTimeout(() => { copyBtn.textContent = "Copy"; copyBtn.classList.remove("is-copied"); }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else { fallback(); }
      function fallback() {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });

    show("curl");
  })();
})();
