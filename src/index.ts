export class ValBoxError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ValBoxAssertionError extends ValBoxError {
  constructor(message: string) {
    super(message);
  }
}

export class ValBoxMethodNotAllowedError extends ValBoxError {
  constructor(className: string, methodName: string) {
    super(`${className}#${methodName}: Not allowed.`);
  }
}

export class ValBoxUnknownValueUnknownMetadata<VT, MT> {
  static ANONYMOUS_ALIAS = '<<Anonymous ValBox.UnknownValue.UnknownMetadata>>';

  alias: string;

  protected _hasValue = false;
  protected _value: VT | undefined = undefined;

  protected _hasMetadata = false;
  protected _metadata: MT | undefined = undefined;

  constructor(alias = ValBoxUnknownValueUnknownMetadata.ANONYMOUS_ALIAS) {
    this.alias = alias;
  }

  assertHasValue(): ValBoxWithValueUnknownMetadata<VT, MT> {
    if (!this._hasValue) {
      throw new ValBoxAssertionError(
        `${this.constructor.name}#assertHasValue: "${this.alias}" has no value.`,
      );
    }
    return this as unknown as ValBoxWithValueUnknownMetadata<VT, MT>;
  }

  assertHasMetadata(): ValBoxUnknownValueWithMetadata<VT, MT> {
    if (!this._hasValue) {
      throw new ValBoxAssertionError(
        `${this.constructor.name}#assertHasMetadata: "${this.alias}" has no metadata.`,
      );
    }
    return this as unknown as ValBoxUnknownValueWithMetadata<VT, MT>;
  }

  assertHasValueAndMetadata(): ValBoxWithValueWithMetadata<VT, MT> {
    return this.assertHasValue().assertHasMetadata() as unknown as ValBoxWithValueWithMetadata<
      VT,
      MT
    >;
  }

  setValue(_value: VT): this {
    this._value = _value;
    this._hasValue = true;
    return this;
  }

  hasValue(): boolean {
    return this._hasValue;
  }

  getValue(): VT | undefined {
    return this._value;
  }

  delValue(): this {
    this._value = undefined;
    this._hasValue = false;
    return this;
  }

  setMetadata(_metadata: MT): this {
    this._metadata = _metadata;
    this._hasMetadata = true;
    return this;
  }

  hasMetadata(): boolean {
    return this._hasMetadata;
  }

  getMetadata(): MT | undefined {
    return this._metadata;
  }

  delMetadata(): this {
    this._metadata = undefined;
    this._hasMetadata = false;
    return this;
  }
}

export class ValBoxWithValueUnknownMetadata<
  VT,
  MT,
> extends ValBoxUnknownValueUnknownMetadata<VT, MT> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.WithValue.UnknownMetadata>>';

  override readonly _hasValue: true;
  override _value: VT;

  constructor(
    value: VT,
    alias: string = ValBoxWithValueUnknownMetadata.ANONYMOUS_ALIAS,
  ) {
    super(alias);
    this._hasValue = true;
    this._value = value;
  }

  override hasValue(): true {
    return super.hasValue() as true;
  }

  override getValue(): VT {
    return super.getValue() as VT;
  }

  override delValue(): never {
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'delValue');
  }

  override assertHasValue(): this {
    return super.assertHasValue() as this;
  }

  override assertHasMetadata(): ValBoxWithValueWithMetadata<VT, MT> {
    return super.assertHasMetadata() as unknown as ValBoxWithValueWithMetadata<
      VT,
      MT
    >;
  }
}

export class ValBoxUnknownValueWithMetadata<
  VT,
  MT,
> extends ValBoxUnknownValueUnknownMetadata<VT, MT> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.UnknownValue.WithMetadata>>';

  override readonly _hasMetadata: true;
  override _metadata: MT;

  constructor(
    metadata: MT,
    alias: string = ValBoxUnknownValueWithMetadata.ANONYMOUS_ALIAS,
  ) {
    super(alias);
    this._hasMetadata = true;
    this._metadata = metadata;
  }

  override hasMetadata(): true {
    return super.hasMetadata() as true;
  }

  override getMetadata(): MT {
    return super.getMetadata() as MT;
  }

  override delMetadata(): never {
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'delMetadata');
  }

  override assertHasValue(): ValBoxWithValueWithMetadata<VT, MT> {
    return super.assertHasValue() as unknown as ValBoxWithValueWithMetadata<
      VT,
      MT
    >;
  }

  override assertHasMetadata(): this {
    return super.assertHasMetadata() as this;
  }
}

export class ValBoxWithValueWithMetadata<
  VT,
  MT,
> extends ValBoxUnknownValueUnknownMetadata<VT, MT> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.WithValue.WithMetadata>>';

  override readonly _hasValue: true;
  override _value: VT;

  override readonly _hasMetadata: true;
  override _metadata: MT;

  constructor(
    value: VT,
    metadata: MT,
    alias: string = ValBoxWithValueWithMetadata.ANONYMOUS_ALIAS,
  ) {
    super(alias);
    this._hasValue = true;
    this._value = value;
    this._hasMetadata = true;
    this._metadata = metadata;
  }

  override hasValue(): true {
    return super.hasValue() as true;
  }

  override getValue(): VT {
    return super.getValue() as VT;
  }

  override delValue(): never {
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'delValue');
  }

  override hasMetadata(): true {
    return super.hasMetadata() as true;
  }

  override getMetadata(): MT {
    return super.getMetadata() as MT;
  }

  override delMetadata(): never {
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'delMetadata');
  }

  override assertHasValue(): this {
    return super.assertHasValue() as this;
  }

  override assertHasMetadata(): this {
    return super.assertHasMetadata() as this;
  }

  override assertHasValueAndMetadata(): this {
    return super.assertHasValueAndMetadata() as this;
  }
}

export class ValBoxNoValueUnknownMetadata<
  MT,
> extends ValBoxUnknownValueUnknownMetadata<never, MT> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.NoValue.UnknownMetadata>>';

  override readonly _hasValue = false as const;
  override readonly _value = undefined;

  constructor(alias = ValBoxNoValueUnknownMetadata.ANONYMOUS_ALIAS) {
    super(alias);
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
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'setValue');
  }

  override assertHasValue(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasValue',
    );
  }

  override assertHasMetadata(): ValBoxNoValueWithMetadata<MT> {
    return super.assertHasMetadata() as unknown as ValBoxNoValueWithMetadata<MT>;
  }

  override assertHasValueAndMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasValueAndMetadata',
    );
  }
}

export class ValBoxUnknownValueNoMetadata<
  VT,
> extends ValBoxUnknownValueUnknownMetadata<VT, never> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.UnknownValue.NoMetadata>>';

  override readonly _hasMetadata = false as const;
  override readonly _metadata = undefined;

  constructor(alias = ValBoxUnknownValueNoMetadata.ANONYMOUS_ALIAS) {
    super(alias);
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
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'setMetadata');
  }

  override assertHasValue(): ValBoxWithValueNoMetadata<VT> {
    return super.assertHasValue() as unknown as ValBoxWithValueNoMetadata<VT>;
  }

  override assertHasMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasMetadata',
    );
  }

  override assertHasValueAndMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasValueAndMetadata',
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

  constructor(alias = ValBoxNoValueNoMetadata.ANONYMOUS_ALIAS) {
    super(alias);
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
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'setValue');
  }

  override hasMetadata(): false {
    return super.hasMetadata() as false;
  }

  override getMetadata(): undefined {
    return super.getMetadata();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override setMetadata(_metadata: never): never {
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'setMetadata');
  }

  override assertHasValue(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasValue',
    );
  }

  override assertHasMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasMetadata',
    );
  }

  override assertHasValueAndMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasValueAndMetadata',
    );
  }
}

export class ValBoxWithValueNoMetadata<
  VT,
> extends ValBoxUnknownValueUnknownMetadata<VT, never> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.WithValue.NoMetadata>>';

  override readonly _hasValue = true as const;
  override _value: VT;

  override readonly _hasMetadata = false as const;
  override readonly _metadata = undefined;

  constructor(value: VT, alias = ValBoxWithValueNoMetadata.ANONYMOUS_ALIAS) {
    super(alias);
    this._hasValue = true;
    this._value = value;
    this._hasMetadata = false;
    this._metadata = undefined;
  }

  override hasValue(): true {
    return super.hasValue() as true;
  }

  override getValue(): VT {
    return super.getValue() as VT;
  }

  override delValue(): never {
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'delValue');
  }

  override hasMetadata(): false {
    return super.hasMetadata() as false;
  }

  override getMetadata(): undefined {
    return super.getMetadata();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override setMetadata(_metadata: never): never {
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'setMetadata');
  }

  override assertHasValue(): this {
    return super.assertHasValue() as this;
  }

  override assertHasMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasMetadata',
    );
  }

  override assertHasValueAndMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasValueAndMetadata',
    );
  }
}

export class ValBoxNoValueWithMetadata<
  MT,
> extends ValBoxUnknownValueUnknownMetadata<never, MT> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.NoValue.WithMetadata>>';

  override readonly _hasValue = false as const;
  override readonly _value = undefined;
  override readonly _hasMetadata = true as const;
  override _metadata: MT;

  constructor(
    metadata: MT,
    alias = ValBoxNoValueWithMetadata.ANONYMOUS_ALIAS,
  ) {
    super(alias);
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
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'setValue');
  }

  override assertHasValue(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasValue',
    );
  }

  override hasMetadata(): true {
    return super.hasMetadata() as true;
  }

  override getMetadata(): MT {
    return super.getMetadata() as MT;
  }

  override delMetadata(): never {
    throw new ValBoxMethodNotAllowedError(this.constructor.name, 'delMetadata');
  }

  override assertHasMetadata(): this {
    return super.assertHasMetadata() as unknown as this;
  }

  override assertHasValueAndMetadata(): never {
    throw new ValBoxMethodNotAllowedError(
      this.constructor.name,
      'assertHasValueAndMetadata',
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ValBox {
  export const Unknown = ValBoxUnknownValueUnknownMetadata;
  export type Unknown<VT, MT> = ValBoxUnknownValueUnknownMetadata<VT, MT>;

  export class UnknownValue<VT, MT> extends ValBoxUnknownValueUnknownMetadata<
    VT,
    MT
  > {}

  Object.defineProperty(UnknownValue, 'name', {
    value: 'ValBoxUnknownValueUnknownMetadata',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace UnknownValue {
    export const UnknownMetadata = ValBoxUnknownValueUnknownMetadata;
    export type UnknownMetadata<VT, MT> = ValBoxUnknownValueUnknownMetadata<
      VT,
      MT
    >;
    export const NoMetadata = ValBoxUnknownValueNoMetadata;
    export type NoMetadata<VT> = ValBoxUnknownValueNoMetadata<VT>;
    export const WithMetadata = ValBoxUnknownValueWithMetadata;
    export type WithMetadata<VT, MT> = ValBoxUnknownValueWithMetadata<VT, MT>;
  }

  export class UnknownMetadata<
    VT,
    MT,
  > extends ValBoxUnknownValueUnknownMetadata<VT, MT> {}

  Object.defineProperty(UnknownMetadata, 'name', {
    value: 'ValBoxUnknownValueUnknownMetadata',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace UnknownMetadata {
    export const UnknownValue = ValBoxUnknownValueUnknownMetadata;
    export type UnknownValue<VT, MT> = ValBoxUnknownValueUnknownMetadata<
      VT,
      MT
    >;
    export const NoValue = ValBoxNoValueUnknownMetadata;
    export type NoValue<MT> = ValBoxNoValueUnknownMetadata<MT>;
    export const WithValue = ValBoxWithValueUnknownMetadata;
    export type WithValue<VT, MT> = ValBoxWithValueUnknownMetadata<VT, MT>;
  }

  export class WithValue<VT, MT> extends ValBoxWithValueUnknownMetadata<
    VT,
    MT
  > {}

  Object.defineProperty(WithValue, 'name', {
    value: 'ValBoxWithValueUnknownMetadata',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace WithValue {
    export const UnknownMetadata = ValBoxWithValueUnknownMetadata;
    export type UnknownMetadata<VT, MT> = ValBoxWithValueUnknownMetadata<
      VT,
      MT
    >;
    export const NoMetadata = ValBoxWithValueNoMetadata;
    export type NoMetadata<VT> = ValBoxWithValueNoMetadata<VT>;
    export const WithMetadata = ValBoxWithValueWithMetadata;
    export type WithMetadata<VT, MT> = ValBoxWithValueWithMetadata<VT, MT>;
  }

  export class WithMetadata<VT, MT> extends ValBoxUnknownValueWithMetadata<
    VT,
    MT
  > {}

  Object.defineProperty(WithValue, 'name', {
    value: 'ValBoxUnknownValueWithMetadata',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace WithMetadata {
    export const UnknownValue = ValBoxUnknownValueWithMetadata;
    export const NoValue = ValBoxNoValueWithMetadata;
    export const WithValue = ValBoxWithValueWithMetadata;
  }

  export class NoValue<MT> extends ValBoxNoValueUnknownMetadata<MT> {}

  Object.defineProperty(NoValue, 'name', {
    value: 'ValBoxNoValueUnknownMetadata',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace NoValue {
    export const UnknownMetadata = ValBoxNoValueUnknownMetadata;
    export type UnknownMetadata<MT> = ValBoxNoValueUnknownMetadata<MT>;
    export const NoMetadata = ValBoxNoValueNoMetadata;
    export type NoMetadata = ValBoxNoValueNoMetadata;
    export const WithMetadata = ValBoxNoValueWithMetadata;
    export type WithMetadata<MT> = ValBoxNoValueWithMetadata<MT>;
  }

  export class NoMetadata<MT> extends ValBoxUnknownValueNoMetadata<MT> {}

  Object.defineProperty(NoMetadata, 'name', {
    value: 'ValBoxUnknownValueNoMetadata',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace NoMetadata {
    export const UnknownValue = ValBoxUnknownValueNoMetadata;
    export type UnknownValue<VT> = ValBoxUnknownValueNoMetadata<VT>;
    export const NoValue = ValBoxNoValueNoMetadata;
    export type NoValue = ValBoxNoValueNoMetadata;
    export const WithValue = ValBoxWithValueNoMetadata;
    export type WithValue<VT> = ValBoxWithValueNoMetadata<VT>;
  }
}
