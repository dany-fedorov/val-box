import { beforeAll, expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import ts = require('typescript');

const packageRoot = resolve(__dirname, '..');
const options: ts.CompilerOptions = {
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  noUncheckedIndexedAccess: true,
  exactOptionalPropertyTypes: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  types: [],
};

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

function diagnostics(path: string) {
  const program = ts.createProgram([path], options);
  return ts.getPreEmitDiagnostics(program);
}

test('emitted declarations preserve all conversion and snapshot refinements', () => {
  const errors = diagnostics(resolve(__dirname, 'types/positive.ts'));

  expect(
    errors.map((error) =>
      ts.flattenDiagnosticMessageText(error.messageText, '\n'),
    ),
  ).toEqual([]);
});

test('emitted declarations reject forbidden presence and snapshot operations', () => {
  const path = resolve(__dirname, 'types/negative.ts');
  const messages = diagnostics(path).map((error) =>
    ts.flattenDiagnosticMessageText(error.messageText, '\n'),
  );

  expect(messages).toHaveLength(6);
  expect(
    messages.filter((message) =>
      message.includes("not assignable to parameter of type 'never'"),
    ),
  ).toHaveLength(4);
  expect(messages.join('\n')).toContain(
    "Property 'value' does not exist on type '{ readonly present: false; }'",
  );
  expect(messages.join('\n')).toContain(
    "Cannot assign to 'alias' because it is a read-only property",
  );
});
