# Val Box

`val-box` tracks value and metadata presence independently. Its compatibility
classes are mutable, while immutable snapshots provide a safe boundary for
diagnostics and adapters.

## Mutable compatibility boxes

Start with `ValBox.Unknown<V, M>` when either channel may be absent. Presence is
separate from the payload, so a present `undefined` is not the same as an absent
channel.

```ts
import { ValBox } from 'val-box';

const box = new ValBox.Unknown<number | undefined, string>('provider')
  .setValue(undefined)
  .setMetadata('database');

box.hasValue();       // true
box.getValue();       // undefined, but present
box.hasMetadata();    // true
box.getMetadata();    // 'database'
```

The existing named classes and namespace aliases remain available. Boxes whose
class guarantees a channel is present do not allow deleting it; boxes whose
class guarantees a channel is absent do not allow setting it. Unknown-presence
classes retain the mutable `setValue`, `delValue`, `setMetadata`, and
`delMetadata` operations.

## Conversion

`convert` always creates a new box. Each option controls one channel:

- `true` requires the channel to be present and preserves its payload.
- `false` removes the channel from the converted box.
- an omitted or `undefined` option preserves the current runtime state while
  returning an unknown static presence for that channel.

The two axes are independent. Literal flags return precise named classes;
widened booleans return a sound union of their possible outcomes.

```ts
const original = new ValBox.Unknown<number, string>('source')
  .setValue(42)
  .setMetadata('db');

const valueOnly = original.convert({
  hasValue: true,
  hasMetadata: false,
});

const value: number = valueOnly.getValue();
valueOnly.hasMetadata(); // false
original.hasMetadata();  // true: conversion did not mutate the original
```

Conversions copy channel state and preserve an intentional alias. Payload
objects remain shared by identity; `val-box` does not clone or take ownership of
them.

## Immutable snapshots

Use `box.snapshot()` or `ValBox.snapshot(box)` to copy the current presence,
payload references, and intentional alias into a shallow immutable view.

```ts
import { ValBox, type ValBoxSnapshot } from 'val-box';

const box = new ValBox.Unknown<number | undefined, string>()
  .setValue(undefined)
  .setMetadata('db');

const snapshot: ValBoxSnapshot<number | undefined, string> = box.snapshot();
box.setValue(42).delMetadata();

snapshot.value;    // { present: true, value: undefined }
snapshot.metadata; // { present: true, value: 'db' }
```

The outer snapshot and both presence records are frozen. Payloads are not
deep-frozen or cloned, and ownership is never transferred. Later box mutation
cannot change which channels or references the snapshot contains, but mutations
made through a shared payload object remain observable.

`Presence<T>` is discriminated by `present`, so TypeScript exposes `value` only
after narrowing:

```ts
if (snapshot.value.present) {
  const value: number | undefined = snapshot.value.value;
}
```

## Development

The package uses Node.js 24.20, npm 11.19, Bun 1.4, and TypeScript 5.9.3 for the
release verification baseline.

```sh
npm install
npm run check
npm pack --dry-run
```

See [PUBLISHING.md](./PUBLISHING.md) for the explicit local release procedure.
