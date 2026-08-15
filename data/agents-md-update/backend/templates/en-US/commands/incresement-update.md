# Command: incresement update

Update existing documentation incrementally, preserving valid guidance and changing only what current repository evidence requires.

1. Read every target repository's existing `AGENTS.md` before editing.
2. Compare the documented commands, architecture, conventions, testing, deployment, and other requested categories with the current repository.
3. Add missing guidance and update stale or changed guidance only when supported by current files and configuration.
4. Preserve valid wording and structure where possible; do not rewrite the document wholesale or remove information merely because it was not inspected.
5. When `includeClaudeMd` is true, update only the minimal redirect in `CLAUDE.md`; never place substantive content there.
6. When `includeClaudeMd` is false, do not read, create, or modify `CLAUDE.md`.
7. Report added, updated, preserved, and skipped content, plus any assumptions. Keep all changes inside the resolved scope.
