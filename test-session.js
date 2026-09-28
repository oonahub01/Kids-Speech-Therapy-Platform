import { readFileSync } from "fs";
import { loadCatalog, startSession, reduce, shownRemaining } from "./session.js";

const catalog = JSON.parse(readFileSync(new URL("./packs.json", import.meta.url), "utf8"));
loadCatalog(catalog);

function check(cond, message) {
  if (!cond) {
    console.error("FAIL", message);
    process.exitCode = 1;
  }
}

let state = startSession();
check(state.cards.length === 12, "12 lanterns");
check(new Set(state.cards.map((card) => card.id)).size === 12, "unique ids");
check(state.totalPairs === 6, "6 pairs");

const [first, second] = state.cards.filter((card) => card.pairId === 0);
state = reduce(state, { type: "reveal", id: first.id });
state = reduce(state, { type: "reveal", id: second.id });
check(state.pending?.type === "match", "matching pair arms a match");
const blocked = reduce(state, { type: "reveal", id: state.cards.find((card) => card.pairId === 1).id });
check(blocked === state, "third flip is ignored while two are open");
state.pending.at = Date.now() - 5;
state = reduce(state, { type: "resolve" });
check(state.score === 1, "score increments");
check(state.cards.filter((card) => card.pairId === 0).every((card) => card.matched), "pair locks");

const missA = state.cards.find((card) => card.pairId === 1 && !card.matched);
const missB = state.cards.find((card) => card.pairId === 2 && !card.matched);
state = reduce(state, { type: "reveal", id: missA.id });
state = reduce(state, { type: "reveal", id: missB.id });
check(state.pending?.type === "miss", "different words miss");
state.pending.at = 0;
const before = state.score;
state = reduce(state, { type: "resolve" });
check(state.score === before, "miss does not score");
check(state.cards.find((card) => card.id === missA.id).revealed === false, "miss hides the card");

state = reduce(state, { type: "pause" });
const left = state.remainingMs;
state.tickAt = Date.now() - 5000;
state = reduce(state, { type: "pause" });
check(state.paused === false, "pause toggles");
check(state.remainingMs === left, "paused time does not drain");

state = reduce(state, { type: "nudge" });
check(state.nudge?.id, "nudge picks a lantern");

state = reduce(state, { type: "practice", word: "whale" });
check(state.practice?.word === "whale", "speech card opens");
check(shownRemaining(state) === state.remainingMs, "speech card freezes the clock");
state = reduce(state, { type: "heard" });
check(state.practice === null, "heard clears the card");

state = reduce(state, { type: "theme", id: "space" });
check(state.themeId === "space", "theme swap");
check(state.score === 0, "theme starts a fresh round");
check(state.cards.some((card) => card.word === "rocket"), "space words load");

let round = startSession();
for (let pair = 0; pair < 6; pair++) {
  const mates = round.cards.filter((card) => card.pairId === pair);
  round = reduce(round, { type: "reveal", id: mates[0].id });
  round = reduce(round, { type: "reveal", id: mates[1].id });
  round.pending.at = 0;
  round = reduce(round, { type: "resolve" });
}
check(round.phase === "clear", "full round clears");
check(round.score === 6, "all pairs scored");

if (!process.exitCode) console.log("session ok");
