// Spawns, moves, pools, and scores pillar pairs.
// Pillars use a fixed-height texture positioned so only the gap matters —
// no vertical scaling, so Arcade bodies stay pixel-accurate.
import Phaser from 'phaser';
import { TUNING, GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const PILLAR_TEX_H = 600;
const POOL_SIZE = 6;

export default class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group({ allowGravity: false, immovable: true });
    this.pairs = [];
    this.distanceAccumulator = 0;
    this.scrollSpeed = TUNING.baseScrollSpeed;
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

    const pair = { top, bottom, topCap, bottomCap, scored: false, active: false };
    this.deactivate(pair);
    return pair;
  }

  deactivate(pair) {
    pair.active = false;
    pair.scored = false;
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
    const minCenter = margin + gap / 2;
    const maxCenter = this.floorY - margin - gap / 2;
    const gapCenter = Phaser.Math.Between(minCenter, maxCenter);
    const gapTop = gapCenter - gap / 2;
    const gapBottom = gapCenter + gap / 2;
    const x = GAME_WIDTH + TUNING.pillarWidth;

    pair.active = true;
    pair.scored = false;

    pair.top.setActive(true).setVisible(true);
    pair.top.body.enable = true;
    pair.top.setPosition(x, gapTop);

    pair.bottom.setActive(true).setVisible(true);
    pair.bottom.body.enable = true;
    pair.bottom.setPosition(x, gapBottom);

    pair.topCap.setVisible(true).setPosition(x, gapTop);
    pair.bottomCap.setVisible(true).setPosition(x, gapBottom);

    this.applyVelocity(pair);
  }

  applyVelocity(pair) {
    pair.top.body.setVelocityX(-this.scrollSpeed);
    pair.bottom.body.setVelocityX(-this.scrollSpeed);
  }

  // Called every frame from GameScene; returns points gained this frame.
  update(delta, score, playerX) {
    if (!this.running) return 0;
    const dt = delta / 1000;
    this.scrollSpeed = this.computeSpeed(score);

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
