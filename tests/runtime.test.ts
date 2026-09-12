import { describe, expect, test } from 'bun:test';
import { ValBox } from '../src';

describe('presence assertions', () => {
  test('metadata assertions consult metadata independently of value', () => {
    const metadataOnly = new ValBox.Unknown<number, string>()
      .setMetadata('db');
    const valueOnly = new ValBox.Unknown<number, string>().setValue(42);

    expect(metadataOnly.assertHasMetadata()).toBe(metadataOnly);
    expect(() => metadataOnly.assertHasNoMetadata()).toThrow(
      ValBox.AssertionError,
    );
    expect(() => valueOnly.assertHasMetadata()).toThrow(ValBox.AssertionError);
    expect(valueOnly.assertHasNoMetadata()).toBe(valueOnly);
  });
});

describe('conversion', () => {
  test('requiring a value preserves its numeric payload', () => {
    const original = new ValBox.Unknown<number, string>('source').setValue(42);

    const converted = original.convert({ hasValue: true });

    expect(converted.getValue()).toBe(42);
  });

  const cases = [
    {
      name: 'unknown/unknown',
      options: { hasValue: undefined, hasMetadata: undefined },
      valuePresent: true,
      metadataPresent: true,
    },
    {
      name: 'unknown/with metadata',
      options: { hasValue: undefined, hasMetadata: true },
      valuePresent: true,
      metadataPresent: true,
    },
    {
      name: 'unknown/no metadata',
      options: { hasValue: undefined, hasMetadata: false },
      valuePresent: true,
      metadataPresent: false,
    },
    {
      name: 'with value/unknown',
      options: { hasValue: true, hasMetadata: undefined },
      valuePresent: true,
      metadataPresent: true,
    },
    {
      name: 'with value/with metadata',
      options: { hasValue: true, hasMetadata: true },
      valuePresent: true,
      metadataPresent: true,
    },
    {
      name: 'with value/no metadata',
      options: { hasValue: true, hasMetadata: false },
      valuePresent: true,
      metadataPresent: false,
    },
    {
      name: 'no value/unknown',
      options: { hasValue: false, hasMetadata: undefined },
      valuePresent: false,
      metadataPresent: true,
    },
    {
      name: 'no value/with metadata',
      options: { hasValue: false, hasMetadata: true },
      valuePresent: false,
      metadataPresent: true,
    },
    {
      name: 'no value/no metadata',
      options: { hasValue: false, hasMetadata: false },
      valuePresent: false,
      metadataPresent: false,
    },
  ] as const;

  for (const fixture of cases) {
    test(`${fixture.name} applies both axes independently`, () => {
      const original = new ValBox.Unknown<number, string>('source')
        .setValue(42)
        .setMetadata('db');

      const converted = original.convert(fixture.options);

      expect(converted).not.toBe(original);
      expect(converted.getIntentionalAlias()).toBe('source');
      expect(converted.hasValue()).toBe(fixture.valuePresent);
      expect(converted.hasMetadata()).toBe(fixture.metadataPresent);
      expect(converted.getValue()).toBe(
        fixture.valuePresent ? 42 : undefined,
      );
      expect(converted.getMetadata()).toBe(
        fixture.metadataPresent ? 'db' : undefined,
      );
    });
  }

  test('true requirements reject independently missing channels', () => {
    const metadataOnly = new ValBox.Unknown<number, string>()
      .setMetadata('db');
    const valueOnly = new ValBox.Unknown<number, string>().setValue(42);

    expect(() => metadataOnly.convert({ hasValue: true })).toThrow(
      ValBox.AssertionError,
    );
    expect(() => valueOnly.convert({ hasMetadata: true })).toThrow(
      ValBox.AssertionError,
    );
  });

  test('present undefined survives required and preserving conversions', () => {
    const original = new ValBox.Unknown<undefined, undefined>('undefined')
      .setValue(undefined)
      .setMetadata(undefined);

    const required = original.convert({
      hasValue: true,
      hasMetadata: true,
    });
    const preserved = original.convert({});

    expect(required.hasValue()).toBe(true);
    expect(required.getValue()).toBeUndefined();
    expect(required.hasMetadata()).toBe(true);
    expect(required.getMetadata()).toBeUndefined();
    expect(preserved.hasValue()).toBe(true);
    expect(preserved.hasMetadata()).toBe(true);
  });

  test('converted boxes isolate mutations while sharing payload references', () => {
    const value = { id: 42 };
    const metadata = { source: 'db' };
    const original = new ValBox.Unknown<typeof value, typeof metadata>('source')
      .setValue(value)
      .setMetadata(metadata);
    const converted = original.convert({});

    expect(converted.getValue()).toBe(value);
    expect(converted.getMetadata()).toBe(metadata);

    converted.setValue({ id: 7 }).delMetadata();
    expect(original.getValue()).toBe(value);
    expect(original.getMetadata()).toBe(metadata);

    original.delValue();
    expect(converted.hasValue()).toBe(true);
    expect(converted.getValue()).toEqual({ id: 7 });
  });

  test('the WithMetadata compatibility alias retains its own class name', () => {
    expect(ValBox.WithMetadata.name).toBe(
      'ValBoxUnknownValueWithMetadata:alias',
    );
    expect(ValBox.WithValue.name).toBe('ValBoxWithValueUnknownMetadata:alias');
  });
});
