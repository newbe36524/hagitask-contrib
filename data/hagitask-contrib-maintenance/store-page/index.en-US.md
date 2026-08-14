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

`new` and `dev` write only to Contrib. `publish` writes the package source to the local Community checkout without deleting the Contrib source. The nested `hagitask` schema remains protected. Catalog files, detail JSON, ZIP archives, and other generated output are excluded.

`new` and `dev` run `npm run validate` and `npm test`. `publish` performs Contrib preflight, copies and validates the package locally, and leaves the Contrib source unchanged. It does not perform remote Git or Pull Request operations.
