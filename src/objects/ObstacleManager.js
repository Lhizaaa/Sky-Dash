// Spawns, moves, pools, and scores pillar pairs.
// Pillars use a fixed-height texture positioned so only the gap matters —
// no vertical scaling, so Arcade bodies stay pixel-accurate.
import Phaser from 'phaser';
import { TUNING, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const PILLAR_TEX_H = 600;
const POOL_SIZE = 6;
// Movers are tinted violet so the player can read at a glance which
// pillars oscillate; static pillars keep the texture's natural teal.
const MOVER_TINT = 0xd0b3ff;
const STATIC_TINT = 0xffffff;

export default class ObstacleManager {
  constructor(scene, onSpawn = null) {
    this.scene = scene;
    this.onSpawn = onSpawn; // callback({ x, gapCenter, gap, pair }) on each spawn
    this.group = scene.physics.add.group({ allowGravity: false, immovable: true });
    this.pairs = [];
    this.distanceAccumulator = 0;
    this.scrollSpeed = TUNING.baseScrollSpeed;
    this.speedMultiplier = 1; // >1 while the player is dashing
    this.running = false;

    this.floorY = GAME_HEIGHT - TUNING.groundHeight;

    for (let i = 0; i < POOL_SIZE; i++) {
      this.pairs.push(this.createPair());
    }
  }

  createPair() {
    const top = this.group.create(0, 0, 'pillar-body');
    top.setOrigin(0.5, 1); // bottom edge is the gap-facing edge
    top.body.setAllowGravity(false);
    top.body.immovable = true;

    const bottom = this.group.create(0, 0, 'pillar-body');
    bottom.setOrigin(0.5, 0); // top edge is the gap-facing edge
    bottom.body.setAllowGravity(false);
    bottom.body.immovable = true;

    const topCap = this.scene.add.image(0, 0, 'pillar-cap').setOrigin(0.5, 1).setDepth(6);
    const bottomCap = this.scene.add
      .image(0, 0, 'pillar-cap')
      .setOrigin(0.5, 0)
      .setDepth(6)
      .setFlipY(true);

    top.setDepth(5);
    bottom.setDepth(5);

    const pair = {
      top,
      bottom,
      topCap,
      bottomCap,
      scored: false,
      active: false,
      moveAmp: 0, // >0 = vertically oscillating pair
      moveDir: 1,
      moveT: 0,
    };
    this.deactivate(pair);
    return pair;
  }

  deactivate(pair) {
    pair.active = false;
    pair.scored = false;
    pair.moveAmp = 0;
    pair.moveT = 0;
    [pair.top, pair.bottom].forEach((p) => {
      p.setActive(false).setVisible(false);
      p.body.enable = false;
      p.body.setVelocity(0, 0);
    });
    pair.topCap.setVisible(false);
    pair.bottomCap.setVisible(false);
  }

  start() {
    this.running = true;
    this.distanceAccumulator = TUNING.spawnDistance; // spawn one immediately
  }

  stop() {
    this.running = false;
    this.pairs.forEach((pair) => {
      if (pair.active) {
        pair.top.body.setVelocity(0, 0);
        pair.bottom.body.setVelocity(0, 0);
      }
    });
  }

  reset() {
    this.running = false;
    this.distanceAccumulator = 0;
    this.scrollSpeed = TUNING.baseScrollSpeed;
    this.speedMultiplier = 1;
    this.pairs.forEach((pair) => this.deactivate(pair));
  }

  // Difficulty derived from score.
  computeGap(score) {
    return Math.max(TUNING.minGap, TUNING.baseGap - TUNING.gapShrinkPerPoint * score);
  }

  computeSpeed(score) {
    return Math.min(TUNING.maxScrollSpeed, TUNING.baseScrollSpeed + TUNING.speedRampPerPoint * score);
  }

  spawn(score) {
    const pair = this.pairs.find((p) => !p.active);
    if (!pair) return;

    const gap = this.computeGap(score);
    const margin = 60;
    let minCenter = margin + gap / 2;
    let maxCenter = this.floorY - margin - gap / 2;

    // Past the mover threshold, some pairs oscillate vertically. Shrink the
    // spawn range by the amplitude so the gap never leaves the safe band.
    let moveAmp = 0;
    if (
      score >= TUNING.moverStartScore &&
      Math.random() < TUNING.moverChance &&
      maxCenter - minCenter > TUNING.moverAmplitude * 2
    ) {
      moveAmp = TUNING.moverAmplitude;
      minCenter += moveAmp;
      maxCenter -= moveAmp;
    }

    const gapCenter = Phaser.Math.Between(minCenter, maxCenter);
    const gapTop = gapCenter - gap / 2;
    const gapBottom = gapCenter + gap / 2;
    const x = GAME_WIDTH + TUNING.pillarWidth;

    pair.active = true;
    pair.scored = false;
    pair.moveAmp = moveAmp;
    pair.moveDir = Math.random() < 0.5 ? 1 : -1;
    pair.moveT = 0;

    pair.top.setActive(true).setVisible(true);
    pair.top.body.enable = true;
    pair.top.setPosition(x, gapTop);

    pair.bottom.setActive(true).setVisible(true);
    pair.bottom.body.enable = true;
    pair.bottom.setPosition(x, gapBottom);

    pair.topCap.setVisible(true).setPosition(x, gapTop);
    pair.bottomCap.setVisible(true).setPosition(x, gapBottom);

    const tint = moveAmp > 0 ? MOVER_TINT : STATIC_TINT;
    pair.top.setTint(tint);
    pair.bottom.setTint(tint);
    pair.topCap.setTint(tint);
    pair.bottomCap.setTint(tint);

    this.applyVelocity(pair);

    if (this.onSpawn) this.onSpawn({ x, gapCenter, gap, pair });
  }

  applyVelocity(pair) {
    pair.top.body.setVelocityX(-this.scrollSpeed);
    pair.bottom.body.setVelocityX(-this.scrollSpeed);

    // Movers oscillate via velocity so Arcade bodies stay in sync. Integrating
    // amp·ω·cos(ωt) from t=0 keeps the gap within ±amp of its spawn centre.
    let vy = 0;
    if (pair.moveAmp > 0) {
      const omega = (Math.PI * 2) / (TUNING.moverPeriodMs / 1000);
      vy = pair.moveDir * pair.moveAmp * omega * Math.cos(omega * pair.moveT);
    }
    pair.top.body.setVelocityY(vy);
    pair.bottom.body.setVelocityY(vy);
  }

  // Called every frame from GameScene; returns points gained this frame.
  update(delta, score, playerX) {
    if (!this.running) return 0;
    const dt = delta / 1000;
    this.scrollSpeed = this.computeSpeed(score) * this.speedMultiplier;

    // Distance-based spawning keeps spacing consistent across speeds.
    this.distanceAccumulator += this.scrollSpeed * dt;
    if (this.distanceAccumulator >= TUNING.spawnDistance) {
      this.distanceAccumulator -= TUNING.spawnDistance;
      this.spawn(score);
    }

    let gained = 0;
    const halfW = TUNING.pillarWidth / 2;

    this.pairs.forEach((pair) => {
      if (!pair.active) return;

      pair.moveT += dt;
      this.applyVelocity(pair);

      // Caps ride along with their pillars.
      pair.topCap.x = pair.top.x;
      pair.topCap.y = pair.top.y;
      pair.bottomCap.x = pair.bottom.x;
      pair.bottomCap.y = pair.bottom.y;

      // Score when the player clears the right edge of the pillar.
      if (!pair.scored && pair.top.x + halfW < playerX) {
        pair.scored = true;
        gained += 1;
      }

      // Recycle once fully off the left edge.
      if (pair.top.x < -halfW - TUNING.pillarWidth) {
        this.deactivate(pair);
      }
    });

    return gained;
  }

  getGroup() {
    return this.group;
  }
}
