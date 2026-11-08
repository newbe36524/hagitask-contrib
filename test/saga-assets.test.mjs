import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, parseBlock, sha256 } from '../scripts/sync-saga-assets.mjs';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'saga');
const read = (...p) => readFileSync(join(pkg, ...p), 'utf8');
const create = (locale) => read('backend', 'templates', locale, 'commands', 'create.md');
const EXPECTED = [
  'tools/saga.mjs', 'prompts/goal.md', 'prompts/research.md', 'prompts/acceptance.md', 'prompts/plan.md', 'prompts/amend.md',
  'prompts/run.md', '.gitignore',
];

test('every embedded saga asset matches the sha256 it declares', () => {
  for (const locale of LOCALES) {
    const assets = parseBlock(create(locale));
    assert.deepEqual(assets.map((a) => a.path), EXPECTED, `${locale}: unexpected asset list`);
    for (const a of assets) assert.equal(sha256(a.content), a.sha, `${locale}: ${a.path} does not match its declared sha256`);
  }
});

test('both locales embed identical assets', () => {
  const [a, b] = LOCALES.map((l) => JSON.stringify(parseBlock(create(l))));
  assert.equal(a, b);
});

test('no embedded asset can be mangled by the template engine', () => {
  for (const a of parseBlock(create('en-US'))) {
    assert.ok(!a.content.includes('{{'), `${a.path} contains "{{"`);
    assert.ok(a.content.endsWith('\n') && !a.content.endsWith('\n\n'), `${a.path} must end with exactly one newline`);
  }
});

test('the embedded saga.mjs is the tool and the saga does not depend on OpenSpec', () => {
  const assets = Object.fromEntries(parseBlock(create('en-US')).map((a) => [a.path, a.content]));
  assert.match(assets['tools/saga.mjs'], /function freeze\(/);
  assert.equal(assets['.gitignore'], '*/runtime/\n');
  for (const l of LOCALES) {
    for (const f of ['system.md', 'user.hbs', 'commands/run.md']) assert.doesNotMatch(read('backend', 'templates', l, ...f.split('/')), /openspec/i, `${l}/${f} mentions OpenSpec`);
    const text = read('backend', 'templates', l, 'commands', 'create.md');
    assert.doesNotMatch(text.slice(0, text.indexOf('<!-- saga-assets:begin -->')), /openspec/i, `${l} create.md mentions OpenSpec`);
  }
  const req = JSON.parse(read('backend', 'task-preset.json')).requirements.filter((r) => r.type === 'cli').map((r) => r.name);
  assert.ok(!req.includes('openspec'), 'the preset must not require the openspec CLI');
  assert.deepEqual(req, ['node'], 'the only command the host needs is node');
});

test('create and run line up across the command list, the prompt map and the input bindings', () => {
  const commands = JSON.parse(read('frontend', 'commands.json')).commands.map((c) => c.id).sort();
  const prompts = JSON.parse(read('backend', 'prompts.json'));
  assert.deepEqual(commands, ['create', 'run']);
  assert.deepEqual(Object.keys(prompts.commandSystemPrompts).sort(), commands);
  for (const c of commands) for (const l of LOCALES) assert.match(read('backend', 'templates', l, 'commands', `${c}.md`), new RegExp(`^## (Command|命令)[:：]\\s*${c}$`, 'm'));
  const bound = JSON.parse(read('backend', 'task-preset.json')).inputBindings.map((b) => b.input);
  const declared = prompts.inputs.filter((i) => i.source === 'task-preset-input').map((i) => i.name);
  for (const n of bound) assert.ok(declared.includes(n), `binding ${n} is not a declared prompt input`);
});

test('both locales keep the run command in step with the contract rules', () => {
  for (const l of LOCALES) {
    const run = read('backend', 'templates', l, 'commands', 'run.md');
    for (const must of ['instructions <sagaId> run', '.hagicode/sagas', 'hagi chat create', '--executor-type ClaudeCodeCli', l === 'en-US' ? 'standard input' : '标准输入'])
      assert.ok(run.includes(must), `${l} run.md is missing "${must}"`);
  }
});

test('no prompt template or asset writes True or False, which the backend renderer lowercases', () => {
  for (const l of LOCALES) {
    for (const f of ['system.md', 'user.hbs', 'commands/create.md', 'commands/run.md']) {
      const text = read('backend', 'templates', l, ...f.split('/'));
      assert.doesNotMatch(text, /\b(True|False)\b/, `${l}/${f} contains True or False`);
    }
  }
});
