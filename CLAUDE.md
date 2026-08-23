# TDZ Wave Game

A tower-defense zombie wave-survival game built for the web (JS/TS + HTML5 Canvas).

## Status

Playable: WASD movement, mouse-aim + click-to-fire (one starting weapon), an
objective + player with HP bars, and an endless wave loop.

All three non-boss zombie types are implemented with their §8 priority
targeting and §8.1 introduction waves — Shambler (objective-priority, wave
1), Stalker (player-priority within aggro range, wave 7), Breaker
(turret-priority, wave 12). Breaker currently always falls back to the
objective because no turrets exist yet; that fallback is the spec'd
behavior, not a stub.

Turrets and Build Mode are in: **B** toggles Build Mode, number keys pick a
turret type, click places it inside the build radius, right-click/Esc exits.
All four types work with their §5.1 counter-design behaviors (Cannon splash,
Frost slow, Flame damage-over-time aura, Machine Gun single-target) and
unlock-wave gating. Currency exists at the minimum needed to make placement
cost something — kills pay out, deaths cost `10 × wave`.

The §10.1 threat cue is implemented: turrets targeted by a Breaker get a
dashed ring plus an HP bar, and a directional arrow near the player when the
threatened turret is far away.

The between-waves shop is in and is a true hard pause (§6/§9): clearing a
wave opens it, nothing simulates while it's open, and **Space** starts the
next wave. It sells the five weapons (Pistol/Shotgun/AR/Sniper/Minigun),
per-gun upgrades for weapons you own, and player/objective upgrades.
Clearing wave 25 wins the run.

All weapons have magazines and reload — automatically when empty, or with
**R**. Turret upgrades live in **Build Mode**, not the shop: click a placed
turret to level it up, click empty ground to place a new one.

All five bosses are in, one per boss wave, each with the signature mechanic
from §9.1 — Lurcher (telegraphed slam), Detonator (chain detonation through
clustered turrets), Vaulter (leaps between turret targets), Glutton
(regenerates unless damage is sustained), Culmination (cycles all four as
phases and spawns adds). They share the windup + line-of-sight area attack;
placed turrets block line of sight, so they double as cover.

Persistence is the remaining unbuilt piece — designed in REQUIREMENTS.md §12
and the architecture doc, but not implemented.

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
- [src/render/Sprites.js](src/render/Sprites.js) — procedural sprites drawn once into cached offscreen canvases; no image files, so the itch.io bundle stays self-contained
- [src/entities/](src/entities) — `Player.js`, `Objective.js`, `Zombie.js`, `Boss.js`, `Turret.js`, `Projectile.js`
- [src/systems/LineOfSight.js](src/systems/LineOfSight.js) — segment/circle test; turrets block boss line of sight
- [src/systems/Economy.js](src/systems/Economy.js) — currency balance, kill payouts, wave-scaled death penalty
- [src/systems/UpgradeSystem.js](src/systems/UpgradeSystem.js) — purchased tiers, stat application, per-turret-type modifiers
- [src/ui/ShopMenu.js](src/ui/ShopMenu.js) — intermission panel layout, hit-testing, and rendering
- [src/data/turretTypes.js](src/data/turretTypes.js) — per-type stats, costs, and unlock-wave gating
- [src/data/weapons.js](src/data/weapons.js) — weapon stats incl. the `automatic` flag and pellet/spread
- [src/data/upgrades.js](src/data/upgrades.js) — upgrade definitions, tier costs, wave gating
- [src/systems/WaveManager.js](src/systems/WaveManager.js) — spawn timing/count per wave, weighted type selection gated on introduction waves
- [src/systems/CollisionSystem.js](src/systems/CollisionSystem.js) — projectile↔zombie, zombie↔objective, zombie↔player, zombie↔turret
- [src/data/zombieTypes.js](src/data/zombieTypes.js) — per-type stats, HP scaling, and introduction-wave gating
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
