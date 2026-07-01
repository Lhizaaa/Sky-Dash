// BootScene: procedurally generate all textures (no external assets),
// show a brief loading beat, then transition to the MenuScene.
import Phaser from 'phaser';
import { COLORS, TUNING, GAME_WIDTH } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.generateTextures();

    // Short, intentional loading beat so the boot doesn't feel like a flash.
    const label = this.add
      .text(GAME_WIDTH / 2, 350, 'Loading…', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#cdd9f5',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: label,
      alpha: 1,
      duration: 250,
      yoyo: true,
      hold: 200,
      onComplete: () => {
        this.cameras.main.fadeOut(200, 15, 22, 38);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MenuScene');
        });
      },
    });
  }

  generateTextures() {
    this.makePlayerTexture();
    this.makePlayerGlowTexture();
    this.makePillarTextures();
    this.makeCloudTexture();
    this.makeParticleTexture();
    this.makeSparkTexture();
    this.makeGroundTexture();
  }

  // --- Player: a glowing rounded orb with a highlight + simple wing. ---
  makePlayerTexture() {
    const size = 48;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Soft outer body.
    g.fillStyle(COLORS.playerGlow, 1);
    g.fillCircle(size / 2, size / 2, 18);
    // Main body.
    g.fillStyle(COLORS.player, 1);
    g.fillCircle(size / 2, size / 2, 15);
    // Highlight.
    g.fillStyle(COLORS.white, 0.85);
    g.fillCircle(size / 2 - 5, size / 2 - 6, 5);
    // Eye.
    g.fillStyle(0x2a2a3a, 1);
    g.fillCircle(size / 2 + 7, size / 2 - 3, 3);
    // Little wing accent.
    g.fillStyle(COLORS.accent, 0.9);
    g.fillEllipse(size / 2 - 9, size / 2 + 3, 14, 9);

    g.generateTexture('player', size, size);
    g.destroy();
  }

  // Radial-ish glow halo drawn behind the player.
  makePlayerGlowTexture() {
    const size = 80;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    for (let r = 38; r > 0; r -= 2) {
      const alpha = 0.04 * (1 - r / 40);
      g.fillStyle(COLORS.playerGlow, Math.max(alpha, 0.01));
      g.fillCircle(size / 2, size / 2, r);
    }
    g.generateTexture('player-glow', size, size);
    g.destroy();
  }

  // --- Pillars: rounded, gradient-ish modern pillars with highlight. ---
  makePillarTextures() {
    const w = TUNING.pillarWidth;
    const h = 600;

    // Body texture (vertical band). We draw a vertical gradient by stacking
    // horizontal strips between obstacle + obstacleDark colors.
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const top = Phaser.Display.Color.IntegerToColor(COLORS.obstacle);
    const bottom = Phaser.Display.Color.IntegerToColor(COLORS.obstacleDark);

    for (let x = 0; x < w; x++) {
      const t = x / w;
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(top, bottom, w, x);
      const color = Phaser.Display.Color.GetColor(c.r, c.g, c.b);
      g.fillStyle(color, 1);
      g.fillRect(x, 0, 1, h);
    }
    // Glossy highlight stripe.
    g.fillStyle(COLORS.white, 0.18);
    g.fillRoundedRect(7, 6, 10, h - 12, 5);
    // Edge shading.
    g.fillStyle(0x000000, 0.12);
    g.fillRect(w - 8, 0, 8, h);

    g.generateTexture('pillar-body', w, h);
    g.destroy();

    // Rounded cap that sits on the gap-facing end of each pillar.
    const capH = 28;
    const cg = this.make.graphics({ x: 0, y: 0, add: false });
    cg.fillStyle(COLORS.obstacle, 1);
    cg.fillRoundedRect(0, 0, w, capH, { tl: 12, tr: 12, bl: 4, br: 4 });
    cg.fillStyle(COLORS.white, 0.25);
    cg.fillRoundedRect(6, 5, w - 12, 8, 4);
    cg.fillStyle(0x000000, 0.1);
    cg.fillRect(0, capH - 4, w, 4);
    cg.generateTexture('pillar-cap', w, capH);
    cg.destroy();
  }

  makeCloudTexture() {
    const w = 120;
    const h = 60;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(COLORS.white, 1);
    g.fillCircle(35, 38, 22);
    g.fillCircle(60, 28, 28);
    g.fillCircle(88, 38, 20);
    g.fillRoundedRect(20, 36, 80, 20, 10);
    g.generateTexture('cloud', w, h);
    g.destroy();
  }

  // Small soft dot used for trail + burst particles.
  makeParticleTexture() {
    const size = 16;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(COLORS.white, 1);
    g.fillCircle(size / 2, size / 2, 6);
    g.fillStyle(COLORS.white, 0.4);
    g.fillCircle(size / 2, size / 2, 8);
    g.generateTexture('particle', size, size);
    g.destroy();
  }

  // Tiny star/spark for the scoring pop.
  makeSparkTexture() {
    const size = 12;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(COLORS.white, 1);
    g.fillRect(size / 2 - 1, 0, 2, size);
    g.fillRect(0, size / 2 - 1, size, 2);
    g.generateTexture('spark', size, size);
    g.destroy();
  }

  makeGroundTexture() {
    const w = GAME_WIDTH;
    const h = TUNING.groundHeight;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(COLORS.ground, 1);
    g.fillRect(0, 0, w, h);
    // Top edge highlight strip.
    g.fillStyle(COLORS.groundTop, 1);
    g.fillRect(0, 0, w, 8);
    // Decorative repeating bumps so scrolling reads clearly.
    g.fillStyle(0x000000, 0.12);
    for (let x = 0; x < w; x += 40) {
      g.fillRect(x, 8, 20, h - 8);
    }
    g.generateTexture('ground', w, h);
    g.destroy();
  }
}
