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

test('release-notes auto-update binds one required request and scoped repositories', () => {
  const packageRoot = join(repoRoot, 'data', 'hagicode-release-notes-auto-update');
  const readJson = (path) => JSON.parse(readFileSync(join(packageRoot, path), 'utf8'));
  const manifest = readJson('manifest.json');
  const panel = readJson('frontend/panel.json');
  const preset = readJson('backend/task-preset.json');
  const prompts = readJson('backend/prompts.json');
  const fields = panel.sections.flatMap(({ fields }) => fields);

  assert.equal(manifest.taskPresetId, 'hagicode-release-notes-auto-update');
  assert.equal(preset.scriptKey, 'autotask.hagicode-release-notes-auto-update');
  assert.deepEqual(manifest.localization.supportedLocales, ['en-US', 'zh-CN']);
  assert.deepEqual(prompts.supportedLocales, manifest.localization.supportedLocales);
  assert.deepEqual(fields.filter(({ id }) => id === 'request').map(({ required, renderer }) =>
    ({ required, renderer })), [{ required: true, renderer: 'multiline-text' }]);
  assert.equal(fields.find(({ id }) => id === 'targetRepositories').required, true);
  assert.ok(!fields.some(({ id }) => /version/i.test(id)));
  assert.ok(!preset.inputBindings.some(({ input, promptParameter }) =>
    /version/i.test(input) || /version/i.test(promptParameter ?? '')));
  assert.ok(!prompts.inputs.some(({ name }) => /version/i.test(name)));
  assert.ok(preset.inputBindings.some(({ input, promptParameter, required }) =>
    input === 'request' && promptParameter === 'request' && required));
  assert.ok(preset.inputBindings.some(({ input, promptParameter, producer, required }) =>
    input === 'targetRepositories' && promptParameter === 'targetRepositories'
      && producer === 'frontend-computed' && required));
  assert.ok(preset.inputBindings.some(({ input, promptParameter, producer, required }) =>
    input === 'targetScopeMarkdown' && promptParameter === 'targetScopeMarkdown'
      && producer === 'frontend-computed' && required));
  assert.deepEqual(preset.targets.repositories.selections[0].allowedAccessTypes, ['read', 'write']);
  assert.equal(preset.targets.repositories.selections[0].required, true);

  for (const locale of manifest.localization.supportedLocales) {
    const user = readFileSync(join(packageRoot, `backend/templates/${locale}/user.hbs`), 'utf8');
    assert.match(user, /{{request}}/);
    assert.match(user, /{{#each targetRepositories}}[\s\S]*{{name}}[\s\S]*{{accessType}}/);
    assert.match(user, /{{{targetScopeMarkdown}}}/);
    assert.match(user, /release-notes/);
    assert.match(user, /docs/i);
    assert.match(user, /HagiTask Contrib/);
    assert.match(user, /absolute|绝对.*路径/);
    assert.match(user, /additional repositories are allowed|允许附加其他仓库/);
    assert.match(user, /HagiTask Contrib is the task package's installation location, not an implicit execution target|HagiTask Contrib 是任务包的安装位置，不是隐式执行目标/);
    assert.ok(readJson(`locales/${locale}.json`).panel.requestLabel);
    assert.match(readJson(`locales/${locale}.json`).panel.repositoriesHint, /repositories|仓库/);
    assert.match(readJson(`locales/${locale}.json`).panel.scopeDescription, /repositories|仓库/);
  }
});

test('release-notes auto-update prompts preserve evidence, output, and Docs contracts in both locales', () => {
  const packageRoot = join(repoRoot, 'data', 'hagicode-release-notes-auto-update');
  const prompts = JSON.parse(readFileSync(join(packageRoot, 'backend/prompts.json'), 'utf8'));
  const texts = Object.fromEntries(Object.entries(prompts.locales).map(([locale, paths]) => [
    locale,
    {
      system: readFileSync(join(packageRoot, 'backend', paths.systemTemplate.replace('./', '')), 'utf8'),
      user: readFileSync(join(packageRoot, 'backend', paths.userTemplate.replace('./', '')), 'utf8'),
    },
  ]));

  for (const { system, user } of Object.values(texts)) {
    const combined = `${system}\n${user}`;
    assert.match(combined, /targetRepositories/);
    assert.match(combined, /targetScopeMarkdown/);
    assert.match(combined, /absolute repository paths|绝对仓库路径/);
    assert.match(combined, /accessType/);
    assert.match(combined, /artifacts\/generated\/<tag>\.json/);
    assert.match(combined, /published\/<tag>\.<locale>\.md/);
  }

  assert.match(texts['en-US'].system, /Do not require an exact count, fixed repository names, or that every selected repository be writable/);
  assert.match(texts['en-US'].system, /Additional repositories, including read-only repositories, are allowed/);
  assert.match(texts['en-US'].system, /write only to repositories explicitly resolved with `write` access/);
  assert.doesNotMatch(texts['en-US'].system, /Reject missing, extra, duplicate, overlapping, mismatched, or non-writable repositories/);
  assert.match(texts['en-US'].system, /never infer a path from a repository name or the Contrib checkout/);
  assert.match(texts['en-US'].system, /A path is required only when an operation needs that repository/);
  assert.match(texts['en-US'].system, /npm --prefix <docs-root> run release-notes:sync -- --source local --local-repo-root/);
  assert.match(texts['en-US'].system, /Do not manually edit generated Docs indexes/);
  assert.doesNotMatch(texts['en-US'].system, /Contrib root|Contrib draft directory|`hagitask-contrib`: `write`/);

  assert.match(texts['en-US'].system, /highest valid published tag found in the selected application repositories/);
  assert.match(texts['en-US'].system, /source-repository tags to discover eligible versions even when those versions have no history/);
  assert.match(texts['en-US'].system, /derive it from the selected repositories' exact Git tag ranges, not HEAD/);
  assert.match(texts['en-US'].system, /create only missing `artifacts\/tags\/<tag>\/<tag>\.json`/);
  assert.match(texts['en-US'].system, /Never rewrite existing tag-history files/);
  assert.match(texts['en-US'].system, /current time minus 30 days/);
  assert.match(texts['en-US'].system, /inclusive interval `\[cutoff, task start\]`/);
  assert.match(texts['en-US'].system, /Git committer timestamp/);
  assert.match(texts['en-US'].system, /Skip tags whose per-repository ranges contain no eligible commits/);
  assert.match(texts['en-US'].system, /do not inspect older commit details to draft notes/);
  assert.match(texts['en-US'].system, /repositories\.<repo>\.group\.fromTag/);
  assert.match(texts['en-US'].system, /authoritative/);
  assert.match(texts['en-US'].system, /preserve it unchanged/);
  assert.match(texts['en-US'].system, /Do not publish a release, commit, or push/);
  assert.match(texts['en-US'].system, /locales\.\<locale\>\.title/);
  assert.match(texts['en-US'].system, /sections: \[\{ "heading": string, "items": string\[\] \}\]/);
  assert.match(texts['en-US'].system, /\/release-notes\//);
  assert.match(texts['en-US'].system, /\/en-US\/release-notes\//);
  assert.match(texts['en-US'].system, /\/<locale>\/release-notes\//);
  assert.match(texts['en-US'].system, /canonical normalized version anchor/);
  assert.match(texts['en-US'].system, /Do not manually edit generated Docs indexes, detail JSON, landing routes, rendered HTML, or create per-version pages/);
  assert.match(texts['en-US'].system, /release-notes has complete published Markdown for every required locale for each version being synchronized/);

  assert.match(texts['zh-CN'].system, /不要求固定的仓库数量、特定仓库名称或所有所选仓库都可写/);
  assert.match(texts['zh-CN'].system, /允许附加只读仓库/);
  assert.match(texts['zh-CN'].system, /只能向明确解析为 `write` 权限的仓库写入/);
  assert.match(texts['zh-CN'].system, /不得根据仓库名称或 Contrib checkout 推断路径/);
  assert.match(texts['zh-CN'].system, /只有操作需要访问某仓库时才要求该路径/);
  assert.match(texts['zh-CN'].system, /npm --prefix <docs-root> run release-notes:sync -- --source local --local-repo-root/);
  assert.match(texts['zh-CN'].system, /不得手动编辑生成的 Docs 索引/);
  assert.match(texts['zh-CN'].system, /每个待同步版本的所有必需语言 Markdown 均完整时才运行同步/);
  assert.doesNotMatch(texts['zh-CN'].system, /Contrib 根目录|Contrib 草稿目录|`hagitask-contrib`：`write`/);
  assert.match(texts['zh-CN'].system, /按语义化版本优先级/);
  assert.match(texts['zh-CN'].system, /尚无历史、生成说明或已发布 Markdown/);
  assert.match(texts['zh-CN'].system, /根据所选仓库的精确 Git tag 范围推导，不得使用 HEAD/);
  assert.match(texts['zh-CN'].system, /创建缺失的 `artifacts\/tags\/<tag>\/<tag>\.json`/);
  assert.match(texts['zh-CN'].system, /绝不可重写已有 tag 历史文件/);
  assert.match(texts['zh-CN'].system, /向前推 30 天/);
  assert.match(texts['zh-CN'].system, /Git 提交者时间戳/);
  assert.match(texts['zh-CN'].system, /即使说明缺失也跳过该 tag/);
  assert.match(texts['zh-CN'].system, /不得查看更早提交的详情来起草说明/);
  assert.match(texts['zh-CN'].system, /repositories\.<repo>\.group\.fromTag/);
  assert.match(texts['zh-CN'].system, /权威变更证据/);
  assert.match(texts['zh-CN'].system, /原样保留/);
  assert.match(texts['zh-CN'].system, /不得发布版本、提交或推送/);
  assert.match(texts['zh-CN'].system, /locales\.\<locale\>\.title/);
  assert.match(texts['zh-CN'].system, /sections: \[\{ "heading": string, "items": string\[\] \}\]/);
  assert.match(texts['zh-CN'].system, /\/release-notes\//);
  assert.match(texts['zh-CN'].system, /\/en-US\/release-notes\//);
  assert.match(texts['zh-CN'].system, /\/<locale>\/release-notes\//);
  assert.match(texts['zh-CN'].system, /规范化版本锚点/);
  assert.match(texts['zh-CN'].system, /不得创建逐版本页面/);
});
