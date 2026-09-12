# Changelog

## 0.1.2 — 2026-09-12

- Refresh the npm README with a concise presence-and-metadata value proposition,
  typed fixtures, and practical LLM harness and agent graph examples.
- Make the documentation self-contained and remove positioning audit notes.
- No runtime or public API changes.

## 0.1.1

- Document agent input presence, result provenance, complete tool-configuration
  examples, and snapshot boundaries.
- Include release notes in the npm package.

## 0.1.0

- Repair metadata presence assertions so they are independent of value
  presence.
- Repair conversion payload and intentional-alias preservation.
- Preserve precise conversion types across all literal combinations, widened
  boolean flags, and union options.
- Correct the `ValBox.WithMetadata` class name.
- Add shallow immutable `Presence<T>` and `ValBoxSnapshot<V, M>` views through
  `box.snapshot()` and `ValBox.snapshot(box)`.
- Add standalone runtime, declaration, and packaged CJS/ESM verification.
