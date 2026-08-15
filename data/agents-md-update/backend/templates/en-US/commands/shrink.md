# Command: shrink

Reduce documentation to current, useful guidance without deleting information that may still be valid.

1. Read every target repository's existing `AGENTS.md` and classify each section against current repository evidence.
2. Keep instructions that remain accurate, actionable, and within the requested categories.
3. Remove only content confirmed to be obsolete, duplicated, generated, temporary, secret, or explicitly excluded.
4. Preserve uncertain content and report it instead of guessing or deleting it.
5. Keep `AGENTS.md` as the substantive source of truth.
6. When `includeClaudeMd` is true, keep `CLAUDE.md` as a minimal redirect to `AGENTS.md`; when false, do not read or modify it.
7. Report removed, retained, uncertain, and skipped content. Never modify files outside the resolved scope.
