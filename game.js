import { drawWorld, drawOrbit, drawBody, drawLantern, drawFirefly, orb } from "./draw.js";
import { ORBIT, homeOf, slotOf } from "./layout.js";

export class Game {
  constructor(canvas, api) {
    this.canvas = canvas;
    this.api = api;
    this.views = new Map();
    this.particles = [];
    this.trail = [];
    this.localDrag = null;
    this.pointer = null;
    this.moved = false;
    this.prev = null;
    this.motion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.ctx = canvas.getContext("2d");
    this.resize();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);

    canvas.addEventListener("pointerdown", (event) => this.onDown(event));
    canvas.addEventListener("pointermove", (event) => this.onMove(event));
    canvas.addEventListener("pointerup", (event) => this.onUp(event));
    canvas.addEventListener("pointerleave", (event) => this.onLeave(event));
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  cardSize() {
    const width = Math.max(78, Math.min(this.w * 0.1, this.h * 0.16, 132));
    return { width, height: width * 1.28 };
  }

  toPx(point) {
    return { x: point.x * this.w, y: point.y * this.h };
  }

  norm(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  }

  hit(point) {
    const state = this.api.getState();
    if (!state) return null;
    const size = this.cardSize();
    const cards = [...state.cards].sort((a, b) => this.viewOf(a).y - this.viewOf(b).y);
    if (this.localDrag) {
      const dragged = cards.find((card) => card.id === this.localDrag.id);
      if (dragged) cards.push(dragged);
    }
    for (let i = cards.length - 1; i >= 0; i--) {
      const card = cards[i];
      if (card.matched) continue;
      const pos = this.toPx(this.viewOf(card));
      const depth = 0.86 + this.viewOf(card).y * 0.32;
      if (Math.abs(point.x * this.w - pos.x) < size.width * depth * 0.48 && Math.abs(point.y * this.h - pos.y) < size.height * depth * 0.5) {
        return card;
      }
    }
    return null;
  }

  viewOf(card) {
    return this.views.get(card.id) || { x: ORBIT.cx, y: ORBIT.cy, flip: 0, rot: 0 };
  }

  onDown(event) {
    if (event.button !== 0) return;
    this.canvas.setPointerCapture(event.pointerId);
    const point = this.norm(event);
    this.pointer = point;
    this.moved = false;
    if (this.api.isGuide()) return;
    const state = this.api.getState();
    if (!this.playable(state)) return;
    const card = this.hit(point);
    if (!card) return;
    const open = state.cards.filter((item) => item.revealed && !item.matched).length;
    if (!card.revealed && (state.lock || open >= 2)) return;
    this.api.act({ type: "reveal", id: card.id });
    this.localDrag = { id: card.id, x: point.x, y: point.y };
    this.api.unlock?.();
  }

  onMove(event) {
    const point = this.norm(event);
    this.pointer = point;
    if (this.api.isGuide()) {
      const now = performance.now();
      if (!this.lastGuide || now - this.lastGuide > 40) {
        this.lastGuide = now;
        this.api.act({ type: "pointer", on: true, x: point.x, y: point.y });
      }
      return;
    }
    if (!this.localDrag) return;
    if (Math.hypot(point.x - this.localDrag.x, point.y - this.localDrag.y) > 0.012) this.moved = true;
    this.localDrag.x = point.x;
    this.localDrag.y = point.y;
    const now = performance.now();
    if (!this.lastDrag || now - this.lastDrag > 32) {
      this.lastDrag = now;
      this.api.act({ type: "drag", id: this.localDrag.id, x: point.x, y: point.y });
    }
  }

  onUp(event) {
    if (this.api.isGuide()) return;
    if (!this.localDrag) return;
    const point = this.norm(event);
    const close = this.nearMate(this.localDrag.id, point);
    this.api.act({ type: "drop", id: this.localDrag.id, x: point.x, y: point.y, close });
    this.localDrag = null;
  }

  onLeave() {
    if (this.api.isGuide()) this.api.act({ type: "pointer", on: false });
  }

  playable(state) {
    return state && state.phase === "play" && !state.paused && !state.practice && !this.api.isGuide();
  }

  nearMate(id, point) {
    const state = this.api.getState();
    if (!state) return false;
    const card = state.cards.find((item) => item.id === id);
    if (!card) return false;
    const mate = state.cards.find(
      (item) => item.pairId === card.pairId && item.id !== card.id && item.revealed && !item.matched,
    );
    if (!mate) return false;
    const matePos = this.viewOf(mate);
    return Math.hypot(matePos.x - point.x, matePos.y - point.y) < 0.11;
  }

  targetFor(card, state, now) {
    if (this.localDrag?.id === card.id) return { x: this.localDrag.x, y: this.localDrag.y, scale: 1.06 };
    if (state.drag?.id === card.id) return { x: state.drag.x, y: state.drag.y, scale: 1.06 };
    if (card.matched) {
      const slot = slotOf(card.slot, state.totalPairs, card.id);
      return { x: slot.x, y: slot.y, scale: 0.58 };
    }
    const home = homeOf(card, now, this.motion);
    const nudged = state.nudge && state.nudge.id === card.id && Date.now() < state.nudge.until;
    let x = home.x;
    let y = home.y;
    if (nudged && this.motion) {
      x += Math.sin(now / 45) * 0.012;
      y -= 0.01;
    }
    if (state.pending?.ids.includes(card.id) && state.pending.type === "match") {
      const otherId = state.pending.ids.find((id) => id !== card.id);
      const other = state.cards.find((item) => item.id === otherId);
      const otherHome = homeOf(other, now, this.motion);
      x = (home.x + otherHome.x) / 2;
      y = (home.y + otherHome.y) / 2;
    }
    if (state.pending?.ids.includes(card.id) && state.pending.type === "miss" && this.motion) {
      x += Math.sin(now / 28) * 0.008;
    }
    return { x, y, scale: nudged ? 1.05 : 1 };
  }

  burst(x, y, color) {
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const speed = 0.6 + Math.random() * 1.4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        r: 2 + Math.random() * 3,
      });
    }
  }

  loop(now) {
    this.update(now);
    this.render(now);
    if (this.api.onFrame) this.api.onFrame();
    requestAnimationFrame(this.loop);
  }

  update(now) {
    const state = this.api.getState();
    const theme = this.api.getTheme();
    if (!state) {
      this.prev = null;
      return;
    }
    if (this.prev && this.prev.roundId !== state.roundId) {
      this.views.clear();
      this.localDrag = null;
    }
    if (this.prev && state.score > this.prev.score) {
      for (const card of state.cards) {
        const before = this.prev.cards.find((item) => item.id === card.id);
        if (card.matched && before && !before.matched) {
          const pos = this.toPx(this.viewOf(card));
          this.burst(pos.x, pos.y, theme.glow);
        }
      }
    }
    if (this.prev && state.phase === "clear" && this.prev.phase !== "clear") {
      this.burst(this.w * ORBIT.cx, this.h * ORBIT.cy, theme.accent);
    }
    this.prev = state;

    for (const card of state.cards) {
      let view = this.views.get(card.id);
      if (!view) {
        const home = homeOf(card, now, this.motion);
        view = { x: home.x, y: home.y, flip: card.revealed ? 1 : 0, rot: 0 };
        this.views.set(card.id, view);
      }
      const target = this.targetFor(card, state, now);
      const drag = this.localDrag?.id === card.id;
      const follow = drag ? 1 : card.matched ? 0.08 : 0.16;
      view.x += (target.x - view.x) * follow;
      view.y += (target.y - view.y) * follow;
      view.scale = target.scale;
      const flipTarget = card.revealed || card.matched ? 1 : 0;
      view.flip += (flipTarget - view.flip) * (this.motion ? 0.18 : 1);
      const tilt = drag ? 0 : Math.max(-0.2, Math.min(0.2, (target.x - view.x) * 6));
      view.rot += (tilt - view.rot) * 0.2;
    }

    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;
      p.life -= 0.018;
    });
    this.particles = this.particles.filter((p) => p.life > 0);

    const fly = this.api.isGuide() ? this.pointer : state.pointer;
    if (fly) this.trail.push({ x: fly.x, y: fly.y, life: 1 });
    this.trail.forEach((p) => {
      p.life -= 0.04;
    });
    this.trail = this.trail.filter((p) => p.life > 0).slice(-18);
  }

  render(now) {
    const ctx = this.ctx;
    const theme = this.api.getTheme();
    const state = this.api.getState();
    drawWorld(ctx, this.w, this.h, theme, now);

    const cx = ORBIT.cx * this.w;
    const cy = ORBIT.cy * this.h;
    const rx = ORBIT.rx * this.w;
    const ry = ORBIT.ry * this.h;
    drawOrbit(ctx, cx, cy, rx, ry);

    const look = this.look(state);
    const smile = state ? state.score / state.totalPairs : 0.2;
    drawBody(ctx, cx, cy, Math.min(this.w, this.h) * 0.09, theme, look, smile);

    if (!state) return;

    if (state.pending?.type === "match") {
      const [a, b] = state.pending.ids.map((id) => this.toPx(this.views.get(id) || { x: 0.5, y: 0.5 }));
      ctx.strokeStyle = "rgba(255, 226, 160, 0.75)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    const size = this.cardSize();
    const order = [...state.cards].sort((a, b) => {
      const ay = a.matched ? -1 : this.viewOf(a).y;
      const by = b.matched ? -1 : this.viewOf(b).y;
      return ay - by;
    });
    const dragged = this.localDrag?.id || state.drag?.id;
    order.sort((a, b) => (a.id === dragged) - (b.id === dragged));

    for (const card of order) {
      const view = this.viewOf(card);
      const pos = this.toPx(view);
      const scale = (view.scale || 1) * (0.86 + view.y * 0.32);
      const nudged = state.nudge && state.nudge.id === card.id && Date.now() < state.nudge.until;
      if ((card.revealed && !card.matched) || nudged) {
        orb(ctx, pos.x, pos.y, size.width * 0.85, nudged ? theme.accent : theme.glow, nudged ? 0.45 : 0.3);
      }
      ctx.save();
      ctx.translate(pos.x + 0, pos.y + size.height * 0.55);
      ctx.scale(1, 0.28);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.beginPath();
      ctx.arc(0, 0, size.width * 0.34 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(view.rot || 0);
      const sx = Math.max(0.05, Math.abs(Math.cos(view.flip * Math.PI)));
      ctx.scale(sx * scale, scale);
      ctx.beginPath();
      ctx.moveTo(0, -size.height * 0.62);
      ctx.lineTo(0, -size.height * 0.62 - 16);
      ctx.strokeStyle = "rgba(92, 51, 23, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
      drawLantern(ctx, size.width, size.height, {
        side: view.flip > 0.5 ? "front" : "back",
        theme,
        word: card.word,
        icon: card.icon,
      });
      ctx.restore();
    }

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (const p of this.trail) {
      const pos = this.toPx(p);
      orb(ctx, pos.x, pos.y, 10 * p.life, theme.glow, 0.35 * p.life);
    }
    const fly = this.api.isGuide() ? this.pointer : state.pointer;
    if (fly) drawFirefly(ctx, fly.x * this.w, fly.y * this.h, theme, now);
  }

  look(state) {
    const focus = this.localDrag || state?.drag || (this.api.isGuide() ? this.pointer : state?.pointer);
    if (!focus) {
      return { x: Math.sin(performance.now() / 1200) * 0.35, y: 0.1 };
    }
    return {
      x: Math.max(-1, Math.min(1, (focus.x - ORBIT.cx) / 0.3)),
      y: Math.max(-1, Math.min(1, (focus.y - ORBIT.cy) / 0.25)),
    };
  }
}
