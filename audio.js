let ctx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function setMuted(next) {
  muted = next;
  return muted;
}

export function unlock() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") ctx.resume();
}

function tone(freq, when, dur, type, gain) {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  amp.gain.setValueAtTime(0.0001, when);
  amp.gain.exponentialRampToValueAtTime(gain, when + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + dur + 0.02);
}

export function play(kind) {
  if (!ctx || muted) return;
  const now = ctx.currentTime;
  if (kind === "flip") tone(392, now, 0.12, "sine", 0.035);
  if (kind === "miss") tone(196, now, 0.16, "triangle", 0.03);
  if (kind === "match") {
    tone(523, now, 0.18, "sine", 0.04);
    tone(659, now + 0.08, 0.22, "sine", 0.035);
    tone(784, now + 0.16, 0.28, "triangle", 0.03);
  }
  if (kind === "card") tone(494, now, 0.2, "sine", 0.03);
  if (kind === "win") {
    [523, 659, 784, 1046].forEach((freq, index) => {
      tone(freq, now + index * 0.09, 0.28, "sine", 0.035);
    });
  }
}
