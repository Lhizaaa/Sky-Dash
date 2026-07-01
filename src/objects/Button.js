// Reusable rounded button / badge drawn with Phaser Graphics.
// Used for menu + game-over UI (Tap to Restart, Menu, Best, control hints).
import Phaser from 'phaser';

const STYLES = {
  // Bright call-to-action.
  primary: { fill: 0x2f6fe0, fillHi: 0x5b9bff, stroke: 0x9fd0ff, text: '#ffffff' },
  // Quieter secondary action.
  secondary: { fill: 0x24365e, fillHi: 0x365488, stroke: 0x6fd3ff, text: '#dfeaff' },
  // Gold info badge (best score).
  badge: { fill: 0x3a2f12, fillHi: 0x6b521d, stroke: 0xffd35c, text: '#ffe8b0' },
  // Neutral hint pill.
  hint: { fill: 0x1b2a4a, fillHi: 0x294068, stroke: 0x6fd3ff, text: '#eaf2ff' },
};

export function createButton(
  scene,
  x,
  y,
  label,
  {
    width = 220,
    height = 58,
    radius = 18,
    fontSize = 24,
    variant = 'primary',
    interactive = false,
    onClick = null,
    depth = 60,
  } = {}
) {
  const s = STYLES[variant] || STYLES.primary;
  const container = scene.add.container(x, y).setDepth(depth);
  const g = scene.add.graphics();

  const draw = () => {
    g.clear();
    const hw = width / 2;
    const hh = height / 2;
    // Drop shadow.
    g.fillStyle(0x000000, 0.28);
    g.fillRoundedRect(-hw, -hh + 5, width, height, radius);
    // Body.
    g.fillStyle(s.fill, 1);
    g.fillRoundedRect(-hw, -hh, width, height, radius);
    // Top glossy highlight.
    g.fillStyle(s.fillHi, 0.55);
    g.fillRoundedRect(-hw + 4, -hh + 4, width - 8, height / 2 - 2, radius - 4);
    // Outline.
    g.lineStyle(2, s.stroke, 0.85);
    g.strokeRoundedRect(-hw, -hh, width, height, radius);
  };
  draw();

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color: s.text,
      fontStyle: 'bold',
    })
    .setOrigin(0.5)
    .setShadow(0, 2, 'rgba(0,0,0,0.4)', 3);

  container.add([g, text]);
  container.label = text;

  if (interactive && onClick) {
    container.setSize(width, height);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains,
      { useHandCursor: true }
    );
    container.on('pointerover', () => {
      scene.tweens.add({ targets: container, scale: 1.06, duration: 120, ease: 'Quad.out' });
    });
    container.on('pointerout', () => {
      scene.tweens.add({ targets: container, scale: 1, duration: 120, ease: 'Quad.out' });
    });
    container.on('pointerdown', (pointer, lx, ly, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      scene.tweens.add({
        targets: container,
        scale: 0.93,
        duration: 80,
        yoyo: true,
        ease: 'Quad.out',
        onComplete: () => onClick(),
      });
    });
  }

  return container;
}
