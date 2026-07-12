# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server on http://localhost:3000
- `npm run build` — static export into `out/` (runs `postbuild` to strip CSS preloads for the FB bundle)
- `npm run lint` — ESLint (`next lint`)
- `npm run check-code` / `npm run format` — Prettier check / write
- `npm test` — Jest in watch mode
- `npm run test-coverage` — run all tests once with coverage
- Run a single test file: `npx jest __tests__/reducers/game-reducer.test.ts`
- Run tests matching a name: `npx jest -t "hasChanged"`
- `npm run bundle` — build and zip `out/` into `instant-game.zip` for Facebook Instant Games

Copy `.env.example` to `.env.local` before running. `NEXT_PUBLIC_GAME_URL` is the shareable play link used by the Web Share fallback (inlined at build time).

## Architecture

This is a Next.js **Pages Router** app configured for **static export** (`next.config.js`: `output: "export"`, `assetPrefix: "./"`). There is no `src/` dir — code lives in root-level folders. The `@/` import alias maps to the repo root (see `tsconfig.json` and `jest.config.js`).

### Game state model — the key thing to understand

All game logic is a pure reducer in `reducers/game-reducer.ts`, wrapped by React context in `context/game-context.tsx`. State has two parallel representations that must stay in sync:

- `board: string[][]` — a 4×4 grid of tile **ids** (or `undefined`), indexed `board[y][x]`.
- `tiles: TileMap` — id → `Tile`, where each tile stores its own `position: [x, y]`.

Note the axis convention: the board is indexed **`[y][x]`** but tile positions are **`[x, y]`**. Getting this backwards is the most common source of bugs.

The four `move_*` actions rebuild the board by scanning each row/column, sliding tiles toward the edge and merging equal adjacent pairs (doubling value, adding to `score`). They set `hasChanged` when any tile moved or merged.

### The move → settle → spawn cycle

Animations depend on stale tiles surviving one render, so a move is a two-phase process driven by effects in `game-context.tsx`:

1. `move_*` computes new positions but leaves merged-away tiles in `tiles` (so they animate out). Sets `hasChanged: true`.
2. An effect on `hasChanged` waits `mergeAnimationDuration`, then dispatches `clean_up` (drops tiles no longer on the board) and appends a random `2` tile.
3. A second effect runs `checkGameState()` once `hasChanged` is false, dispatching `update_status` → `"won"` (a 2048 tile exists) or `"lost"` (no empty cells and no adjacent equal pair).

`moveTiles` is **throttled** and gated on `isBoardSettled` (all tile ids resolve to real tiles) so input during animation is dropped. Constants live in `constants.ts`.

### Input & rendering

`components/board.tsx` handles both keyboard (arrow keys, `keydown`) and touch (`components/mobile-swiper.tsx` → swipe deltas), both mapping to the four move directions. It renders `components/tile.tsx` positioned absolutely from tile coordinates, and shows `components/splash.tsx` on win/loss.

### Facebook Instant Games integration

The app runs both as a normal web page (GitHub Pages) and as an FB Instant Game. The startup handshake is a plain inline script in `pages/_document.tsx` — deliberately **not** coupled to React hydration, because FB's loading screen only dismisses when `startGameAsync()` resolves. It calls `FBInstant.initializeAsync()` → `startGameAsync()`, then sets `window.__FB_INSTANT_READY__` and fires a `fb-instant-ready` event.

`hooks/use-facebook-instant.ts` observes that signal and gates rendering in `pages/_app.tsx` (returns `null` until ready). When no SDK is present (local dev), it renders immediately.

### Score sharing

`hooks/use-share-score.ts` prefers `FBInstant.shareAsync` when available, otherwise falls back to the Web Share API (`navigator.share`) with `NEXT_PUBLIC_GAME_URL`. `lib/score-card.ts` draws a PNG share image via canvas.

`components/share-test-button.tsx` is a **temporary** affordance (mock share data for testing the FB modal) and is meant to be deleted once the game-over share flow is verified.

## Tests

Tests are in `__tests__/`, mirroring the source layout (note: `__tests__/compontents` is misspelled). The reducer is the most heavily tested unit and the best place to add coverage for game-logic changes.
