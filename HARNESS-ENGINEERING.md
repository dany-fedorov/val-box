# Val Box in harness engineering

Val Box is an optional presence-and-metadata utility for agentic development
and LLM harness graph results. Its strongest contribution is preserving
independent value and metadata presence through mutable construction and
shallow snapshots. It does not define an agent's execution state or establish
the truth of provenance. This assessment audits commit
`5f27fc2eb284f043c891cb64bbea6287dfd647fd` on 2026-09-12 against the
[mutable API](src/index.ts), [snapshot implementation](src/snapshot.ts), and
[runtime tests](tests/runtime.test.ts).

## A concrete boundary problem

Suppose a harness applies configuration defaults only when a value was not
supplied. A retry limit of `0` must survive, and an explicit `undefined` may
have a different domain meaning from omission. Val Box stores presence apart
from payload, then publishes a discriminated snapshot. The consumer branches
on `present`, so its fallback does not accidentally erase supplied values.
The host must define whether explicit undefined is valid and what it means.
Reading `getValue()` alone cannot distinguish it from absence.

Metadata presence is independent: a provider can supply an absence reason
without manufacturing a business value. A retrieval result can carry source
and revision alongside content for an inspector or routing policy. The host
defines those fields, computes freshness, and executes the selected next node.
A supplied empty list means “completed search, no matches” only if the
producer's protocol guarantees that interpretation; presence does not establish
completion, success, or permission.

## What the wrapper guarantees

Unknown boxes allow channels to be set or deleted. Required channels can be
replaced but not deleted through their API; absent channels cannot be set.
`convert` creates another mutable box: `true` requires and preserves a channel,
`false` drops it, and an omitted flag preserves runtime presence with unknown
static presence. It does not transform payloads. Assertions return the original
box; snapshot discrimination or conversion provides static payload refinement.

Snapshots freeze the outer record and both presence records. Replacing or
deleting a builder's channel cannot change a prior snapshot's references or
presence flags. Nested payloads remain shared and mutable, as the
[snapshot tests](tests/snapshot.test.ts) demonstrate. Conversions also share
payload references. A stable checkpoint, isolated graph branch, or immutable
audit record therefore needs host-defined cloning, immutable payloads, or
encoding. The mutable box is not itself an immutable result.

## The plain TypeScript baseline

The essential representation needs only ordinary discriminated unions:

```ts
type Presence<T> =
  | { readonly present: false }
  | { readonly present: true; readonly value: T };
type Reading<V, M> = {
  readonly value: Presence<V>;
  readonly metadata: Presence<M>;
  readonly alias: string | null;
};
```

Freezing its outer and presence records reproduces the snapshot guarantee.
Both forms force presence checks under strict TypeScript. Val Box adds tested
builders, presence-constrained variants, conversions, assertions, and aliases.
That can pay off across adapters repeatedly assembling both channels. If
undefined always means absent, `T | undefined` is enough; if both fields are
required, use a plain record. A graph already using a complete `SearchOutcome`
union may gain redundant absence states by wrapping every result.

## Missing integrations and evidence limits

There is no `map`, automatic metadata propagation through transformations,
success/error algebra, retry mechanism, graph routing, checkpointing, schema
validation, provenance verification, or deep immutability. Summarizing or
merging content requires the host to decide which source metadata remains
valid. An arbitrary `fresh: true` or source name cannot establish trust.
`isValBox` recognizes instances of the loaded package copy, not remote JSON
or authenticated origins.

JSON retains `present: true` for supplied undefined but drops its `value`
property; NaN becomes null. A transport codec must define allowed values,
validation, reconstruction, and schema evolution. Metadata intended for logs,
model context, or policy decisions also needs appropriate host selection.

The audit ran 19 runtime/snapshot tests, package no-emit typechecking, and
comparative probes. Plain unions matched tested presence semantics, including
undefined and falsy values. These results support the mechanism, not claims of
better LLM reasoning or faster development. Smaller coding context depends on
adequate contracts, representative fixtures, and deliberate context selection.
“Quick evals” means static contract checks and deterministic fixture assertions.

See the [detailed evidence chapter](https://github.com/dany-fedorov/di-bag/blob/main/docs/research/2026-09-12-box-harness-evidence.md),
[runtime comparisons](https://github.com/dany-fedorov/di-bag/blob/main/docs/research/box-harness-probe.ts),
[compile-only comparisons](https://github.com/dany-fedorov/di-bag/blob/main/docs/research/box-harness-types.ts),
and [cross-library synthesis](https://github.com/dany-fedorov/di-bag/blob/main/docs/research/2026-09-12-harness-engineering-claim-audit.md).
The report supplies setup and portable commands. Adoption should be tested
against equivalent unions using the same states and change tasks, measuring
integration code and defects before asserting an agent-productivity advantage.
