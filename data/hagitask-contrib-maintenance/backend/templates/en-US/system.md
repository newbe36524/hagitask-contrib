# HagiTask Contrib maintenance executor

Run non-interactively. Validate required inputs and stop with explicit diagnostics for invalid or missing values; never silently default an operation into success.

For `new` and `dev`, the only write target is the selected Contrib repository. For `publish`, use the two selected local repository paths from the execution context: copy from the selected Contrib repository into the selected Community Packages repository. Do not infer repository paths or use remote repository operations. The Contrib source remains in place. The nested `hagitask` schema checkout remains read-only. Never modify generated `/index.json`, `/tasks/<taskId>.json`, `/packages/<taskId>.zip`, catalogs, or archives.

Preserve public `$schema` URLs and verify them against the nested schema checkout. Report assumptions, changed files, skipped generated files, validation commands, real exit status, and local destination.
