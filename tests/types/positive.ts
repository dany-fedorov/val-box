import { Presence, ValBox, ValBoxSnapshot } from '../../dist';

const original = new ValBox.Unknown<number, string>('source')
  .setValue(42)
  .setMetadata('db');

const uu = original.convert({ hasValue: undefined, hasMetadata: undefined });
const uuValue: number | undefined = uu.getValue();
const uuMetadata: string | undefined = uu.getMetadata();

const ut = original.convert({ hasValue: undefined, hasMetadata: true });
const utValue: number | undefined = ut.getValue();
const utMetadata: string = ut.getMetadata();

const uf = original.convert({ hasValue: undefined, hasMetadata: false });
const ufValue: number | undefined = uf.getValue();
const ufMetadata: undefined = uf.getMetadata();

const tu = original.convert({ hasValue: true, hasMetadata: undefined });
const tuValue: number = tu.getValue();
const tuMetadata: string | undefined = tu.getMetadata();

const tt = original.convert({ hasValue: true, hasMetadata: true });
const ttValue: number = tt.getValue();
const ttMetadata: string = tt.getMetadata();

const tf = original.convert({ hasValue: true, hasMetadata: false });
const tfValue: number = tf.getValue();
const tfMetadata: undefined = tf.getMetadata();

const fu = original.convert({ hasValue: false, hasMetadata: undefined });
const fuValue: undefined = fu.getValue();
const fuMetadata: string | undefined = fu.getMetadata();

const ft = original.convert({ hasValue: false, hasMetadata: true });
const ftValue: undefined = ft.getValue();
const ftMetadata: string = ft.getMetadata();

const ff = original.convert({ hasValue: false, hasMetadata: false });
const ffValue: undefined = ff.getValue();
const ffMetadata: undefined = ff.getMetadata();

const widened: boolean = Math.random() > 0.5;
const widenedValue:
  | ValBox.WithValue.WithMetadata<number, string>
  | ValBox.NoValue.WithMetadata<string> = original.convert({
  hasValue: widened,
  hasMetadata: true,
});
const widenedValueResult: number | undefined = widenedValue.getValue();
const widenedMetadataResult: string = widenedValue.getMetadata();

const widenedBoth = original.convert({
  hasValue: widened,
  hasMetadata: widened,
});
const widenedBothValue: number | undefined = widenedBoth.getValue();
const widenedBothMetadata: string | undefined = widenedBoth.getMetadata();

const unionOptions:
  | { hasValue: true; hasMetadata: false }
  | { hasValue: false; hasMetadata: true } = widened
  ? { hasValue: true, hasMetadata: false }
  : { hasValue: false, hasMetadata: true };
const unionResult = original.convert(unionOptions);
const unionValue: number | undefined = unionResult.getValue();
const unionMetadata: string | undefined = unionResult.getMetadata();

const snapshot: ValBoxSnapshot<number, string> = tt.snapshot();
const structuralSnapshot: ValBoxSnapshot<number, string> = ValBox.snapshot(tt);
if (snapshot.value.present) {
  const value: number = snapshot.value.value;
  void value;
}
if (structuralSnapshot.metadata.present) {
  const metadata: string = structuralSnapshot.metadata.value;
  void metadata;
}
const absent: Presence<number> = { present: false };

void uuValue;
void uuMetadata;
void utValue;
void utMetadata;
void ufValue;
void ufMetadata;
void tuValue;
void tuMetadata;
void ttValue;
void ttMetadata;
void tfValue;
void tfMetadata;
void fuValue;
void fuMetadata;
void ftValue;
void ftMetadata;
void ffValue;
void ffMetadata;
void widenedValueResult;
void widenedMetadataResult;
void widenedBothValue;
void widenedBothMetadata;
void unionValue;
void unionMetadata;
void absent;
