import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const repoRoot = resolve(import.meta.dirname, '..');
const cli = resolve(repoRoot, 'node_modules/@hagicode/hagitask/dist/cli.js');
const agentsPackage = join(repoRoot, 'data', 'agents-md-update');

function readPackageFile(path) {
  return readFileSync(join(agentsPackage, path), 'utf8');
}

function readPackageJson(path) {
  return JSON.parse(readPackageFile(path));
}

function runValidation(target) {
  return spawnSync(process.execPath, [cli, 'validate', target], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

test('published CLI validates the repository packages and reports the package set', () => {
  const result = runValidation(repoRoot);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Packages discovered: \d+/);
  assert.match(result.stdout, /data\/[a-z0-9-]+/);
});

test('published CLI reports package and field diagnostics for invalid manifests', () => {
  const tempRoot = mkdtempSync(join(tmpdir(), 'hagitask-contrib-cli-'));
  try {
    cpSync(join(repoRoot, 'data'), join(tempRoot, 'data'), { recursive: true });
    const manifestPath = join(tempRoot, 'data', 'hagitask-contrib-maintenance', 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    delete manifest.taskPresetId;
    writeFileSync(manifestPath, JSON.stringify(manifest));

    const result = runValidation(tempRoot);
    assert.equal(result.status, 1);
    assert.match(`${result.stdout}${result.stderr}`, /hagitask-contrib-maintenance/);
    assert.match(`${result.stdout}${result.stderr}`, /taskPresetId/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('agents-md-update only binds AGENTS.md targets in both locales', () => {
  const manifest = readPackageJson('manifest.json');
  const prompts = readPackageJson('backend/prompts.json');
  const panel = readPackageJson('frontend/panel.json');
  const preset = readPackageJson('backend/task-preset.json');

  assert.equal(manifest.version, '2.0.0');
  assert.equal(prompts.version, manifest.version);
  assert.equal(manifest.schemaVersion, '1.0');
  assert.deepEqual(panel.sections.flatMap(({ fields }) => fields.map(({ id }) => id))
    .filter((id) => id === 'projectId' || id === 'repositoryScope'), ['projectId', 'repositoryScope']);
  assert.ok(!panel.sections.some(({ fields }) => fields.some(({ id }) => id === 'includeClaudeMd')));
  assert.ok(!preset.inputBindings.some(({ input, promptParameter, metadataKey }) =>
    input === 'includeClaudeMd' || promptParameter === 'includeClaudeMd' || metadataKey === 'autoTaskIncludeClaudeMd'));
  assert.ok(!prompts.inputs.some(({ name }) => name === 'includeClaudeMd'));

  for (const locale of manifest.localization.supportedLocales) {
    const exclusion = locale === 'en-US'
      ? /do not read, create, or modify [`]?CLAUDE\.md/i
      : /不得读取、创建或修改 [`]?CLAUDE\.md/;
    const bundle = readPackageJson(`locales/${locale}.json`);
    assert.ok(!Object.keys(bundle.panel).some((key) => key.startsWith('includeClaudeMd')));
    const { systemTemplate, userTemplate } = prompts.locales[locale];
    const system = readPackageFile(`backend/${systemTemplate.replace('./', '')}`);
    const user = readPackageFile(`backend/${userTemplate.replace('./', '')}`);
    assert.match(user, /{{#if targetRepositories}}[\s\S]*{{#each targetRepositories}}[\s\S]*AGENTS\.md[\s\S]*{{else}}[\s\S]*{{projectPath}}\/AGENTS\.md/);
    assert.doesNotMatch(user, /includeClaudeMd|\/CLAUDE\.md/);
    for (const text of [system, user]) {
      assert.match(text, /AGENTS\.md/);
      assert.match(text, exclusion);
      assert.doesNotMatch(text, /includeClaudeMd/);
    }
    for (const command of Object.values(prompts.commandSystemPrompts)) {
      const text = readPackageFile(`backend/${command[locale].replace('./', '')}`);
      assert.match(text, /AGENTS\.md/);
      assert.match(text, exclusion);
      assert.doesNotMatch(text, /includeClaudeMd/);
    }
    assert.doesNotMatch(JSON.stringify(bundle), /includeClaudeMd|redirect|重定向/);
    assert.doesNotMatch(readPackageFile(`store-page/index.${locale}.md`), /includeClaudeMd|redirect|重定向/);
  }
});
