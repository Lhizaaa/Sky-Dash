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
};

export const STORAGE_KEY = 'skydash.best';
export const MUTE_KEY = 'skydash.muted';
