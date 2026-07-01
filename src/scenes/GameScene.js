// GameScene: the core gameplay loop — flap, dodge, score, crash.
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TUNING, COLORS } from '../config.js';
import Background from '../objects/Background.js';
import Player from '../objects/Player.js';
import ObstacleManager from '../objects/ObstacleManager.js';
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

    this.background = new Background(this, { scroll: true });

    // Player hovers idle at the left-third until the first flap.
    this.player = new Player(this, GAME_WIDTH * 0.32, GAME_HEIGHT / 2);

    this.obstacles = new ObstacleManager(this);

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
    // the mute button from also flapping.
    this.input.keyboard.on('keydown-SPACE', this.onFlapInput, this);
    this.input.keyboard.on('keydown-UP', this.onFlapInput, this);
    this.add
      .zone(0, 0, GAME_WIDTH, GAME_HEIGHT)
      .setOrigin(0, 0)
      .setDepth(1)
      .setInteractive()
      .on('pointerdown', () => this.onFlapInput());
  }

  onFlapInput() {
    if (this.isGameOver) return;
    unlockAudio();

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

  handleHit() {
    if (this.isGameOver || !this.isStarted) return;
    this.isGameOver = true;

    Sfx.hit();
    this.player.die();
    this.obstacles.stop();

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
      this.scene.start('GameOverScene', { score: this.score });
    });
  }

  update(time, delta) {
    this.background.update(delta, this.obstacles.scrollSpeed);

    if (!this.isStarted || this.isGameOver) return;

    const gained = this.obstacles.update(delta, this.score, this.player.x);
    for (let i = 0; i < gained; i++) this.addScore();

    // Ceiling acts as a soft wall (bonk, don't die) to feel fair.
    if (this.player.y < 14) {
      this.player.y = 14;
      if (this.player.body.velocity.y < 0) this.player.setVelocityY(0);
    }
  }
}
