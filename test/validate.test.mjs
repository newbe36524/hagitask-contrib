import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const repoRoot = resolve(import.meta.dirname, '..');
const cli = resolve(repoRoot, 'node_modules/@hagicode/hagitask/dist/cli.js');

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
