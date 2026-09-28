let catalog = { roundSeconds: 60, themes: [] };

export function loadCatalog(data) {
  catalog = data;
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function themeById(id) {
  return catalog.themes.find((theme) => theme.id === id) || catalog.themes[0];
}

export function createRound(theme, roundSeconds, roundId = 1) {
  const cards = [];
  theme.pairs.forEach((pair, pairId) => {
    for (const copy of ["a", "b"]) {
      cards.push({
        id: `${theme.id}-${pairId}-${copy}`,
        pairId,
        word: pair.word,
        icon: pair.icon,
        cue: pair.cue,
        revealed: false,
        matched: false,
        slot: -1,
        angle: 0,
        phase: 0,
      });
    }
  });
  shuffle(cards);
  const count = cards.length;
  cards.forEach((card, index) => {
    card.angle = -Math.PI / 2 + ((index + 0.5) / count) * Math.PI * 2;
    card.phase = (index * 1.3) % (Math.PI * 2);
  });
  return {
    rev: 1,
    roundId,
    themeId: theme.id,
    phase: "play",
    paused: false,
    practice: null,
    pointer: null,
    drag: null,
    pending: null,
    lock: false,
    nudge: null,
    remainingMs: roundSeconds * 1000,
    durationMs: roundSeconds * 1000,
    tickAt: Date.now(),
    score: 0,
    totalPairs: theme.pairs.length,
    cards,
  };
}

function fresh(themeId, roundId, rev) {
  const next = createRound(themeById(themeId), catalog.roundSeconds, roundId);
  next.rev = rev;
  return next;
}

export function startSession() {
  return fresh(catalog.themes[0].id, 1, 1);
}

function bumpTime(next, prev) {
  const now = Date.now();
  if (prev.phase === "play" && !prev.paused && !prev.practice) {
    next.remainingMs = Math.max(0, prev.remainingMs - (now - prev.tickAt));
  }
  next.tickAt = now;
}

function openCards(state) {
  return state.cards.filter((card) => card.revealed && !card.matched);
}

function resolvePending(next) {
  const pending = next.pending;
  next.pending = null;
  next.lock = false;
  if (!pending) return;
  if (pending.type === "miss") {
    for (const id of pending.ids) {
      const card = next.cards.find((item) => item.id === id);
      if (card && !card.matched) card.revealed = false;
    }
    return;
  }
  for (const id of pending.ids) {
    const card = next.cards.find((item) => item.id === id);
    card.matched = true;
    card.revealed = true;
    card.slot = next.score;
  }
  next.score += 1;
  next.drag = null;
  if (next.cards.every((card) => card.matched)) next.phase = "clear";
}

function changed(prev) {
  const next = structuredClone(prev);
  next.rev = prev.rev + 1;
  return next;
}

export function reduce(state, intent) {
  if (!state || !intent) return state;

  if (intent.type === "theme") {
    if (!catalog.themes.some((item) => item.id === intent.id)) return state;
    return fresh(intent.id, state.roundId + 1, state.rev + 1);
  }

  if (intent.type === "reset") {
    return fresh(state.themeId, state.roundId + 1, state.rev + 1);
  }

  if (intent.type === "pause") {
    const next = changed(state);
    bumpTime(next, state);
    next.paused = !state.paused;
    next.tickAt = Date.now();
    return next;
  }

  if (intent.type === "practice") {
    const card = state.cards.find((item) => item.word === intent.word);
    if (!card) return state;
    const next = changed(state);
    bumpTime(next, state);
    next.practice = { word: card.word, icon: card.icon, cue: card.cue };
    next.drag = null;
    return next;
  }

  if (intent.type === "heard") {
    if (!state.practice) return state;
    const next = changed(state);
    bumpTime(next, state);
    next.practice = null;
    next.tickAt = Date.now();
    return next;
  }

  if (intent.type === "pointer") {
    const next = changed(state);
    next.pointer = intent.on
      ? {
          x: Math.max(0, Math.min(1, intent.x)),
          y: Math.max(0, Math.min(1, intent.y)),
        }
      : null;
    return next;
  }

  if (intent.type === "nudge") {
    const open = openCards(state);
    let target = null;
    if (open.length === 1) {
      target = state.cards.find(
        (card) => card.pairId === open[0].pairId && card.id !== open[0].id,
      );
    } else {
      const pool = state.cards.filter((card) => !card.matched);
      target = pool[Math.floor(Math.random() * pool.length)] || null;
    }
    if (!target) return state;
    const next = changed(state);
    next.nudge = { id: target.id, until: Date.now() + 1800 };
    return next;
  }

  if (intent.type === "timeout") {
    if (state.phase !== "play" || state.paused || state.practice) return state;
    const next = changed(state);
    bumpTime(next, state);
    if (next.remainingMs > 0) return state;
    next.remainingMs = 0;
    next.phase = "time";
    next.drag = null;
    next.pending = null;
    next.lock = false;
    return next;
  }

  if (intent.type === "resolve") {
    if (!state.pending || state.paused || state.practice || Date.now() < state.pending.at) {
      return state;
    }
    const next = changed(state);
    bumpTime(next, state);
    resolvePending(next);
    return next;
  }

  if (intent.type === "reveal") {
    if (state.phase !== "play" || state.paused || state.practice || state.lock) return state;
    const card = state.cards.find((item) => item.id === intent.id);
    if (!card || card.matched || card.revealed) return state;
    if (openCards(state).length >= 2) return state;
    const next = changed(state);
    bumpTime(next, state);
    const opened = next.cards.find((item) => item.id === intent.id);
    opened.revealed = true;
    const previous = next.cards.find(
      (item) => item.revealed && !item.matched && item.id !== opened.id,
    );
    if (previous) {
      const matched = previous.pairId === opened.pairId;
      next.lock = true;
      next.pending = {
        type: matched ? "match" : "miss",
        ids: [previous.id, opened.id],
        at: Date.now() + (matched ? 420 : 880),
      };
    }
    return next;
  }

  if (intent.type === "drag") {
    const card = state.cards.find((item) => item.id === intent.id);
    if (!card || !card.revealed || card.matched) return state;
    if (state.phase !== "play" || state.paused || state.practice) return state;
    const next = changed(state);
    next.drag = {
      id: card.id,
      x: Math.max(0, Math.min(1, intent.x)),
      y: Math.max(0, Math.min(1, intent.y)),
    };
    return next;
  }

  if (intent.type === "drop") {
    if (!state.drag && !intent.close) return state;
    const next = changed(state);
    next.drag = null;
    if (
      intent.close &&
      next.pending?.type === "match" &&
      next.pending.ids.includes(intent.id)
    ) {
      next.pending.at = Date.now();
    }
    return next;
  }

  return state;
}

export function shownRemaining(state, now = Date.now()) {
  if (!state) return 0;
  if (state.phase !== "play" || state.paused || state.practice) return state.remainingMs;
  return Math.max(0, state.remainingMs - (now - state.tickAt));
}
