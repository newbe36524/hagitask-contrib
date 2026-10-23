## Command: update

Refresh each repository's source `README.md` so that it matches the repository's index file and the repository's own evidence. Change only what deviates.

1. Read `.hagicode/hagitask/readme-updator/index.md` and check its keys as the system prompt requires. On a blocker, stop for that repository, write nothing there, and continue with the others.
2. Read the source `README.md`. If it does not exist, report a blocker for that repository: this command refreshes an existing README and does not create one.
3. Collect the repository facts the README depends on, such as purpose, commands, configuration, paths and links, from the repository's own files. Do not describe features the repository does not show.
4. Compare the README with the index requirements (required sections, audience, tone, exclusions) and with the collected facts:
   - `style: product`: describe value, audience and usage in product language, and keep internal implementation detail out of the main description.
   - `style: technical`: describe architecture, commands and conventions grounded in the repository's code and configuration.
5. If `public` is `true`, remove or rewrite any secret, internal-only host or path, or link that the repository evidence shows to be private.
6. Change only the sections that deviate from steps 4 and 5. Keep every other line byte-for-byte unchanged.
7. If nothing deviates, leave `README.md` unchanged and report it as unchanged.
8. Do not edit any translated README. If `multilingual` is `true` and `README.md` changed, report that the `translate` command is needed to bring the translated variants in line.
9. Report per repository the changed or unchanged `README.md`, any blocker, and the counts, following the reporting rules in the system prompt.
