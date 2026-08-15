# HagiTask Contrib - Agent Configuration

## Root Configuration

Inherits the monorepo rules from `/AGENTS.md`. This is the internal development and validation repository for HagiTask packages before public promotion.

## Overview and Architecture

- Development packages live under `data/<taskId>/` and use the same layout as community packages.
- `hagitask/` is the nested schema source used by the validator.
- `scripts/validate-contrib-packages.mjs` discovers and validates package sources; `test/` contains validator tests.
- Stabilized packages may be moved to `hagitask-community-packages`; generated catalogs and archives do not belong here.

## Commands and Testing

Run from `repos/hagitask-contrib/`:

```bash
git submodule update --init --recursive
npm ci
npm run validate
npm test
```

Run validation and tests after changing a package contract, prompt binding, locale, or validator.

## Conventions

- Keep package IDs, directory names, schema references, and locale resources consistent.
- Put command-specific execution guidance in `backend/prompts.json` and locale templates; keep skills for reusable capabilities.
- Do not edit the nested `hagitask/` checkout or generated publication output.
- Keep internal packages compatible with the community repository layout so promotion does not require restructuring.

## Deployment

This repository is an intermediate source, not the public publication target. Promote only validated package source to `hagitask-community-packages`; the site owns catalog and archive generation.

## Publish Preparation

The `publish` operation receives the absolute Contrib source checkout and Community Packages target checkout from its execution context. Treat those paths as authoritative; verify that both exist, are distinct repository roots, and initialize the nested `hagitask/` schema checkout when required. Do not infer paths or use remotes, `gh`, forks, commits, pushes, pull requests, merges, or releases.

Before copying anything, run `npm run validate` and `npm test` in this checkout, then verify the selected `data/<taskId>/` package, its directory name, `manifest.json.taskPresetId`, and the requested target semantic version. Any validation, identity, preflight, or version failure stops the operation and leaves the Contrib package unchanged.

Copy only the authored package source from `data/<taskId>/` to the target checkout's `data/<taskId>/`. Update the copied `manifest.json` to the target semantic version while preserving its public `$schema` URL. Never copy or edit catalogs, archives, generated `/index.json`, `/tasks/<taskId>.json`, `/packages/<taskId>.zip`, unrelated packages, repository-level files, or the nested schema checkout. Report the task ID, old and new versions, copied and skipped files, both validation/test exit statuses, and the local target path.
