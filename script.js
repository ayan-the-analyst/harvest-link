/* =========================================================
   Harvest-Link website
   EDIT HERE: your WhatsApp Business number, country code first,
   digits only (e.g. 919876543210 for +91 98765 43210).
   ========================================================= */
const WHATSAPP_NUMBER = "919999999999";

const WA_TEXT = {
  general: "Hi Harvest-Link, I'd like to know more.",
  farmer: "Hi Harvest-Link, I am a farmer and I want to sell my vegetables.",
  store: "Hi Harvest-Link, I run a kirana store and I want to order vegetables.",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rupees = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

/* ---------- Role: "Who are you?" drives the whole page ---------- */
let role = "farmer";
try { role = localStorage.getItem("hl-role") || "farmer"; } catch (e) {}

function setRole(next, replay = true) {
  role = next === "store" ? "store" : "farmer";
  document.body.dataset.role = role;
  $$("[data-role-btn]").forEach((b) => {
    const on = b.dataset.roleBtn === role;
    if (b.getAttribute("role") === "radio") b.setAttribute("aria-checked", on);
    else b.setAttribute("aria-pressed", on);
  });
  try { localStorage.setItem("hl-role", role); } catch (e) {}
  updateWaLinks();
  updateCalc();
  if (replay) playChat();
}
$$("[data-role-btn]").forEach((b) => b.addEventListener("click", () => setRole(b.dataset.roleBtn)));

// arrow keys move between the two role radio buttons
$(".role-switch").addEventListener("keydown", (e) => {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
  e.preventDefault();
  setRole(role === "farmer" ? "store" : "farmer");
  $(`.role-btn[data-role-btn="${role}"]`).focus();
});

/* ---------- WhatsApp links ---------- */
function updateWaLinks() {
  $$(".js-wa").forEach((a) => {
    const kind = a.dataset.wa === "role" ? role : a.dataset.wa;
    a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WA_TEXT[kind] || WA_TEXT.general)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });
}

/* ---------- Hero chat demo ---------- */
const CHATS = {
  farmer: [
    { from: "in", t: "5:02 AM", html: "Namaskara! Today we are buying tomato, onion and beans. Send a photo of your harvest and the quantity." },
    { from: "out", t: "5:06 AM", html: '<div class="photo" role="img" aria-label="Photo of tomatoes"></div>50 kg tomato' },
    { from: "in", t: "5:07 AM", html: "Good quality! Price today: <b>₹26/kg</b> = ₹1,300.<br>After our 2% fee you get <b>₹1,274</b>.<br>Pickup at 6:00 AM from your village point. Confirm?" },
    { from: "out", t: "5:07 AM", html: "Yes, confirm" },
    { from: "in", t: "5:08 AM", html: "Confirmed ✅ The money reaches your bank within 24 hours of pickup." },
  ],
  store: [
    { from: "in", t: "4:45 AM", html: "Good morning, Ravi! Today's fresh list:<br>Tomato ₹28 · Onion ₹24 · Beans ₹40 (per kg)" },
    { from: "out", t: "5:20 AM", html: "10 kg onion, 5 kg tomato" },
    { from: "in", t: "5:20 AM", html: 'Your order:<table class="bill"><tr><td>Vegetables</td><td>₹380</td></tr><tr><td>Delivery (15 kg × ₹3)</td><td>₹45</td></tr><tr><td>Service fee 2%</td><td>₹8</td></tr><tr><td>Total</td><td>₹433</td></tr></table>Pay by UPI?' },
    { from: "out", t: "5:21 AM", html: "Paid ₹433" },
    { from: "in", t: "5:21 AM", html: "Thank you! Your vegetables reach the shop before 7:00 AM 🚚" },
  ],
};

const chatEl = $("#chat");
const replayBtn = $("#replay");
const statusEl = $(".chat-status");
let chatRun = 0;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function bubble(m) {
  const li = document.createElement("li");
  li.className = "msg" + (m.from === "out" ? " out" : "");
  li.innerHTML = `${m.html}<span class="time">${m.t}</span>`;
  return li;
}

async function playChat() {
  const run = ++chatRun;
  chatEl.innerHTML = "";
  replayBtn.classList.remove("show");
  const script = CHATS[role];
  if (reduceMotion) {
    script.forEach((m) => chatEl.appendChild(bubble(m)));
    replayBtn.classList.add("show");
    return;
  }
  await wait(400);
  for (const m of script) {
    if (run !== chatRun) return;
    if (m.from === "in") {
      const t = document.createElement("li");
      t.className = "typing";
      t.setAttribute("aria-hidden", "true");
      t.innerHTML = "<span></span><span></span><span></span>";
      chatEl.appendChild(t);
      statusEl.textContent = "typing…";
      await wait(1100);
      if (run !== chatRun) return;
      t.remove();
      statusEl.textContent = "online";
    } else {
      await wait(900);
      if (run !== chatRun) return;
    }
    chatEl.appendChild(bubble(m));
    chatEl.scrollTop = chatEl.scrollHeight;
    await wait(500);
  }
  if (run === chatRun) replayBtn.classList.add("show");
}
replayBtn.addEventListener("click", playChat);

/* ---------- Morning slider ---------- */
const STOPS = [
  { p: 0, time: "4:30 AM", title: "Prices go out", text: "Stores get the day's price list on WhatsApp. Farmers get today's buying price and reply with a photo of their harvest." },
  { p: 30, time: "5:15 AM", title: "Orders come in", text: "Kirana stores reply with what they need and pay by UPI. Farmers get a confirmed price for their produce." },
  { p: 60, time: "6:00 AM", title: "Pickup at the village", text: "Our logistics partner collects from the village pickup point. Every crate is weighed and quality-checked." },
  { p: 80, time: "6:30 AM", title: "On the road", text: "Orders are sorted shop by shop and loaded for delivery across the city." },
  { p: 100, time: "7:00 AM", title: "At your shop", text: "Fresh vegetables arrive before the shutter goes up. The farmer's money is on its way, in the bank within 24 hours." },
];
const range = $("#clock-range");
const road = $("#road");
const van = $("#van");
const roadLen = road.getTotalLength();
const stopsEl = $("#clock-stops");

STOPS.forEach((s) => {
  const li = document.createElement("li");
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = s.time;
  b.addEventListener("click", () => { range.value = s.p; drawMorning(); });
  li.appendChild(b);
  stopsEl.appendChild(li);
});

const mix = (a, b, t) => {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
const lerp3 = (a, b, c, t) => (t < 0.5 ? mix(a, b, t * 2) : mix(b, c, (t - 0.5) * 2));
const clockText = (p) => {
  const mins = 4 * 60 + 30 + Math.round((p / 100) * 150);
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h}:${String(m).padStart(2, "0")} AM`;
};

function drawMorning() {
  const p = Number(range.value);
  const t = p / 100;
  // sky lightens from night to morning
  $("#scene").style.background =
    `linear-gradient(${lerp3("16324f", "4f7fa8", "9fd0ee", t)}, ${lerp3("2d5a7a", "f6b97a", "e4f3fb", t)})`;
  $("#sun").setAttribute("cy", 320 - t * 250);
  // van: waits at farm, reaches pickup point at 6:00, shop at 7:00
  let f = p <= 30 ? 0 : p <= 60 ? ((p - 30) / 30) * 0.3 : 0.3 + ((p - 60) / 40) * 0.7;
  const pt = road.getPointAtLength(f * roadLen);
  van.setAttribute("transform", `translate(${pt.x} ${pt.y - 4})`);
  // shop shutter opens at the end
  const open = Math.max(0, (p - 85) / 15);
  $("#shutter").setAttribute("height", 42 - open * 36);
  // text
  const time = clockText(p);
  $("#scene-time").textContent = time;
  range.setAttribute("aria-valuetext", time);
  const stop = [...STOPS].reverse().find((s) => p >= s.p);
  $("#step-time").textContent = stop.time;
  $("#step-title").textContent = stop.title;
  $("#step-text").textContent = stop.text;
  $$("button", stopsEl).forEach((b) => {
    if (b.textContent === stop.time) b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  });
}
range.addEventListener("input", drawMorning);

/* ---------- Calculator ---------- */
const DAYS = 26;
const FEE = 0.02;
const DELIVERY_PER_KG = 3;
const STORE_PRICE_PER_KG = 30;

function updateCalc() {
  // farmer
  const kg = +$("#f-kg").value, price = +$("#f-price").value, comm = +$("#f-comm").value;
  $("#f-kg-out").textContent = `${kg} kg`;
  $("#f-price-out").textContent = `₹${price} per kg`;
  $("#f-comm-out").textContent = `${comm}%`;
  const sales = kg * price * DAYS;
  const mandi = (sales * comm) / 100, hl = sales * FEE;
  $("#f-mandi").textContent = rupees(mandi);
  $("#f-hl").textContent = rupees(hl);
  $("#f-result").textContent = rupees(Math.round((mandi - hl) / 100) * 100);

  // store
  const skg = +$("#s-kg").value, trip = +$("#s-trip").value, hrs = +$("#s-hours").value;
  $("#s-kg-out").textContent = `${skg} kg`;
  $("#s-trip-out").textContent = rupees(trip);
  $("#s-hours-out").textContent = `${hrs} hours`;
  const hlDay = skg * DELIVERY_PER_KG + skg * STORE_PRICE_PER_KG * FEE;
  const save = (trip - hlDay) * DAYS;
  const sleep = Math.round(hrs * DAYS);
  $("#s-mandi").textContent = rupees(trip * DAYS);
  $("#s-hl").textContent = rupees(hlDay * DAYS);
  const big = $("#s-result");
  if (save >= 0) {
    $("#s-label-top").textContent = "You could save about";
    big.textContent = rupees(Math.round(save / 100) * 100);
    big.classList.remove("neg");
    $("#s-label-bottom").textContent = `a month, plus about ${sleep} hours of your time back`;
  } else {
    $("#s-label-top").textContent = "Costs about";
    big.textContent = rupees(Math.round(-save / 100) * 100);
    big.classList.add("neg");
    $("#s-label-bottom").textContent = `more a month, but gives you back about ${sleep} hours`;
  }
}
$$("#calc-form input").forEach((i) => i.addEventListener("input", updateCalc));

/* ---------- Start ---------- */
$("#year").textContent = new Date().getFullYear();
setRole(role, false);
drawMorning();

// play the chat when the hero is visible (it is, on load)
if ("IntersectionObserver" in window) {
  let played = false;
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting && !played) { played = true; playChat(); obs.disconnect(); }
  }, { threshold: 0.3 }).observe($(".phone"));
} else {
  playChat();
}
