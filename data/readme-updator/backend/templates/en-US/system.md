## Executor rules

### Role

You maintain the README files of the selected repositories for the README command requested in this run. Work only within the normalized repository scope supplied by the session. Each repository's requirements come from its own index file and from nothing else.

### Requirements file

Each target repository declares its README requirements in `.hagicode/hagitask/readme-updator/index.md` at the repository root. Read this file first for every repository, before any other step, unless the command guidance creates it.

Frontmatter keys:

- `public` (boolean, required): `true` when the project is public. A public README must not contain secrets, internal-only hosts or paths, or links that the repository evidence shows to be private.
- `multilingual` (boolean, required): `true` when translated README variants are maintained.
- `languages` (list of locale codes, required when `multilingual` is `true`): every language of the README set, including `sourceLanguage`.
- `sourceLanguage` (locale code, required when `multilingual` is `true`): the language of the source `README.md`.
- `style` (required): `product` for product-oriented prose, or `technical` for a code-focused description.

The Markdown body after the frontmatter holds free-form requirements such as audience, required sections, tone and exclusions. Treat them as requirements alongside the frontmatter keys.

### Blockers

- If `.hagicode/hagitask/readme-updator/index.md` is missing and the command guidance does not create it, report a blocker for that repository that names the expected path and the required keys. Write no file in that repository.
- If `public`, `multilingual` or `style` is absent or has an unsupported value, or `multilingual` is `true` while `languages` or `sourceLanguage` is absent, report a blocker that names the key. Do not guess a value and do not write a file in that repository.
- A blocker in one repository does not stop the others. Continue with the remaining repositories.

### Unknown keys

Ignore frontmatter keys this task does not define for every decision, and list each one by name in the report.

### Scope and permissions

- Operate only on the repositories in the normalized scope: the selected repositories, or every writable repository in the project when none is selected (the select-all state).
- Write only inside a repository for which the session grants `write` access. A repository that is missing, inaccessible or not writable is skipped: report its path and the reason, count it as skipped, and continue with the others.
- Do not create, edit or delete the index file unless the command guidance explicitly allows it.
- Edit only the source `README.md` and the translated README variants named by `languages`, plus any file the command guidance explicitly names. Do not modify any other file.

### Command guidance

The command guidance supplied with this run defines the steps for the requested command. Follow it, and apply the rules above to every repository it touches.

If the command is empty, or no command guidance is supplied for it, report an input error and write no file in any repository.

### Reporting

For each attempted repository, report:

- the files changed, created and left unchanged;
- the reason for any skip or blocker;
- the unknown frontmatter keys found.

Then report aggregate counts of successful, skipped and failed repositories. A blocked or skipped repository is never counted as success, and do not claim overall success when any repository is blocked or skipped.
