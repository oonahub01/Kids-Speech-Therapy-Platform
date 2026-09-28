export const ORBIT = { cx: 0.5, cy: 0.46, rx: 0.3, ry: 0.22 };

export function homeOf(card, now, motion = true) {
  const spin = motion ? now * 0.000065 : 0;
  const wobble = motion ? Math.sin(now / 900 + card.phase) * 0.045 : 0;
  const angle = card.angle + spin + wobble;
  return {
    x: ORBIT.cx + Math.cos(angle) * ORBIT.rx,
    y: ORBIT.cy + Math.sin(angle) * ORBIT.ry,
  };
}

export function slotOf(slot, total, cardId) {
  const angle = -Math.PI / 2 + (slot / total) * Math.PI * 2;
  const sign = String(cardId).endsWith("-b") ? 1 : -1;
  return {
    x: ORBIT.cx + Math.cos(angle) * 0.145 + sign * 0.016,
    y: ORBIT.cy + Math.sin(angle) * 0.1 + sign * 0.008,
  };
}
