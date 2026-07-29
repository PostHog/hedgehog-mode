# Opening the unsigned macOS test build

This pull request artifact is not signed or notarized with an Apple Developer certificate. macOS may report that the app is damaged after downloading it.

Drag Hedgehog Mode into Applications, then run:

```sh
xattr -dr com.apple.quarantine "/Applications/Hedgehog Mode.app"
open "/Applications/Hedgehog Mode.app"
```

Only bypass Gatekeeper for an artifact downloaded directly from the Hedgehog Mode repository's GitHub Actions run. Release builds should be signed and notarized before distribution.
