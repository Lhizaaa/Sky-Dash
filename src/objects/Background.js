// Reusable parallax background: gradient sky, drifting clouds, scrolling ground.
// Supports a day -> dusk colour shift driven by the current score.
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, TUNING } from '../config.js';

export default class Background {
  constructor(scene, { scroll = true } = {}) {
    this.scene = scene;
    this.scroll = scroll;
    this.duskAmount = 0; // 0 = day, 1 = dusk

    this.buildSky();
    this.buildClouds();
    this.buildGround();
  }

  // Two stacked rectangles tinted via a render texture for a smooth gradient.
  buildSky() {
    const key = 'sky-gradient';
    if (!this.scene.textures.exists(key)) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
      const top = Phaser.Display.Color.IntegerToColor(COLORS.skyTop);
      const bottom = Phaser.Display.Color.IntegerToColor(COLORS.skyBottom);
      for (let y = 0; y < GAME_HEIGHT; y++) {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(top, bottom, GAME_HEIGHT, y);
        g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
        g.fillRect(0, y, GAME_WIDTH, 1);
      }
      g.generateTexture(key, GAME_WIDTH, GAME_HEIGHT);
      g.destroy();

      // Dusk variant for cross-fading.
      const gd = this.scene.make.graphics({ x: 0, y: 0, add: false });
      const topD = Phaser.Display.Color.IntegerToColor(COLORS.skyTopDusk);
      const botD = Phaser.Display.Color.IntegerToColor(COLORS.skyBottomDusk);
      for (let y = 0; y < GAME_HEIGHT; y++) {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(topD, botD, GAME_HEIGHT, y);
        gd.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
        gd.fillRect(0, y, GAME_WIDTH, 1);
      }
      gd.generateTexture('sky-gradient-dusk', GAME_WIDTH, GAME_HEIGHT);
      gd.destroy();
    }

    this.sky = this.scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(-30);
    this.skyDusk = this.scene.add
      .image(0, 0, 'sky-gradient-dusk')
      .setOrigin(0, 0)
      .setDepth(-29)
      .setAlpha(0);
  }

  buildClouds() {
    this.clouds = [];
    const layers = [
      { count: 3, scale: 0.7, alpha: 0.35, speed: 8, depth: -25 },
      { count: 3, scale: 1.1, alpha: 0.55, speed: 16, depth: -20 },
    ];
    layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const x = Phaser.Math.Between(0, GAME_WIDTH);
        const y = Phaser.Math.Between(60, GAME_HEIGHT * 0.55);
        const cloud = this.scene.add
          .image(x, y, 'cloud')
          .setScale(layer.scale)
          .setAlpha(layer.alpha)
          .setDepth(layer.depth);
        cloud.speed = layer.speed;
        this.clouds.push(cloud);
      }
    });
  }

  buildGround() {
    const y = GAME_HEIGHT - TUNING.groundHeight;
    // Two tiled images side by side that we loop for an endless scroll.
    this.ground = this.scene.add
      .tileSprite(0, y, GAME_WIDTH, TUNING.groundHeight, 'ground')
      .setOrigin(0, 0)
      .setDepth(20);
  }

  setScrollSpeed(speed) {
    this.groundSpeed = speed;
  }

  // dusk: 0..1, smoothly cross-fade the dusk sky on top.
  setDusk(amount) {
    this.duskAmount = Phaser.Math.Clamp(amount, 0, 1);
    this.skyDusk.setAlpha(this.duskAmount);
  }

  update(delta, scrollSpeed = 0) {
    const dt = delta / 1000;

    // Clouds always drift slowly for life, even on the menu.
    this.clouds.forEach((cloud) => {
      cloud.x -= cloud.speed * dt;
      if (cloud.x < -cloud.width * cloud.scaleX) {
        cloud.x = GAME_WIDTH + cloud.width * cloud.scaleX;
        cloud.y = Phaser.Math.Between(60, GAME_HEIGHT * 0.55);
      }
    });

    if (this.scroll && this.ground) {
      this.ground.tilePositionX += scrollSpeed * dt;
    }
  }
}
