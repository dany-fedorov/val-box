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

  assertHasValue(): ValBoxKnownValueUnknownMetadata<VT, MT> {
    if (!this._hasValue) {
      throw new ValBoxAssertionError(
        `${this.constructor.name}#assertHasValue: "${this.alias}" has no value.`,
      );
    }
    return this as unknown as ValBoxKnownValueUnknownMetadata<VT, MT>;
  }

  assertHasMetadata(): ValBoxUnknownValueKnownMetadata<VT, MT> {
    if (!this._hasValue) {
      throw new ValBoxAssertionError(
        `${this.constructor.name}#assertHasMetadata: "${this.alias}" has no metadata.`,
      );
    }
    return this as unknown as ValBoxUnknownValueKnownMetadata<VT, MT>;
  }

  assertHasValueAndMetadata(): ValBoxKnownValueKnownMetadata<VT, MT> {
    return this.assertHasValue().assertHasMetadata() as unknown as ValBoxKnownValueKnownMetadata<
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

export class ValBoxKnownValueUnknownMetadata<
  VT,
  MT,
> extends ValBoxUnknownValueUnknownMetadata<VT, MT> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.KnownValue.UnknownMetadata>>';

  override readonly _hasValue: true;
  override _value: VT;

  constructor(
    value: VT,
    alias: string = ValBoxKnownValueUnknownMetadata.ANONYMOUS_ALIAS,
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

  override assertHasMetadata(): ValBoxKnownValueKnownMetadata<VT, MT> {
    return super.assertHasMetadata() as unknown as ValBoxKnownValueKnownMetadata<
      VT,
      MT
    >;
  }
}

export class ValBoxUnknownValueKnownMetadata<
  VT,
  MT,
> extends ValBoxUnknownValueUnknownMetadata<VT, MT> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.UnknownValue.KnownMetadata>>';

  override readonly _hasMetadata: true;
  override _metadata: MT;

  constructor(
    metadata: MT,
    alias: string = ValBoxUnknownValueKnownMetadata.ANONYMOUS_ALIAS,
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

  override assertHasValue(): ValBoxKnownValueKnownMetadata<VT, MT> {
    return super.assertHasValue() as unknown as ValBoxKnownValueKnownMetadata<
      VT,
      MT
    >;
  }

  override assertHasMetadata(): this {
    return super.assertHasMetadata() as this;
  }
}

export class ValBoxKnownValueKnownMetadata<
  VT,
  MT,
> extends ValBoxUnknownValueUnknownMetadata<VT, MT> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.KnownValue.KnownMetadata>>';

  override readonly _hasValue: true;
  override _value: VT;

  override readonly _hasMetadata: true;
  override _metadata: MT;

  constructor(
    value: VT,
    metadata: MT,
    alias: string = ValBoxKnownValueKnownMetadata.ANONYMOUS_ALIAS,
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

  override assertHasMetadata(): ValBoxNoValueKnownMetadata<MT> {
    return super.assertHasMetadata() as unknown as ValBoxNoValueKnownMetadata<MT>;
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

  override assertHasValue(): ValBoxKnownValueNoMetadata<VT> {
    return super.assertHasValue() as unknown as ValBoxKnownValueNoMetadata<VT>;
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

export class ValBoxKnownValueNoMetadata<
  VT,
> extends ValBoxUnknownValueUnknownMetadata<VT, never> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.KnownValue.NoMetadata>>';

  override readonly _hasValue = true as const;
  override _value: VT;

  override readonly _hasMetadata = false as const;
  override readonly _metadata = undefined;

  constructor(value: VT, alias = ValBoxKnownValueNoMetadata.ANONYMOUS_ALIAS) {
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

export class ValBoxNoValueKnownMetadata<
  MT,
> extends ValBoxUnknownValueUnknownMetadata<never, MT> {
  static override ANONYMOUS_ALIAS =
    '<<Anonymous ValBox.NoValue.KnownMetadata>>';

  override readonly _hasValue = false as const;
  override readonly _value = undefined;
  override readonly _hasMetadata = true as const;
  override _metadata: MT;

  constructor(
    metadata: MT,
    alias = ValBoxNoValueKnownMetadata.ANONYMOUS_ALIAS,
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
  export const Known = ValBoxKnownValueKnownMetadata;

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
    export const NoMetadata = ValBoxUnknownValueNoMetadata;
    export const KnownMetadata = ValBoxUnknownValueKnownMetadata;
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
    export const NoValue = ValBoxNoValueUnknownMetadata;
    export const KnownValue = ValBoxKnownValueUnknownMetadata;
  }

  export class KnownValue<VT, MT> extends ValBoxKnownValueUnknownMetadata<
    VT,
    MT
  > {}

  Object.defineProperty(KnownValue, 'name', {
    value: 'ValBoxKnownValueUnknownMetadata',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace KnownValue {
    export const UnknownMetadata = ValBoxKnownValueUnknownMetadata;
    export const NoMetadata = ValBoxKnownValueNoMetadata;
    export const KnownMetadata = ValBoxKnownValueKnownMetadata;
  }

  export class KnownMetadata<VT, MT> extends ValBoxUnknownValueKnownMetadata<
    VT,
    MT
  > {}

  Object.defineProperty(KnownValue, 'name', {
    value: 'ValBoxUnknownValueKnownMetadata',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace KnownMetadata {
    export const UnknownValue = ValBoxUnknownValueKnownMetadata;
    export const NoValue = ValBoxNoValueKnownMetadata;
    export const KnownValue = ValBoxKnownValueKnownMetadata;
  }

  export class NoValue<MT> extends ValBoxNoValueUnknownMetadata<MT> {}

  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace NoValue {
    export const UnknownMetadata = ValBoxNoValueUnknownMetadata;
    export const NoMetadata = ValBoxNoValueNoMetadata;
    export const KnownMetadata = ValBoxNoValueKnownMetadata;
  }

  Object.defineProperty(NoValue, 'name', {
    value: 'ValBoxNoValueUnknownMetadata',
    writable: false,
    enumerable: false,
    configurable: true,
  });

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
    export const NoValue = ValBoxNoValueNoMetadata;
    export const KnownValue = ValBoxKnownValueNoMetadata;
  }
}
