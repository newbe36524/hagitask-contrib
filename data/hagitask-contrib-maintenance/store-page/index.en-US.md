---
locale: en-US
slug: hagitask-contrib-maintenance
title: HagiTask Contrib Maintenance
summary: Safely create, develop, and prepare local publication copies of Contrib HagiTask packages.
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
  - Local publication
---

This maintenance task provides three commands: `new` creates a complete Contrib package, `dev` reads a Community Packages source and synchronizes it into Contrib, and `publish` copies a validated package into a local publication directory and updates its version.

Contrib is the only write target. Community Packages and the nested `hagitask` schemas are read-only. Catalog files, detail JSON, ZIP archives, and other generated output are excluded.

`new` and `dev` run `npm run validate` and `npm test`. `publish` performs the same preflight before the local copy, version update, and local publication validation. It never forks, pushes, or creates a Pull Request.
