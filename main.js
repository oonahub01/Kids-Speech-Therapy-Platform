import { loadCatalog, startSession, reduce, shownRemaining } from "./session.js";
import { play, unlock, setMuted, isMuted } from "./audio.js";
import { drawIcon } from "./icons.js";
import { Game } from "./game.js";

const params = new URLSearchParams(location.search);
const role = params.get("role") === "student" ? "student" : "lead";

const canvas = document.querySelector("#game");
const roleEl = document.querySelector("#role");
const titleEl = document.querySelector("#title");
const timerEl = document.querySelector("#timer");
const progressEl = document.querySelector("#progress");
const syncEl = document.querySelector("#sync");
const hintEl = document.querySelector("#hint");
const themesEl = document.querySelector("#themes");
const wordsEl = document.querySelector("#words");
const pauseBtn = document.querySelector("#pause");
const nudgeBtn = document.querySelector("#nudge");
const resetBtn = document.querySelector("#reset");
const guideBtn = document.querySelector("#guide");
const popBtn = document.querySelector("#pop");
const jsonBtn = document.querySelector("#show-json");
const soundBtn = document.querySelector("#sound");
const veil = document.querySelector("#veil");
const veilTitle = document.querySelector("#veil-title");
const veilSub = document.querySelector("#veil-sub");
const veilActions = document.querySelector("#veil-actions");
const practice = document.querySelector("#practice");
const practiceWord = document.querySelector("#practice-word");
const practiceCue = document.querySelector("#practice-cue");
const practiceNote = document.querySelector("#practice-note");
const heardBtn = document.querySelector("#heard");
const iconCanvas = document.querySelector("#picon");
const jsonDialog = document.querySelector("#json");
const jsonPre = document.querySelector("#json-pre");
const toast = document.querySelector("#toast");

let catalog = null;
let state = null;
let authority = role === "lead";
let guide = false;
let channel = null;
const peers = new Map();
let veilMode = "";
let toastTimer = 0;

const res = await fetch("./packs.json");
catalog = await res.json();
loadCatalog(catalog);
if (authority) state = startSession();

try {
  channel = new BroadcastChannel("telesesh-tide-lanterns-v1");
} catch {
  channel = null;
}

function currentTheme() {
  return catalog.themes.find((theme) => theme.id === state?.themeId) || catalog.themes[0];
}

function showToast(text) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function effectsFrom(prev, next) {
  if (!prev || prev.roundId !== next.roundId) return;
  const open = (round) => round.cards.filter((card) => card.revealed && !card.matched).length;
  if (next.score > prev.score) play("match");
  else if (open(next) < open(prev)) play("miss");
  else if (open(next) > open(prev)) play("flip");
  if (next.phase === "clear" && prev.phase !== "clear") play("win");
  if (next.practice && !prev.practice) play("card");
}

function publish(next) {
  const prev = state;
  state = next;
  channel?.postMessage({ t: "snapshot", state });
  effectsFrom(prev, state);
  onFrame();
}

function act(intent) {
  unlock();
  if (!authority) {
    channel?.postMessage({ t: "intent", intent, from: role });
    return;
  }
  if (!state) return;
  const next = reduce(state, intent);
  if (next !== state) publish(next);
}

function adopt(next) {
  if (!next) return;
  if (state && next.rev === state.rev && next.roundId === state.roundId) return;
  if (state && next.rev < state.rev && next.roundId === state.roundId) return;
  const prev = state;
  state = next;
  effectsFrom(prev, state);
  onFrame();
}

function applyChrome() {
  const studentView = role === "student" && !authority;
  document.body.dataset.role = studentView ? "student" : "lead";
  roleEl.textContent = studentView ? "Student" : role === "student" ? "Solo preview" : "Therapist";
}

function paintIcon(name) {
  const ctx = iconCanvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = 160;
  iconCanvas.width = size * dpr;
  iconCanvas.height = size * dpr;
  iconCanvas.style.width = `${size}px`;
  iconCanvas.style.height = `${size}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.scale(62, 62);
  drawIcon(ctx, name);
  ctx.restore();
}

function renderThemes() {
  themesEl.innerHTML = "";
  for (const theme of catalog.themes) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = theme.title;
    button.dataset.id = theme.id;
    button.addEventListener("click", () => act({ type: "theme", id: theme.id }));
    themesEl.appendChild(button);
  }
}

function renderWords() {
  const theme = currentTheme();
  if (wordsEl.dataset.theme === theme.id) return;
  wordsEl.dataset.theme = theme.id;
  wordsEl.innerHTML = "";
  for (const pair of theme.pairs) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = pair.word;
    button.addEventListener("click", () => act({ type: "practice", word: pair.word }));
    wordsEl.appendChild(button);
  }
}

function setVeil(mode) {
  if (mode === veilMode) return;
  veilMode = mode;
  veilActions.innerHTML = "";
  if (!mode) {
    veil.hidden = true;
    return;
  }
  veil.hidden = false;
  const studentView = document.body.dataset.role === "student";
  const copy = {
    wait: ["One moment", "Your therapist is opening the round."],
    pause: ["Paused", "Take a breath. The lanterns will wait."],
    time: ["Time's up", "That was a good minute."],
    clear: ["All paired", "Soft and steady. The words are ready."],
  };
  veilTitle.textContent = copy[mode][0];
  veilSub.textContent = studentView && mode !== "wait" ? "Waiting for your therapist." : copy[mode][1];
  if (studentView || mode === "wait") return;
  if (mode === "pause") addVeilButton("Resume", () => act({ type: "pause" }));
  if (mode === "time" || mode === "clear") addVeilButton("New round", () => act({ type: "reset" }));
}

function addVeilButton(label, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "primary";
  button.textContent = label;
  button.addEventListener("click", onClick);
  veilActions.appendChild(button);
}

function onFrame() {
  applyChrome();
  const theme = currentTheme();
  titleEl.textContent = theme.title;
  document.title = `${theme.title} · Tide Lanterns`;
  for (const button of themesEl.querySelectorAll("button")) {
    button.classList.toggle("on", button.dataset.id === theme.id);
  }
  renderWords();
  if (!state) {
    timerEl.textContent = "60";
    progressEl.textContent = "Waiting";
    hintEl.hidden = true;
    practice.hidden = true;
    setVeil(role === "student" ? "wait" : "");
    return;
  }
  const left = shownRemaining(state);
  timerEl.textContent = String(Math.ceil(left / 1000));
  timerEl.classList.toggle("low", state.phase === "play" && left <= 10000 && !state.paused && !state.practice);
  progressEl.textContent = `${state.score} of ${state.totalPairs} pairs`;
  hintEl.hidden = state.cards.some((card) => card.revealed || card.matched) || state.phase !== "play";
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";

  if (state.practice) {
    setVeil("");
    practice.hidden = false;
    if (practice.dataset.word !== state.practice.word) {
      practice.dataset.word = state.practice.word;
      practiceWord.textContent = state.practice.word;
      practiceCue.textContent = state.practice.cue;
      paintIcon(state.practice.icon);
    }
    const studentView = document.body.dataset.role === "student";
    heardBtn.hidden = studentView;
    practiceNote.textContent = studentView ? "Say it out loud." : "Hold the card. Mark it when you hear the word.";
  } else {
    practice.hidden = true;
    practice.dataset.word = "";
    if (state.paused) setVeil("pause");
    else if (state.phase === "time") setVeil("time");
    else if (state.phase === "clear") setVeil("clear");
    else setVeil("");
  }
}

pauseBtn.addEventListener("click", () => act({ type: "pause" }));
nudgeBtn.addEventListener("click", () => act({ type: "nudge" }));
resetBtn.addEventListener("click", () => act({ type: "reset" }));
heardBtn.addEventListener("click", () => act({ type: "heard" }));
guideBtn.addEventListener("click", () => {
  guide = !guide;
  guideBtn.setAttribute("aria-pressed", String(guide));
  guideBtn.classList.toggle("on", guide);
  canvas.classList.toggle("guide", guide);
  if (!guide) act({ type: "pointer", on: false });
});
popBtn.addEventListener("click", () => {
  const win = window.open("./index.html?role=student", "tide-student", "width=980,height=760");
  if (!win) showToast("Pop-up blocked. Open a second tab to ?role=student");
});
jsonBtn.addEventListener("click", () => {
  jsonPre.textContent = JSON.stringify(
    {
      template: catalog.template,
      roundSeconds: catalog.roundSeconds,
      theme: currentTheme(),
    },
    null,
    2,
  );
  jsonDialog.showModal();
});
document.querySelector("#json-close").addEventListener("click", () => jsonDialog.close());
soundBtn.addEventListener("click", () => {
  unlock();
  const muted = setMuted(!isMuted());
  soundBtn.textContent = muted ? "Sound off" : "Sound on";
  soundBtn.classList.toggle("on", !muted);
});
window.addEventListener("pointerdown", () => unlock(), { once: true });
window.addEventListener("keydown", (event) => {
  if (event.code === "Space" && state?.practice && document.body.dataset.role !== "student") {
    event.preventDefault();
    act({ type: "heard" });
  }
});

if (channel) {
  channel.onmessage = (event) => {
    const msg = event.data;
    if (!msg || typeof msg !== "object") return;
    if (msg.t === "hello" && authority && state) {
      peers.set(msg.id, Date.now());
      channel.postMessage({ t: "snapshot", state });
    }
    if (msg.t === "snapshot" && role === "student") {
      clearTimeout(soloTimer);
      authority = false;
      adopt(msg.state);
      applyChrome();
    }
    if (msg.t === "intent" && authority) {
      const next = reduce(state, msg.intent);
      if (next !== state) publish(next);
    }
  };
}

const me = Math.random().toString(36).slice(2);
let soloTimer = 0;
if (role === "student") {
  const hello = () => {
    if (!authority) channel?.postMessage({ t: "hello", id: me });
  };
  hello();
  setInterval(hello, 800);
  soloTimer = setTimeout(() => {
    if (!state) {
      authority = true;
      state = startSession();
      applyChrome();
    }
  }, 1800);
}

setInterval(() => {
  const now = Date.now();
  for (const [id, seen] of peers) {
    if (now - seen > 2500) peers.delete(id);
  }
  const studentView = role === "student" && !authority;
  if (studentView && state) {
    syncEl.textContent = "Live with therapist";
    syncEl.classList.add("live");
  } else if (peers.size > 0) {
    syncEl.textContent = "Student linked";
    syncEl.classList.add("live");
  } else if (role === "student") {
    syncEl.textContent = authority ? "Solo preview" : "Linking…";
    syncEl.classList.remove("live");
  } else {
    syncEl.textContent = "Waiting for student";
    syncEl.classList.remove("live");
  }
}, 400);

renderThemes();
applyChrome();
soundBtn.classList.add("on");

const game = new Game(canvas, {
  getState: () => state,
  getTheme: () => currentTheme(),
  isGuide: () => guide && document.body.dataset.role !== "student",
  act,
  unlock,
  onFrame,
});

setInterval(() => {
  if (!authority || !state) return;
  if (state.pending && !state.paused && !state.practice && Date.now() >= state.pending.at) {
    const next = reduce(state, { type: "resolve" });
    if (next !== state) publish(next);
    return;
  }
  if (state.phase === "play" && !state.paused && !state.practice && shownRemaining(state) <= 0) {
    const next = reduce(state, { type: "timeout" });
    if (next !== state) publish(next);
  }
}, 120);

void game;
