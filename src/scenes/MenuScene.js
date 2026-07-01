// MenuScene: animated title, pulsing "Tap to Start", current best, mute toggle.
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import Background from '../objects/Background.js';
import { getBestScore } from '../utils/storage.js';
import { unlockAudio } from '../utils/audio.js';
import { createMuteButton } from '../objects/MuteButton.js';
import { createButton } from '../objects/Button.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.fadeIn(300, 15, 22, 38);
    this.background = new Background(this, { scroll: true });

    // Floating title.
    this.title = this.add
      .text(GAME_WIDTH / 2, 200, 'SKY DASH', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: '52px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setShadow(0, 6, 'rgba(0,0,0,0.35)', 8, false, true)
      .setStroke('#1b2a4a', 8);

    this.tweens.add({
      targets: this.title,
      y: 184,
      duration: 1600,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Decorative orb under the title.
    this.orb = this.add.image(GAME_WIDTH / 2, 300, 'player').setScale(1.6).setDepth(30);
    this.add.image(GAME_WIDTH / 2, 300, 'player-glow').setScale(1.4).setDepth(29).setAlpha(0.8);
    this.tweens.add({
      targets: this.orb,
      y: 312,
      angle: 6,
      duration: 1200,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Pulsing prompt.
    this.prompt = this.add
      .text(GAME_WIDTH / 2, 440, 'Tap to Start', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setShadow(0, 3, 'rgba(0,0,0,0.4)', 4);

    this.tweens.add({
      targets: this.prompt,
      alpha: 0.35,
      scale: 0.95,
      duration: 750,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    // Best score badge.
    const best = getBestScore();
    createButton(this, GAME_WIDTH / 2, 522, `★  BEST  ${best}`, {
      variant: 'badge',
      width: 190,
      height: 50,
      fontSize: 22,
      depth: 30,
    });

    // Control hint pill — clearer and high-contrast.
    createButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 124, 'Tap  ·  Click  ·  Space  to Flap', {
      variant: 'hint',
      width: 300,
      height: 48,
      radius: 24,
      fontSize: 17,
      depth: 30,
    });

    // Simple credit line, tucked above the ground.
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 76, 'Created by lhizaa', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.55)',
      })
      .setOrigin(0.5)
      .setDepth(30);

    // Mute toggle (top-right).
    this.muteButton = createMuteButton(this);

    // Input: any tap/click/space starts the game. A full-screen zone (below the
    // mute button) catches taps; topOnly input means tapping mute won't start.
    this.input.keyboard.on('keydown-SPACE', this.startGame, this);
    this.input.keyboard.on('keydown-UP', this.startGame, this);
    this.add
      .zone(0, 0, GAME_WIDTH, GAME_HEIGHT)
      .setOrigin(0, 0)
      .setDepth(1)
      .setInteractive()
      .on('pointerdown', () => this.startGame());

    this.starting = false;
  }

  startGame() {
    if (this.starting) return;
    this.starting = true;
    unlockAudio();
    this.cameras.main.fadeOut(220, 15, 22, 38);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }

  update(time, delta) {
    this.background.update(delta);
  }
}
