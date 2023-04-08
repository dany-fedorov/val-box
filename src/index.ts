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

  assertHasValue(): ValBoxV<VT, MT> {
    if (!this.hasValue) {
      throw new ValBoxAssertionError(
        `ValBox#assertHasValue: ValBox "${this.alias}" has no value.`,
      );
    }
    return this as ValBoxV<VT, MT>;
  }

  assertHasMetadata(): ValBoxM<VT, MT> {
    if (!this.hasValue) {
      throw new ValBoxAssertionError(
        `ValBox#assertHasValue: ValBox "${this.alias}" has no metadata.`,
      );
    }
    return this as ValBoxM<VT, MT>;
  }

  assertHasValueAndMetadata(): ValBoxVM<VT, MT> {
    return this.assertHasValue().assertHasMetadata() as ValBoxVM<VT, MT>;
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

export class ValBoxV<VT, MT> extends ValBox<VT, MT> {
  override hasValue: true;
  override value: VT;

  static ANONYMOUS_VAL_V_BOX_ALIAS = '<<Anonymous ValBoxV>>';

  constructor(alias: string = ValBoxV.ANONYMOUS_VAL_V_BOX_ALIAS, value: VT) {
    super(alias);
    this.hasValue = true;
    this.value = value;
  }

  override getValue(): VT {
    return super.getValue() as VT;
  }
}

export class ValBoxM<VT, MT> extends ValBox<VT, MT> {
  override hasMetadata: true;
  override metadata: MT;

  static ANONYMOUS_VAL_M_BOX_ALIAS = '<<Anonymous ValBoxM>>';

  constructor(alias: string = ValBoxM.ANONYMOUS_VAL_M_BOX_ALIAS, metadata: MT) {
    super(alias);
    this.hasMetadata = true;
    this.metadata = metadata;
  }

  override getMetadata(): MT {
    return super.getMetadata() as MT;
  }
}

export class ValBoxVM<VT, MT> extends ValBox<VT, MT> {
  override hasValue: true;
  override value: VT;

  override hasMetadata: true;
  override metadata: MT;

  static ANONYMOUS_VAL_BOX_VM_ALIAS = '<<Anonymous ValBoxVM>>';

  constructor(
    alias: string = ValBoxVM.ANONYMOUS_VAL_BOX_VM_ALIAS,
    value: VT,
    metadata: MT,
  ) {
    super(alias);
    this.hasValue = true;
    this.value = value;
    this.hasMetadata = true;
    this.metadata = metadata;
  }

  override getValue(): VT {
    return super.getValue() as VT;
  }

  override getMetadata(): MT {
    return super.getMetadata() as MT;
  }
}
