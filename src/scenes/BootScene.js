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
    this.makeStarTexture();
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

  // --- Pillars: segmented "crystal tower" bodies with rim light, panel
  // grooves, glowing accent lights, and a wide cap whose gap-facing edge
  // glows so the safe passage reads instantly. ---
  makePillarTextures() {
    const w = TUNING.pillarWidth;
    const h = 600;

    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const top = Phaser.Display.Color.IntegerToColor(COLORS.obstacle);
    const bottom = Phaser.Display.Color.IntegerToColor(COLORS.obstacleDark);

    // Horizontal gradient = side lighting (light on the left, shaded right).
    for (let x = 0; x < w; x++) {
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(top, bottom, w, x);
      g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
      g.fillRect(x, 0, 1, h);
    }

    // Glossy highlight stripe + a slim secondary sheen.
    g.fillStyle(COLORS.white, 0.2);
    g.fillRoundedRect(7, 6, 9, h - 12, 4);
    g.fillStyle(COLORS.white, 0.07);
    g.fillRect(21, 0, 4, h);

    // Rim light on the lit edge, deeper shading on the far edge.
    g.fillStyle(COLORS.white, 0.28);
    g.fillRect(0, 0, 2, h);
    g.fillStyle(0x000000, 0.18);
    g.fillRect(w - 6, 0, 6, h);

    // Panel grooves every 64px: dark cut with a bevel light beneath.
    for (let y = 64; y < h; y += 64) {
      g.fillStyle(0x000000, 0.16);
      g.fillRect(2, y, w - 8, 3);
      g.fillStyle(COLORS.white, 0.1);
      g.fillRect(2, y + 3, w - 8, 2);
    }

    // Small glowing accent lights, one per segment.
    for (let y = 32; y < h; y += 64) {
      g.fillStyle(COLORS.accent, 0.28);
      g.fillCircle(w - 17, y, 5);
      g.fillStyle(COLORS.accent, 0.75);
      g.fillCircle(w - 17, y, 3);
      g.fillStyle(COLORS.white, 0.85);
      g.fillCircle(w - 18, y - 1, 1.3);
    }

    g.generateTexture('pillar-body', w, h);
    g.destroy();

    // Cap: slightly wider than the body (visual-only overhang — the hitbox
    // stays the body width, so any corner graze is forgiven, never unfair).
    // The gap-facing edge (texture bottom; ObstacleManager flips the lower
    // cap) carries a bright accent glow line marking the safe opening.
    const capW = w + 10;
    const capH = 30;
    const cg = this.make.graphics({ x: 0, y: 0, add: false });

    // Body with rounded corners toward the gap.
    cg.fillStyle(COLORS.obstacle, 1);
    cg.fillRoundedRect(0, 0, capW, capH, { tl: 5, tr: 5, bl: 12, br: 12 });
    // Shaded upper portion (away from the gap) for depth.
    cg.fillStyle(0x000000, 0.15);
    cg.fillRoundedRect(0, 0, capW, 10, { tl: 5, tr: 5, bl: 0, br: 0 });
    // Glossy band.
    cg.fillStyle(COLORS.white, 0.3);
    cg.fillRoundedRect(5, 4, capW - 10, 7, 3);
    // Side shading matching the body's lighting.
    cg.fillStyle(COLORS.white, 0.22);
    cg.fillRect(1, 4, 2, capH - 10);
    cg.fillStyle(0x000000, 0.16);
    cg.fillRect(capW - 6, 4, 5, capH - 10);
    // Glowing gap edge: soft halo + bright core line.
    cg.fillStyle(COLORS.accent, 0.35);
    cg.fillRoundedRect(2, capH - 9, capW - 4, 7, 3);
    cg.fillStyle(0xeaffff, 0.9);
    cg.fillRoundedRect(3, capH - 5, capW - 6, 3, 1.5);

    cg.generateTexture('pillar-cap', capW, capH);
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

  // Five-pointed star collectible (charges the dash meter).
  makeStarTexture() {
    const size = 28;
    const cx = size / 2;
    const cy = size / 2;
    const outer = 12;
    const inner = 5;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Soft glow behind the star.
    g.fillStyle(COLORS.star, 0.25);
    g.fillCircle(cx, cy, 13);

    const points = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      points.push(new Phaser.Geom.Point(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
    }
    g.fillStyle(COLORS.star, 1);
    g.fillPoints(points, true);
    // Tiny highlight.
    g.fillStyle(COLORS.white, 0.8);
    g.fillCircle(cx - 2, cy - 3, 2.5);

    g.generateTexture('star', size, size);
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
