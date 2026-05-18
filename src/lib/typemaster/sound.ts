// Tiny WebAudio synth — no external assets, no audio files in bundle.
// Plays nothing until first user interaction (browser autoplay policy is fine here
// because we only fire sounds in response to user input).

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  const Ctor =
    (window as any).AudioContext ?? (window as any).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  masterGain = ctx!.createGain();
  masterGain.gain.value = 0.18; // overall ceiling — keep it subtle
  masterGain.connect(ctx!.destination);
  return ctx;
}

function tone(
  freq: number,
  durationSec: number,
  opts: { type?: OscillatorType; volume?: number; attack?: number; delay?: number } = {}
) {
  if (!enabled) return;
  const c = getCtx();
  if (!c || !masterGain) return;
  const t0 = c.currentTime + (opts.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.value = freq;
  const vol = opts.volume ?? 0.7;
  const attack = opts.attack ?? 0.005;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);
  osc.connect(g).connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + durationSec + 0.02);
}

export const Sound = {
  setEnabled(v: boolean) {
    enabled = v;
  },
  correct() {
    tone(660, 0.12, { type: 'triangle', volume: 0.6 });
    tone(990, 0.18, { type: 'triangle', volume: 0.4, delay: 0.06 });
  },
  wrong() {
    tone(220, 0.18, { type: 'square', volume: 0.35 });
    tone(165, 0.22, { type: 'square', volume: 0.3, delay: 0.05 });
  },
  combo(level: number) {
    // ascending blip — louder as combo grows
    const base = 600 + Math.min(level, 20) * 30;
    tone(base, 0.08, { type: 'sine', volume: 0.5 });
    tone(base * 1.5, 0.1, { type: 'sine', volume: 0.35, delay: 0.04 });
  },
  levelUp() {
    const notes = [523, 659, 784, 1047]; // C, E, G, C
    notes.forEach((f, i) =>
      tone(f, 0.22, { type: 'triangle', volume: 0.5, delay: i * 0.08 })
    );
  },
  tick() {
    tone(900, 0.04, { type: 'sine', volume: 0.25 });
  },
  expire() {
    tone(160, 0.35, { type: 'sawtooth', volume: 0.35 });
  },
};
