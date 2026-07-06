# 🐦 Sky Dash

A polished, one-tap arcade game — built with **Phaser 3** and **Vite**.
Tap, click, or press **Space** to flap. Dodge the glowing pillars, collect stars,
and **hold to Dash** — a burst of invincible speed that blasts you through anything.

![Phaser](https://img.shields.io/badge/Phaser-3.90-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple)

## ✨ Features

- **One-tap gameplay** — mouse, touch, and keyboard (Space / ↑) all flap.
- **The Dash** ⚡ — collect **3 stars** to fill the meter, then **hold** any input to dash:
  ~0.7s of invincibility at 2.4× speed with afterimages, camera punch, and a whoosh.
  A post-dash grace period guarantees you never exit a dash inside a pillar.
- **Star collectibles** ★ — spawn inside pillar gaps at risky offsets; a classic
  risk/reward detour that charges your dash.
- **Moving pillars** — from score 10, some pillar pairs oscillate vertically,
  so late-game runs demand timing as well as precision.
- **Instant replay loop** — no menus between attempts; restart in a single tap.
- **Procedural visuals** — gradient sky, parallax clouds, scrolling ground, glowing orb with a particle trail, and segmented crystal-tower pillars: rim lighting, panel grooves, glowing accent lights, and caps whose gap-facing edge glows to mark the safe opening. Moving pillars are tinted violet so they read at a glance. No image assets required.
- **Juice** — screen shake, impact flash, death + score particle bursts, score "pop" tweens, smooth scene fades, and a day → dusk colour shift as you climb.
- **Fair difficulty ramp** — the gap narrows and the world speeds up as your score rises, capped so it stays beatable.
- **Procedural audio** — synthesized flap / score / hit sounds via the Web Audio API (no audio files). Includes a mute toggle. Audio stays silent until your first interaction.
- **Best score** saved to `localStorage`, with a "New Best!" celebration.
- **Responsive** — Phaser Scale Manager (`FIT` + auto-center) looks great on mobile portrait and desktop.

## 🎮 Controls

| Action | Input |
| ------ | ----- |
| Flap / Start / Restart | Tap · Left-click · `Space` · `↑` |
| Dash (needs 3 ★) | **Hold** any flap input ~0.2s |
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
    │   ├── Player.js          # Orb: gravity, flap, dash, tilt, trail
    │   ├── ObstacleManager.js # Pooled pillar pairs (incl. movers) + scoring
    │   ├── StarManager.js     # Pooled star collectibles (dash charge)
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
scroll speed, gap size, the difficulty ramp, star frequency, dash duration/speed,
and moving-pillar behaviour. Tweak `TUNING` to make it easier or harder.

## 📄 License

MIT — do whatever you like with it.
