class ValBoxError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class ValBoxAssertionError extends ValBoxError {
  static plines(prefix: string, ...lines: string[]): ValBoxAssertionError {
    return new ValBoxAssertionError(
      lines.map((ln) => `${prefix}: ${ln}`).join('\n'),
    );
  }

  constructor(message: string) {
    super(message);
  }
}

class ValBoxInputError extends ValBoxError {
  static plines(prefix: string, ...lines: string[]): ValBoxInputError {
    return new ValBoxInputError(
      lines.map((ln) => `${prefix}: ${ln}`).join('\n'),
    );
  }

  constructor(message: string) {
    super(message);
  }
}

class ValBoxMethodNotAllowedError extends ValBoxError {
  constructor(className: string, methodName: string, alias: string) {
    super(
      [
        `${className}#${methodName}: Reason - Not allowed.`,
        `${className}#${methodName}: Alias - ${alias}.`,
      ].join('\n'),
    );
  }
}

type ValBoxAliasInput = string | null | undefined;

const VAL_BOX_TYPE_SYMBOL = Symbol('VAL_BOX_TYPE_SYMBOL');

//region ValBoxUnknownValueUnknownMetadata class and namespace

export class ValBoxUnknownValueUnknownMetadata<TValue, TMetadata> {
  [VAL_BOX_TYPE_SYMBOL] = true as const;

  static ANONYMOUS_ALIAS = '<<Anonymous ValBox.UnknownValue.UnknownMetadata>>';

  protected _hasIntentionalAlias: boolean;
  alias: string;

  protected _hasValue = false;
  protected _value: TValue | undefined = undefined;

  protected _hasMetadata = false;
  protected _metadata: TMetadata | undefined = undefined;

  constructor(alias?: ValBoxAliasInput) {
    if (!alias) {
      this.alias = ValBoxUnknownValueUnknownMetadata.ANONYMOUS_ALIAS;
      this._hasIntentionalAlias = false;
    } else {
      this.alias = alias;
      this._hasIntentionalAlias = true;
    }
  }

  getIntentionalAlias(): string | null {
    if (this._hasIntentionalAlias) {
      return this.alias;
    } else {
      return null;
    }
  }

  assertHasValue(): this {
    if (!this.hasValue()) {
      throw ValBoxAssertionError.plines(
        `${this.constructor.name}#assertHasValue`,
        `Reason - DOESN'T HAVE a value.`,
        `Alias - ${this.alias}`,
      );
    }
    return this;
  }

  assertHasNoValue(): this {
    if (this.hasValue()) {
      throw ValBoxAssertionError.plines(
        `${this.constructor.name}#assertHasNoValue`,
        `Reason - HAS a value.`,
        `Alias - ${this.alias}`,
      );
    }
    return this;
  }

  assertHasMetadata(): this {
    if (!this.hasValue()) {
      throw ValBoxAssertionError.plines(
        `${this.constructor.name}#assertHasMetadata`,
        `Reason - DOESN'T HAVE metadata.`,
        `Alias - ${this.alias}`,
      );
    }
    return this;
  }

  assertHasNoMetadata(): this {
    if (this.hasValue()) {
      throw ValBoxAssertionError.plines(
        `${this.constructor.name}#assertHasNoMetadata`,
        `Reason - HAS metadata.`,
        `Alias - ${this.alias}`,
      );
    }
    return this;
  }

  convert<TConversion extends ValBoxUnknownValueUnknownMetadata.Conversion>(
    refinement: TConversion,
  ): ValBoxUnknownValueUnknownMetadata.ConvertedResult<
    TConversion,
    TValue,
    TMetadata
  > {
    const { hasValue, hasMetadata } = refinement;
    if (hasValue === true) {
      this.assertHasValue();
    }
    if (hasMetadata === true) {
      this.assertHasMetadata();
    }
    const BadInputError = () =>
      ValBoxInputError.plines(
        `${this.constructor.name}#refine`,
        'Reason - Bad input',
        `Alias - ${this.alias}`,
        `Input - ${JSON.stringify(refinement)}`,
      );
    let newBox: any;
    if (hasValue === undefined) {
      if (hasMetadata === undefined) {
        newBox = new ValBoxUnknownValueUnknownMetadata(
          this.getIntentionalAlias(),
        );
        if (this.hasValue()) {
          newBox.setValue(this.getValue());
        }
        if (this.hasMetadata()) {
          newBox.setMetadata(this.getMetadata());
        }
      } else if (hasMetadata === true) {
        newBox = new ValBoxUnknownValueWithMetadata(
          this.getMetadata(),
          this.getIntentionalAlias(),
        );
        if (this.hasValue()) {
          newBox.setValue(this.getValue());
        }
      } else if (hasMetadata === false) {
        newBox = new ValBoxUnknownValueNoMetadata(this.getIntentionalAlias());
        if (this.hasValue()) {
          newBox.setValue(this.getValue());
        }
      } else {
        throw BadInputError();
      }
    } else if (hasValue === true) {
      if (hasMetadata === undefined) {
        newBox = new ValBoxWithValueUnknownMetadata(this.getIntentionalAlias());
        if (this.hasMetadata()) {
          newBox.setMetadata(this.getMetadata());
        }
      } else if (hasMetadata === true) {
        newBox = new ValBoxWithValueWithMetadata(
          this.getValue(),
          this.getMetadata(),
          this.getIntentionalAlias(),
        );
      } else if (hasMetadata === false) {
        newBox = new ValBoxWithValueNoMetadata(
          this.getValue(),
          this.getIntentionalAlias(),
        );
      } else {
        throw BadInputError();
      }
    } else if (hasValue === false) {
      if (hasMetadata === undefined) {
        newBox = new ValBoxNoValueUnknownMetadata(this.getIntentionalAlias());
        if (this.hasMetadata()) {
          newBox.setMetadata(this.getMetadata());
        }
      } else if (hasMetadata === true) {
        newBox = new ValBoxNoValueWithMetadata(
          this.getMetadata(),
          this.getIntentionalAlias(),
        );
      } else if (hasMetadata === false) {
        newBox = new ValBoxNoValueNoMetadata(this.getIntentionalAlias());
      } else {
        throw BadInputError();
      }
    } else {
      throw BadInputError();
    }
    return newBox as unknown as ValBoxUnknownValueUnknownMetadata.ConvertedResult<
      TConversion,
      TValue,
      TMetadata
    >;
  }

  setValue(_value: TValue): this {
    this._value = _value;
    this._hasValue = true;
    return this;
  }

  hasValue(): boolean {
    return this._hasValue;
  }

  getValue(): TValue | undefined {
    return this._value;
  }

  delValue(): this {
    this._value = undefined;
    this._hasValue = false;
    return this;
  }

  setMetadata(_metadata: TMetadata): this {
    this._metadata = _metadata;
    this._hasMetadata = true;
    return this;
  }

  hasMetadata(): boolean {
    return this._hasMetadata;
  }

  getMetadata(): TMetadata | undefined {
    return this._metadata;
  }

  delMetadata(): this {
    this._metadata = undefined;
    this._hasMetadata = false;
    return this;
  }
}

export namespace ValBoxUnknownValueUnknownMetadata {
  export type Conversion = {
    hasValue?: boolean | undefined;
    hasMetadata?: boolean | undefined;
  };

  export type ConvertedResult<
    TRefinement extends Conversion,
    TValue,
    TMetadata,
  > = TRefinement extends
    | {
        hasValue: undefined;
        hasMetadata: undefined;
      }
    | { hasValue: undefined }
    | { hasMetadata: undefined }
    | Record<string, never>
    ? ValBoxUnknownValueUnknownMetadata<TValue, TMetadata>
    : TRefinement extends
        | {
            hasValue: undefined;
            hasMetadata: true;
          }
        | { hasMetadata: true }
    ? ValBoxUnknownValueWithMetadata<TValue, TMetadata>
    : TRefinement extends
        | {
            hasValue: undefined;
            hasMetadata: false;
          }
        | { hasMetadata: false }
    ? ValBoxUnknownValueNoMetadata<TValue>
    : TRefinement extends
        | {
            hasValue: true;
            hasMetadata: undefined;
          }
        | { hasValue: true }
    ? ValBoxWithValueUnknownMetadata<TValue, TMetadata>
    : TRefinement extends {
        hasValue: true;
        hasMetadata: true;
      }
    ? ValBoxWithValueWithMetadata<TValue, TMetadata>
    : TRefinement extends {
        hasValue: true;
        hasMetadata: false;
      }
    ? ValBoxWithValueNoMetadata<TValue>
    : TRefinement extends
        | {
            hasValue: false;
            hasMetadata: undefined;
          }
        | { hasValue: false }
    ? ValBoxNoValueUnknownMetadata<TMetadata>
    : TRefinement extends {
        hasValue: false;
        hasMetadata: true;
      }
    ? ValBoxNoValueWithMetadata<TMetadata>
    : TRefinement extends {
        hasValue: false;
        hasMetadata: false;
      }
    ? ValBoxNoValueNoMetadata
    : never;
}

//endregion

export class ValBoxWithValueUnknownMetadata<
  TValue,
  TMetadata,
> extends ValBoxUnknownValueUnknownMetadata<TValue, TMetadata> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.WithValue.UnknownMetadata>>';

  override readonly _hasValue: true;
  override _value: TValue;

  constructor(value: TValue, alias?: ValBoxAliasInput) {
    super(alias || ValBoxWithValueUnknownMetadata.ANONYMOUS_ALIAS);
    this._hasIntentionalAlias = !!alias;
    this._hasValue = true;
    this._value = value;
  }

  override hasValue(): true {
    return super.hasValue() as true;
  }

  override getValue(): TValue {
    return super.getValue() as TValue;
  }

  override delValue(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'delValue',
      this.alias,
    );
  }

  override assertHasNoValue(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasNoValue',
      this.alias,
    );
  }
}

export class ValBoxUnknownValueWithMetadata<
  TValue,
  TMetadata,
> extends ValBoxUnknownValueUnknownMetadata<TValue, TMetadata> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.UnknownValue.WithMetadata>>';

  override readonly _hasMetadata: true;
  override _metadata: TMetadata;

  constructor(metadata: TMetadata, alias?: ValBoxAliasInput) {
    super(alias || ValBoxUnknownValueWithMetadata.ANONYMOUS_ALIAS);
    this._hasIntentionalAlias = !!alias;
    this._hasMetadata = true;
    this._metadata = metadata;
  }

  override hasMetadata(): true {
    return super.hasMetadata() as true;
  }

  override getMetadata(): TMetadata {
    return super.getMetadata() as TMetadata;
  }

  override delMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'delMetadata',
      this.alias,
    );
  }

  override assertHasNoMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasNoMetadata',
      this.alias,
    );
  }
}

export class ValBoxWithValueWithMetadata<
  TValue,
  TMetadata,
> extends ValBoxUnknownValueUnknownMetadata<TValue, TMetadata> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.WithValue.WithMetadata>>';

  override readonly _hasValue: true;
  override _value: TValue;

  override readonly _hasMetadata: true;
  override _metadata: TMetadata;

  constructor(value: TValue, metadata: TMetadata, alias?: ValBoxAliasInput) {
    super(alias || ValBoxWithValueWithMetadata.ANONYMOUS_ALIAS);
    this._hasIntentionalAlias = !!alias;
    this._hasValue = true;
    this._value = value;
    this._hasMetadata = true;
    this._metadata = metadata;
  }

  override hasValue(): true {
    return super.hasValue() as true;
  }

  override getValue(): TValue {
    return super.getValue() as TValue;
  }

  override delValue(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'delValue',
      this.alias,
    );
  }

  override hasMetadata(): true {
    return super.hasMetadata() as true;
  }

  override getMetadata(): TMetadata {
    return super.getMetadata() as TMetadata;
  }

  override delMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'delMetadata',
      this.alias,
    );
  }

  override assertHasNoValue(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasNoValue',
      this.alias,
    );
  }

  override assertHasNoMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasNoMetadata',
      this.alias,
    );
  }
}

export class ValBoxNoValueUnknownMetadata<
  TMetadata,
> extends ValBoxUnknownValueUnknownMetadata<never, TMetadata> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.NoValue.UnknownMetadata>>';

  override readonly _hasValue = false as const;
  override readonly _value = undefined;

  constructor(alias?: ValBoxAliasInput) {
    super(alias || ValBoxNoValueUnknownMetadata.ANONYMOUS_ALIAS);
    this._hasIntentionalAlias = !!alias;
    this._hasValue = false;
    this._value = undefined;
  }

  override hasValue(): false {
    return super.hasValue() as false;
  }

  override getValue(): undefined {
    return super.getValue();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override setValue(_value: never): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'setValue',
      this.alias,
    );
  }

  override assertHasValue(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasValue',
      this.alias,
    );
  }
}

export class ValBoxUnknownValueNoMetadata<
  TValue,
> extends ValBoxUnknownValueUnknownMetadata<TValue, never> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.UnknownValue.NoMetadata>>';

  override readonly _hasMetadata = false as const;
  override readonly _metadata = undefined;

  constructor(alias?: ValBoxAliasInput) {
    super(alias || ValBoxUnknownValueNoMetadata.ANONYMOUS_ALIAS);
    this._hasIntentionalAlias = !!alias;
    this._hasMetadata = false;
    this._metadata = undefined;
  }

  override hasMetadata(): false {
    return super.hasMetadata() as false;
  }

  override getMetadata(): undefined {
    return super.getMetadata();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override setMetadata(_metadata: never): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'setMetadata',
      this.alias,
    );
  }

  override assertHasMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasMetadata',
      this.alias,
    );
  }
}

export class ValBoxNoValueNoMetadata extends ValBoxUnknownValueUnknownMetadata<
  never,
  never
> {
  static override ANONYMOUS_ALIAS = '<<Anonymous ValBox.NoValue.NoMetadata>>';

  override readonly _hasValue = false as const;
  override readonly _value = undefined;
  override readonly _hasMetadata = false as const;
  override readonly _metadata = undefined;

  constructor(alias: ValBoxAliasInput) {
    super(alias || ValBoxNoValueNoMetadata.ANONYMOUS_ALIAS);
    this._hasIntentionalAlias = !!alias;
    this._hasValue = false;
    this._value = undefined;
    this._hasMetadata = false;
    this._metadata = undefined;
  }

  override hasValue(): false {
    return super.hasValue() as false;
  }

  override getValue(): undefined {
    return super.getValue();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override setValue(_value: never): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'setValue',
      this.alias,
    );
  }

  override hasMetadata(): false {
    return super.hasMetadata() as false;
  }

  override getMetadata(): undefined {
    return super.getMetadata();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override setMetadata(_metadata: never): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'setMetadata',
      this.alias,
    );
  }

  override assertHasValue(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasValue',
      this.alias,
    );
  }

  override assertHasMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasMetadata',
      this.alias,
    );
  }
}

export class ValBoxWithValueNoMetadata<
  TValue,
> extends ValBoxUnknownValueUnknownMetadata<TValue, never> {
  static override ANONYMOUS_ALIAS = '<<Anonymous ValBox.WithValue.NoMetadata>>';

  override readonly _hasValue = true as const;
  override _value: TValue;

  override readonly _hasMetadata = false as const;
  override readonly _metadata = undefined;

  constructor(value: TValue, alias?: ValBoxAliasInput) {
    super(alias || ValBoxWithValueNoMetadata.ANONYMOUS_ALIAS);
    this._hasIntentionalAlias = !!alias;
    this._hasValue = true;
    this._value = value;
    this._hasMetadata = false;
    this._metadata = undefined;
  }

  override hasValue(): true {
    return super.hasValue() as true;
  }

  override getValue(): TValue {
    return super.getValue() as TValue;
  }

  override delValue(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'delValue',
      this.alias,
    );
  }

  override hasMetadata(): false {
    return super.hasMetadata() as false;
  }

  override getMetadata(): undefined {
    return super.getMetadata();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override setMetadata(_metadata: never): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'setMetadata',
      this.alias,
    );
  }

  override assertHasValue(): this {
    return super.assertHasValue() as this;
  }

  override assertHasMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasMetadata',
      this.alias,
    );
  }
}

export class ValBoxNoValueWithMetadata<
  TMetadata,
> extends ValBoxUnknownValueUnknownMetadata<never, TMetadata> {
  static override ANONYMOUS_ALIAS = '<<Anonymous ValBox.NoValue.WithMetadata>>';

  override readonly _hasValue = false as const;
  override readonly _value = undefined;
  override readonly _hasMetadata = true as const;
  override _metadata: TMetadata;

  constructor(metadata: TMetadata, alias?: ValBoxAliasInput) {
    super(alias || ValBoxNoValueWithMetadata.ANONYMOUS_ALIAS);
    this._hasIntentionalAlias = !!alias;
    this._hasMetadata = true;
    this._metadata = metadata;
    this._hasValue = false;
    this._value = undefined;
  }

  override hasValue(): false {
    return super.hasValue() as false;
  }

  override getValue(): undefined {
    return super.getValue();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override setValue(_value: never): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'setValue',
      this.alias,
    );
  }

  override assertHasValue(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasValue',
      this.alias,
    );
  }

  override hasMetadata(): true {
    return super.hasMetadata() as true;
  }

  override getMetadata(): TMetadata {
    return super.getMetadata() as TMetadata;
  }

  override delMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'delMetadata',
      this.alias,
    );
  }

  override assertHasMetadata(): this {
    return super.assertHasMetadata() as unknown as this;
  }
}

export namespace ValBox {
  export function isValBox(
    obj: unknown,
  ): obj is ValBoxUnknownValueUnknownMetadata<unknown, unknown> {
    if (
      !obj ||
      typeof obj !== 'object' ||
      Array.isArray(obj) ||
      !(obj instanceof ValBoxUnknownValueUnknownMetadata)
    ) {
      return false;
    }
    return (obj as any)[VAL_BOX_TYPE_SYMBOL] === true;
  }

  export const Error = ValBoxError;
  export type Error = ValBoxError;

  export const AssertionError = ValBoxAssertionError;
  export type AssertionError = ValBoxAssertionError;

  export const InputError = ValBoxInputError;
  export type InputError = ValBoxInputError;

  export const MethodNotAllowedError = ValBoxMethodNotAllowedError;
  export type MethodNotAllowedError = ValBoxMethodNotAllowedError;

  export type AliasInput = ValBoxAliasInput;

  export const Unknown = ValBoxUnknownValueUnknownMetadata;
  export type Unknown<TValue, TMetadata> = ValBoxUnknownValueUnknownMetadata<
    TValue,
    TMetadata
  >;

  export class UnknownValue<
    TValue,
    TMetadata,
  > extends ValBoxUnknownValueUnknownMetadata<TValue, TMetadata> {}

  Object.defineProperty(UnknownValue, 'name', {
    value: 'ValBoxUnknownValueUnknownMetadata:alias',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  export namespace UnknownValue {
    export const UnknownMetadata = ValBoxUnknownValueUnknownMetadata;
    export type UnknownMetadata<TValue, TMetadata> =
      ValBoxUnknownValueUnknownMetadata<TValue, TMetadata>;
    export const NoMetadata = ValBoxUnknownValueNoMetadata;
    export type NoMetadata<TValue> = ValBoxUnknownValueNoMetadata<TValue>;
    export const WithMetadata = ValBoxUnknownValueWithMetadata;
    export type WithMetadata<TValue, TMetadata> =
      ValBoxUnknownValueWithMetadata<TValue, TMetadata>;
  }

  export class UnknownMetadata<
    TValue,
    TMetadata,
  > extends ValBoxUnknownValueUnknownMetadata<TValue, TMetadata> {}

  Object.defineProperty(UnknownMetadata, 'name', {
    value: 'ValBoxUnknownValueUnknownMetadata:alias',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  export namespace UnknownMetadata {
    export const UnknownValue = ValBoxUnknownValueUnknownMetadata;
    export type UnknownValue<TValue, TMetadata> =
      ValBoxUnknownValueUnknownMetadata<TValue, TMetadata>;
    export const NoValue = ValBoxNoValueUnknownMetadata;
    export type NoValue<TMetadata> = ValBoxNoValueUnknownMetadata<TMetadata>;
    export const WithValue = ValBoxWithValueUnknownMetadata;
    export type WithValue<TValue, TMetadata> = ValBoxWithValueUnknownMetadata<
      TValue,
      TMetadata
    >;
  }

  export class WithValue<
    TValue,
    TMetadata,
  > extends ValBoxWithValueUnknownMetadata<TValue, TMetadata> {}

  Object.defineProperty(WithValue, 'name', {
    value: 'ValBoxWithValueUnknownMetadata:alias',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  export namespace WithValue {
    export const UnknownMetadata = ValBoxWithValueUnknownMetadata;
    export type UnknownMetadata<TValue, TMetadata> =
      ValBoxWithValueUnknownMetadata<TValue, TMetadata>;
    export const NoMetadata = ValBoxWithValueNoMetadata;
    export type NoMetadata<TValue> = ValBoxWithValueNoMetadata<TValue>;
    export const WithMetadata = ValBoxWithValueWithMetadata;
    export type WithMetadata<TValue, TMetadata> = ValBoxWithValueWithMetadata<
      TValue,
      TMetadata
    >;
  }

  export class WithMetadata<
    TValue,
    TMetadata,
  > extends ValBoxUnknownValueWithMetadata<TValue, TMetadata> {}

  Object.defineProperty(WithValue, 'name', {
    value: 'ValBoxUnknownValueWithMetadata:alias',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  export namespace WithMetadata {
    export const UnknownValue = ValBoxUnknownValueWithMetadata;
    export const NoValue = ValBoxNoValueWithMetadata;
    export const WithValue = ValBoxWithValueWithMetadata;
  }

  export class NoValue<
    TMetadata,
  > extends ValBoxNoValueUnknownMetadata<TMetadata> {}

  Object.defineProperty(NoValue, 'name', {
    value: 'ValBoxNoValueUnknownMetadata:alias',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  export namespace NoValue {
    export const UnknownMetadata = ValBoxNoValueUnknownMetadata;
    export type UnknownMetadata<TMetadata> =
      ValBoxNoValueUnknownMetadata<TMetadata>;
    export const NoMetadata = ValBoxNoValueNoMetadata;
    export type NoMetadata = ValBoxNoValueNoMetadata;
    export const WithMetadata = ValBoxNoValueWithMetadata;
    export type WithMetadata<TMetadata> = ValBoxNoValueWithMetadata<TMetadata>;
  }

  export class NoMetadata<
    TMetadata,
  > extends ValBoxUnknownValueNoMetadata<TMetadata> {}

  Object.defineProperty(NoMetadata, 'name', {
    value: 'ValBoxUnknownValueNoMetadata:alias',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  export namespace NoMetadata {
    export const UnknownValue = ValBoxUnknownValueNoMetadata;
    export type UnknownValue<TValue> = ValBoxUnknownValueNoMetadata<TValue>;
    export const NoValue = ValBoxNoValueNoMetadata;
    export type NoValue = ValBoxNoValueNoMetadata;
    export const WithValue = ValBoxWithValueNoMetadata;
    export type WithValue<TValue> = ValBoxWithValueNoMetadata<TValue>;
  }
}

