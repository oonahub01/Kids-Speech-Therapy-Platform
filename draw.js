import { drawIcon } from "./icons.js";

const BACKS = {
  tide: ["#c2564c", "#f09478", "#8f383c"],
  space: ["#3a2b86", "#7464c8", "#241c58"],
  picnic: ["#2c8a52", "#8ed48a", "#1c6438"],
};

function orb(ctx, x, y, radius, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, hexAlpha(color, alpha));
  g.addColorStop(1, hexAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function hexAlpha(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function drawWorld(ctx, w, h, theme, now) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, theme.sky[0]);
  sky.addColorStop(0.55, theme.sky[1]);
  sky.addColorStop(1, theme.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  orb(ctx, w * 0.18, h * 0.22, w * 0.28, theme.glow, 0.16);
  orb(ctx, w * 0.86, h * 0.78, w * 0.22, theme.accent, 0.1);

  if (theme.motes === "bubbles") {
    ctx.strokeStyle = "rgba(150, 255, 230, 0.09)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 14) {
        const y = h * (0.18 + i * 0.16) + Math.sin(x * 0.012 + now / 900 + i) * 18;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  if (theme.motes === "pollen") {
    ctx.save();
    ctx.translate(w * 0.82, h * 0.08);
    ctx.strokeStyle = "rgba(255, 236, 190, 0.16)";
    ctx.lineWidth = 18;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(i) * w * 0.55, Math.sin(i) * h * 0.7);
      ctx.stroke();
    }
    ctx.restore();
  }

  const count = theme.motes === "stars" ? 70 : 28;
  for (let i = 0; i < count; i++) {
    const px = ((i * 97) % 1000) / 1000 * w;
    const drift = theme.motes === "bubbles" ? -0.018 : theme.motes === "pollen" ? 0.012 : 0.004;
    const py = (((i * 53) % 1000) / 1000 * h + now * drift) % h;
    const y = py < 0 ? py + h : py;
    const twinkle = 0.25 + Math.abs(Math.sin(now / 500 + i)) * 0.55;
    ctx.fillStyle =
      theme.motes === "stars"
        ? `rgba(255, 248, 230, ${twinkle})`
        : hexAlpha(theme.ink, 0.28);
    ctx.beginPath();
    const radius = theme.motes === "stars" ? (i % 4 === 0 ? 1.8 : 1.1) : 2 + (i % 3);
    ctx.arc(px, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.78);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

export function drawOrbit(ctx, cx, cy, rx, ry) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 12]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawBody(ctx, x, y, radius, theme, look, smile) {
  ctx.save();
  ctx.translate(x, y);
  orb(ctx, 0, 0, radius * 2.4, theme.glow, 0.28);

  if (theme.body === "sun") {
    ctx.fillStyle = hexAlpha(theme.glow, 0.45);
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.lineTo(Math.cos(angle) * radius * 1.55, Math.sin(angle) * radius * 1.55);
      const angle2 = angle + Math.PI / 18;
      ctx.lineTo(Math.cos(angle2) * radius * 1.15, Math.sin(angle2) * radius * 1.15);
    }
    ctx.fill();
  }

  const body =
    theme.body === "planet" ? "#6d5bd6" : theme.body === "sun" ? "#ffd56a" : "#ffe1a8";
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  if (theme.body === "planet") {
    ctx.strokeStyle = "rgba(255, 224, 150, 0.85)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.45, radius * 0.42, -0.5, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = theme.body === "sun" ? "rgba(255,255,255,0.28)" : "rgba(214, 164, 92, 0.35)";
    ctx.beginPath();
    ctx.ellipse(-radius * 0.28, -radius * 0.1, radius * 0.18, radius * 0.12, 0.4, 0, Math.PI * 2);
    ctx.ellipse(radius * 0.22, radius * 0.18, radius * 0.12, radius * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const ex = look.x * radius * 0.12;
  const ey = look.y * radius * 0.08;
  ctx.fillStyle = theme.body === "planet" ? "#f7f3ff" : "#3a2916";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(side * radius * 0.28 + ex, -radius * 0.12 + ey, radius * 0.07, radius * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  const mouth = radius * (0.16 + smile * 0.12);
  ctx.arc(ex * 0.4, radius * 0.18 + ey * 0.3, mouth, 0.15, Math.PI - 0.15);
  ctx.stroke();

  if (theme.body !== "planet") {
    ctx.fillStyle = "rgba(255, 140, 150, 0.35)";
    ctx.beginPath();
    ctx.ellipse(-radius * 0.42, radius * 0.12, radius * 0.1, radius * 0.06, 0, 0, Math.PI * 2);
    ctx.ellipse(radius * 0.42, radius * 0.12, radius * 0.1, radius * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function lanternPath(ctx, w, h) {
  const hw = w / 2;
  const hh = h / 2;
  ctx.beginPath();
  ctx.moveTo(0, -hh * 0.92);
  ctx.bezierCurveTo(hw * 0.98, -hh * 0.5, hw * 0.78, hh * 0.62, 0, hh * 0.8);
  ctx.bezierCurveTo(-hw * 0.78, hh * 0.62, -hw * 0.98, -hh * 0.5, 0, -hh * 0.92);
  ctx.closePath();
}

export function drawLantern(ctx, w, h, options) {
  const { side, theme, word, icon } = options;
  const colors = BACKS[theme.id] || BACKS.tide;
  const hw = w / 2;
  const hh = h / 2;

  ctx.fillStyle = "#5c3317";
  roundRect(ctx, -hw * 0.28, -hh * 1.05, hw * 0.56, hh * 0.16, 4);
  ctx.fill();

  lanternPath(ctx, w, h);
  const fill = ctx.createLinearGradient(-hw, 0, hw, 0);
  if (side === "back") {
    fill.addColorStop(0, colors[0]);
    fill.addColorStop(0.5, colors[1]);
    fill.addColorStop(1, colors[2]);
  } else {
    fill.addColorStop(0, "#f3cc86");
    fill.addColorStop(0.42, "#fff8ea");
    fill.addColorStop(1, "#f0c27a");
  }
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(70, 36, 18, 0.28)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  lanternPath(ctx, w, h);
  ctx.clip();
  ctx.strokeStyle = side === "back" ? "rgba(255,255,255,0.28)" : "rgba(196, 120, 48, 0.25)";
  ctx.lineWidth = 2;
  for (const x of [-0.38, 0, 0.38]) {
    ctx.beginPath();
    ctx.moveTo(hw * x, -hh * 0.75);
    ctx.quadraticCurveTo(hw * x * 0.9, 0, hw * x * 0.62, hh * 0.62);
    ctx.stroke();
  }
  if (side === "front") {
    ctx.fillStyle = "rgba(255, 196, 90, 0.28)";
    ctx.beginPath();
    ctx.ellipse(0, hh * 0.05, hw * 0.36, hh * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = "rgba(255, 228, 176, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, hh * 0.02, Math.min(w, h) * 0.11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -hh * 0.12);
    ctx.lineTo(hw * 0.16, hh * 0.02);
    ctx.lineTo(0, hh * 0.16);
    ctx.lineTo(-hw * 0.16, hh * 0.02);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();

  ctx.strokeStyle = "#5c3317";
  ctx.fillStyle = "#5c3317";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, hh * 0.8);
  ctx.lineTo(0, hh * 1.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, hh * 1.14, 4, 0, Math.PI * 2);
  ctx.fill();

  if (side !== "front") return;

  ctx.save();
  ctx.translate(0, -h * 0.08);
  ctx.scale(w * 0.34, w * 0.34);
  drawIcon(ctx, icon);
  ctx.restore();

  ctx.fillStyle = "#4a2a14";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = Math.max(13, Math.floor(w * 0.16));
  ctx.font = `700 ${size}px Fraunces, Georgia, serif`;
  while (size > 11 && ctx.measureText(word).width > w * 0.78) {
    size -= 1;
    ctx.font = `700 ${size}px Fraunces, Georgia, serif`;
  }
  ctx.fillText(word, 0, h * 0.24);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawFirefly(ctx, x, y, theme, now) {
  const pulse = 0.65 + Math.sin(now / 140) * 0.35;
  orb(ctx, x, y, 28 + pulse * 10, theme.glow, 0.55);
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = hexAlpha(theme.ink, 0.7);
  ctx.fillStyle = hexAlpha(theme.ink, 0.35);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-7, -2, 8, 4, -0.6, 0, Math.PI * 2);
  ctx.ellipse(7, -2, 8, 4, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = theme.glow;
  ctx.beginPath();
  ctx.ellipse(0, 2, 4.5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export { orb };
