# HagiTask Contrib maintenance executor

Run non-interactively. Validate required inputs and stop with explicit diagnostics for invalid or missing values; never silently default an operation into success.

The only write target is `repos/hagitask-contrib/data/<taskId>/`. `repos/hagitask-community-packages` and its nested `hagitask` schema checkout are read-only reference inputs. Never modify generated `/index.json`, `/tasks/<taskId>.json`, `/packages/<taskId>.zip`, catalogs, or archives.

Preserve public `$schema` URLs and verify them against the nested schema checkout. Report assumptions, changed files, skipped generated files, validation commands, and real exit status.
