// GameOverScene: final score, best, "New Best!" celebration, instant restart.
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';
import Background from '../objects/Background.js';
import { commitScore } from '../utils/storage.js';
import { Sfx } from '../utils/audio.js';
import { createMuteButton } from '../objects/MuteButton.js';
import { createButton } from '../objects/Button.js';

const RESTART_LOCKOUT = 600; // ms before input is accepted

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    this.cameras.main.fadeIn(250, 15, 22, 38);
    this.background = new Background(this, { scroll: false });

    const { best, isNewBest } = commitScore(this.finalScore);

    // Full-screen "tap empty space to restart" zone, sitting BELOW the buttons.
    // Phaser's topOnly input means a tap on the Menu/Restart button hits that
    // button only — never this zone — so they can't steal each other's taps.
    this.add
      .zone(0, 0, GAME_WIDTH, GAME_HEIGHT)
      .setOrigin(0, 0)
      .setDepth(1)
      .setInteractive()
      .on('pointerdown', () => this.restart());

    // Panel.
    const panel = this.add
      .rectangle(GAME_WIDTH / 2, 320, 300, 280, 0x1b2a4a, 0.78)
      .setStrokeStyle(3, COLORS.accent, 0.6)
      .setDepth(20);
    panel.setScale(0.8);
    panel.setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 260, ease: 'Back.out' });

    // Title.
    const title = this.add
      .text(GAME_WIDTH / 2, 220, 'Game Over', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '40px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setStroke('#1b2a4a', 6)
      .setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, y: 210, duration: 300, ease: 'Quad.out' });

    // Score + best.
    this.add
      .text(GAME_WIDTH / 2, 290, 'SCORE', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: 'rgba(255,255,255,0.7)',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(30);
    this.add
      .text(GAME_WIDTH / 2, 320, String(this.finalScore), {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '44px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(30);

    // Best score badge.
    createButton(this, GAME_WIDTH / 2, 376, `★  BEST  ${best}`, {
      variant: 'badge',
      width: 180,
      height: 46,
      fontSize: 20,
      depth: 30,
    });

    if (isNewBest && this.finalScore > 0) {
      this.celebrateNewBest();
    }

    // Action buttons (revealed after the lockout).
    this.restartBtn = createButton(this, GAME_WIDTH / 2, 482, 'Tap to Restart', {
      variant: 'primary',
      width: 240,
      height: 60,
      fontSize: 24,
      depth: 30,
      interactive: true,
      onClick: () => this.restart(),
    }).setAlpha(0);

    this.menuBtn = createButton(this, GAME_WIDTH / 2, 556, 'Menu', {
      variant: 'secondary',
      width: 150,
      height: 46,
      fontSize: 18,
      depth: 30,
      interactive: true,
      onClick: () => this.goMenu(),
    }).setAlpha(0);

    this.muteButton = createMuteButton(this);

    // Brief input lockout so the player doesn't skip this screen by accident.
    this.canRestart = false;
    this.time.delayedCall(RESTART_LOCKOUT, () => {
      this.canRestart = true;
      this.tweens.add({
        targets: [this.restartBtn, this.menuBtn],
        alpha: 1,
        y: '-=6',
        duration: 300,
        ease: 'Quad.out',
        onComplete: () => {
          // Gentle attention pulse on the primary button.
          this.tweens.add({
            targets: this.restartBtn,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
          });
        },
      });
    });

    this.input.keyboard.on('keydown-SPACE', this.restart, this);
    this.input.keyboard.on('keydown-UP', this.restart, this);
  }

  celebrateNewBest() {
    Sfx.newBest();
    const badge = this.add
      .text(GAME_WIDTH / 2, 405, '★ New Best! ★', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '22px',
        color: '#ffd35c',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(31)
      .setStroke('#1b2a4a', 5);

    this.tweens.add({
      targets: badge,
      scale: { from: 0.5, to: 1.1 },
      duration: 400,
      ease: 'Back.out',
      yoyo: true,
      hold: 200,
      onComplete: () => badge.setScale(1),
    });

    // Confetti-ish burst.
    const p = this.add.particles(GAME_WIDTH / 2, 405, 'spark', {
      speed: { min: 120, max: 320 },
      angle: { min: 200, max: 340 },
      scale: { start: 1, end: 0 },
      lifespan: 900,
      gravityY: 400,
      quantity: 30,
      tint: [0xffd35c, 0x6fd3ff, 0xffffff, 0x5be0c8],
      emitting: false,
    });
    p.setDepth(35);
    p.explode(30);
  }

  restart() {
    if (!this.canRestart) return;
    this.canRestart = false;
    this.cameras.main.fadeOut(200, 15, 22, 38);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameScene'));
  }

  goMenu() {
    if (!this.canRestart) return;
    this.canRestart = false;
    this.cameras.main.fadeOut(200, 15, 22, 38);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
  }

  update(time, delta) {
    this.background.update(delta);
  }
}
