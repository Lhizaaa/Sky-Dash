// A small interactive mute toggle drawn with text glyphs.
// Shared by MenuScene and GameScene.
import { isMuted, toggleMute, unlockAudio } from '../utils/audio.js';
import { GAME_WIDTH } from '../config.js';

export function createMuteButton(scene) {
  const label = () => (isMuted() ? '🔇' : '🔊');
  const btn = scene.add
    .text(GAME_WIDTH - 30, 30, label(), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      color: '#ffffff',
    })
    .setOrigin(0.5)
    .setDepth(100)
    .setScrollFactor(0)
    .setAlpha(0.85)
    .setInteractive({ useHandCursor: true });

  btn.on('pointerdown', (pointer, x, y, event) => {
    if (event && event.stopPropagation) event.stopPropagation();
    unlockAudio();
    toggleMute();
    btn.setText(label());
    scene.tweens.add({
      targets: btn,
      scale: 1.25,
      duration: 110,
      yoyo: true,
      ease: 'Quad.out',
    });
  });

  return btn;
}
