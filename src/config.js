// Central tuning + constants for Sky Dash.
// Base resolution is portrait, scaled responsively by Phaser's Scale Manager.

export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;

export const COLORS = {
  skyTop: 0x4aa3ff,
  skyBottom: 0xffd9a0,
  skyTopDusk: 0x2a3a72,
  skyBottomDusk: 0xff8a5c,
  player: 0xfff2b2,
  playerGlow: 0xffd35c,
  obstacle: 0x5be0c8,
  obstacleDark: 0x2bb39a,
  ground: 0x3a2f4a,
  groundTop: 0x6f5a8c,
  accent: 0x6fd3ff,
  star: 0xffd94d,
  white: 0xffffff,
};

// Gameplay physics + difficulty tuning.
export const TUNING = {
  gravity: 1500,
  flapVelocity: -430,
  maxFallSpeed: 720,

  // Obstacle scrolling.
  baseScrollSpeed: 170,
  maxScrollSpeed: 300,
  speedRampPerPoint: 3, // px/s added per point scored

  // Gap between top/bottom pillars.
  baseGap: 210,
  minGap: 140,
  gapShrinkPerPoint: 3,

  // Horizontal spacing between obstacle pairs.
  spawnDistance: 240,

  pillarWidth: 70,

  groundHeight: 90,

  // Stars — collectibles that charge the dash meter. Placed inside pillar
  // gaps at a random vertical offset, so grabbing them adds risk.
  starChance: 0.6, // chance a pillar pair carries a star

  // Dash — Sky Dash's signature move. Collect stars to fill the meter,
  // then HOLD input to blast forward: brief invincibility + speed burst.
  starsPerDash: 3,
  dashHoldMs: 220, // hold input this long (with a full meter) to dash
  dashDuration: 700, // ms of invincible speed burst
  dashSpeedMult: 2.4, // scroll-speed multiplier while dashing
  dashGraceMs: 180, // min invincibility after the dash ends (extends until clear of pillars)

  // Moving pillars — past this score, some pairs oscillate vertically.
  moverStartScore: 10,
  moverChance: 0.35,
  moverAmplitude: 46, // px of vertical travel each way
  moverPeriodMs: 2400, // full oscillation period
};

export const STORAGE_KEY = 'skydash.best';
export const MUTE_KEY = 'skydash.muted';
