// localStorage helpers for high score + mute preference.
// All access is wrapped so the game still runs if storage is unavailable
// (e.g. private browsing modes).

import { STORAGE_KEY, MUTE_KEY } from '../config.js';

export function getBestScore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const value = parseInt(raw, 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (e) {
    return 0;
  }
}

export function setBestScore(score) {
  try {
    localStorage.setItem(STORAGE_KEY, String(score));
  } catch (e) {
    /* ignore */
  }
}

// Returns the new best and whether it was beaten.
export function commitScore(score) {
  const best = getBestScore();
  if (score > best) {
    setBestScore(score);
    return { best: score, isNewBest: true };
  }
  return { best, isNewBest: false };
}

export function getMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch (e) {
    return false;
  }
}

export function setMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch (e) {
    /* ignore */
  }
}
