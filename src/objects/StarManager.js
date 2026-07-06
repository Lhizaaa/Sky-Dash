// Pooled star collectibles. Stars spawn inside pillar gaps (at a random
// vertical offset, so grabbing one adds risk) and charge the dash meter.
// Stars attached to a moving pillar pair ride along with its oscillation.
import Phaser from 'phaser';
import { TUNING } from '../config.js';

const POOL_SIZE = 6;
const EDGE_PADDING = 40; // keep stars this far from the gap edges

export default class StarManager {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group({ allowGravity: false, immovable: true });
    this.stars = [];

    for (let i = 0; i < POOL_SIZE; i++) {
      const star = this.group.create(0, 0, 'star');
      star.setDepth(7);
      star.body.setCircle(11, 3, 3);
      star.pairRef = null;

      // Gentle perpetual spin + pulse; harmless while pooled/invisible.
      scene.tweens.add({
        targets: star,
        angle: 360,
        duration: 2400,
        repeat: -1,
      });
      scene.tweens.add({
        targets: star,
        scale: { from: 0.9, to: 1.1 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });

      this.deactivate(star);
      this.stars.push(star);
    }
  }

  // Called by ObstacleManager whenever a pillar pair spawns.
  maybeSpawn({ x, gapCenter, gap, pair }) {
    if (Math.random() > TUNING.starChance) return;
    const star = this.stars.find((s) => !s.active);
    if (!star) return;

    const range = Math.max(0, gap / 2 - EDGE_PADDING);
    const y = gapCenter + Phaser.Math.Between(-range, range);

    star.setActive(true).setVisible(true);
    star.body.enable = true;
    star.setPosition(x, y);
    // Ride along with oscillating pairs so the star stays inside the gap.
    star.pairRef = pair.moveAmp > 0 ? pair : null;
  }

  collect(star) {
    this.deactivate(star);
  }

  deactivate(star) {
    star.setActive(false).setVisible(false);
    star.body.enable = false;
    star.body.setVelocity(0, 0);
    star.pairRef = null;
  }

  stop() {
    this.stars.forEach((star) => {
      if (star.active) star.body.setVelocity(0, 0);
    });
  }

  update(scrollSpeed) {
    this.stars.forEach((star) => {
      if (!star.active) return;
      star.body.setVelocityX(-scrollSpeed);
      const pair = star.pairRef;
      star.body.setVelocityY(pair && pair.active ? pair.top.body.velocity.y : 0);
      if (star.x < -30) this.deactivate(star);
    });
  }

  getGroup() {
    return this.group;
  }
}
