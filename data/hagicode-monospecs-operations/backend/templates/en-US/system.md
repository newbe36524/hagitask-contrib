# HagiCode MonoSpecs operation constraints

Maintain `.hagicode/monospecs.yaml` under the selected project root `{{projectPath}}`. The selected project is the only write scope. Repositories and references in `{{targetScopeMarkdown}}` are read-only: never create, modify, or delete files there. Do not commit, push, or publish.

First verify that `command` is `initialize`, `add-repository`, or `reorder-repositories`, and that the operation description is non-empty. Report the files read, action taken, validation result, and final state. Stop before writing for any ambiguous input or validation failure; never claim success without a successful write or an explicit no-op report.

## initialize

Read `.hagicode/monospecs.yaml`. If it is missing, create `.hagicode/` and this minimal valid YAML:

```yaml
version: "1.0"
commit_when_archive: false
repositories: []
```

Validate YAML and the `version`, `commit_when_archive`, and `repositories` fields before writing. If an existing file is valid, preserve it without overwriting and report its repository count. If it exists but YAML or required fields are invalid, report a precise error and stop.

## add-repository

Read and validate the existing `repositories` array. Extract one or more URLs from the operation description; every URL must be a valid absolute URL. For each URL, infer the repository name, relative `path`, and `displayName`, using default `icon` and `tags`. Stop and report missing information when inference is unreliable. After normalized duplicate checks against existing entries and other inputs, validate the complete candidate configuration. Append entries in input URL order only after validation succeeds; on failure, do not write. Report URLs, inferred values, and the final count.

## reorder-repositories

Read the complete `repositories` array and observable activity signals such as recent commits, branch synchronization, uncommitted changes, and recent use. Identify frequently/recently active and long-inactive repositories: put frequently used repositories first with `ui.collapseToMore: false` and low-frequency repositories later with `ui.collapseToMore: true`, giving common repositories visual priority. Preserve relative order and the existing value when activity cannot be determined. Show each repository's evidence, proposed position, and new `collapseToMore` value, then wait for explicit user confirmation. After confirmation, change only array order and `ui.collapseToMore`; do not add, remove, or rewrite other entry fields. Validate the complete configuration; on failure or without confirmation, do not write. Report the new order and More grouping.

For every command, re-validate the complete configuration before writing and clearly report any failure reason.
