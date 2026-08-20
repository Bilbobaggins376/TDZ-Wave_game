# TDZ Wave Game

A tower-defense zombie wave-survival game built for the web (JS/TS + HTML5 Canvas).

## Status

Minimal starter scaffold in place: a Vite dev server, a canvas that fills the
window, and a game loop with a placeholder wave counter. No actual gameplay
(zombies, towers, spawning) exists yet.

## Tech stack

- Language: JavaScript (vanilla, no framework)
- Bundler/dev server: Vite
- Rendering: HTML5 Canvas 2D

## Structure

- [index.html](index.html) — entry HTML, loads `src/main.js`
- [src/main.js](src/main.js) — game loop (update/draw), currently just a wave counter
- [src/style.css](src/style.css) — full-window canvas styling

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build

## Conventions

- No comments in code unless explaining non-obvious "why" (a workaround, a subtle invariant)
- Prefer small, focused modules over large files as the codebase grows
