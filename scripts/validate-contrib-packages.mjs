#!/usr/bin/env node
/**
 * HagiTask contrib package validation entrypoint.
 *
 * One repeatable command used both locally and by GitHub Actions. It:
 *   1. discovers every package directory (top-level dir with a manifest.json),
 *   2. validates each JSON document against its repository-local `$schema`,
 *   3. enforces canonical `taskPresetId` format, directory/identity match and
 *      repository-wide uniqueness,
 *   4. checks manifest-declared resource paths stay inside the package,
 *   5. verifies locale coverage, prompt template associations, locale bundle
 *      references and required store-page frontmatter,
 *   6. aggregates every error and exits non-zero so a required check can block
 *      an invalid submission.
 *
 * The authoritative schemas live in the `hagitask` nested submodule at
 * `hagitask/schemas/task-preset-plugin/`. A document's `$schema` reference
 * (e.g. `https://tasks.hagicode.com/schemas/task-preset-plugin/manifest.schema.json`,
 * the public URL published by `hagitask-site` from the same pinned revision)
 * is resolved by file name against that nested directory only — the validator
 * matches on the `schemas/task-preset-plugin/` segment of the URL and ignores
 * the leading base — so it never reads outside `hagitask/schemas/task-preset-plugin/`
 * or falls back to the contrib repository root.
 *
 * Packages are discovered exclusively under `data/`. The repository root is no
 * longer a task entry point.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, sep, basename, dirname } from 'node:path';
import Ajv from 'ajv/dist/2020.js';

const DATA_DIR = 'data';
const SCHEMA_DIR = join('hagitask', 'schemas', 'task-preset-plugin');
const TASK_PRESET_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const SUPPORTED_TARGET_SCOPE_SOURCES = new Set([
  'owner-project-repositories',
  'vault-registry',
  'project-registry',
]);

/**
 * @typedef {Object} ValidationError
 * @property {string} packageId
 * @property {string} file
 * @property {string} field
 * @property {string} message
 */

function readJsonSafe(file) {
  try {
    return { ok: true, value: JSON.parse(readFileSync(file, 'utf8')) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

function walkJsonFiles(packageDir, base, out) {
  const dir = base ? join(packageDir, base) : packageDir;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      walkJsonFiles(packageDir, rel, out);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      out.push(rel);
    }
  }
}

/**
 * Resolve a document `$schema` reference to a schema file name inside
 * `<repoRoot>/hagitask/schemas/task-preset-plugin/`. The file name is taken from
 * the `schemas/task-preset-plugin/` segment of the reference; the only location
 * the validator ever consults is the nested HagiTask schema root. Returns null
 * when the referenced schema cannot be resolved there.
 */
function resolveSchemaFileName(repoRoot, schemaRef) {
  const anchor = 'schemas/task-preset-plugin/';
  const norm = String(schemaRef).replace(/\\/g, '/');
  const idx = norm.indexOf(anchor);
  const fileName = idx >= 0 ? norm.slice(idx + anchor.length) : basename(norm);
  const full = join(repoRoot, SCHEMA_DIR, fileName);
  return existsSync(full) ? fileName : null;
}

function buildValidator(repoRoot) {
  const ajv = new Ajv({ strict: false, allErrors: true });
  const schemaDir = join(repoRoot, SCHEMA_DIR);
  /** @type {Map<string, (data: unknown) => boolean>} */
  const cache = new Map();
  if (existsSync(schemaDir)) {
    for (const f of readdirSync(schemaDir)) {
      if (!f.endsWith('.json')) continue;
      const schema = JSON.parse(readFileSync(join(schemaDir, f), 'utf8'));
      try {
        cache.set(f, ajv.compile(schema));
      } catch (e) {
        // A broken schema should not crash discovery; surface it later.
        cache.set(f, () => true);
      }
    }
  }
  return {
    hasSchema(fileName) {
      return cache.has(fileName);
    },
    validateFile(fileName, data) {
      const fn = cache.get(fileName);
      if (!fn) return null;
      const ok = fn(data);
      return ok ? [] : fn.errors ?? [];
    },
  };
}

function discoverPackages(repoRoot) {
  const dataRoot = join(repoRoot, DATA_DIR);
  if (!existsSync(dataRoot) || !statSync(dataRoot).isDirectory()) {
    throw new Error(
      `Contrib data directory not found at ${dataRoot}. ` +
        `Packages must live under \`data/<taskId>/\`. ` +
        `Ensure you run validation from the contrib repository root and have initialized its nested submodules.`,
    );
  }
  const result = [];
  for (const entry of readdirSync(dataRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dirName = entry.name;
    const manifestPath = join(dataRoot, entry.name, 'manifest.json');
    if (existsSync(manifestPath)) {
      result.push({ dirName, dir: join(dataRoot, entry.name), rel: `${DATA_DIR}/${entry.name}` });
    }
  }
  return result;
}

/** Minimal YAML frontmatter parser (scalar values + block sequences). */
function parseFrontmatter(md) {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const lines = match[1].split(/\r?\n/);
  const result = {};
  let currentKey = null;
  let list = null;
  const flush = () => {
    if (currentKey && list) result[currentKey] = list;
    list = null;
  };
  for (const line of lines) {
    if (/^\s*-\s+/.test(line)) {
      const val = line.replace(/^\s*-\s+/, '').trim().replace(/^['"]|['"]$/g, '');
      if (!list) list = [];
      list.push(val);
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      flush();
      const key = kv[1];
      const raw = kv[2].trim().replace(/^['"]|['"]$/g, '');
      currentKey = key;
      if (raw === '') {
        list = null;
      } else {
        result[key] = raw;
        list = null;
      }
    }
  }
  flush();
  return result;
}

function validatePackage(pkg, repoRoot, validator) {
  /** @type {ValidationError[]} */
  const errors = [];
  const rel = (file) => `${pkg.rel}/${file}`;
  const add = (file, field, message) => errors.push({ packageId: pkg.rel, file: rel(file), field, message });

  const manifestRes = readJsonSafe(join(pkg.dir, 'manifest.json'));
  if (!manifestRes.ok) {
    add('manifest.json', 'parse', `invalid JSON: ${manifestRes.error.message}`);
    return errors;
  }
  const manifest = manifestRes.value;

  // --- 1.3 canonical identity ---
  const taskPresetId = manifest.taskPresetId;
  if (typeof taskPresetId !== 'string' || !TASK_PRESET_ID_PATTERN.test(taskPresetId)) {
    add('manifest.json', 'taskPresetId', `must match ^[a-z0-9][a-z0-9-]*$ (got ${JSON.stringify(taskPresetId)})`);
  } else if (taskPresetId !== pkg.dirName) {
    add('manifest.json', 'taskPresetId', `must equal directory name '${pkg.dirName}' (got '${taskPresetId}')`);
  }

  // --- 1.4 JSON Schema validation for every .json document with $schema ---
  const jsonFiles = [];
  walkJsonFiles(pkg.dir, '', jsonFiles);
  for (const jf of jsonFiles) {
    const full = join(pkg.dir, jf);
    const res = readJsonSafe(full);
    if (!res.ok) {
      add(jf, 'parse', `invalid JSON: ${res.error.message}`);
      continue;
    }
    const data = res.value;
    if (data && typeof data === 'object' && typeof data.$schema === 'string') {
      const fileName = resolveSchemaFileName(repoRoot, data.$schema);
      if (!fileName) {
        add(jf, `$schema(${data.$schema})`, 'unresolved schema reference (not found in hagitask/schemas/task-preset-plugin/)');
      } else if (validator.hasSchema(fileName)) {
        const errs = validator.validateFile(fileName, data);
        for (const e of errs) {
          const loc = e.instancePath || '';
          const detail = e.params && e.params.allowedValues ? ` (${e.params.allowedValues.join(', ')})` : '';
          add(jf, `schema:${fileName}${loc}`, `${e.message}${detail}`);
        }
      }
    }
  }

  // --- 1.5 enabled task target scope sources ---
  const taskPresetPath = manifest.backend?.taskPreset;
  if (typeof taskPresetPath === 'string' && taskPresetPath.length > 0) {
    const taskPresetAbs = resolve(pkg.dir, taskPresetPath);
    const taskPresetRes = readJsonSafe(taskPresetAbs);
    if (taskPresetRes.ok && taskPresetRes.value && typeof taskPresetRes.value === 'object') {
      const targets = taskPresetRes.value.targets;
      for (const [kind, bucket] of Object.entries(targets || {})) {
        if (!bucket || bucket.enabled !== true || !Array.isArray(bucket.selections)) continue;
        for (const selection of bucket.selections) {
          const source = selection?.scope?.source;
          if (source === undefined) continue;
          if (typeof source === 'string' && SUPPORTED_TARGET_SCOPE_SOURCES.has(source)) continue;
          add(
            taskPresetPath,
            `targets.${kind}.selections[${selection?.id ?? '<unknown>'}].scope.source`,
            `selection '${selection?.id ?? '<unknown>'}' uses unsupported scope source ${JSON.stringify(source)}`,
          );
        }
        const execution = taskPresetRes.value.execution;
        if (execution !== undefined) {
          if (!execution || typeof execution !== 'object'
            || !/^1\./.test(execution.schemaVersion ?? '')
            || !['declarative', 'extension'].includes(execution.strategy)) {
            add(taskPresetPath, 'execution', 'must declare schemaVersion 1.x and strategy declarative or extension');
          } else if (execution.strategy === 'extension' && typeof execution.extensionPoint !== 'string') {
            add(taskPresetPath, 'execution.extensionPoint', 'is required for extension strategy');
          } else if (execution.strategy === 'declarative' && execution.extensionPoint !== undefined) {
            add(taskPresetPath, 'execution.extensionPoint', 'must be omitted for declarative strategy');
          }
        }
        const bindings = Array.isArray(taskPresetRes.value.inputBindings)
          ? taskPresetRes.value.inputBindings
          : [];
        for (const binding of bindings) {
          const aliases = Array.isArray(binding?.aliases) ? binding.aliases : [];
          if (aliases.includes(binding?.input)) {
            add(taskPresetPath, `inputBindings.${binding?.input}.aliases`, 'must not contain its canonical input name');
          }
          if (binding?.transform === 'url-list' && binding?.valueType !== 'url-list') {
            add(taskPresetPath, `inputBindings.${binding?.input}.valueType`, 'url-list transform requires url-list valueType');
          }
        }
      }
    }
  }

  // --- 2.1 declared resource paths exist and stay inside the package ---
  const declared = [];
  const pushPath = (field, p) => {
    if (typeof p === 'string' && p.length) declared.push({ field, p });
  };
  if (manifest.ui) {
    pushPath('ui.panel', manifest.ui.panel);
    pushPath('ui.commands', manifest.ui.commands);
  }
  if (manifest.site) pushPath('site.storePage', manifest.site.storePage);
  if (manifest.backend) {
    pushPath('backend.taskPreset', manifest.backend.taskPreset);
    pushPath('backend.prompts', manifest.backend.prompts);
  }
  if (manifest.localization && manifest.localization.bundles) {
    for (const [loc, p] of Object.entries(manifest.localization.bundles)) {
      pushPath(`localization.bundles.${loc}`, p);
    }
  }
  for (const { field, p } of declared) {
    const abs = resolve(pkg.dir, p);
    if (abs !== pkg.dir && !abs.startsWith(pkg.dir + sep)) {
      add('manifest.json', field, `path escapes package directory: ${p}`);
      continue;
    }
    if (!existsSync(abs)) {
      add('manifest.json', field, `missing declared file: ${p}`);
    }
  }
  if (manifest.site && manifest.site.storePage) {
    const sp = resolve(pkg.dir, manifest.site.storePage);
    if (existsSync(sp) && !statSync(sp).isDirectory()) {
      add('manifest.json', 'site.storePage', `must be a directory: ${manifest.site.storePage}`);
    }
  }

  // --- 2.2 locale coverage + bundle references ---
  const supported = Array.isArray(manifest.localization?.supportedLocales)
    ? manifest.localization.supportedLocales
    : [];
  const defaultLocale = manifest.localization?.defaultLocale;
  const bundles = manifest.localization?.bundles || {};

  for (const loc of supported) {
    if (!(loc in bundles)) {
      add('manifest.json', 'localization.bundles', `missing bundle for supported locale '${loc}'`);
    } else {
      const bAbs = resolve(pkg.dir, bundles[loc]);
      if (!bAbs.startsWith(pkg.dir + sep) || !existsSync(bAbs)) {
        add('manifest.json', `localization.bundles.${loc}`, `missing locale bundle file: ${bundles[loc]}`);
      }
    }
    const spFile = `store-page/index.${loc}.md`;
    if (!existsSync(join(pkg.dir, spFile))) {
      add(spFile, 'store-page', `missing store page for supported locale '${loc}'`);
    }
  }
  if (defaultLocale && !supported.includes(defaultLocale)) {
    add('manifest.json', 'localization.defaultLocale', `default locale '${defaultLocale}' not in supportedLocales`);
  }

  // --- 2.2 store-page frontmatter + slug/locale consistency ---
  const storePageDir = join(pkg.dir, 'store-page');
  if (existsSync(storePageDir) && statSync(storePageDir).isDirectory()) {
    for (const f of readdirSync(storePageDir)) {
      const m = f.match(/^index\.([a-zA-Z-]+)\.md$/);
      if (!m) continue;
      const loc = m[1];
      const full = join(storePageDir, f);
      const fm = parseFrontmatter(readFileSync(full, 'utf8'));
      const spSchemaName = 'store-page-frontmatter.schema.json';
      if (validator.hasSchema(spSchemaName)) {
        const errs = validator.validateFile(spSchemaName, fm);
        for (const e of errs) {
          add(f, `schema:${spSchemaName}${e.instancePath || ''}`, e.message);
        }
      }
      if (fm.slug !== undefined && fm.slug !== pkg.dirName) {
        add(f, 'slug', `must equal taskId '${pkg.dirName}' (got '${fm.slug}')`);
      }
      if (fm.locale !== undefined && fm.locale !== loc) {
        add(f, 'locale', `must equal file locale '${loc}' (got '${fm.locale}')`);
      }
      if (!supported.includes(loc)) {
        add(f, 'locale', `store page locale '${loc}' not in manifest supportedLocales`);
      }
    }
  }

  // --- 2.2 prompt template associations ---
  const promptsPath = manifest.backend?.prompts;
  if (promptsPath) {
    const promptsAbs = resolve(pkg.dir, promptsPath);
    const promptsFile = promptsPath.replace(/^\.\//, '');
    if (existsSync(promptsAbs)) {
      const pres = readJsonSafe(promptsAbs);
      if (pres.ok) {
        const prompts = pres.value;
        const refs = new Set();
        if (prompts.variants && Array.isArray(prompts.variants.entries)) {
          for (const e of prompts.variants.entries) {
            if (e.systemTemplate) refs.add(e.systemTemplate);
            if (e.userTemplate) refs.add(e.userTemplate);
          }
          if (prompts.variants.fallback) {
            if (prompts.variants.fallback.systemTemplate) refs.add(prompts.variants.fallback.systemTemplate);
            if (prompts.variants.fallback.userTemplate) refs.add(prompts.variants.fallback.userTemplate);
          }
        } else if (prompts.locales && typeof prompts.locales === 'object') {
          for (const lp of Object.values(prompts.locales)) {
            if (lp.systemTemplate) refs.add(lp.systemTemplate);
            if (lp.userTemplate) refs.add(lp.userTemplate);
            if (lp.developerTemplate) refs.add(lp.developerTemplate);
          }
        }
        if (prompts.commandSystemPrompts && typeof prompts.commandSystemPrompts === 'object') {
          for (const [commandId, localeTemplates] of Object.entries(prompts.commandSystemPrompts)) {
            if (!commandId.trim() || !localeTemplates || typeof localeTemplates !== 'object' || Array.isArray(localeTemplates)) {
              add(promptsFile, `commandSystemPrompts.${commandId}`, 'command-specific prompt mapping must be a locale object');
              continue;
            }
            for (const [locale, templatePath] of Object.entries(localeTemplates)) {
              if (!locale.trim() || typeof templatePath !== 'string' || !templatePath.trim()) {
                add(promptsFile, `commandSystemPrompts.${commandId}.${locale}`, 'command-specific prompt template must be a non-empty path');
                continue;
              }
              refs.add(templatePath);
            }
          }
        }
        // Template references are relative to the prompts.json file location.
        const promptsDir = dirname(promptsAbs);
        for (const tpl of refs) {
          const tAbs = resolve(promptsDir, tpl);
          if (!tAbs.startsWith(pkg.dir + sep) || !existsSync(tAbs)) {
            add(promptsFile, `template:${tpl}`, 'prompt template file not found within package');
          }
        }
        const pSupported = Array.isArray(prompts.supportedLocales) ? prompts.supportedLocales : [];
        for (const loc of pSupported) {
          if (!supported.includes(loc)) {
            add(promptsPath, 'supportedLocales', `prompt locale '${loc}' not declared in manifest.supportedLocales`);
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Validate all contrib packages under `repoRoot`.
 * @param {string} repoRoot
 * @returns {{ packages: string[], errors: ValidationError[] }}
 */
export function validateContribPackages(repoRoot) {
  const packages = discoverPackages(repoRoot);
  const validator = buildValidator(repoRoot);
  /** @type {ValidationError[]} */
  const allErrors = [];

  // 1.3 duplicate canonical id detection
  const idMap = new Map();
  for (const pkg of packages) {
    const res = readJsonSafe(join(pkg.dir, 'manifest.json'));
    if (res.ok && typeof res.value.taskPresetId === 'string') {
      const id = res.value.taskPresetId;
      if (!idMap.has(id)) idMap.set(id, []);
      idMap.get(id).push(pkg.rel);
    }
  }
  const duplicateIds = [...idMap.entries()].filter(([, dirs]) => dirs.length > 1);

  for (const pkg of packages) {
    allErrors.push(...validatePackage(pkg, repoRoot, validator));
  }

  for (const [id, dirs] of duplicateIds) {
    for (const d of dirs) {
      allErrors.push({
        packageId: d,
        file: 'manifest.json',
        field: 'taskPresetId',
        message: `duplicate canonical id '${id}' also used by ${dirs.filter((x) => x !== d).join(', ')}`,
      });
    }
  }

  return { packages: packages.map((p) => p.rel).sort(), errors: allErrors };
}

function formatError(e) {
  return `${e.packageId}: ${e.file}: ${e.field}: ${e.message}`;
}

function main() {
  const repoRoot = resolve(process.argv[2] || process.cwd());
  const schemaRoot = join(repoRoot, SCHEMA_DIR);
  if (!existsSync(schemaRoot)) {
    console.error(`✗ Authoritative schema root not found at ${schemaRoot}`);
    console.error(
      `  Initialize the nested hagitask submodule before validating:\n  git submodule update --init --recursive`,
    );
  }
  const { packages, errors } = validateContribPackages(repoRoot);

  const summaryLines = [];
  summaryLines.push(`## Contrib package validation`);
  summaryLines.push(`- Packages discovered: ${packages.length}`);
  summaryLines.push(`- Packages: ${packages.join(', ') || '(none)'}`);
  summaryLines.push(`- Errors: ${errors.length}`);

  if (errors.length === 0) {
    console.log(`✓ Contrib validation passed for ${packages.length} package(s): ${packages.join(', ')}`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      writeFileSyncSafe(process.env.GITHUB_STEP_SUMMARY, summaryLines.join('\n') + '\n');
    }
    process.exit(0);
  }

  console.error(`✗ Contrib validation failed with ${errors.length} error(s):`);
  for (const e of errors) {
    console.error(`  ${formatError(e)}`);
  }
  console.error(`\nValidated ${packages.length} package(s).`);
  summaryLines.push('');
  summaryLines.push('### Failures');
  for (const e of errors) summaryLines.push(`- \`${formatError(e)}\``);
  if (process.env.GITHUB_STEP_SUMMARY) {
    writeFileSyncSafe(process.env.GITHUB_STEP_SUMMARY, summaryLines.join('\n') + '\n');
  }
  process.exit(1);
}

function writeFileSyncSafe(path, content) {
  try {
    const { writeFileSync } = require('node:fs');
    writeFileSync(path, content);
  } catch {
    /* best-effort summary */
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}