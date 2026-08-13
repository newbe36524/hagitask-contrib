/**
 * Fixture-oriented tests for the contrib package validator.
 *
 * Each scenario builds a throwaway repository root. Packages are placed under
 * `data/<taskId>/` (the only discovery root), and the authoritative
 * task-preset-plugin schemas are copied from the nested HagiTask source into
 * `hagitask/schemas/task-preset-plugin/`. The validator resolves `$schema`
 * references from that nested directory only.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  cpSync,
  existsSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { validateContribPackages as validateCommunityPackages } from '../scripts/validate-contrib-packages.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Authoritative schema source: prefer the initialized nested submodule, then
// fall back to the sibling HagiTask repository in the monorepo.
const HAGITASK_SCHEMAS = existsSync(join(repoRoot, 'hagitask', 'schemas'))
  ? join(repoRoot, 'hagitask', 'schemas')
  : join(repoRoot, '..', 'hagitask', 'schemas');

const DATA_DIR = 'data';
const SCHEMA_REL = 'hagitask/schemas/task-preset-plugin';

let root;

before(() => {
  root = mkdtempSync(join(tmpdir(), 'comm-val-'));
  cpSync(HAGITASK_SCHEMAS, join(root, 'hagitask', 'schemas'), { recursive: true });
});

after(() => rmSync(root, { recursive: true, force: true }));

/**
 * Write a package. By default it is discovered under `data/<dirName>/`; pass
 * `{ root: true }` to place it at the repository root (which must be ignored).
 */
function writePackage(dirName, files, opts = {}, targetRoot = root) {
  const base = opts.root ? targetRoot : join(targetRoot, DATA_DIR);
  const dir = join(base, dirName);
  mkdirSync(dir, { recursive: true });
  for (const [rel, content] of Object.entries(files)) {
    const f = join(dir, rel);
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, content);
  }
}

function manifest(id, overrides = {}) {
  return JSON.stringify(
    {
      $schema: '../../hagitask/schemas/task-preset-plugin/manifest.schema.json',
      schemaVersion: '1.0',
      taskPresetId: id,
      version: '1.0.0',
      icon: 'star',
      displayName: { key: 'taskPreset.displayName' },
      description: { key: 'taskPreset.description' },
      kind: 'custom-executor',
      status: 'experimental',
      owner: 'Test',
      entrypoints: { menuSurface: 'session-create', drawerId: id },
      activation: { defaultState: 'passive' },
      localization: {
        strategy: 'plugin-bundles',
        namespace: id,
        defaultLocale: 'en-US',
        supportedLocales: ['en-US', 'zh-CN'],
        bundles: { 'en-US': './locales/en-US.json', 'zh-CN': './locales/zh-CN.json' },
      },
      capabilities: { supportsSceneBinding: false, supportsCommandCatalog: false },
      ui: { panel: './frontend/panel.json' },
      site: { storePage: './store-page/' },
      backend: {
        taskPreset: './backend/task-preset.json',
        prompts: './backend/prompts.json',
      },
      ...overrides,
    },
    null,
    2,
  );
}

function taskPreset() {
  return JSON.stringify(
    {
      $schema: '../../../hagitask/schemas/task-preset-plugin/task-preset.schema.json',
      taskKey: 'test',
      scriptKey: 'autotask.test',
      defaultTargetType: 'repository',
      requirements: [{ type: 'agent', name: 'any' }],
      targets: {
        repositories: {
          enabled: true,
          selections: [
            {
              id: 'targetRepositories',
              selectionMode: 'multiple',
              allowedAccessTypes: ['read', 'write'],
              output: 'targetRepositories',
              scope: { source: 'owner-project-repositories' },
            },
          ],
        },
        vaults: { enabled: false },
        projects: { enabled: false },
      },
      inputBindings: [
        { input: 'scope', promptParameter: 'scope', metadataKey: 'autoTaskScope', required: true },
      ],
    },
    null,
    2,
  );
}

function taskPresetWithSource(source) {
  return taskPreset().replace('"owner-project-repositories"', JSON.stringify(source));
}

function prompts() {
  return JSON.stringify(
    {
      $schema: '../../../hagitask/schemas/task-preset-plugin/prompt-package.schema.json',
      version: '1.0.0',
      templateEngine: 'handlebars',
      defaultLocale: 'en-US',
      supportedLocales: ['en-US', 'zh-CN'],
      inputs: [{ name: 'scope', source: 'task-preset-input', required: true }],
      rendering: { strictVariables: false, trimBlocks: true },
      locales: {
        'en-US': {
          systemTemplate: './templates/en-US/system.md',
          userTemplate: './templates/en-US/user.hbs',
        },
        'zh-CN': {
          systemTemplate: './templates/zh-CN/system.md',
          userTemplate: './templates/zh-CN/user.hbs',
        },
      },
    },
    null,
    2,
  );
}

function panel() {
  return JSON.stringify(
    {
      $schema: '../../../hagitask/schemas/task-preset-plugin/panel.schema.json',
      surface: 'drawer',
      title: { key: 'panel.title' },
      description: { key: 'panel.description' },
      defaultTitle: { key: 'panel.defaultTitle' },
      submitLabel: { key: 'panel.submit' },
      sections: [
        {
          id: 'main',
          layout: 'stack',
          fields: [
            {
              id: 'scope',
              renderer: 'text',
              output: 'scope',
              inputType: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    null,
    2,
  );
}

function locales(loc) {
  return JSON.stringify({
    $schema: '../../../hagitask/schemas/task-preset-plugin/locales.schema.json',
    taskPreset: {
      displayName: `Test ${loc}`,
      description: `Test description ${loc}`,
    },
  });
}

function storePage(id, loc, title, langTag) {
  return `---
locale: ${loc}
slug: ${id}
title: ${title}
summary: A test preset for validation.
status: experimental
catalog:
  - test
tags:
  - sample
---

Body content for ${langTag}.
`;
}

function validPackageFiles(id) {
  return {
    'manifest.json': manifest(id),
    'backend/task-preset.json': taskPreset(),
    'backend/prompts.json': prompts(),
    'frontend/panel.json': panel(),
    'locales/en-US.json': locales('en-US'),
    'locales/zh-CN.json': locales('zh-CN'),
    'backend/templates/en-US/system.md': '# system',
    'backend/templates/en-US/user.hbs': '{{scope}}',
    'backend/templates/zh-CN/system.md': '# system',
    'backend/templates/zh-CN/user.hbs': '{{scope}}',
    'store-page/index.en-US.md': storePage(id, 'en-US', 'Test', 'en'),
    'store-page/index.zh-CN.md': storePage(id, 'zh-CN', '测试', 'zh'),
  };
}

test('valid package passes with no errors', () => {
  writePackage('good-pkg', validPackageFiles('good-pkg'));
  const { packages, errors } = validateCommunityPackages(root);
  assert.ok(errors.length === 0, `expected no errors, got:\n${errors.map((e) => e.message).join('\n')}`);
  assert.ok(packages.includes('data/good-pkg'));
});

for (const source of ['owner-project-repositories', 'vault-registry', 'project-registry']) {
  test(`valid package accepts ${source} target scope source`, () => {
    const id = `scope-${source.replaceAll('-', '')}`;
    const files = validPackageFiles(id);
    files['backend/task-preset.json'] = taskPresetWithSource(source);
    writePackage(id, files);
    const { errors } = validateCommunityPackages(root);
    assert.deepEqual(
      errors.filter((error) => error.packageId === `data/${id}`),
      [],
    );
  });
}

test('unknown target scope source is reported with selection details', () => {
  const id = 'unknown-scope';
  const files = validPackageFiles(id);
  files['backend/task-preset.json'] = taskPresetWithSource('unknown-registry');
  writePackage(id, files);
  const { errors } = validateCommunityPackages(root);
  const hit = errors.find(
    (error) =>
      error.packageId === `data/${id}`
      && error.file.endsWith('/backend/task-preset.json')
      && error.field.includes('targetRepositories')
      && error.message.includes('unknown-registry'),
  );
  assert.ok(hit, 'expected an unsupported target scope source error');
});

test('invalid JSON is reported as a parse failure', () => {
  writePackage('bad-json', {
    'manifest.json': '{ this is not valid json',
  });
  const { errors } = validateCommunityPackages(root);
  const hit = errors.find((e) => e.packageId === 'data/bad-json' && e.field === 'parse');
  assert.ok(hit, 'expected a parse error for invalid JSON');
});

test('unresolved schema reference is reported', () => {
  const files = validPackageFiles('unresolved');
  files['manifest.json'] = JSON.stringify({
    $schema: '../../hagitask/schemas/task-preset-plugin/does-not-exist.schema.json',
    taskPresetId: 'unresolved',
    version: '1.0.0',
  });
  writePackage('unresolved', files);
  const { errors } = validateCommunityPackages(root);
  const hit = errors.find(
    (e) => e.packageId === 'data/unresolved' && e.message.includes('unresolved schema reference'),
  );
  assert.ok(hit, 'expected unresolved schema reference error');
});

test('root-level directory is NOT discovered as a package', () => {
  // A manifest at the repository root (not under data/) must be ignored.
  writePackage('root-only', validPackageFiles('root-only'), { root: true });
  const { packages, errors } = validateCommunityPackages(root);
  assert.ok(!packages.includes('data/root-only'), 'root-level dir must not appear in discovered packages');
  assert.ok(!packages.includes('root-only'), 'root-level dir must not appear in discovered packages');
  assert.ok(
    !errors.some((e) => e.packageId === 'root-only' || e.packageId === 'data/root-only'),
    'no errors should reference the root-level directory',
  );
});

test('duplicate canonical ids are detected', () => {
  writePackage('dup-a', validPackageFiles('dup-id'));
  writePackage('dup-b', validPackageFiles('dup-id'));
  const { errors } = validateCommunityPackages(root);
  const hit = errors.find(
    (e) => e.field === 'taskPresetId' && e.message.includes('duplicate canonical id'),
  );
  assert.ok(hit, 'expected duplicate canonical id error');
});

test('path traversal is rejected', () => {
  const files = validPackageFiles('traversal');
  files['manifest.json'] = manifest('traversal', { ui: { panel: '../escape.json' } });
  writePackage('traversal', files);
  const { errors } = validateCommunityPackages(root);
  const hit = errors.find((e) => e.message.includes('path escapes package directory'));
  assert.ok(hit, 'expected path traversal error');
});

test('missing declared resource is an explicit failure', () => {
  // Declare a panel path but do not create the file.
  const files = validPackageFiles('missing');
  delete files['frontend/panel.json'];
  writePackage('missing', files);
  const { errors } = validateCommunityPackages(root);
  const hit = errors.find(
    (e) => e.packageId === 'data/missing' && e.message.includes('missing declared file'),
  );
  assert.ok(hit, 'expected missing declared file error');
});

test('missing prompt template is an explicit failure', () => {
  const files = validPackageFiles('missing-tpl');
  delete files['backend/templates/en-US/system.md'];
  writePackage('missing-tpl', files);
  const { errors } = validateCommunityPackages(root);
  const hit = errors.find(
    (e) => e.packageId === 'data/missing-tpl' && e.message.includes('prompt template file not found'),
  );
  assert.ok(hit, 'expected missing prompt template error');
});

test('inconsistent localization: store page slug must equal taskId', () => {
  const files = validPackageFiles('wrong-slug');
  files['store-page/index.en-US.md'] = storePage('different-id', 'en-US', 'Test', 'en');
  writePackage('wrong-slug', files);
  const { errors } = validateCommunityPackages(root);
  const hit = errors.find(
    (e) => e.packageId === 'data/wrong-slug' && e.field === 'slug' && e.message.includes('must equal taskId'),
  );
  assert.ok(hit, 'expected slug mismatch error');
});

test('inconsistent localization: missing store page for supported locale', () => {
  const files = validPackageFiles('missing-locale');
  delete files['store-page/index.zh-CN.md'];
  writePackage('missing-locale', files);
  const { errors } = validateCommunityPackages(root);
  const hit = errors.find(
    (e) => e.packageId === 'data/missing-locale' && e.message.includes('missing store page for supported locale'),
  );
  assert.ok(hit, 'expected missing store page error');
});

test('schema violation is reported with field location', () => {
  // manifest with an invalid kind value (not in enum).
  const files = validPackageFiles('schema-violation');
  const m = JSON.parse(files['manifest.json']);
  m.kind = 'not-a-kind';
  files['manifest.json'] = JSON.stringify(m, null, 2);
  writePackage('schema-violation', files);
  const { errors } = validateCommunityPackages(root);
  const hit = errors.find(
    (e) => e.packageId === 'data/schema-violation' && e.field.includes('schema:manifest.schema.json'),
  );
  assert.ok(hit, `expected schema violation error, got:\n${errors.map((e) => e.message).join('\n')}`);
});

test('missing nested schema root makes every reference unresolved', () => {
  // A repository root with data/ packages but no hagitask/schemas must fail.
  const isolated = mkdtempSync(join(tmpdir(), 'comm-val-noschema-'));
  try {
    writePackage('orphan', validPackageFiles('orphan'), {}, isolated);
    const { packages, errors } = validateCommunityPackages(isolated);
    assert.ok(packages.includes('data/orphan'), 'package under data/ should still be discovered');
    const hit = errors.find((e) => e.message.includes('unresolved schema reference'));
    assert.ok(hit, 'expected unresolved schema reference when nested schema root is absent');
  } finally {
    rmSync(isolated, { recursive: true, force: true });
  }
});

// Keep an explicit reference to the canonical schema source path for clarity.
assert.ok(SCHEMA_REL === 'hagitask/schemas/task-preset-plugin');

test('discovers contrib tasks under data/ and nothing at the repo root', () => {
  const { packages } = validateCommunityPackages(repoRoot);
  const expected = ['data/add-community-task', 'data/hagicode-monospecs-operations'];
  for (const id of expected) {
    assert.ok(packages.includes(id), `expected canonical task ${id} to be discovered`);
  }
  assert.equal(packages.length, expected.length, 'exactly the canonical packages are discovered');
  assert.ok(
    !packages.some((p) => !p.startsWith('data/')),
    'no package is discovered at the repository root (data/ is the only entry point)',
  );
});

test('authoritative schemas resolve from the hagitask nested submodule, with no duplicated root schema tree', () => {
  const nestedSchemaDir = join(repoRoot, 'hagitask', 'schemas', 'task-preset-plugin');
  assert.ok(
    existsSync(join(nestedSchemaDir, 'manifest.schema.json')),
    'authoritative schema must live under the hagitask nested submodule',
  );
  assert.ok(
    !existsSync(join(repoRoot, 'schemas')),
    'the duplicated root-level schemas/ tree must be removed',
  );
});

test('add-community-task uses one unified brief across panel, bindings, prompts, and templates', () => {
  const packageRoot = join(repoRoot, 'data', 'add-community-task');
  const panel = JSON.parse(readFileSync(join(packageRoot, 'frontend/panel.json'), 'utf8'));
  const preset = JSON.parse(readFileSync(join(packageRoot, 'backend/task-preset.json'), 'utf8'));
  const prompts = JSON.parse(readFileSync(join(packageRoot, 'backend/prompts.json'), 'utf8'));
  const panelText = readFileSync(join(packageRoot, 'frontend/panel.json'), 'utf8');
  const templateText = [
    readFileSync(join(packageRoot, 'backend/templates/en-US/user.hbs'), 'utf8'),
    readFileSync(join(packageRoot, 'backend/templates/zh-CN/user.hbs'), 'utf8'),
  ].join('\n');
  const oldFields = [
    'communityTaskObjective',
    'communityTaskInputs',
    'communityTaskQuality',
    'communityTaskAcceptance',
    'communityTaskPublication',
  ];
  const outputs = panel.sections.flatMap((section) => section.fields.map((field) => field.output));
  const bindings = preset.inputBindings.map((binding) => binding.input);
  const promptInputs = prompts.inputs.map((input) => input.name);

  assert.ok(outputs.includes('communityTaskBrief'));
  assert.equal(outputs.filter((output) => output === 'communityTaskBrief').length, 1);
  assert.ok(bindings.includes('communityTaskBrief'));
  assert.ok(promptInputs.includes('communityTaskBrief'));
  assert.ok(templateText.includes('{{{communityTaskBrief}}}'));
  for (const oldField of oldFields) {
    assert.equal(outputs.includes(oldField), false, `${oldField} must not be a panel output`);
    assert.equal(bindings.includes(oldField), false, `${oldField} must not be a preset binding`);
    assert.equal(promptInputs.includes(oldField), false, `${oldField} must not be a prompt input`);
    assert.equal(panelText.includes(oldField), false, `${oldField} must not be declared in the panel`);
  }
});