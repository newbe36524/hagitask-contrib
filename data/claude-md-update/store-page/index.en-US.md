---
locale: en-US
slug: claude-md-update
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

CLAUDE.md Update is a task preset package for teams that want documentation maintenance to run through the shared preset-task contract instead of a legacy prompt shortcut. It treats `AGENTS.md` as the primary source of truth and keeps `CLAUDE.md` as a minimal redirect.

## Why teams install it

### AGENTS-first architecture

The preset builds or updates `AGENTS.md` as the comprehensive project documentation source, then writes a thin `CLAUDE.md` that redirects readers to `AGENTS.md`.

### MonoSpecs-aware scope

When the selected project is a MonoSpecs root, the drawer can keep the run limited to the root `AGENTS.md`/`CLAUDE.md` or expand it to child-repo `AGENTS.md` / `CLAUDE.md` files.

### Clean migration away from legacy routing

The preset replaces the orphaned legacy `claudeMdUpdate` entry point without touching existing docs until a user explicitly starts a run.

## Best fit

- Best for: repository instruction refreshes, AGENTS.md maintenance (with CLAUDE.md redirect), and MonoSpecs-wide documentation updates that still need explicit scope control.
- Not for: unrestricted cross-project batches, ad hoc repository editing, or workflows that do not center on AGENTS.md / CLAUDE.md maintenance.

## FAQ

### Does the migration rewrite existing AGENTS.md/CLAUDE.md files automatically?

No. Existing documentation remains unchanged until someone explicitly runs this preset.

### Why does the preset ask for scope only on MonoSpecs roots?

Single-repo projects already map cleanly to root `AGENTS.md` + `CLAUDE.md`. The extra scope choice is only needed when child repositories are available.
