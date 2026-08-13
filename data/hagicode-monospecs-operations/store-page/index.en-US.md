---
locale: en-US
slug: hagicode-monospecs-operations
title: HagiCode MonoSpecs Operations
summary: Initialize MonoSpecs configuration, batch-add repositories, and reorder repositories by observable activity through a structured task.
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: Install task preset
secondaryCtaLabel: Preview operation contract
catalog:
  - configuration
  - repositories
tags:
  - monospecs
  - bilingual
  - validation
badges:
  - Selected-project writes
  - Read-only references
  - Pre-write validation
---

HagiCode MonoSpecs Operations provides three structured commands: `initialize` creates a missing `.hagicode/monospecs.yaml`, `add-repository` accepts one or more absolute URLs and infers repository metadata, and `reorder-repositories` builds a proposed order from observable activity signals.

The task writes only to the selected project. Attached repositories are read-only references. Adding repositories validates URLs, infers paths, and rejects duplicates; reordering shows a preview and requires explicit confirmation, then changes only the `repositories` array order. Every candidate configuration is fully revalidated before writing, and failures leave the file unchanged.
