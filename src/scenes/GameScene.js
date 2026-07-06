// GameScene: the core gameplay loop — flap, dodge, score, crash.
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TUNING, COLORS } from '../config.js';
import Background from '../objects/Background.js';
import Player from '../objects/Player.js';
import ObstacleManager from '../objects/ObstacleManager.js';
import StarManager from '../objects/StarManager.js';
import { createMuteButton } from '../objects/MuteButton.js';
import { Sfx, unlockAudio } from '../utils/audio.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.cameras.main.fadeIn(220, 15, 22, 38);
    this.isStarted = false;
    this.isGameOver = false;
    this.score = 0;
    this.starsCollected = 0;

    // Dash state — meter fills by collecting stars; hold input to unleash.
    this.dashMeter = 0;
    this.isDashing = false;
    this.dashGraceActive = false;
    this.dashGraceUntil = 0;
    this.holdActive = false;
    this.holdStart = 0;
    this.shownDashHint = false;

    this.background = new Background(this, { scroll: true });

    // Player hovers idle at the left-third until the first flap.
    this.player = new Player(this, GAME_WIDTH * 0.32, GAME_HEIGHT / 2);

    this.obstacles = new ObstacleManager(this, (info) => this.stars.maybeSpawn(info));
    this.stars = new StarManager(this);
    this.physics.add.overlap(this.player, this.stars.getGroup(), (_player, star) =>
      this.collectStar(star)
    );

    // --- Collisions ---
    this.floorY = GAME_HEIGHT - TUNING.groundHeight;
    // Invisible floor body.
    this.floor = this.add
      .rectangle(GAME_WIDTH / 2, this.floorY + TUNING.groundHeight / 2, GAME_WIDTH, TUNING.groundHeight)
      .setVisible(false);
    this.physics.add.existing(this.floor, true);

    this.physics.add.collider(this.player, this.floor, () => this.handleHit(), null, this);
    this.physics.add.overlap(this.player, this.obstacles.getGroup(), () => this.handleHit(), null, this);

    // --- Score UI ---
    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 70, '0', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '56px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setShadow(0, 5, 'rgba(0,0,0,0.4)', 6, false, true)
      .setStroke('#1b2a4a', 7);

    // --- Dash meter: star pips under the score. ---
    this.pips = [];
    for (let i = 0; i < TUNING.starsPerDash; i++) {
      const x = GAME_WIDTH / 2 + (i - (TUNING.starsPerDash - 1) / 2) * 30;
      const pip = this.add.image(x, 118, 'star').setDepth(50).setScale(0.8).setAlpha(0.28);
      this.pips.push(pip);
    }

    // --- "Get Ready" prompt ---
    this.readyText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 110, 'Tap to Fly', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '26px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setShadow(0, 3, 'rgba(0,0,0,0.4)', 4);
    this.tweens.add({
      targets: this.readyText,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.muteButton = createMuteButton(this);

    // Burst emitter reused for scoring + death.
    this.burst = this.add.particles(0, 0, 'particle', {
      speed: { min: 80, max: 260 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 520,
      blendMode: 'ADD',
      emitting: false,
    });
    this.burst.setDepth(40);

    // --- Input ---
    // Full-screen flap zone below the mute button; topOnly input keeps a tap on
    // the mute button from also flapping. Tap = flap; holding the input with a
    // full star meter triggers the dash (checked in update()).
    this.input.keyboard.on('keydown-SPACE', this.onFlapDown, this);
    this.input.keyboard.on('keydown-UP', this.onFlapDown, this);
    this.input.keyboard.on('keyup-SPACE', this.onFlapUp, this);
    this.input.keyboard.on('keyup-UP', this.onFlapUp, this);
    this.input.on('pointerup', () => this.onFlapUp());
    this.add
      .zone(0, 0, GAME_WIDTH, GAME_HEIGHT)
      .setOrigin(0, 0)
      .setDepth(1)
      .setInteractive()
      .on('pointerdown', () => this.onFlapDown());
  }

  onFlapDown(event) {
    if (event && event.repeat) return; // held keys shouldn't auto-flap or reset the hold timer
    if (this.isGameOver) return;
    unlockAudio();

    this.holdActive = true;
    this.holdStart = this.time.now;

    if (!this.isStarted) {
      this.isStarted = true;
      this.player.start();
      this.obstacles.start();
      this.tweens.killTweensOf(this.readyText);
      this.readyText.destroy();
      return;
    }
    this.player.flap();
  }

  onFlapUp() {
    this.holdActive = false;
  }

  addScore() {
    this.score += 1;
    this.scoreText.setText(String(this.score));
    Sfx.score();

    // Pop the score number.
    this.tweens.add({
      targets: this.scoreText,
      scale: 1.35,
      duration: 110,
      yoyo: true,
      ease: 'Back.out',
    });

    // Small spark burst at the player.
    this.burst.setParticleTint(COLORS.accent);
    this.burst.emitParticleAt(this.player.x + 14, this.player.y, 8);

    // Day -> dusk shift as score climbs (caps at 30 points).
    this.background.setDusk(Math.min(this.score / 30, 1));
  }

  collectStar(star) {
    if (this.isGameOver || !star.active) return;
    this.stars.collect(star);
    this.starsCollected += 1;
    Sfx.star();

    this.burst.setParticleTint(COLORS.star);
    this.burst.emitParticleAt(star.x, star.y, 10);

    if (this.dashMeter >= TUNING.starsPerDash) return; // meter already full
    this.dashMeter += 1;

    // Light up the next pip.
    const pip = this.pips[this.dashMeter - 1];
    pip.setAlpha(1);
    this.tweens.add({
      targets: pip,
      scale: 1.25,
      duration: 130,
      yoyo: true,
      ease: 'Back.out',
    });

    if (this.dashMeter === TUNING.starsPerDash) this.onDashReady();
  }

  onDashReady() {
    Sfx.dashReady();

    // Pulse the full meter until the dash is spent.
    this.pipPulse = this.tweens.add({
      targets: this.pips,
      scale: 1.15,
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    if (this.shownDashHint) return;
    this.shownDashHint = true;
    const hint = this.add
      .text(GAME_WIDTH / 2, 156, 'HOLD to Dash!', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '18px',
        color: '#ffd94d',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setStroke('#1b2a4a', 5)
      .setAlpha(0);
    this.tweens.add({
      targets: hint,
      alpha: 1,
      duration: 200,
      hold: 1500,
      yoyo: true,
      onComplete: () => hint.destroy(),
    });
  }

  startDash() {
    this.isDashing = true;
    this.dashMeter = 0;
    this.dashGraceActive = false;

    // Spend the meter.
    if (this.pipPulse) this.pipPulse.stop();
    this.pips.forEach((pip) => pip.setAlpha(0.28).setScale(0.8));

    Sfx.dash();
    this.player.startDash();
    this.obstacles.speedMultiplier = TUNING.dashSpeedMult;
    this.cameras.main.zoomTo(1.06, 140, 'Quad.easeOut');

    // Fading afterimages sell the speed.
    this.dashGhostTimer = this.time.addEvent({
      delay: 45,
      loop: true,
      callback: () => {
        const ghost = this.add
          .image(this.player.x, this.player.y, 'player')
          .setDepth(9)
          .setAlpha(0.45)
          .setTint(COLORS.accent);
        this.tweens.add({
          targets: ghost,
          alpha: 0,
          scale: 0.6,
          duration: 280,
          onComplete: () => ghost.destroy(),
        });
      },
    });

    this.time.delayedCall(TUNING.dashDuration, () => this.endDash());
  }

  endDash() {
    if (this.dashGhostTimer) this.dashGhostTimer.remove();
    if (this.isGameOver) return;

    this.isDashing = false;
    this.obstacles.speedMultiplier = 1;
    this.cameras.main.zoomTo(1, 180, 'Quad.easeOut');
    this.player.endDash();

    // Keep invincibility briefly — and until clear of any pillar the dash
    // ended inside — so the dash can never dump the player into an unfair hit.
    this.dashGraceActive = true;
    this.dashGraceUntil = this.time.now + TUNING.dashGraceMs;
  }

  handleHit() {
    if (this.isGameOver || !this.isStarted || this.player.invincible) return;
    this.isGameOver = true;

    Sfx.hit();
    this.player.die();
    this.obstacles.stop();
    this.stars.stop();

    // Juice: screen shake + white flash.
    this.cameras.main.shake(280, 0.015);
    this.cameras.main.flash(180, 255, 255, 255);

    // Death particle burst.
    this.burst.setParticleTint([COLORS.player, COLORS.playerGlow, COLORS.white]);
    this.burst.emitParticleAt(this.player.x, this.player.y, 24);

    // Let the player tumble down, then transition.
    this.player.setVelocityY(-200);
    this.player.body.setAllowGravity(true);

    this.time.delayedCall(650, () => {
      this.scene.start('GameOverScene', { score: this.score, stars: this.starsCollected });
    });
  }

  update(time, delta) {
    this.background.update(delta, this.obstacles.scrollSpeed);

    if (!this.isStarted || this.isGameOver) return;

    // Holding the input with a full meter unleashes the dash.
    if (
      !this.isDashing &&
      this.holdActive &&
      this.dashMeter >= TUNING.starsPerDash &&
      this.time.now - this.holdStart >= TUNING.dashHoldMs
    ) {
      this.startDash();
    }

    // Post-dash grace ends once the timer is up AND the player is clear of pillars.
    if (
      this.dashGraceActive &&
      this.time.now >= this.dashGraceUntil &&
      !this.physics.overlap(this.player, this.obstacles.getGroup())
    ) {
      this.dashGraceActive = false;
      this.player.clearInvincible();
    }

    const gained = this.obstacles.update(delta, this.score, this.player.x);
    for (let i = 0; i < gained; i++) this.addScore();
    this.stars.update(this.obstacles.scrollSpeed);

    // Ceiling acts as a soft wall (bonk, don't die) to feel fair.
    if (this.player.y < 14) {
      this.player.y = 14;
      if (this.player.body.velocity.y < 0) this.player.setVelocityY(0);
    }
  }
}
