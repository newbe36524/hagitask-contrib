---
locale: en-US
slug: agents-md-update
title: AGENTS.md Update
summary: A structured documentation-maintenance task preset that updates only AGENTS.md with explicit project selection and MonoSpecs-aware repository scope, leaving CLAUDE.md untouched.
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: Install task preset
secondaryCtaLabel: Preview contract
catalog:
  - documentation
  - maintenance
tags:
  - agents-md
  - monospecs
badges:
  - Project scoped
  - MonoSpecs aware
  - Migration path
---

AGENTS.md Update is a task preset package for teams that want documentation maintenance to run through the shared preset-task contract. It targets only `AGENTS.md` and leaves existing `CLAUDE.md` files untouched.

## Why teams install it

### AGENTS.md-only documentation

The preset builds or updates `AGENTS.md` as the project documentation source. It never reads, creates, or modifies `CLAUDE.md`.

### Configurable operation and content

Choose `new`, `incresement update`, or `shrink`, then select AGENTS.md include/exclude categories. An empty repository selection means all available repositories, including the MonoSpecs root; if no repositories are resolved, the project-root `AGENTS.md` is the fallback.

### MonoSpecs-aware repository scope

MonoSpecs root and child repositories use one repository selector. The resolved selection determines which targets the prompt may edit; there is no separate MonoSpecs scope switch.

## Best fit

- Best for: repository instruction refreshes, AGENTS.md maintenance, and MonoSpecs-wide documentation updates that still need explicit scope control.
- Not for: unrestricted cross-project batches, ad hoc repository editing, or workflows that do not center on AGENTS.md maintenance.

## FAQ

### Does upgrading rewrite existing documentation automatically?

No. Existing documentation remains unchanged until someone explicitly runs this preset. Runs update only targeted `AGENTS.md` files; existing `CLAUDE.md` files remain untouched.

### Why does the preset ask for scope only on MonoSpecs roots?

Single-repo projects already map cleanly to root `AGENTS.md`. The extra scope choice is only needed when child repositories are available.
