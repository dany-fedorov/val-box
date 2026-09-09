# Val Box

`val-box` tracks value and metadata presence independently. Its compatibility
classes are mutable, while immutable snapshots provide a safe boundary for
diagnostics and adapters.

See [Why val-box exists](#why-val-box-exists) for the problem it solves,
production uses, prior art, and its limits.

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

### The problem

`undefined` is a legitimate value, so it cannot also mean "nothing here".
JavaScript draws the line at the language level: `"x" in obj` is
[not the same as `obj.x !== undefined`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in),
and `Object.hasOwn` returns `true`
[even when the value is `undefined`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn).
TypeScript 4.4 added
[`exactOptionalPropertyTypes`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html)
to draw the same line for properties. Wire formats agree. In
[JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396.txt) an omitted
member is left alone while `null` removes it. Protocol Buffers restored
[explicit field presence](https://protobuf.dev/programming-guides/field_presence/)
to proto3 because whether a field has a value is a different question from
what the value is. The
[GraphQL specification](https://github.com/graphql/graphql-spec/blob/main/spec/Section%203%20--%20Type%20System.md)
says "there is a semantic difference between the explicitly provided value
{null} versus having not provided a value".

Dependency injection hits this bug directly. NestJS classified a provider by
`!isUndefined(provider.useValue)` until
[commit 4cddcfb](https://github.com/nestjs/nest/commit/4cddcfb492ed55c6d90b6af25258d89e3075cfc6)
switched to `hasOwnProperty.call(provider, 'useValue')`, fixing a
"false-negative value provider not registered error when the value of the
provider is `undefined`" reported in
[#2732](https://github.com/nestjs/nest/issues/2732) and
[#4743](https://github.com/nestjs/nest/issues/4743). Angular's injector tests
`USE_VALUE in value` in
[`provider_collection.ts`](https://github.com/angular/angular/blob/main/packages/core/src/di/provider_collection.ts),
and [PR #27035](https://github.com/angular/angular/pull/27035) fixed a crash
where a default parameter swallowed `useValue: undefined`.

Metadata has a parallel problem. A port number, a connection string, a frozen
configuration object, or a third-party client instance cannot carry a "where
did this come from" annotation on itself. The annotation needs its own
channel, present or absent independently of the value. Spring Boot wraps
configuration values in
[`OriginTrackedValue`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/origin/OriginTrackedValue.html),
whose `getOrigin()` returns `null` "if the origin is not known".
[OpenFeature](https://openfeature.dev/specification/types) resolves a flag to
a `value` plus optional `variant`, `reason`, and `flag metadata`, and on
failure "error code, reason, and error message will be set" next to the
default value.
[AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html)
returns `SecretString` with `VersionId`, `VersionStages`, and `CreatedDate`.

`val-box` gives the value and the metadata their own presence flags, keeps an
optional alias for diagnostics, and exposes a frozen `snapshot()` that other
libraries consume without depending on this package.

### What it buys

- **Present `undefined` is distinct from absent.** `Presence<T>` is a
  discriminated union, so a consumer must check `present` before reading
  `value`, and `{ present: true, value: undefined }` survives a boundary.
  `Option` in [Effect](https://effect.website/docs/data-types/option/) and
  [fp-ts](https://gcanti.github.io/fp-ts/modules/Option.ts.html) folds
  `undefined` into `None` through `fromNullable`, and Java's
  [`Optional.of(null)`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html)
  throws, so those types cannot represent this case.
- **Absence can carry an explanation.** A box with no value and present
  metadata says why nothing was produced: a disabled flag, a missing
  configuration key, an upstream error code. This is the OpenFeature shape
  for a failed evaluation.
- **Acquisition-time provenance on values you do not own.** The metadata
  channel records which source answered, which secret version was read, or
  which team owns the resource, without mutating a primitive or a client
  object. Spring's actuator `env` endpoint and .NET's
  [`GetDebugView`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.configuration.configurationrootextensions.getdebugview)
  ("showing where each value came from") are the same idea for
  configuration.
- **A safe diagnostics boundary.** `snapshot()` returns frozen presence
  records and the alias. Later mutation of the box cannot rewrite a
  snapshot, and inspection tooling cannot mutate the service through it.
  Payloads are shared by identity, never cloned or owned.

### Where it fits in production

1. **Configuration and secrets with provenance.** Consumers receive the raw
   value. Startup diagnostics read the metadata to report that the database
   URL came from the environment and which secret version the pool uses.
2. **Optional or feature-gated services.** A registered factory that
   legitimately produces nothing returns `{ present: false }` with a reason
   in metadata, and its consumer receives `Presence<T>` instead of an
   ambiguous `undefined`.
3. **Cache and fetch results with freshness.** The value is the payload. The
   metadata holds `etag`, `fetchedAt`, and `ttl` for observers that decide
   when to refresh.
4. **Ownership and audit tags.** `{ owner: 'platform', tier: 'critical' }` is
   visible to inspection without resolving the service.

### Prior art

| Pattern | What it establishes |
| --- | --- |
| [TypeScript `exactOptionalPropertyTypes`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html), [`in`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in), [`Object.hasOwn`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn) | Presence is separate from the value at the language level. |
| [RFC 7396 JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396.txt), [Protobuf field presence](https://protobuf.dev/programming-guides/field_presence/), [GraphQL input coercion](https://github.com/graphql/graphql-spec/blob/main/spec/Section%203%20--%20Type%20System.md) | Absent and explicitly empty mean different things on the wire. |
| [`JsonNullable<T>`](https://github.com/OpenAPITools/jackson-databind-nullable), [serde `Option<Option<T>>`](https://github.com/serde-rs/serde/issues/984), [Prisma `null` vs `undefined`](https://www.prisma.io/docs/orm/v7/prisma-client/special-fields-and-types/null-and-undefined) | Three-state wrappers appear wherever PATCH semantics matter. |
| [NestJS commit 4cddcfb](https://github.com/nestjs/nest/commit/4cddcfb492ed55c6d90b6af25258d89e3075cfc6), [Angular `USE_VALUE in value`](https://github.com/angular/angular/blob/main/packages/core/src/di/provider_collection.ts), [Angular PR #27035](https://github.com/angular/angular/pull/27035) | DI containers have shipped and fixed present-`undefined` bugs. |
| [Spring Boot `OriginTrackedValue`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/origin/OriginTrackedValue.html), [.NET `GetDebugView`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.configuration.configurationrootextensions.getdebugview) | A value with an independently optional origin, exposed for diagnostics. |
| [OpenFeature resolution details](https://openfeature.dev/specification/types), [AWS `GetSecretValue`](https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html) | Values delivered together with variant, reason, version, and timestamps. |
| [PEP 593 `Annotated`](https://peps.python.org/pep-0593/), [W3C Baggage properties](https://www.w3.org/TR/baggage/), [JSON:API `meta`](https://jsonapi.org/format/) | Metadata attached beside a value, ignorable by consumers that do not understand it. |

### Limits and non-goals

- If you own the value's type, put the metadata on the object.
- If absence is rare and metadata is not needed, `T | undefined` with an
  `Object.hasOwn` check is enough. Angular and Vue resolve missing
  dependencies with sentinels or `undefined`
  ([`Injector.get`](https://angular.dev/api/core/Injector),
  [`inject`](https://vuejs.org/api/composition-api-dependency-injection.html)),
  and that is adequate for most resolution APIs.
- This package is not an `Option` algebra. There is no `map` or `flatMap`.
  Use Effect or fp-ts when you need one.
- No DI container was found that carries per-value metadata from provider to
  consumer. The precedent for the metadata channel is configuration
  provenance tooling, so the channel earns its place for provenance,
  freshness, and reasons, not as a general-purpose side channel.
- The nine presence classes have no precedent. Every verified source encodes
  presence with one composable primitive. They remain for compatibility.
  New code should construct `ValBox.Unknown`, refine with `convert` when a
  static guarantee is needed, and hand out `snapshot()` results.
  `Presence<T>` and `ValBoxSnapshot<V, M>` are the contracts other
  libraries consume.
- `alias` is a free string. Spring's `Origin` records file, line, and
  column. Put structured provenance in the metadata channel and use the
  alias only as a label.

### Use with DI Bag

[DI Bag](https://github.com/dany-fedorov/di-bag) ships structural adapters,
`fromValBox` and `fromValBoxAsync`, on its `di-bag/val-box` entry. They do not
import this package; any object with a compatible `snapshot()` method works.
The adapter calls `snapshot()` once per acquisition, hands the value to
consumers, and records the metadata channel and alias as a frozen
`ValBoxFrame` that `bag.inspect(key)` and lifecycle observers can read without
resolving the service:

```ts
import { DiBag } from 'di-bag/node';
import { fromValBox } from 'di-bag/val-box';
import { ValBox } from 'val-box';

const databaseUrl = fromValBox(() =>
  new ValBox.WithValue.WithMetadata(
    process.env.DATABASE_URL ?? 'postgres://localhost/app',
    { source: process.env.DATABASE_URL ? 'env' : 'default' },
    'database-url',
  ),
);
const betaFlag = fromValBox(
  () => new ValBox.Unknown<boolean, { reason: string }>('beta').setMetadata({ reason: 'disabled' }),
  { value: 'presence' },
);

const bag = DiBag.begin().add({ databaseUrl, betaFlag }).end();
bag.resolve('databaseUrl'); // string
bag.resolve('betaFlag'); // { present: false }
bag.inspect('databaseUrl').acquisitions[0]?.metadata[0];
// { present: true, value: { kind: 'val-box', metadata: { present: true, value: { source: 'env' } }, alias: 'database-url' } }
await bag.close();
```

Required mode throws when the value is absent; `{ value: 'presence' }` exposes
`Presence<T>` instead. Ownership stays explicit: wrapping the raw box in
`DiBag.withDisposal` owns the box, not the payload. See the
[DI Bag box adapter reference](https://github.com/dany-fedorov/di-bag/blob/main/docs/guides/api-reference.md#optional-box-adapters).

## Development

The package uses Node.js 24.20, npm 11.19, Bun 1.4, and TypeScript 5.9.3 for the
release verification baseline.

```sh
npm install
npm run check
npm pack --dry-run
```

See [PUBLISHING.md](./PUBLISHING.md) for the explicit local release procedure.
