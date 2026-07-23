# Firefox source submission

The Firefox package contains bundled and minified JavaScript built from this monorepo. Build it from a clean checkout with Node.js 24.18.0 and pnpm 10.29.3:

```bash
pnpm install --frozen-lockfile
pnpm --dir hedgehog-mode build
pnpm --dir hedgehog-mode-anywhere package:firefox
```

The resulting extension is `hedgehog-mode-anywhere/artifacts/hedgehog-mode-firefox.zip`.

`web-ext lint` reports `innerHTML` warnings inside React DOM's bundled renderer. The extension source does not assign to `innerHTML`; these assignments are React's internal DOM implementation. Pixi's unused dynamic code-generation paths are replaced at bundle time, and the packaged extension contains no `eval` or `Function` constructor warnings.
