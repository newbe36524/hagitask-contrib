---
locale: en-US
slug: codegraph-tasks
title: CodeGraph Tasks
summary: Run localized CodeGraph lifecycle and graph-backed architecture tasks across eligible repositories.
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: Run a task
secondaryCtaLabel: Review prerequisites
catalog:
  - codegraph
  - architecture
tags:
  - codegraph
  - repository
  - automation
badges:
  - CodeGraph CLI or MCP required
  - Optional repository selection
  - Per-repository results
---

CodeGraph Tasks offers six commands: `init` builds a graph, `status` reports index and pending sync state, `sync` updates the graph, `upgrade` updates the installed CLI, `uninit` removes a project index, and `explore` answers architecture or impact questions using `codegraph_explore`.

## Choose a target

Choose **All repositories** to attempt each configured child in `.hagicode/monospecs.yaml` (or the project root outside MonoSpecs). Choose **Specific repository** and select exactly one repository to limit the task to it. The selector remains visible in both modes; an existing selection is ignored in All mode. Missing, inaccessible, or unauthorized children are skipped with reasons. The task reports successes, skips, and failures per repository. Describe your request and any expected results in one text field; `explore` needs a concrete question or symbol there.

## Before you start

- CLI commands require an available `codegraph` executable or an already available `npx @colbymchenry/codegraph` invocation; the task does not download or install it for you.
- `explore` requires the `codegraph_explore` MCP tool and an accessible indexed graph.
- Check repository read/write permissions and local access. `init`, `sync`, and `uninit` require write access.
- `upgrade` affects the installed CLI and runs only once even when multiple child repositories are targeted; review its effects before selecting it.
