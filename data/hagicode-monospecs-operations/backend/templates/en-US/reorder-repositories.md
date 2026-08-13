## reorder-repositories command

Purpose: organize the existing repository order from observable activity signals and use `ui.collapseToMore` so frequently used repositories stay visible while low-frequency repositories go into More.

Steps:
1. Read the complete `repositories` array.
2. Check recent commits, current branch synchronization, uncommitted changes, and recent-use records.
3. Put frequently or recently active repositories first with `ui.collapseToMore: false`; put long-inactive repositories later with `ui.collapseToMore: true` so common repositories receive visual priority. When activity cannot be determined, preserve relative order and the existing `collapseToMore` value.
4. Produce a preview with evidence, proposed positions, and new `collapseToMore` values, then wait for explicit user confirmation.
5. After confirmation, change only the `repositories` array order and each entry's `ui.collapseToMore`; do not add, remove, or rewrite other repository fields.
6. Validate the complete document. Without confirmation or after validation failure, do not write; report the reason, final order, and More grouping.
