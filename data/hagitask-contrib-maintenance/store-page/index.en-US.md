---
locale: en-US
slug: hagitask-contrib-maintenance
title: HagiTask Contrib Maintenance
summary: Safely create, develop, and prepare local publication migrations for Contrib HagiTask packages.
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: Install maintenance task
secondaryCtaLabel: Preview workflow
catalog:
  - maintenance
  - contrib
tags:
  - hagi-task
  - validation
  - bilingual
badges:
  - Contrib writes only
  - Community read-only
  - Local migration
---

This maintenance task provides three commands: `new` creates a complete Contrib package, `dev` reads a Community Packages source and synchronizes it into Contrib, and `publish` copies a validated package into the local Community Packages checkout, updates its version, and validates it. The Contrib source remains in place.

## What it does

### Creates and validates new packages

`new` creates the shared manifest, frontend, backend, locale, and store-page layout in Contrib. It must use a lowercase kebab-case task ID and finish with the repository's real validation and test commands.

### Synchronizes development sources

`dev` reads a selected Community Packages source and copies it into Contrib for development. The Community source is read-only, and local differences require an explicit conflict decision rather than a silent overwrite.

### Prepares a local publication migration

`publish` runs Contrib preflight, copies only authored package source to the local Community Packages checkout, updates the requested semantic version, and validates the target. It does not push, open a pull request, or delete the Contrib source.

## Before you start

- Keep the Contrib checkout and local Community Packages checkout as distinct repository roots.
- Use a lowercase kebab-case task ID and a valid semantic version for publication.
- Treat nested schemas, catalogs, detail JSON, ZIP archives, and other generated output as protected.

## Write boundaries

`new` and `dev` write only to Contrib. `publish` is the only command that writes to the local Community checkout, and it leaves the Contrib source unchanged. Any preflight, identity, copy, validation, or test failure stops the operation without reporting success.

`new` and `dev` run `npm run validate` and `npm test`. `publish` performs Contrib preflight, copies and validates the package locally, and leaves the Contrib source unchanged. It does not perform remote Git or Pull Request operations.

## Best fit

- Best for: developing a package safely before local Community promotion.
- Not for: remote publishing, editing generated site output, or bypassing package validation.
