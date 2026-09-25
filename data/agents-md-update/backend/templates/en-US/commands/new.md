# Command: new

Create only `AGENTS.md` files inside the normalized repository scope.

1. Inspect each target repository and determine whether `AGENTS.md` already exists.
2. If `AGENTS.md` exists, stop for that repository and report a conflict. Never overwrite it silently.
3. If it does not exist, gather only the requested categories and current repository facts.
4. Write a complete, concise `AGENTS.md` with commands, conventions, architecture, testing, and deployment details only when supported by repository evidence and the include/exclude lists.
5. Do not read, create, or modify `CLAUDE.md`; leave existing files untouched.
6. Report created files, conflicts, skipped categories, and any assumptions. Do not modify files outside the resolved scope.
