// The player orb: gravity-driven, flap impulse, tilt, and a glowing trail.
import Phaser from 'phaser';
import { TUNING, COLORS } from '../config.js';
import { Sfx } from '../utils/audio.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.setCircle(15, 9, 9); // tighter circular hitbox than the 48px sprite
    this.setCollideWorldBounds(false);

    // Glow halo follows the player.
    this.glow = scene.add.image(x, y, 'player-glow').setDepth(9).setAlpha(0.8);

    // Particle trail (Phaser 3.60+ particle API).
    this.trail = scene.add.particles(0, 0, 'particle', {
      follow: this,
      speed: { min: 5, max: 25 },
      angle: { min: 160, max: 200 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 380,
      frequency: 35,
      tint: [COLORS.playerGlow, COLORS.accent, COLORS.white],
      blendMode: 'ADD',
    });
    this.trail.setDepth(8);
    this.trail.stop();

    this.isFrozen = true; // hovers idle until first flap
    this.isDead = false;
    this.isDashing = false;
    this.invincible = false; // true during dash + post-dash grace
    this.body.setAllowGravity(false);

    // Idle hover tween while frozen.
    this.hoverTween = scene.tweens.add({
      targets: this,
      y: y - 12,
      duration: 650,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  start() {
    // First flap: enable gravity and begin the run.
    this.isFrozen = false;
    if (this.hoverTween) this.hoverTween.stop();
    this.body.setAllowGravity(true);
    this.body.setGravityY(TUNING.gravity);
    this.body.setMaxVelocity(99999, TUNING.maxFallSpeed);
    this.trail.start();
    this.flap();
  }

  // Dash: lock the orb level, cut gravity, and light everything up.
  // Invincibility is cleared by the scene once the post-dash grace ends.
  startDash() {
    if (this.isDead) return;
    this.isDashing = true;
    this.invincible = true;
    this.body.setAllowGravity(false);
    this.setVelocity(0, 0);
    this.setTint(0xbfefff);
    this.glow.setAlpha(1).setScale(1.35);
    this.trail.frequency = 12;
    this.scene.tweens.add({
      targets: this,
      angle: 0,
      duration: 100,
      ease: 'Quad.out',
    });
  }

  endDash() {
    this.isDashing = false;
    this.body.setAllowGravity(true);
    // Soft upward nudge so the player regains control gracefully.
    this.setVelocityY(TUNING.flapVelocity * 0.5);
    this.trail.frequency = 35;
    this.glow.setAlpha(0.8).setScale(1);
  }

  clearInvincible() {
    this.invincible = false;
    this.clearTint();
  }

  flap() {
    if (this.isDead || this.isDashing) return;
    this.setVelocityY(TUNING.flapVelocity);
    Sfx.flap();

    // Quick upward tilt that settles as it falls (handled in update).
    this.scene.tweens.add({
      targets: this,
      angle: -22,
      duration: 110,
      ease: 'Quad.out',
    });

    // Tiny squash-and-stretch pop.
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.85,
      scaleY: 1.15,
      duration: 90,
      yoyo: true,
      ease: 'Quad.out',
    });
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.trail.stop();
    this.body.setVelocityX(0);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Keep glow on the orb.
    this.glow.setPosition(this.x, this.y);

    if (this.isFrozen) return;

    // Tilt downward proportional to fall speed (classic flappy feel).
    if (!this.isDead && this.body.velocity.y > 0) {
      const target = Phaser.Math.Clamp(this.body.velocity.y / 12, 0, 80);
      this.angle = Phaser.Math.Linear(this.angle, target, 0.08);
    }
  }

  destroy(fromScene) {
    if (this.glow) this.glow.destroy();
    if (this.trail) this.trail.destroy();
    if (this.hoverTween) this.hoverTween.stop();
    super.destroy(fromScene);
  }
}
