---
locale: en-US
slug: agents-md-update
title: AGENTS.md / CLAUDE.md Update
summary: A structured documentation-maintenance task preset that builds AGENTS.md as the primary data source and keeps CLAUDE.md as a minimal redirect, with explicit project selection and MonoSpecs-aware scope.
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: Install task preset
secondaryCtaLabel: Preview contract
catalog:
  - documentation
  - maintenance
tags:
  - claude-md
  - agents-md
  - monospecs
badges:
  - Project scoped
  - MonoSpecs aware
  - Migration path
---

AGENTS.md Update is a task preset package for teams that want documentation maintenance to run through the shared preset-task contract. It treats `AGENTS.md` as the primary source of truth and lets users choose whether `CLAUDE.md` is included.

## Why teams install it

### AGENTS-first architecture

The preset builds or updates `AGENTS.md` as the comprehensive project documentation source, then writes a thin `CLAUDE.md` that redirects readers to `AGENTS.md`.

### Configurable operation and content

Choose `new`, `incresement update`, or `shrink`, then select AGENTS.md include/exclude categories. An empty repository selection means all available repositories, including the MonoSpecs root. When `CLAUDE.md` is disabled, only AGENTS.md files are targeted.

### MonoSpecs-aware repository scope

MonoSpecs root and child repositories use one repository selector. The resolved selection determines which targets the prompt may edit; there is no separate MonoSpecs scope switch.

## Best fit

- Best for: repository instruction refreshes, AGENTS.md maintenance (with CLAUDE.md redirect), and MonoSpecs-wide documentation updates that still need explicit scope control.
- Not for: unrestricted cross-project batches, ad hoc repository editing, or workflows that do not center on AGENTS.md / CLAUDE.md maintenance.

## FAQ

### Does the migration rewrite existing AGENTS.md/CLAUDE.md files automatically?

No. Existing documentation remains unchanged until someone explicitly runs this preset.

### Why does the preset ask for scope only on MonoSpecs roots?

Single-repo projects already map cleanly to root `AGENTS.md` + `CLAUDE.md`. The extra scope choice is only needed when child repositories are available.
