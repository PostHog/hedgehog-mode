# CLAUDE.md

Guidance for agents working in this repo. (The hedgehog is watching. Be cool.)

## What this is

`hedgehog-mode` is the bouncy, physics-driven hedgehog that scurries around
PostHog. It's a [Pixi.js](https://pixijs.com) (rendering) + [Matter.js](https://brm.io/matter-js/)
(physics) overlay shipped as an npm package, with a Next.js playground for
poking at it.

pnpm monorepo:

- `hedgehog-mode/` — the published library (`@posthog/hedgehog-mode`).
- `playground/` — Next.js app for local development (port `8002`).
- `hedgehog-mode-anywhere/` — MV3 browser extension that drops the hedgehog
  onto any website. Private; consumes the library via `workspace:*` (esbuild, not vite).
- `texturepacker/` — source sprite frames, packed into `hedgehog-mode/assets/sprites.{png,json}`.

## Dev workflow

From the repo root:

```bash
nvm use        # Node.js 24 LTS
pnpm dev      # runs the library watcher AND the playground together
```

This runs `pnpm -r --parallel --no-bail run dev`:

- the library builds via `vite build --watch` (emits `dist/` on change),
- the playground runs `next dev -p 8002` and hot-reloads it (the package is in
  `transpilePackages`, so Next picks up library rebuilds),
- `--no-bail` means if one process dies (e.g. the port's taken) it doesn't kill
  the other or exit the command — so it won't crash-loop. The watchers
  pause-on-error and resume on the next save. Don't reintroduce a blocking
  pre-build or `&&` chaining here; that's what made it loop before.

Other commands:

```bash
pnpm lint                          # oxlint, from the repo root
pnpm format                        # oxfmt, from the repo root
pnpm test                          # vitest, from the repo root
pnpm --dir hedgehog-mode build     # vite build
```

Tip: in the running app, press `ctrl+d` five times to toggle the Matter.js
debug renderer (bodies, constraints, velocities).

### The browser extension

`hedgehog-mode-anywhere/` bundles the library's `dist/`, so the library must be
built first. It's kept out of `pnpm dev` on purpose — esbuild can't resolve the
engine before its first emit, and a blocking pre-build is what crash-looped the
dev loop before. Develop it alongside a running `pnpm dev` (which keeps `dist/`
fresh):

```bash
pnpm --dir hedgehog-mode-anywhere watch
```

Load `hedgehog-mode-anywhere/artifacts/chrome/` as an unpacked extension and reload after each rebuild. Run `pnpm --dir hedgehog-mode-anywhere run:firefox` for a temporary Firefox profile. Root `pnpm build` covers both extension artifacts, so CI catches breakage.

The extension's `.jsx` is untyped and esbuild doesn't type-check, so
`hedgehog-mode-anywhere/api-contract.ts` pins the slice of the library API the
extension consumes; `tsc --noEmit` (part of its `build`) fails if a `workspace:*`
engine change drifts that surface. Keep the contract in sync with actual usage.

## Architecture

Everything on screen is a `GameElement` (see `src/types.ts`) held in
`game.elements` and ticked every frame via `update()`.

- `src/actors/Actor.ts` — base class: rigid body + animated sprite, drag, the
  per-frame sprite/hitbox sync.
- `src/actors/Hedgehog.ts` — the star. Movement, jumping, fire, death, colour.
- `src/actors/hedgehog/` — the hedgehog's collaborators, deliberately split out
  so `Hedgehog.ts` doesn't become a 700-line god class again:
  - `ai.ts` — idle wandering behaviours.
  - `controls.ts` — keyboard input.
  - `interface.ts` — the speech bubbles + easter-egg cheat sheet (and the
    canonical source of the hedgehog's **voice** — read it before writing PRs).
  - `colors.ts` — colour → `ColorMatrixFilter` map.
  - `skins.ts` — `HEDGEHOG_SKINS` registry: per-skin physics, jump, render,
    collision and accessory tuning. **Add skin behaviour here, not as
    `if (skin === ...)` branches in the actor.**
  - `abilities.ts` — active per-skin behaviours (spiderhog web-slinging,
    hogzilla fireball). A skin's `createAbility` returns one of these.
- `src/items/` — standalone entities: `Flame`, `SpiderWebActor`, `Ground`,
  `SyncedPlatform`, `Accessory`. Self-fading visual entities (flames, webs)
  follow the `FlameActor` pattern: own your Matter bodies + Pixi objects, fade
  with `gsap`, and clean up in `beforeUnload()` (the engine only auto-removes a
  single `rigidBody`/`sprite`).
- `src/sprites/sprites.ts` — loads the packed spritesheet; animations are keyed
  like `skins/<skin>/<action>/tile`.

Coordinates: Matter world space and Pixi stage space are both screen pixels, so
pointer/`clientX` positions map 1:1 — no transforms needed.

## Conventions

- TypeScript, Oxfmt, Oxlint. Match the surrounding style; keep new skin/item
  logic out of the actor when a registry/entity fits.
- Always run `pnpm build` (or at least `tsc --noEmit`) before declaring done —
  the build runs the dts plugin and will catch type errors.

## Writing PRs (important)

The hedgehog has _opinions_ about lazy PRs — one of its actual in-app barbs is
"the pr is just _fix_ with no description." So don't be that PR.

**PR descriptions should be fun and written in the spirit of the project** —
the same dry, lowercase, startup-satire voice the hedgehog uses in
`interface.ts` (self-deprecating, PostHog/VC in-jokes, the occasional jab at
ben). Lean into the theme of whatever you changed (webs, fire, physics...).

But fun ≠ useless. A good PR here still clearly covers **what changed, why, and
how it was tested** — just wrapped in personality. Think "patch notes written
by a sarcastic hedgehog," not "wall of corporate bullet points" and not
"single emoji." Markdown headings, short sections, a bit of flair.
