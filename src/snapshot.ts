export type Presence<T> =
  | { readonly present: false }
  | { readonly present: true; readonly value: T };

export interface ValBoxSnapshot<V, M> {
  readonly value: Presence<V>;
  readonly metadata: Presence<M>;
  readonly alias: string | null;
}

export interface ValBoxSnapshotSource<V, M> {
  hasValue(): boolean;
  getValue(): V | undefined;
  hasMetadata(): boolean;
  getMetadata(): M | undefined;
  getIntentionalAlias(): string | null;
}

function snapshotPresence<T>(
  present: boolean,
  value: T | undefined,
): Presence<T> {
  if (!present) {
    return Object.freeze({ present: false });
  }
  return Object.freeze({ present: true, value: value as T });
}

export function createValBoxSnapshot<V, M>(
  source: ValBoxSnapshotSource<V, M>,
): ValBoxSnapshot<V, M> {
  return Object.freeze({
    value: snapshotPresence(source.hasValue(), source.getValue()),
    metadata: snapshotPresence(source.hasMetadata(), source.getMetadata()),
    alias: source.getIntentionalAlias(),
  });
}
