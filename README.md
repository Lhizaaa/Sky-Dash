# 🐦 Sky Dash

A polished, one-tap arcade game inspired by Flappy Bird — built with **Phaser 3** and **Vite**.
Tap, click, or press **Space** to flap. Dodge the glowing pillars, score points, and beat your best.

![Phaser](https://img.shields.io/badge/Phaser-3.90-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple)

## ✨ Features

- **One-tap gameplay** — mouse, touch, and keyboard (Space / ↑) all flap.
- **Instant replay loop** — no menus between attempts; restart in a single tap.
- **Procedural visuals** — gradient sky, parallax clouds, scrolling ground, glowing orb with a particle trail, and modern rounded pillars. No image assets required.
- **Juice** — screen shake, impact flash, death + score particle bursts, score "pop" tweens, smooth scene fades, and a day → dusk colour shift as you climb.
- **Fair difficulty ramp** — the gap narrows and the world speeds up as your score rises, capped so it stays beatable.
- **Procedural audio** — synthesized flap / score / hit sounds via the Web Audio API (no audio files). Includes a mute toggle. Audio stays silent until your first interaction.
- **Best score** saved to `localStorage`, with a "New Best!" celebration.
- **Responsive** — Phaser Scale Manager (`FIT` + auto-center) looks great on mobile portrait and desktop.

## 🎮 Controls

| Action | Input |
| ------ | ----- |
| Flap / Start / Restart | Tap · Left-click · `Space` · `↑` |
| Mute / Unmute | 🔊 button (top-right) |

## 🛠️ Tech Stack

- [Phaser 3](https://phaser.io/) — game framework (Arcade Physics)
- [Vite](https://vitejs.dev/) — dev server & build tool
- Vanilla JavaScript (ES modules), no backend, no login

## 📂 Project Structure

```
.
├── index.html              # Entry + loading splash
├── package.json
├── vite.config.js
├── vercel.json
└── src/
    ├── main.js             # Phaser config + boot
    ├── config.js           # Constants & gameplay tuning
    ├── scenes/
    │   ├── BootScene.js     # Generates all textures, loading state
    │   ├── MenuScene.js     # Title + "Tap to Start" + best
    │   ├── GameScene.js     # Core gameplay loop
    │   └── GameOverScene.js # Score, best, restart
    ├── objects/
    │   ├── Player.js          # Orb: gravity, flap, tilt, trail
    │   ├── ObstacleManager.js # Pooled pillar pairs + scoring
    │   ├── Background.js       # Gradient sky, parallax, ground
    │   └── MuteButton.js       # Shared mute toggle
    └── utils/
        ├── storage.js       # localStorage best-score helpers
        └── audio.js         # Web Audio SFX + mute
```

## 🚀 Getting Started

```bash
npm install      # install dependencies
npm run dev      # start dev server (opens http://localhost:5173)
npm run build    # production build -> dist/
npm run preview  # serve the production build locally
```

## ☁️ Deploying to Vercel

The project is configured for **zero-config** Vercel deployment via `vercel.json`
(Framework = Vite · Build = `npm run build` · Output = `dist`).

### Option 1 — GitHub + Vercel dashboard

1. Push this repo to GitHub:
   ```bash
   git add .
   git commit -m "Sky Dash"
   git branch -M main
   git remote add origin https://github.com/<you>/sky-dash.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the repository.
3. Confirm the settings (auto-detected):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**. Every future `git push` redeploys automatically.

### Option 2 — Vercel CLI

```bash
npm i -g vercel     # if you don't have it
vercel              # first run: links the project, then deploys a preview
vercel --prod       # deploy to production
```

Accept the defaults when prompted — the included `vercel.json` supplies the build settings.

## 🎛️ Tuning

All gameplay feel lives in [`src/config.js`](src/config.js) — gravity, flap strength,
scroll speed, gap size, and the difficulty ramp. Tweak `TUNING` to make it easier or harder.

## 📄 License

MIT — do whatever you like with it.
