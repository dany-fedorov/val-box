# val-box

Explicit value presence and optional metadata for agentic development, LLM harnesses, and agent graphs.

`val-box` gives a module a small result contract: whether a value was supplied,
the value itself, and independently optional metadata. A feature can consume the
payload while inspectors and policies use its source, revision, or absence
reason. Humans and coding agents can implement these consumers separately and
check them against the same TypeScript contract.

- **[Explicit presence at module boundaries](#explicit-presence-at-module-boundaries).**
  Pass a result contract between modules. A coding agent may use representative
  snapshots as focused context when they adequately describe the required
  behavior. Smaller context depends on those contracts and deliberate selection.
- **[Typed presence checks and fixtures](#typed-presence-checks-and-fixtures).**
  Check payloads, metadata, and presence handling before running the application.
  Use small fixtures to evaluate missing values, explicit overrides, and
  conversions without setting up external services. These checks test presence
  handling, not model quality or the correctness of external data.
- **[Application-defined result metadata](#application-defined-result-metadata).**
  Carry structured fields alongside a result. Build inspectors, freshness rules,
  and source-selection policies that branch on fields instead of parsing prose
  or adding diagnostic fields to business values.

Use these result contracts [inside an LLM agent harness](#inside-an-llm-agent-harness)
to keep graph-node outputs inspectable and make routing decisions from structured
metadata.
Use it when adapters repeatedly need independent value and metadata presence.
A plain presence union or required `{ value, metadata }` record may be simpler.
Presence does not mean success, and metadata does not verify its own provenance.

See [Harness engineering rationale](HARNESS-ENGINEERING.md) for the mechanisms,
plain TypeScript alternatives, conditions for adoption, and evidence limits.

## Install

```sh
npm install val-box
```

Includes TypeScript declarations, CommonJS and ESM import support, and no runtime
dependencies.

## Quick start: a value with its source

```ts
import { ValBox } from 'val-box';

const result = new ValBox.Unknown<number | undefined, string>('timeout')
  .setValue(undefined)
  .setMetadata('configuration file');

console.log(result.hasValue()); // true
console.log(result.getValue()); // undefined, explicitly supplied
console.log(result.getMetadata()); // 'configuration file'

const snapshot = result.snapshot();
result.delValue();

console.log(result.hasValue()); // false
console.log(snapshot.value); // { present: true, value: undefined }
console.log(snapshot.metadata); // { present: true, value: 'configuration file' }
```

Presence is stored separately from the payload. Present `undefined`, `null`,
`false`, and `0` are supplied values. Reading an absent channel also returns
`undefined`, so check presence when that distinction matters.

## Explicit presence at module boundaries

A settings consumer needs a lookup contract and example results. Its provider
can own file access, environment precedence, or remote configuration privately.

```ts
import assert from 'node:assert/strict';
import { ValBox, type ValBoxSnapshot } from 'val-box';

type Origin = { source: string; reason: 'found' | 'missing' };
type ReadSetting = (key: string) => ValBoxSnapshot<number | undefined, Origin>;

function createSettings(read: ReadSetting) {
  return {
    retries(): number | undefined {
      const result = read('retries');
      return result.value.present ? result.value.value : 3;
    },
  };
}

function fixture(values: ReadonlyMap<string, number | undefined>): ReadSetting {
  return key => {
    const found = values.has(key);
    const result = new ValBox.Unknown<number | undefined, Origin>(key)
      .setMetadata({ source: 'fixture', reason: found ? 'found' : 'missing' });
    if (found) result.setValue(values.get(key));
    return result.snapshot();
  };
}

assert.equal(createSettings(fixture(new Map())).retries(), 3);
assert.equal(createSettings(fixture(new Map([['retries', 0]]))).retries(), 0);
assert.equal(
  createSettings(fixture(new Map([['retries', undefined]]))).retries(),
  undefined,
);
console.log('Missing, zero, and explicit undefined stay distinct');
```

Export `ReadSetting` as the shared contract and keep the provider implementation
in its own module. When the contract and these cases cover a fallback change,
a coding agent can use them as focused context. A lookup-precedence change may
require additional provider details even when the return type stays the same.
The consumer applies a default only on absence; the application decides what a
supplied `undefined` means.

Snapshots capture channel presence and references for a handoff. They do not
choose module boundaries or isolate nested mutable objects. Clone or select
payload fields when a consumer requires independent data.

## Typed presence checks and fixtures

A snapshot makes absence explicit in the type. Required conversions expose a
definite payload, while metadata remains checked against its own contract.

```ts
import assert from 'node:assert/strict';
import { ValBox } from 'val-box';

type Origin = { source: string };
const result = new ValBox.Unknown<number, Origin>('retries')
  .setValue(0)
  .setMetadata({ source: 'configuration' });

function rejectedContracts() {
  const snapshot = result.snapshot();
  // @ts-expect-error Narrow presence before reading the snapshot payload.
  const unchecked: number = snapshot.value.value;
  // @ts-expect-error Metadata must satisfy the declared Origin type.
  result.setMetadata({ source: 42 });
  // @ts-expect-error Snapshot records are readonly.
  snapshot.alias = 'changed';
  return unchecked;
}

const snapshot = result.snapshot();
if (snapshot.value.present) {
  const retries: number = snapshot.value.value;
  assert.equal(retries, 0);
}
const required = result.convert({ hasValue: true, hasMetadata: false });
const retries: number = required.getValue();
assert.equal(retries, 0);
assert.equal(required.hasMetadata(), false);
console.log('Presence, payload, and metadata contracts passed');
```

Save each example in its own `example.ts` file. To check it:

```sh
npm install --save-dev typescript @types/node
npx tsc --noEmit --strict --skipLibCheck --target ES2022 --module Node16 --moduleResolution Node16 example.ts
```

Run a checked example with `bun example.ts`, or compile it without
`--noEmit` and run `node example.js`. Bun execution alone does not type-check.

Keep `rejectedContracts` uncalled. Each `@ts-expect-error` requires an error
on that line; remove the directive to inspect the compiler's diagnostic.
These checks evaluate declared types. A required conversion still checks presence
at runtime and throws if the value is missing. Type checking does not validate
external data or prove that a fallback policy is correct.

## Application-defined result metadata

Metadata can describe a particular result even when no value was found.
An application can use the same snapshot for payload consumption, inspection,
and a policy decision without changing the payload's own type.

```ts
import assert from 'node:assert/strict';
import { ValBox, type ValBoxSnapshot } from 'val-box';

type Origin = { source: string; revision: string; fresh: boolean };
type Reading = ValBoxSnapshot<number, Origin>;

function chooseAction(reading: Reading): 'load' | 'refresh' | 'use' {
  if (!reading.value.present) return 'load';
  if (!reading.metadata.present || !reading.metadata.value.fresh) return 'refresh';
  return 'use';
}

const current = new ValBox.Unknown<number, Origin>('shipping-cents')
  .setValue(500)
  .setMetadata({ source: 'pricing-service', revision: 'r7', fresh: true });
const stale = new ValBox.Unknown<number, Origin>('shipping-cents')
  .setValue(400)
  .setMetadata({ source: 'local-cache', revision: 'r6', fresh: false });
const missing = new ValBox.Unknown<number, Origin>('shipping-cents')
  .setMetadata({ source: 'local-cache', revision: 'r6', fresh: false });

assert.equal(chooseAction(current.snapshot()), 'use');
assert.equal(chooseAction(stale.snapshot()), 'refresh');
assert.equal(chooseAction(missing.snapshot()), 'load');

const reading = current.snapshot();
if (reading.metadata.present) {
  const inspection = {
    alias: reading.alias,
    source: reading.metadata.value.source,
    revision: reading.metadata.value.revision,
    action: chooseAction(reading),
  };
  assert.equal(inspection.action, 'use');
  console.log(inspection);
}
```

Here the provider supplies the freshness fact, and `chooseAction` is an
application policy. Val Box neither computes freshness nor performs the selected
action. A different consumer can inspect revision history or expose a payload
without implementing this policy. Validate metadata from external sources before
letting it influence execution.

## Inside an LLM agent harness

An agent harness coordinates a large language model (LLM), tools, and their
execution environment.
An agent workflow graph organizes processing into nodes and routing edges.
`val-box` gives tool and node results an explicit contract: what was supplied,
where it came from, and metadata the harness can use for inspection and routing.

This example selects the next node from a retrieval result. Missing content
starts a search; stale content requests a refresh; current content can support
an answer. A supplied empty list is a completed search with no matches.

```ts
import assert from 'node:assert/strict';
import { ValBox, type ValBoxSnapshot } from 'val-box';

type Provenance = { source: string; revision: string; fresh: boolean };
type Retrieval = ValBoxSnapshot<readonly string[], Provenance>;
type NextNode = 'search' | 'refresh' | 'answer' | 'no-results';

function nextNode(result: Retrieval): NextNode {
  if (!result.value.present) return 'search';
  if (!result.metadata.present || !result.metadata.value.fresh) return 'refresh';
  return result.value.value.length === 0 ? 'no-results' : 'answer';
}

const missing = new ValBox.Unknown<readonly string[], Provenance>('retrieval')
  .setMetadata({ source: 'cache', revision: 'r1', fresh: false });
const stale = new ValBox.Unknown<readonly string[], Provenance>('retrieval')
  .setValue(['Refunds are available within 14 days.'])
  .setMetadata({ source: 'cache', revision: 'r1', fresh: false });
const current = new ValBox.Unknown<readonly string[], Provenance>('retrieval')
  .setValue(['Refunds are available within 30 days.'])
  .setMetadata({ source: 'policy-index', revision: 'r2', fresh: true });
const noMatches = new ValBox.Unknown<readonly string[], Provenance>('retrieval')
  .setValue([])
  .setMetadata({ source: 'policy-index', revision: 'r2', fresh: true });

assert.equal(nextNode(missing.snapshot()), 'search');
assert.equal(nextNode(stale.snapshot()), 'refresh');
assert.equal(nextNode(current.snapshot()), 'answer');
assert.equal(nextNode(noMatches.snapshot()), 'no-results');

const selected = current.snapshot();
assert.equal(selected.metadata.present && selected.metadata.value.revision, 'r2');
console.log('Missing, stale, current, and empty retrieval results route explicitly');
```

`nextNode` is application routing code; the harness executes the selected
step. Presence, freshness, and empty-result meanings are part of this
application's contract. The box does not infer success, trust, or execution
status from a payload.

The routing policy can be evaluated with four small fixtures, independently of
the retriever, model, or graph runner. Another consumer can inspect provenance
without knowing the routing rules. Snapshots preserve presence and references
within the process; validate and encode payloads and metadata before putting
them into a graph's persisted state. The graph runtime owns checkpointing and
state-update rules.

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

## Shallow-frozen snapshots

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
