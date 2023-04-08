export class ValBoxAssertionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ValBox<VT, MT> {
  static ANONYMOUS_VAL_BOX_ALIAS = '<<Anonymous ValBox>>';

  alias: string;
  hasValue = false;
  value: VT | undefined = undefined;
  hasMetadata = false;
  metadata: MT | undefined = undefined;

  static new<VT, MT>(alias?: string): ValBox<VT, MT> {
    return new ValBox<VT, MT>(alias);
  }

  constructor(alias: string = ValBox.ANONYMOUS_VAL_BOX_ALIAS) {
    this.alias = alias;
  }

  assertHasValue(): this & { value: VT; hasValue: true; getValue(): VT } {
    if (!this.hasValue) {
      throw new ValBoxAssertionError(
        `ValBox#assertHasValue: ValBox "${this.alias}" has no value.`,
      );
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return this;
  }

  setValue(value: VT): this {
    this.value = value;
    this.hasValue = true;
    return this;
  }

  getValue(): VT | undefined {
    return this.value;
  }

  delValue(): this {
    this.value = undefined;
    this.hasValue = false;
    return this;
  }

  setMetadata(metadata: MT): this {
    this.metadata = metadata;
    this.hasMetadata = true;
    return this;
  }

  getMetadata(): MT | undefined {
    return this.metadata;
  }

  delMetadata(): this {
    this.metadata = undefined;
    this.hasMetadata = false;
    return this;
  }
}
