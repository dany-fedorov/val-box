# val-box

Preserve what an agent input or context lookup supplied, and where it came from.

`val-box` keeps value presence and metadata presence independent. An agent's
tool configuration or context lookup can return an explicit `undefined`, a
missing entry with an explanation, or a value with its source and version.
The host can apply defaults only on absence and retain provenance when passing
results between steps.

- Preserve present `undefined`, `null`, `false`, and `0`.
- Attach source, freshness, or absence information independently of the value.
- Build results incrementally, then publish a shallow immutable snapshot.
- Require or remove channels through conversions with precise TypeScript types.

## Install

```sh
npm install val-box
```

Includes TypeScript declarations, CommonJS and ESM import support, and no runtime
dependencies.

## Quick start: capture a tool setting

```ts
import { ValBox } from 'val-box';

const result = new ValBox.Unknown<number | undefined, string>('timeout')
  .setValue(undefined)
  .setMetadata('tool configuration');

console.log(result.hasValue()); // true
console.log(result.getValue()); // undefined, explicitly supplied
console.log(result.getMetadata()); // 'tool configuration'

const snapshot = result.snapshot();
result.delValue();

console.log(result.hasValue()); // false
console.log(snapshot.value); // { present: true, value: undefined }
console.log(snapshot.metadata); // { present: true, value: 'tool configuration' }
```

Presence is stored separately from the payload. Reading an absent channel also
returns `undefined`, so use a presence check or a snapshot when that distinction
matters.

## Resolve tool configuration with provenance

An agent host may combine per-tool overrides with defaults. This loader preserves
the difference between a missing override and an explicit `undefined` override.
Metadata records the source of either result; the host defines what a supplied
`undefined` means for each setting.

```ts
import { ValBox } from 'val-box';

type Origin = { source: string; key: string; reason: 'found' | 'missing' };
const overrides = new Map<string, number | undefined>([['timeoutMs', undefined]]);

function lookup(key: string) {
  const found = overrides.has(key);
  const result = new ValBox.Unknown<number | undefined, Origin>(key)
    .setMetadata({
      source: 'tool-overrides',
      key,
      reason: found ? 'found' : 'missing',
    });
  if (found) result.setValue(overrides.get(key));
  return result.snapshot();
}

const timeout = lookup('timeoutMs');
const retries = lookup('retries');

console.log(timeout.value); // { present: true, value: undefined }
console.log(retries.value); // { present: false }

const effectiveRetries = retries.value.present ? retries.value.value : 3;
console.log(effectiveRetries); // 3
if (retries.metadata.present) {
  console.log(retries.metadata.value.reason); // 'missing'
}
```

Use the same pattern for retrieved context with a document version, cached tool
results with an ETag, or unavailable evidence with a reason. Metadata describes
the particular result; it need not be part of the value's own type.

## Mutable boxes

`new ValBox.Unknown<V, M>(alias?)` starts with both channels absent and allows
each to be set or deleted independently. Mutators return the same box.

| Member | Behavior |
| --- | --- |
| `setValue(value)`, `setMetadata(metadata)` | Store a payload and mark that channel present |
| `delValue()`, `delMetadata()` | Remove a channel |
| `hasValue()`, `hasMetadata()` | Return the channel's presence |
| `getValue()`, `getMetadata()` | Return the payload, or `undefined` when absent |
| `assertHasValue()`, `assertHasMetadata()` | Throw `ValBox.AssertionError` if absent; otherwise return this box |
| `assertHasNoValue()`, `assertHasNoMetadata()` | Throw `ValBox.AssertionError` if present; otherwise return this box |
| `getIntentionalAlias()` | Return the supplied label or `null` |
| `snapshot()` | Capture both channels and the intentional alias |
| `convert(options)` | Create a separate box with selected presence guarantees |

Assertions check runtime state; use a snapshot's `present` discriminator or
`convert({ hasValue: true })` to obtain a statically narrowed payload.

### Require a channel in the type

Construct a box with known presence when that is part of an interface.
Both type parameters are ordered `<Value, Metadata>` when both are needed.

| Constructor | Arguments | Value | Metadata |
| --- | --- | --- | --- |
| `ValBox.Unknown<V, M>` | `alias?` | Mutable presence | Mutable presence |
| `ValBox.WithValue<V, M>` | `value, alias?` | Required | Mutable presence |
| `ValBox.WithMetadata<V, M>` | `metadata, alias?` | Mutable presence | Required |
| `ValBox.WithValue.WithMetadata<V, M>` | `value, metadata, alias?` | Required | Required |
| `ValBox.NoValue<M>` | `alias?` | Absent | Mutable presence |
| `ValBox.NoMetadata<V>` | `alias?` | Mutable presence | Absent |
| `ValBox.WithValue.NoMetadata<V>` | `value, alias?` | Required | Absent |
| `ValBox.NoValue.WithMetadata<M>` | `metadata, alias?` | Absent | Required |
| `ValBox.NoValue.NoMetadata` | `alias (or undefined)` | Absent | Absent |

A required channel can be replaced but cannot be deleted. An absent channel
cannot be set. Disallowed operations throw `ValBox.MethodNotAllowedError`.
Unknown presence is a static allowance for either runtime state.

The namespace also groups constructors by either axis, such as
`ValBox.UnknownValue.WithMetadata` and `ValBox.UnknownMetadata.WithValue`.
The named exports use the full combination, such as
`ValBoxUnknownValueUnknownMetadata` and `ValBoxWithValueWithMetadata`.

`ValBox.isValBox(value)` checks for an instance from the loaded package copy.
It is not a validator for remote JSON or instances from another installed copy.

## Conversion

`convert` always creates a new box. Its two options, `hasValue` and
`hasMetadata`, work independently:

| Option | Result |
| --- | --- |
| `true` | Require presence and preserve the payload; throw if absent |
| `false` | Remove the channel from the new box |
| Omitted or `undefined` | Preserve runtime presence, with unknown static presence |

```ts
import { ValBox } from 'val-box';

const original = new ValBox.Unknown<number, string>('source')
  .setValue(42)
  .setMetadata('database');

const valueOnly = original.convert({ hasValue: true, hasMetadata: false });
const value: number = valueOnly.getValue();

console.log(value); // 42
console.log(valueOnly.hasMetadata()); // false
console.log(original.hasMetadata()); // true
```

Literal flags select precise classes. Widened boolean flags produce a union of
the possible results. Conversion preserves the intentional alias and copies
payload references; it does not clone payload objects.

## Immutable snapshots

`box.snapshot()` and `ValBox.snapshot(box)` return
`ValBoxSnapshot<V, M>`: an `alias: string | null`, a `value: Presence<V>`,
and a `metadata: Presence<M>`. The exported `Presence<T>` type is
`{ readonly present: false } | { readonly present: true; readonly value: T }`.

```ts
import { ValBox, type ValBoxSnapshot } from 'val-box';

const box = new ValBox.Unknown<number | undefined, string>()
  .setValue(undefined)
  .setMetadata('database');
const snapshot: ValBoxSnapshot<number | undefined, string> = ValBox.snapshot(box);
box.setValue(42).delMetadata();

if (snapshot.value.present) {
  const value: number | undefined = snapshot.value.value;
  console.log(value); // undefined
}
console.log(snapshot.metadata); // { present: true, value: 'database' }
```

The outer object and both presence records are frozen. Later box mutations
cannot change the snapshot's presence or references. Payload objects remain
shared: changing a nested payload is visible through every reference to it.

## Scope and composition

### Agent integration contract

| State | Interpretation |
| --- | --- |
| Value present, metadata present | A supplied payload with context about that result |
| Value present, metadata absent | A supplied payload without provenance |
| Value absent, metadata present | No payload, with an explanation or source information |
| Value absent, metadata absent | No payload or metadata supplied |

Check `present` before reading or defaulting a value. Capture a snapshot before
passing a result to another step; select or clone nested payloads when that step
needs isolation. Validate and encode snapshots before transport.

Presence does not mean success, truth, confidence, or permission to act. Metadata
can contain untrusted tool or document content. The host decides which sources
to trust and which facts may enter the agent's context.

Boxes do not validate payload schemas, redact secrets, transfer ownership,
refresh caches, or provide deep immutability. Select metadata appropriate for
the consumer before publishing a snapshot. JSON serialization does not preserve
every JavaScript payload, including present `undefined`; use an application
codec if snapshots need to cross a JSON boundary.

Use `T | undefined` when undefined always means absent. Use a plain
`{ value, metadata }` record when both fields are always required. A box is
useful when independent presence must travel with a result and callers benefit
from consistent mutation, conversion, and snapshot operations.

A dependency container such as [DI Bag](https://www.npmjs.com/package/di-bag)
can register a factory returning a snapshot or a selected payload. Metadata
stays on that result; container inspection and resource disposal are separate
policies.

## Validate a change

With Node.js, npm, and Bun installed:

```sh
npm ci
npm run check
npm pack --dry-run
```

[Release notes](CHANGELOG.md) · [npm package](https://www.npmjs.com/package/val-box)
