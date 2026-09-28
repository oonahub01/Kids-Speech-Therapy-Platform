function eye(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.fillStyle = "#fffdf8";
  ctx.beginPath();
  ctx.arc(x, y, 0.11 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a2118";
  ctx.beginPath();
  ctx.arc(x + 0.02, y, 0.055 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function starPath(ctx, radius, inset) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? radius : radius * inset;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = Math.cos(angle) * rad;
    const y = Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

const ICONS = {
  crab(ctx) {
    ctx.fillStyle = "#e15a45";
    ctx.strokeStyle = "#e15a45";
    ctx.lineWidth = 0.1;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.ellipse(0, 0.08, 0.38, 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-0.46, -0.08, 0.16, 0.2, Math.PI * 1.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0.46, -0.08, 0.16, Math.PI * 1.65, Math.PI * 0.8, true);
    ctx.stroke();
    eye(ctx, -0.14, 0.02, 0.75);
    eye(ctx, 0.14, 0.02, 0.75);
  },
  whale(ctx) {
    ctx.fillStyle = "#3d7ea6";
    ctx.beginPath();
    ctx.ellipse(-0.05, 0.05, 0.46, 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.38, 0.02);
    ctx.lineTo(0.68, -0.18);
    ctx.lineTo(0.62, 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#8fd0ea";
    ctx.beginPath();
    ctx.ellipse(-0.08, 0.12, 0.22, 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    eye(ctx, -0.28, -0.02, 0.7);
    ctx.fillStyle = "#d9f4ff";
    ctx.beginPath();
    ctx.arc(-0.18, -0.42, 0.05, 0, Math.PI * 2);
    ctx.arc(-0.08, -0.56, 0.07, 0, Math.PI * 2);
    ctx.fill();
  },
  turtle(ctx) {
    ctx.fillStyle = "#67a84a";
    ctx.beginPath();
    ctx.ellipse(0, 0.28, 0.12, 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-0.34, 0.08, 0.12, 0.08, -0.4, 0, Math.PI * 2);
    ctx.ellipse(0.34, 0.08, 0.12, 0.08, 0.4, 0, Math.PI * 2);
    ctx.ellipse(-0.24, 0.32, 0.1, 0.07, 0.5, 0, Math.PI * 2);
    ctx.ellipse(0.24, 0.32, 0.1, 0.07, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c6863a";
    ctx.beginPath();
    ctx.ellipse(0, 0.02, 0.34, 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8d5a22";
    ctx.lineWidth = 0.04;
    ctx.beginPath();
    ctx.moveTo(-0.16, -0.16);
    ctx.lineTo(0, 0.22);
    ctx.lineTo(0.16, -0.16);
    ctx.stroke();
    eye(ctx, 0, 0.28, 0.45);
  },
  octopus(ctx) {
    ctx.fillStyle = "#b15cff";
    ctx.beginPath();
    ctx.arc(0, -0.12, 0.32, Math.PI, 0);
    ctx.lineTo(0.32, 0.08);
    ctx.lineTo(-0.32, 0.08);
    ctx.fill();
    ctx.strokeStyle = "#b15cff";
    ctx.lineWidth = 0.09;
    ctx.lineCap = "round";
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 0.13, 0.06);
      ctx.quadraticCurveTo(i * 0.2, 0.36, i * 0.16, 0.58);
      ctx.stroke();
    }
    eye(ctx, -0.12, -0.12, 0.7);
    eye(ctx, 0.12, -0.12, 0.7);
  },
  dolphin(ctx) {
    ctx.fillStyle = "#4aa3c7";
    ctx.beginPath();
    ctx.moveTo(-0.55, 0.12);
    ctx.quadraticCurveTo(-0.1, -0.48, 0.48, -0.05);
    ctx.quadraticCurveTo(0.15, 0.08, 0.42, 0.28);
    ctx.quadraticCurveTo(-0.05, 0.12, -0.55, 0.12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.05, -0.22);
    ctx.lineTo(0.02, -0.48);
    ctx.lineTo(0.16, -0.16);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.48, 0.08);
    ctx.lineTo(-0.72, -0.12);
    ctx.lineTo(-0.68, 0.22);
    ctx.fill();
    eye(ctx, 0.22, -0.02, 0.55);
  },
  starfish(ctx) {
    ctx.fillStyle = "#f08a3c";
    starPath(ctx, 0.62, 0.42);
    ctx.fill();
    eye(ctx, -0.1, -0.02, 0.55);
    eye(ctx, 0.12, -0.02, 0.55);
    ctx.strokeStyle = "#9a4e16";
    ctx.lineWidth = 0.04;
    ctx.beginPath();
    ctx.arc(0, 0.12, 0.08, 0.15, Math.PI - 0.15);
    ctx.stroke();
  },
  rocket(ctx) {
    ctx.fillStyle = "#f4f7fb";
    ctx.beginPath();
    ctx.moveTo(0, -0.68);
    ctx.quadraticCurveTo(0.28, -0.2, 0.22, 0.28);
    ctx.lineTo(-0.22, 0.28);
    ctx.quadraticCurveTo(-0.28, -0.2, 0, -0.68);
    ctx.fill();
    ctx.fillStyle = "#ff7b6a";
    ctx.beginPath();
    ctx.moveTo(-0.22, 0.12);
    ctx.lineTo(-0.42, 0.42);
    ctx.lineTo(-0.12, 0.28);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.22, 0.12);
    ctx.lineTo(0.42, 0.42);
    ctx.lineTo(0.12, 0.28);
    ctx.fill();
    ctx.fillStyle = "#7ec8ff";
    ctx.beginPath();
    ctx.arc(0, -0.08, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffb15a";
    ctx.beginPath();
    ctx.moveTo(-0.08, 0.28);
    ctx.lineTo(0, 0.55);
    ctx.lineTo(0.08, 0.28);
    ctx.fill();
  },
  planet(ctx) {
    ctx.strokeStyle = "#e7c56a";
    ctx.lineWidth = 0.06;
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.62, 0.18, -0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#7d6cff";
    ctx.beginPath();
    ctx.arc(0, 0, 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b9a6ff";
    ctx.beginPath();
    ctx.ellipse(-0.08, -0.06, 0.12, 0.08, 0.4, 0, Math.PI * 2);
    ctx.fill();
  },
  comet(ctx) {
    ctx.fillStyle = "#ffe29a";
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(-0.55, 0.2);
    ctx.quadraticCurveTo(-0.1, 0.05, 0.2, -0.08);
    ctx.quadraticCurveTo(-0.15, 0.28, -0.55, 0.2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff6d8";
    ctx.beginPath();
    ctx.arc(0.28, -0.12, 0.2, 0, Math.PI * 2);
    ctx.fill();
  },
  alien(ctx) {
    ctx.fillStyle = "#7ed957";
    ctx.beginPath();
    ctx.ellipse(0, 0.08, 0.38, 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#7ed957";
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    ctx.moveTo(-0.12, -0.22);
    ctx.lineTo(-0.2, -0.48);
    ctx.moveTo(0.12, -0.22);
    ctx.lineTo(0.2, -0.48);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-0.2, -0.5, 0.05, 0, Math.PI * 2);
    ctx.arc(0.2, -0.5, 0.05, 0, Math.PI * 2);
    ctx.fill();
    eye(ctx, -0.14, 0.02, 0.9);
    eye(ctx, 0.14, 0.02, 0.9);
    ctx.strokeStyle = "#2f6b24";
    ctx.beginPath();
    ctx.arc(0, 0.2, 0.1, 0.2, Math.PI - 0.2);
    ctx.stroke();
  },
  astronaut(ctx) {
    ctx.fillStyle = "#f4f7fb";
    ctx.fillRect(-0.22, 0.02, 0.44, 0.4);
    ctx.fillStyle = "#d5dbe6";
    ctx.fillRect(0.18, 0.08, 0.14, 0.26);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, -0.22, 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#263246";
    ctx.beginPath();
    ctx.arc(0, -0.2, 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9fd7ff";
    ctx.beginPath();
    ctx.arc(-0.04, -0.24, 0.05, 0, Math.PI * 2);
    ctx.fill();
  },
  moon(ctx) {
    ctx.fillStyle = "#ffe3a6";
    ctx.beginPath();
    ctx.arc(-0.06, 0, 0.4, Math.PI * 0.55, Math.PI * 1.45, true);
    ctx.arc(0.16, 0, 0.32, Math.PI * 1.35, Math.PI * 0.65, false);
    ctx.fill();
  },
  apple(ctx) {
    ctx.fillStyle = "#e24b4b";
    ctx.beginPath();
    ctx.arc(-0.12, 0.08, 0.28, 0, Math.PI * 2);
    ctx.arc(0.12, 0.08, 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6b3a1e";
    ctx.lineWidth = 0.06;
    ctx.beginPath();
    ctx.moveTo(0, -0.16);
    ctx.lineTo(0.02, -0.42);
    ctx.stroke();
    ctx.fillStyle = "#67a84a";
    ctx.beginPath();
    ctx.ellipse(0.16, -0.36, 0.14, 0.08, 0.6, 0, Math.PI * 2);
    ctx.fill();
  },
  cake(ctx) {
    ctx.fillStyle = "#f2c1d6";
    ctx.beginPath();
    ctx.moveTo(0, -0.45);
    ctx.lineTo(0.42, 0.4);
    ctx.lineTo(-0.42, 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff6ea";
    ctx.fillRect(-0.28, 0.02, 0.56, 0.12);
    ctx.fillStyle = "#e24b4b";
    ctx.beginPath();
    ctx.arc(0, -0.48, 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
  grapes(ctx) {
    ctx.fillStyle = "#7b4fd0";
    const spots = [
      [-0.16, -0.2],
      [0.08, -0.22],
      [-0.28, 0.02],
      [-0.02, 0],
      [0.22, 0.02],
      [-0.14, 0.24],
      [0.1, 0.24],
    ];
    for (const [x, y] of spots) {
      ctx.beginPath();
      ctx.arc(x, y, 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#6b3a1e";
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    ctx.moveTo(-0.04, -0.34);
    ctx.lineTo(0.02, -0.52);
    ctx.stroke();
  },
  cookie(ctx) {
    ctx.fillStyle = "#e0a15a";
    ctx.beginPath();
    ctx.arc(0, 0, 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6b3a1e";
    for (const [x, y] of [
      [-0.16, -0.12],
      [0.12, -0.16],
      [0, 0.08],
      [-0.18, 0.18],
      [0.18, 0.16],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 0.06, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  cheese(ctx) {
    ctx.fillStyle = "#f2c14e";
    ctx.beginPath();
    ctx.moveTo(-0.4, 0.36);
    ctx.lineTo(0.46, 0.36);
    ctx.lineTo(-0.05, -0.48);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffe9a8";
    for (const [x, y, r] of [
      [-0.08, 0.12, 0.07],
      [0.16, 0.2, 0.05],
      [0.02, -0.08, 0.045],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  juice(ctx) {
    ctx.fillStyle = "#ff8d6b";
    ctx.beginPath();
    ctx.moveTo(-0.22, -0.08);
    ctx.lineTo(0.22, -0.08);
    ctx.lineTo(0.16, 0.46);
    ctx.lineTo(-0.16, 0.46);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#fff6ea";
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    ctx.moveTo(0.08, -0.08);
    ctx.lineTo(0.2, -0.48);
    ctx.stroke();
    ctx.fillStyle = "#fff6ea";
    ctx.fillRect(-0.24, -0.2, 0.48, 0.08);
  },
};

export function drawIcon(ctx, name) {
  ctx.save();
  const draw = ICONS[name];
  if (draw) draw(ctx);
  else {
    ctx.fillStyle = "#4a2c12";
    ctx.font = "700 1.15px Fredoka, Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(name || "?").slice(0, 1).toUpperCase(), 0, 0.05);
  }
  ctx.restore();
}
