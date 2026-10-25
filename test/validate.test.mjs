import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

test('codegraph-tasks exposes only the six supported commands in both locales', () => {
  const packageRoot = join(repoRoot, 'data', 'codegraph-tasks');
  const readJson = (path) => JSON.parse(readFileSync(join(packageRoot, path), 'utf8'));
  const commands = readJson('frontend/commands.json').commands;
  const prompts = readJson('backend/prompts.json');
  const expected = ['init', 'status', 'sync', 'upgrade', 'uninit', 'explore'];

  assert.deepEqual(commands.map(({ id }) => id), expected);
  assert.deepEqual(Object.keys(prompts.commandSystemPrompts), expected);
  for (const locale of ['en-US', 'zh-CN']) {
    const bundle = readJson(`locales/${locale}.json`);
    for (const command of commands) {
      assert.ok(bundle.commands[command.description.key.split('.')[1]]);
      assert.ok(readFileSync(join(packageRoot, 'backend', prompts.commandSystemPrompts[command.id][locale]), 'utf8'));
    }
    const system = readFileSync(join(packageRoot, `backend/templates/${locale}/system.md`), 'utf8');
    assert.match(system, /six catalog commands|六个命令/);
    assert.doesNotMatch(system, /`install`|`uninstall`|`ui`/);
  }
});

test('codegraph-tasks binds explicit repository scope to both localized prompts', () => {
  const packageRoot = join(repoRoot, 'data', 'codegraph-tasks');
  const readJson = (path) => JSON.parse(readFileSync(join(packageRoot, path), 'utf8'));
  const panel = readJson('frontend/panel.json');
  const preset = readJson('backend/task-preset.json');
  const prompts = readJson('backend/prompts.json');
  const fields = panel.sections.flatMap(({ fields }) => fields);
  const scope = fields.find(({ id }) => id === 'targetMode');

  assert.equal(scope.renderer, 'radio-group');
  assert.equal(scope.required, true);
  assert.deepEqual(scope.componentProps.options.map(({ value }) => value), ['all', 'specific']);
  assert.ok(fields.some(({ id }) => id === 'targetRepositories'));
  assert.ok(preset.inputBindings.some(({ input, promptParameter, required }) =>
    input === 'targetMode' && promptParameter === 'targetMode' && required));
  assert.ok(prompts.inputs.some(({ name, required }) => name === 'targetMode' && required));

  for (const locale of ['en-US', 'zh-CN']) {
    const bundle = readJson(`locales/${locale}.json`);
    for (const option of scope.componentProps.options) {
      assert.ok(bundle.panel[option.label.key.split('.')[1]]);
    }
    const user = readFileSync(join(packageRoot, `backend/templates/${locale}/user.hbs`), 'utf8');
    const system = readFileSync(join(packageRoot, `backend/templates/${locale}/system.md`), 'utf8');
    assert.match(user, /{{targetMode}}/);
    assert.match(user, /{{targetScopeMarkdown}}/);
    assert.match(system, /`all`/);
    assert.match(system, /`specific`/);
    assert.match(system, /ignore|忽略/);
    assert.match(system, /exactly one|仅找到一个/);
  }
});

const outputFormatContract = {
  'en-US': {
    heading: '## Output format',
    headings: ['## Conclusion', '## Assumptions (if any)', '## Next step'],
  },
  'zh-CN': {
    heading: '## 输出格式',
    headings: ['## 结论', '## 假设（如有）', '## 下一步'],
  },
};

// Packages whose reply is not meant to follow the three-section shape. Each entry needs a reason string.
const outputFormatExemptions = {};

function packageIds() {
  return readdirSync(join(repoRoot, 'data'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function readUserTemplate(packageId, locale) {
  return readFileSync(join(repoRoot, 'data', packageId, 'backend', 'templates', locale, 'user.hbs'), 'utf8');
}

function outputFormatSection(text, heading) {
  const lines = text.split('\n');
  const start = lines.indexOf(heading);
  if (start === -1) return null;
  const next = lines.findIndex((line, index) => index > start && line.startsWith('## '));
  return lines.slice(start, next === -1 ? lines.length : next).join('\n');
}

test('output-format exemptions name existing packages and each carries a reason', () => {
  const ids = new Set(packageIds());
  for (const [id, reason] of Object.entries(outputFormatExemptions)) {
    assert.ok(ids.has(id), `output-format exemption ${id} does not match a package`);
    assert.equal(typeof reason, 'string', `output-format exemption ${id} needs a reason string`);
    assert.ok(reason.trim().length > 0, `output-format exemption ${id} needs a non-empty reason`);
  }
});

test('every non-exempt user template carries the output-format block with its headings in order', () => {
  for (const id of packageIds()) {
    if (Object.hasOwn(outputFormatExemptions, id)) continue;
    for (const [locale, { heading, headings }] of Object.entries(outputFormatContract)) {
      const section = outputFormatSection(readUserTemplate(id, locale), heading);
      assert.notEqual(section, null, `${id} ${locale} user.hbs is missing "${heading}"`);
      let previous = -1;
      for (const expected of headings) {
        const at = section.indexOf(`\`${expected}\``);
        assert.ok(at > previous, `${id} ${locale} output format must name \`${expected}\` after the previous heading`);
        previous = at;
      }
    }
  }
});

test('readme-updator exposes update and translate with matching prompts, bindings and locales', () => {
  const packageRoot = join(repoRoot, 'data', 'readme-updator');
  const readJson = (path) => JSON.parse(readFileSync(join(packageRoot, path), 'utf8'));
  const manifest = readJson('manifest.json');
  const commands = readJson('frontend/commands.json').commands;
  const panel = readJson('frontend/panel.json');
  const preset = readJson('backend/task-preset.json');
  const prompts = readJson('backend/prompts.json');
  const expected = ['update', 'translate', 'init'];

  assert.equal(manifest.taskPresetId, 'readme-updator');
  assert.equal(prompts.version, manifest.version);
  assert.deepEqual(commands.map(({ id }) => id), expected);
  assert.deepEqual(Object.keys(prompts.commandSystemPrompts), expected);
  assert.equal(panel.sections.flatMap(({ fields }) => fields)
    .find(({ id }) => id === 'repositoryScope').renderer, 'repository-access-selector');
  assert.deepEqual(preset.targets.repositories.selections[0].allowedAccessTypes, ['write']);
  assert.ok(preset.inputBindings.some(({ input, promptParameter }) => input === 'command' && promptParameter === 'command'));
  assert.ok(preset.inputBindings.some(({ input, promptParameter }) => input === 'operationBrief' && promptParameter === 'operationBrief'));

  for (const locale of manifest.localization.supportedLocales) {
    const { systemTemplate, userTemplate } = prompts.locales[locale];
    const system = readFileSync(join(packageRoot, 'backend', systemTemplate.replace('./', '')), 'utf8');
    readFileSync(join(packageRoot, 'backend', userTemplate.replace('./', '')), 'utf8');
    for (const key of ['public', 'multilingual', 'languages', 'sourceLanguage', 'style']) {
      assert.match(system, new RegExp(`\`${key}\``));
    }
    assert.match(system, /\.hagicode\/hagitask\/readme-updator\/index\.md/);
    for (const command of expected) {
      const text = readFileSync(join(packageRoot, 'backend', prompts.commandSystemPrompts[command][locale].replace('./', '')), 'utf8');
      assert.match(text, /\.hagicode\/hagitask\/readme-updator\/index\.md/);
    }
    assert.ok(readJson(`locales/${locale}.json`).taskPreset.displayName);
  }
});
