// Procedural sound effects via the Web Audio API.
// No asset files needed — flap / score / hit are synthesized on the fly.
// Audio stays silent until the first user gesture (browser autoplay policy):
// the AudioContext is created lazily on the first play() call, which always
// happens inside an input handler.

import { getMuted, setMuted } from './storage.js';

let ctx = null;
let muted = getMuted();

function ensureContext() {
  if (ctx) return ctx;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  } catch (e) {
    ctx = null;
  }
  return ctx;
}

// A single short tone with an attack/decay envelope.
function tone({ freq, type = 'sine', duration = 0.12, gain = 0.18, slideTo = null }) {
  if (muted) return;
  const audio = ensureContext();
  if (!audio) return;
  if (audio.state === 'suspended') audio.resume();

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const env = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
  }

  env.gain.setValueAtTime(0.0001, now);
  env.gain.exponentialRampToValueAtTime(gain, now + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(env);
  env.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export const Sfx = {
  flap() {
    tone({ freq: 480, slideTo: 700, type: 'sine', duration: 0.12, gain: 0.14 });
  },
  score() {
    tone({ freq: 660, slideTo: 990, type: 'triangle', duration: 0.14, gain: 0.16 });
  },
  hit() {
    tone({ freq: 200, slideTo: 70, type: 'sawtooth', duration: 0.32, gain: 0.22 });
  },
  newBest() {
    tone({ freq: 660, type: 'triangle', duration: 0.16, gain: 0.16 });
    setTimeout(() => tone({ freq: 880, type: 'triangle', duration: 0.2, gain: 0.16 }), 130);
  },
  star() {
    tone({ freq: 880, slideTo: 1320, type: 'sine', duration: 0.09, gain: 0.12 });
  },
  dashReady() {
    tone({ freq: 780, type: 'triangle', duration: 0.1, gain: 0.14 });
    setTimeout(() => tone({ freq: 1170, type: 'triangle', duration: 0.14, gain: 0.14 }), 90);
  },
  dash() {
    tone({ freq: 160, slideTo: 900, type: 'sawtooth', duration: 0.28, gain: 0.13 });
    tone({ freq: 320, slideTo: 1800, type: 'sine', duration: 0.28, gain: 0.08 });
  },
};

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  setMuted(muted);
  return muted;
}

// Called on the very first user gesture to unlock audio on iOS/Safari.
export function unlockAudio() {
  const audio = ensureContext();
  if (audio && audio.state === 'suspended') audio.resume();
}
