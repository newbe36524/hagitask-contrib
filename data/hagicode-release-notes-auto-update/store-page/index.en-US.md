---
locale: en-US
slug: hagicode-release-notes-auto-update
title: HagiCode Release Notes Auto-Update
summary: Create release notes from the latest 30 days of application-repository history and synchronize Docs.
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: Install task preset
secondaryCtaLabel: Preview contract
catalog:
  - release-notes
  - maintenance
tags:
  - release-notes
  - bilingual
badges:
  - Application tags as version source
  - Permission-aware writes
  - Existing Docs sync workflow
---

HagiCode Release Notes Auto-Update discovers versions from selected application repositories such as web and backend. It derives missing history from each repository's own tag range, then creates missing, evidence-backed release notes through the latest valid tag using only commits from the 30 days before the task starts. It accepts one required natural-language request and does not expose a version field.

## What it does

- Checks selected application-repository tags and existing release-notes history and outputs.
- Creates missing tag history and version notes from verified per-repository Git ranges; existing conflicting history is preserved and reported.
- Skips versions without commits in the rolling 30-day UTC window and never backfills older changes.
- Writes generated JSON and localized Markdown to `artifacts/generated/<tag>.json` and `published/<tag>.<locale>.md` in release-notes.
- Verifies localized landing routes and version anchors against Docs, then updates its managed release-notes view using the existing synchronization workflow.
- Skips identical output and preserves conflicting release-note files rather than overwriting them.

## Repository access

The task accepts the repositories supplied in its scope, including additional and read-only repositories. It does not require an exact count or fixed names. Operations that need a repository path stop if that path is unavailable, and writes are allowed only to repositories resolved with write access. HagiTask Contrib is the package's installation location, not an implicit target.

## Limits

The task does not publish a GitHub Release or create per-version Docs pages. It updates Docs only through its existing synchronization workflow and reports missing evidence, incomplete locales, conflicts, and compatibility blockers.

The task's UI is available in English and Simplified Chinese. Generated notes must cover the locale set currently supported by the release-notes repository, and an incomplete locale set must not be reported as Docs-ready.
