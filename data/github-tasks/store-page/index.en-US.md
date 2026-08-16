---
locale: en-US
slug: github-tasks
title: GitHub Tasks
summary: Run focused GitHub management commands through gh CLI without persistent local artifacts.
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: Run a task
secondaryCtaLabel: Review remote changes
catalog:
  - github
  - repository-metadata
tags:
  - github
  - gh-cli
  - automation
badges:
  - Requires gh authentication
  - Explicit write targets
  - No local artifacts
---

GitHub Tasks provides focused remote GitHub operations through `gh` CLI. It is designed for repository maintenance that should be auditable, narrowly scoped, and completed remotely rather than by creating a local export or catalog.

## What it does

### Runs focused commands

`arrange-star` organizes supported GitHub metadata from the authenticated account. `update-repo-description` updates the explicitly requested repository description, topics, homepage URL, or other supported metadata.

### Resolves targets explicitly

For metadata updates, the task prefers repository URLs in the operation brief and falls back to repositories selected with `write` access. Read-only repositories are never treated as write targets.

### Reports remote results

The executor uses the installed `gh` CLI, reports the command outcome and affected repositories, and does not leave persistent local catalog files or generated artifacts.

## Before you start

- Install GitHub CLI and run `gh auth status` successfully.
- Confirm that the authenticated account can administer the target repositories.
- State the exact repositories, fields, and expected values in the operation brief when changing metadata.

## Best fit

- Best for: focused repository metadata updates and supported GitHub maintenance commands.
- Not for: local repository implementation, bulk changes without an explicit target list, or operations that require a GitHub token to be pasted into the brief.

## FAQ

### Can it write to every repository attached to the session?

No. Only repositories explicitly selected with `write` access, or URLs explicitly named in the operation brief, can be used as update targets.

### Does it create local output files?

No. The task performs remote operations through `gh` and reports the result without creating persistent local artifacts.
