#!/usr/bin/env node
// Embeds the saga tool and the method prompts into the `create` command prompts of data/saga.
//
//   node scripts/sync-saga-assets.mjs --skill <dir of long-running-orchestration> [--check]
//
// A HagiTask package can only ship prompt templates, so the `create` command writes these files into
// <project>/.hagicode/sagas on first use and verifies each one by sha256. The skill is the source of truth;
// this script copies it between the saga-assets markers of both locales. With --check it changes nothing and
// exits 1 when a template is out of date.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BEGIN = '<!-- saga-assets:begin -->';
export const END = '<!-- saga-assets:end -->';
export const FENCE = '`````';
const here = dirname(fileURLToPath(import.meta.url));
const packageDir = join(here, '..', 'data', 'saga');
export const LOCALES = ['en-US', 'zh-CN'];

export const sha256 = (text) => createHash('sha256').update(text).digest('hex');

/** [path inside the saga root, content] */
export function assetList(skillDir) {
  const read = (rel) => readFileSync(join(skillDir, rel), 'utf8');
  const prompts = ['goal', 'research', 'acceptance', 'plan', 'amend', 'run'];
  return [
    ['tools/saga.mjs', read('scripts/saga.mjs')],
    ...prompts.map((name) => [`prompts/${name}.md`, read(`templates/saga/prompts/${name}.md`)]),
    ['.gitignore', read('templates/saga/gitignore')],
  ];
}

export function renderBlock(assets) {
  const parts = [];
  for (const [path, content] of assets) {
    if (!content.endsWith('\n') || content.endsWith('\n\n')) throw new Error(`${path} must end with exactly one newline`);
    if (content.includes('{{')) throw new Error(`${path} contains "{{", which Handlebars would try to render`);
    if (/\b(True|False)\b/.test(content)) throw new Error(`${path} contains True or False: the backend prompt renderer rewrites them to lowercase`);
    if (content.includes(FENCE)) throw new Error(`${path} contains the fence ${FENCE}`);
    parts.push(`#### \`${path}\`\nsha256: \`${sha256(content)}\`\n\n${FENCE}text\n${content}${FENCE}\n`);
  }
  return parts.join('\n');
}

/** Reads the assets back out of a rendered template: [{ path, sha, content }]. */
export function parseBlock(markdown) {
  const start = markdown.indexOf(BEGIN), end = markdown.indexOf(END);
  if (start < 0 || end < start) throw new Error('saga-assets markers are missing');
  const body = markdown.slice(start + BEGIN.length, end);
  const re = new RegExp('#### `([^`]+)`\\nsha256: `([0-9a-f]{64})`\\n\\n' + FENCE + 'text\\n([\\s\\S]*?)' + FENCE + '\\n', 'g');
  return [...body.matchAll(re)].map((m) => ({ path: m[1], sha: m[2], content: m[3] }));
}

export function sync(skillDir, { check = false } = {}) {
  const block = renderBlock(assetList(skillDir));
  const stale = [];
  for (const locale of LOCALES) {
    const file = join(packageDir, 'backend', 'templates', locale, 'commands', 'create.md');
    const text = readFileSync(file, 'utf8');
    const start = text.indexOf(BEGIN), end = text.indexOf(END);
    if (start < 0 || end < start) throw new Error(`${file}: saga-assets markers are missing`);
    const next = `${text.slice(0, start + BEGIN.length)}\n${block}${text.slice(end)}`;
    if (next !== text) { stale.push(file); if (!check) writeFileSync(file, next); }
  }
  return stale;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--skill');
  if (i < 0 || !process.argv[i + 1]) { console.error('usage: sync-saga-assets.mjs --skill <dir> [--check]'); process.exit(2); }
  const check = process.argv.includes('--check');
  const stale = sync(resolve(process.argv[i + 1]), { check });
  if (check) { console.log(stale.length ? `out of date:\n${stale.join('\n')}` : 'saga assets are up to date'); process.exit(stale.length ? 1 : 0); }
  console.log(stale.length ? `updated:\n${stale.join('\n')}` : 'already up to date');
}
