# TDZ Wave Game

A tower-defense zombie wave-survival game built for the web (JS/TS + HTML5 Canvas).

## Status

First playable slice: WASD movement, mouse-aim + click-to-fire (one starting
weapon), a Shambler zombie type that walks toward the objective and does
periodic contact damage, an objective + player with HP bars, and a basic
endless wave loop (spawn count grows per wave, zombies get tougher). No
shop/currency/turrets/Build Mode/other zombie types/bosses/persistence yet —
those are designed in REQUIREMENTS.md and the architecture doc but not built.

## Tech stack

- Language: JavaScript (vanilla, no framework)
- Bundler/dev server: Vite
- Rendering: HTML5 Canvas 2D

## Design

Game requirements/design decisions live in [REQUIREMENTS.md](REQUIREMENTS.md)
— check it before implementing gameplay features, and update it when design
decisions change or open questions get resolved.

## Structure

- [index.html](index.html) — entry HTML, loads `src/main.js`
- [src/main.js](src/main.js) — thin entry point, creates and starts `Game`
- [src/core/Game.js](src/core/Game.js) — frame loop, per-frame system order, reset/game-over/restart
- [src/core/InputManager.js](src/core/InputManager.js) — keyboard/mouse state, edge-triggered click detection
- [src/core/Renderer.js](src/core/Renderer.js) — draws entities + HP bars + game-over overlay
- [src/entities/](src/entities) — `Player.js`, `Objective.js`, `Zombie.js`, `Projectile.js`
- [src/systems/WaveManager.js](src/systems/WaveManager.js) — spawn timing/count per wave (Shambler only so far)
- [src/systems/CollisionSystem.js](src/systems/CollisionSystem.js) — projectile↔zombie, zombie↔objective, zombie↔player
- [src/data/zombieTypes.js](src/data/zombieTypes.js) — zombie type stats (just `shambler` right now)
- [src/ui/HUD.js](src/ui/HUD.js) — wave-number overlay text
- [src/style.css](src/style.css) — full-window canvas styling
- [vite.config.js](vite.config.js) — sets `base: './'`; required for the build to work when hosted off the domain root (see Deployment below) — don't remove it
- [scripts/verify-itch-build.mjs](scripts/verify-itch-build.mjs) — serves `dist/` from a nested path to catch absolute-path asset regressions before they'd break on itch.io

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `node scripts/verify-itch-build.mjs` (after `npm run build`) — sanity-check the build for itch.io hosting; open the printed URL and confirm no 404s under `/nested/assets/`

## Deployment

Target platform is **itch.io** (HTML5, played in-browser). itch.io never hosts
a game at a domain root, so absolute asset paths (Vite's default) 404 there —
`vite.config.js` sets `base: './'` to keep every reference relative. To
publish: `npm run build`, zip the *contents* of `dist/` (not the folder
itself), upload as a new file on the itch.io project page, mark it "This file
will be played in the browser" and kind "HTML". See `REQUIREMENTS.md` §13 for
the full checklist and known caveats (e.g. localStorage inside itch.io's
iframe).

## Conventions

- No comments in code unless explaining non-obvious "why" (a workaround, a subtle invariant)
- Prefer small, focused modules over large files as the codebase grows
