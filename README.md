# Val Box

`val-box` tracks value and metadata presence independently. Its compatibility
classes are mutable, while immutable snapshots provide a safe boundary for
diagnostics and adapters.

[View `val-box` on npm](https://www.npmjs.com/package/val-box).

See [Why val-box exists](#why-val-box-exists) for the problem it solves,
production uses, prior art, and its limits.

## Installation

```sh
npm install val-box
```

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

## Why val-box exists

**The useful pattern is a presence-aware value with acquisition provenance.**
A configuration reader can return a value plus the source that supplied it, or
no value plus an explanation. A consumer can receive the plain value while DI
Bag retains its provenance for inspection. That is a real use case; it does
not require every service to be boxed.

Two separate questions are preserved: “Was a value supplied?” and “Is anything
known about this result?” Present `undefined`, `null`, `false`, and `0` are all
values. An absent value can still have metadata, and a present value can have
no metadata. The alias labels the result; it is not a DI registration key.

### Production precedents

These sources establish the underlying patterns, not adoption of `val-box` or
the necessity of its class hierarchy. Sources were checked on 2026-09-10.

| Example | Relevant pattern and difference |
| --- | --- |
| [Spring Boot `OriginTrackedValue`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/origin/OriginTrackedValue.html) | A configuration value with an independently optional origin. This is the closest precedent for provenance beside a value, without modifying the value itself. |
| [Protobuf explicit field presence](https://protobuf.dev/programming-guides/field_presence/) | The API tracks whether a field was set separately from its default value. This supports the presence distinction; it does not imply a JavaScript box or metadata channel is needed. |
| [NestJS's `undefined` provider issue](https://github.com/nestjs/nest/issues/2732) and [provider classification](https://github.com/nestjs/nest/blob/master/packages/core/injector/module.ts) | A reported failure involved explicitly supplied `undefined`; current classification checks whether `useValue` is an own property. Presence confusion has caused real DI bugs; a property check was sufficient for Nest's case. |
| [OpenFeature evaluation details](https://openfeature.dev/specification/types/) | Flag values travel with reasons, variants, and metadata. Its value is required and errors can yield a default, so it supports the metadata pattern, not an absent-value model. |
| [AWS Secrets Manager `GetSecretValue`](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) | A secret response includes version and staging information. An adapter can retain the actual version alongside an injected payload without making every consumer depend on the SDK response shape. |

### Where it fits with DI Bag

1. **Configuration or secret provenance discovered during acquisition.** A
   provider may try environment, file, and remote sources. Registration metadata
   can describe those candidates, but only the acquisition knows which answered
   and which version was read. `ValBoxSnapshot` keeps that information beside
   the acquired value without adding fields to a primitive or third-party object.
2. **An optional result with a reason.** A registered factory may find no
   tenant override or deliberately omit a feature-gated service. Presence mode
   carries that absence to consumers and retains the explanation for observers.
   This differs from a missing registration, which DI Bag's optional dependencies
   already handle. Disabled `false` is still a present flag value.
3. **A snapshot with freshness information.** A provider can expose a payload
   and record an ETag, version, or retrieval time. This describes the acquired
   snapshot; refresh and invalidation need an application policy. For live flags
   or caches, injecting their client is often simpler than caching one result
   in a bag.

For example, this loader distinguishes a missing key from an explicitly
supplied `undefined` and records which lookup produced the result:

```ts
import { DiBag } from 'di-bag/node';
import { ValBox } from 'val-box';

type Origin = { source: string; key: string; reason: 'found' | 'missing' };
const overrides = new Map<string, number | undefined>([['timeoutMs', undefined]]);

function lookup(key: string) {
  const found = overrides.has(key);
  const box = new ValBox.Unknown<number | undefined, Origin>(key)
    .setMetadata({ source: 'tenant-overrides', key, reason: found ? 'found' : 'missing' });
  if (found) box.setValue(overrides.get(key));
  return box;
}

const bag = DiBag.createBuilder()
  .register({
    timeout: () => lookup('timeoutMs').snapshot(),
    retries: () => lookup('retries').snapshot(),
  })
  .build();

bag.resolve('timeout').value; // { present: true, value: undefined }
bag.resolve('retries').value; // { present: false }

const retries = bag.resolve('retries');
if (retries.metadata.present) {
  console.log(retries.metadata.value.reason); // 'missing'
}
await bag.close();
```

The distinction lets a consumer apply a fallback only on absence, while treating
present `undefined` according to its domain contract. A plain `Map.has` check
already solves this locally; the box carries the distinction and provenance
across the snapshot boundary.

DI Bag 0.1 does not include a `val-box` adapter. The example registers immutable
snapshots directly, keeping value presence, metadata presence, and alias
available to the consumer. A factory can instead return only `.snapshot().value`
when consumers need presence but not provenance. DI Bag's `inspect()` describes
the DI registration and its acquisitions; it does not automatically promote
Val Box metadata into inspection. Attach metadata known at registration time
with `DiBag.withMetadata`.

### What is simpler, and what may be over-engineered

- **Presence alone:** use `T | undefined` if `undefined` always means absent.
  If it is a legitimate payload, use a discriminated union, `Map.has`, an own
  property check, or `Option<T>`. For example, [fp-ts](https://gcanti.github.io/fp-ts/modules/Option.ts.html)
  can represent `some(undefined)`; its `fromNullable(undefined)` deliberately
  produces `none`. Preserving present `undefined` is not unique to val-box.
- **A value plus metadata:** an ordinary `{ value, metadata }` record is enough
  when both are required. Two `Presence` fields are enough when both are
  optional. If all consumers need the metadata, inject that record directly;
  separating it from the service may add indirection without benefit.
- **Registration metadata:** ownership tags, service descriptions, and known
  configuration sources already fit DI Bag's `withMetadata`. val-box adds value
  when the metadata describes the particular result produced at runtime.
- **Nine presence classes:** their static guarantees restrict allowed mutations,
  but the sourced production cases do not establish a need for a 3 × 3 class
  hierarchy. Unknown presence is uncertainty in the type, not a third runtime
  state. The hierarchy and conversion API are the most plausible
  over-engineering here. New integrations can consume the small
  `Presence<T>` / `ValBoxSnapshot<V, M>` protocol; the classes need no role in
  their public API.
- **Snapshot guarantees:** the outer records are frozen, but payload objects
  remain shared and mutable. This is not deep immutability, isolation, automatic
  redaction, or tamper-proof audit storage. Select metadata appropriate for
  inspection; a secret's version identifier and its secret contents have
  different disclosure requirements.

The integration is explicit and adds no ownership implicitly. Wrap the
registration in `DiBag.withDisposal` when the bag should own the acquired
snapshot or projected value.

**Assessment:** presence plus per-acquisition provenance is worth having when
services should receive plain values and diagnostics need their origins. That
supports the small snapshot protocol more strongly than the full mutable class
matrix. Use the package if its construction and conversion helpers remove
repeated work; a plain record is a reasonable default for a single application.

## Development

The package uses Node.js 24.20, npm 11.19, Bun 1.4, and TypeScript 5.9.3 for the
release verification baseline.

```sh
npm install
npm run check
npm pack --dry-run
```

See [PUBLISHING.md](./PUBLISHING.md) for the explicit local release procedure.
