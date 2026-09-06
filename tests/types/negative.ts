import { Presence, ValBox } from '../../dist';

const original = new ValBox.Unknown<number, string>()
  .setValue(42)
  .setMetadata('db');

const noValue = original.convert({ hasValue: false });
noValue.setValue(1);

const noMetadata = original.convert({ hasMetadata: false });
noMetadata.setMetadata('db');

const neither = original.convert({ hasValue: false, hasMetadata: false });
neither.setValue(1);
neither.setMetadata('db');

const absent: Presence<number> = { present: false };
absent.value;

const snapshot = original.snapshot();
snapshot.alias = 'changed';
