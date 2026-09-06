import { beforeAll, expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const packageRoot = resolve(__dirname, '..');

beforeAll(() => {
  const build = spawnSync('npm', ['run', 'build'], {
    cwd: packageRoot,
    encoding: 'utf8',
  });

  if (build.error) throw build.error;
  if (build.status !== 0) {
    throw new Error(`Package build failed:\n${build.stdout}\n${build.stderr}`);
  }
});

test('Node CommonJS consumes conversions and snapshots from the public entry', () => {
  const script = String.raw`
    const { ValBox } = require('val-box');
    const box = new ValBox.Unknown('source').setValue(42).setMetadata('db');
    const converted = box.convert({ hasValue: true, hasMetadata: false });
    const snapshot = converted.snapshot();
    if (
      converted.getValue() !== 42 ||
      converted.hasMetadata() !== false ||
      snapshot.value.present !== true ||
      snapshot.value.value !== 42 ||
      snapshot.metadata.present !== false ||
      snapshot.alias !== 'source'
    ) process.exitCode = 1;
    else console.log('cjs-ok');
  `;
  const consumer = spawnSync('node', ['--eval', script], {
    cwd: packageRoot,
    encoding: 'utf8',
  });

  if (consumer.error) throw consumer.error;
  expect(consumer.stderr).toBe('');
  expect(consumer.status).toBe(0);
  expect(consumer.stdout.trim()).toBe('cjs-ok');
});

test('Node ESM consumes namespace snapshots with present undefined', () => {
  const script = String.raw`
    import { ValBox } from 'val-box';
    const box = new ValBox.Unknown('source')
      .setValue(undefined)
      .setMetadata(undefined);
    const snapshot = ValBox.snapshot(box);
    if (
      snapshot.value.present !== true ||
      snapshot.value.value !== undefined ||
      snapshot.metadata.present !== true ||
      snapshot.metadata.value !== undefined ||
      snapshot.alias !== 'source'
    ) process.exitCode = 1;
    else console.log('esm-ok');
  `;
  const consumer = spawnSync(
    'node',
    ['--input-type=module', '--eval', script],
    { cwd: packageRoot, encoding: 'utf8' },
  );

  if (consumer.error) throw consumer.error;
  expect(consumer.stderr).toBe('');
  expect(consumer.status).toBe(0);
  expect(consumer.stdout.trim()).toBe('esm-ok');
});
