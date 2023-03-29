export class ValBox<VT, MT> {
  static ANONYMOUS_VAL_BOX_ALIAS = '<<Anonymous ValBox>>';

  alias: string;
  hasValue = false;
  value: VT | null = null;
  hasMetadata = false;
  metadata: MT | null = null;

  static new<VT, MT>(alias?: string): ValBox<VT, MT> {
    return new ValBox<VT, MT>(alias);
  }

  constructor(alias: string = ValBox.ANONYMOUS_VAL_BOX_ALIAS) {
    this.alias = alias;
  }

  setValue(value: VT): this {
    this.value = value;
    this.hasValue = true;
    return this;
  }

  getValue(): VT | null {
    return this.value;
  }

  delValue(): this {
    this.value = null;
    this.hasValue = false;
    return this;
  }

  setMetadata(metadata: MT): this {
    this.metadata = metadata;
    this.hasMetadata = true;
    return this;
  }

  getMetadata(): MT | null {
    return this.metadata;
  }

  delMetadata(): this {
    this.metadata = null;
    this.hasMetadata = false;
    return this;
  }
}
