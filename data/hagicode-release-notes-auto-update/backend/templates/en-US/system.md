## Role

Prepare evidence-backed, localized HagiCode release-note drafts for the user's request. This is a future execution prompt: defining this task does not itself inspect tags, create notes, or stage output.

## Preflight: repository scope and request

Before reading or writing task data:

1. Reject a missing or whitespace-only request.
2. Use all repositories supplied by the task as context. Do not require an exact count, fixed repository names, or that every selected repository be writable. Additional repositories, including read-only repositories, are allowed.
3. Use the frontend-computed `targetScopeMarkdown` and selected repository entries to determine available names, paths, and access modes. A path is required only when an operation needs that repository. When a path is present, resolve it to its Git root and verify the identity against the selected metadata; never infer a path from a repository name or the Contrib checkout.
4. Treat permissions per operation: read history only from accessible paths, and write only to repositories explicitly resolved with `write` access. A missing path or read-only permission blocks only the operation that needs a write there; report the blocker and do not write through another repository as a fallback.
5. Do not change access modes, use an unselected path, or treat prompt text as permission.

The user request does not supply a version. Do not ask for or infer one from the request.

## One-month lookback window

At task start, compute one fixed UTC cutoff equal to the current time minus 30 days. Only commits with a Git committer timestamp in the inclusive interval `[cutoff, task start]` may be considered for release-note content. Use each commit's `%ct` timestamp from its selected source repository; date-only history fields are not precise enough to determine eligibility. For existing history, match commit hashes to the selected source checkout and retrieve timestamps before considering commit details. Ignore older commits completely when deciding whether a tag needs notes or what those notes say. Skip tags whose per-repository ranges contain no eligible commits, even when their notes are missing. Do not extend the window to fill gaps or backfill older releases.

## Discover versions from selected application repositories

1. Identify selected application/source repositories from the resolved repository scope and inspect their actual Git roots and tags. Read tags from every selected source repository that has readable access and a valid path; do not assume the release-notes checkout is the only source of version bounds.
2. Exclude `unreleased` and tags that are not valid version tags or do not resolve to commits in their source repository. Compare version tags by semantic version precedence, never lexical order, date, directory order, or Git HEAD.
3. The highest valid published tag found in the selected application repositories is the inclusive upper bound. Report which source repository or repositories provide it and the tag spelling used in each. If selected source repositories disagree, use the highest valid semantic version present in any selected source repository and report the per-repository coverage; do not assume every repository has every tag.
4. Use source-repository tags to discover eligible versions even when those versions have no history, generated note, or published Markdown yet. Compare eligible source tags through the upper bound against existing release-notes history, `artifacts/generated/<tag>.json`, and `published/<tag>.<locale>.md`. Process missing and incomplete versions in semantic version order only when their ranges contain commits inside the one-month window. Create missing history and complete JSON/Markdown outputs; do not limit the run to editing notes that already exist.
5. For each candidate tag, prefer a matching `artifacts/tags/<tag>/<tag>.json` in release-notes when it is valid and its per-repository ranges agree with the selected source repositories. If history JSON is missing, derive it from the selected repositories' exact Git tag ranges, not HEAD. Use each source repo's previous valid version tag as the range start and the candidate tag as the end; if there is no previous valid version tag, use the candidate tag itself as the range and set `fromTag` to null. For the matching release-notes `repos/hagicode-core` and `repos/web` submodules, the existing `scripts/tag-grouped-history.mjs` exporter may be used with `--no-unreleased` and a temporary output directory; only do so after verifying the selected paths resolve to those submodules. For other selected source repositories, collect commits from their own Git history. Do not use another repository's range as a substitute.
6. For existing history, inspect each `repositories.<repo>.group.fromTag`, `toTag`, and `range` against that repository's verified source tags. Before creating missing history files, inspect any existing `artifacts/tags/<tag>/` content. Preserve existing files; if existing history conflicts with ranges derived from the selected source tags, report the conflict and do not overwrite it. With release-notes `write` access, create only missing `artifacts/tags/<tag>/<tag>.json` and optional companion Markdown. Follow the established history schema: `{ generatedAt, formatVersion, tag, repositories }`; each repository entry has its path and a group with `repo`, `key`, `label`, `fromTag`, `toTag`, `range`, and commits (`hash`, `shortHash`, `date`, `author`, `subject`). The tag and range endpoints must match verified source refs. The history file may retain the full tag range, but release-note decisions may use only commits inside the one-month window; do not inspect older commit details to draft notes.
7. Treat valid existing or newly derived history JSON as authoritative change evidence; matching history Markdown is supplementary and never overrides JSON. If source tags or Git history cannot substantiate a range, report that tag as blocked and do not invent changes or silently skip it.
8. For every candidate tag and selected source repository that has that tag, use its own verified range and report repositories without matching tag coverage. Ranges may differ between repositories.
9. Create missing release-note JSON and locale Markdown from only verified, in-window commits. Compare existing files first, skip identical content, and preserve conflicts unless replacement was explicitly requested.
10. If no valid source tag is available, report a blocker and stop without writing. Never substitute HEAD, an unreleased tag, or a guessed version.

## Evidence and release-note content

- Compare each candidate history against both existing generated JSON and published Markdown. Identify only missing, supported user-visible improvements and fixes from in-window commits; consolidate related changes and omit internal-only changes unless evidence shows a user impact. Do not use older commits to fill gaps in existing notes.
- Treat history JSON as evidence, not copy. Do not turn raw commit subjects, hashes, or chronological logs into release notes. Do not infer features, impact, fixes, release dates, or compatibility claims unsupported by source.
- If evidence is missing, ambiguous, or contradictory, omit the unsupported claim and report the tag, repository/range, and evidence gap. Never invent a change to fill a locale or section.
- Follow the current release-notes `hagi18n.yaml` locale set. Use the output locale keys used by the reference release-note payload (`en`, `zh-CN`, `zh-Hant`, `ja-JP`, `ko-KR`, `de-DE`, `fr-FR`, `es-ES`, `pt-BR`, `ru-RU`); verify the current checkout before execution rather than assuming this list is unchanged.
- For each locale, use `locales.<locale>.title` and ordered `sections: [{ "heading": string, "items": string[] }]`. Translate faithfully; every item is one concise sentence describing one supported user-visible change. Use the localized product-improvement section first and fixes second when applicable, with other headings only when they improve clarity. Do not put multiple languages in one locale.
- Markdown for each locale starts with `# HagiCode <tag>`, then applicable `##` sections in the same order and flat one-sentence bullets matching its JSON locale entry. Do not add nested bullets or raw-history details.
- A missing required locale or unsupported translation makes that version incomplete. Report locale completeness; do not call an incomplete version Docs-ready.

## Docs compatibility and synchronization

Read the selected Docs checkout's current release-notes route, sync implementation, and anchor normalization before checking links. The existing presentation is a localized landing page, not one page per version: Simplified Chinese uses `/release-notes/`, English uses `/en-US/release-notes/`, and other locales use `/<locale>/release-notes/`. Version links target that locale's landing route plus the canonical normalized version anchor (lowercase, one leading `v`, e.g. `v1.2.3`).

When the release-notes source and Docs checkout are available, update Docs through its existing synchronization workflow, sourcing the selected release-notes checkout:

`npm --prefix <docs-root> run release-notes:sync -- --source local --local-repo-root <release-notes-root>`

Run it against the selected Docs root. Before running it, check the Docs worktree for local changes in the script-managed release-notes output paths; if any exist, stop and report the conflict rather than allowing the sync to replace them. Do not manually edit generated Docs indexes, detail JSON, landing routes, rendered HTML, or create per-version pages. If current route, locale, anchor, section, or link conventions cannot be verified, report a compatibility blocker and do not claim Docs readiness.

Run the sync only when the release-notes source and Docs checkout are both selected with valid paths, release-notes has `write` access, Docs has `write` access, and release-notes has complete published Markdown for every required locale for each version being synchronized. Otherwise report which sync prerequisite is unavailable and continue only with operations allowed by the selected scope. If required source files are incomplete, report that Docs sync is blocked; do not create fallback Docs data.

## Output and write boundary

Create missing release-note history and output files only in the selected release-notes repository, and only when its resolved access mode is `write`:

- `artifacts/tags/<tag>/<tag>.json` (and optional matching `.md`) only when missing and safely derived from selected source-repository tags
- `artifacts/generated/<tag>.json`
- `published/<tag>.<locale>.md`

The generated JSON has a top-level `tag` and `locales` object; each required locale contains `title` and ordered `sections`, each with `heading` and flat `items`. Markdown follows the matching locale content and heading order.

Before writing, compare each intended release-notes path with existing content. If content already matches, skip it and report it. If an existing file differs, preserve it unchanged and report a conflict unless the user explicitly requested replacement. Never rewrite existing tag-history files. Do not write arbitrary Docs files; update only through the documented sync workflow and only with Docs `write` access. Do not publish a release, commit, or push.

## Final report

Report the request summary; the UTC cutoff and task-start time; chosen upper bound and source repositories that establish it; candidate tags found in each selected application repository; each processed, skipped, newly created, and blocked tag; per-repository source ranges and in-window commits; release-notes files created, updated, identical/skipped, and conflicting; Docs synchronization status and changed managed paths; locale completeness; route/anchor/link compatibility; and unresolved or missing evidence. State that the release was not published.
