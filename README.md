# 🦔 Hedgehog Mode

> Tiny hedgehogs. Living on your website. Walking around, jumping off your buttons, occasionally wearing top hats.

A playful PixiJS-powered hedgehog game you can drop into any React app. Your DOM elements become the platforms — buttons, cards, headings, whatever you point a CSS selector at — and the hedgehogs do the rest. PostHog uses it as the in-product mascot. Now it can live on your site too.

[**▶ Try the playground**](./playground) · [**🐛 Report a bug**](https://github.com/PostHog/hedgehog-mode/issues)

---

## Get a hedgehog on your site in 60 seconds

### 1. Install

```sh
pnpm add @posthog/hedgehog-mode
# or: npm install @posthog/hedgehog-mode
# or: yarn add @posthog/hedgehog-mode
```

### 2. Make the sprites available

The package ships sprite sheets in `assets/`. They need to be served from a public path your app can reach:

```sh
cp -R node_modules/@posthog/hedgehog-mode/assets public/assets
```

Pop that into a `postinstall` or build script so it stays in sync. (See [`playground/package.json`](./playground/package.json) for an example — look for `copy-assets`.)

### 3. Drop the renderer in

```tsx
"use client";

import { HedgehogModeRenderer, HedgeHogMode } from "@posthog/hedgehog-mode";
import { useState } from "react";

export default function Page() {
  const [game, setGame] = useState<HedgeHogMode | null>(null);

  return (
    <>
      <main>{/* your actual website */}</main>

      <HedgehogModeRenderer
        config={{
          assetsUrl: "/assets",
          platforms: {
            selector: ".border", // anything visible — buttons, cards, h1s
            viewportPadding: { top: 50 },
          },
        }}
        onGameReady={setGame}
      />
    </>
  );
}
```

That's it. Refresh, and watch a hedgehog wander across your homepage.

> 💡 **Tip:** the `selector` is the secret. Point it at the elements you want hedgehogs to walk on. `button, .card, h1` is a fun starting point.

---

## Style your hedgehog

Five skins, ten colours, and a wardrobe of accessories ship out of the box.

| Skins | `default` · `spiderhog` · `robohog` · `hogzilla` · `ghost` |
| Colours | `green` · `red` · `blue` · `purple` · `dark` · `light` · `greyscale` · `sepia` · `invert` · `rainbow` |
| Accessories | top hats, glasses, capes, party gear — `HedgehogActorAccessoryOptions` has the full list |

A pre-built picker is included if you want users to dress their own hedgehog:

```tsx
import { HedgehogCustomization } from "@posthog/hedgehog-mode";

<HedgehogCustomization game={game} config={config} setConfig={setConfig} />;
```

---

## Just want a static one?

For avatars, lists, or anywhere you don't need a full game loop, use `StaticHedgehog`:

```tsx
import { StaticHedgehog } from "@posthog/hedgehog-mode";

<StaticHedgehog
  options={{ id: "me", skin: "spiderhog", accessories: ["top-hat"] }}
  size={64}
  assetsUrl="/assets"
/>;
```

Same skins, colours, and accessories — no physics, no animation, no fuss.

---

## Compatibility

- **React** 18 or 19 (peer dependency)
- **Next.js** 14, 15, 16 — App Router or Pages
- The renderer is client-only, but importing from a server component is safe (it lazy-loads `react-shadow`)

### Next.js 16 + Turbopack gotcha

Next 16 ships its own vendored React canary. With Turbopack, that vendored `react` can get paired with your installed `react-dom`, and React 19 will throw `Incompatible React versions`. Two ways out:

1. Run with `--webpack` (`next dev --webpack`, `next build --webpack`).
2. Pin `react`/`react-dom` to the canary version Next ships, e.g. via `pnpm.overrides`:

   ```json
   "pnpm": {
     "overrides": {
       "react": "19.3.0-canary-3f0b9e61-20260317",
       "react-dom": "19.3.0-canary-3f0b9e61-20260317"
     }
   }
   ```

   Bump these whenever you upgrade Next. Check the version with `cat node_modules/next/dist/compiled/react/package.json | jq -r .version`.

---

## Contributing

Want to add a skin, fix a bug, or just poke around?

Use Node.js 24.18.0 and pnpm 10.29.3. The repository includes an `.nvmrc` for the Node.js version.

```sh
pnpm install
pnpm dev      # builds the lib in watch mode + runs the playground at http://localhost:8002
pnpm build    # builds lib then playground
```

Repo layout:

- [`hedgehog-mode/`](./hedgehog-mode) — the published library
- [`playground/`](./playground) — Next.js demo app (the easiest way to try changes)
- [`texturepacker/`](./texturepacker) — sprite-sheet generation tooling

PRs welcome. Bonus points for new accessories.

## License

MIT — go forth and hedgehog.
