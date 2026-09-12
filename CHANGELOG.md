# Changelog

## 0.1.0

- Repair metadata presence assertions so they are independent of value
  presence.
- Repair conversion payload and intentional-alias preservation.
- Preserve precise conversion types across all literal combinations, widened
  boolean flags, and union options.
- Correct the `ValBox.WithMetadata` compatibility alias name.
- Add shallow immutable `Presence<T>` and `ValBoxSnapshot<V, M>` views through
  `box.snapshot()` and `ValBox.snapshot(box)`.
- Add standalone runtime, declaration, and packaged CJS/ESM verification.
