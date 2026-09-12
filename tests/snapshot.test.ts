import { expect, test } from 'bun:test';
import { ValBox } from '../src';

test('snapshot preserves present undefined after later box mutations', () => {
  const box = new ValBox.Unknown<number | undefined, string>()
    .setValue(undefined)
    .setMetadata('db');

  const snapshot = ValBox.snapshot(box);
  box.setValue(42).delMetadata();

  expect(snapshot.value).toEqual({ present: true, value: undefined });
  expect(snapshot.metadata).toEqual({ present: true, value: 'db' });
  expect(snapshot.alias).toBeNull();
});

test('instance snapshot records absent channels and an intentional alias', () => {
  const box = new ValBox.Unknown<number, string>('source');

  expect(box.snapshot()).toEqual({
    value: { present: false },
    metadata: { present: false },
    alias: 'source',
  });
});

test('snapshot freezes records but shares unfrozen payload identity', () => {
  const value = { count: 1 };
  const metadata = { source: 'db' };
  const box = new ValBox.Unknown<typeof value, typeof metadata>()
    .setValue(value)
    .setMetadata(metadata);

  const snapshot = box.snapshot();

  expect(Object.isFrozen(snapshot)).toBe(true);
  expect(Object.isFrozen(snapshot.value)).toBe(true);
  expect(Object.isFrozen(snapshot.metadata)).toBe(true);
  expect(snapshot.value).toEqual({ present: true, value });
  expect(snapshot.metadata).toEqual({ present: true, value: metadata });
  if (snapshot.value.present && snapshot.metadata.present) {
    expect(snapshot.value.value).toBe(value);
    expect(snapshot.metadata.value).toBe(metadata);
    expect(Object.isFrozen(snapshot.value.value)).toBe(false);
    expect(Object.isFrozen(snapshot.metadata.value)).toBe(false);
  }
});

test('namespace snapshot retains a refined subtype at the structural boundary', () => {
  const box = new ValBox.WithValue.WithMetadata(42, 'db', 'source');

  const snapshot = ValBox.snapshot(box);

  expect(snapshot).toEqual({
    value: { present: true, value: 42 },
    metadata: { present: true, value: 'db' },
    alias: 'source',
  });
});
