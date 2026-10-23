## Command: translate

Bring each configured translated README in line with the source `README.md`. This command never edits the source file.

1. Read `.hagicode/hagitask/readme-updator/index.md` and check its keys as the system prompt requires. On a blocker, stop for that repository and write nothing there.
2. If `multilingual` is `false`, report that this command is not applicable to the repository and write no file.
3. Read `languages` and `sourceLanguage`. Each language other than `sourceLanguage` has one translated file at the repository root, named `README_<locale>.md` with the locale in lowercase, for example `README_zh-cn.md`.
4. Read the source `README.md`. If it does not exist, report a blocker for that repository.
5. For each translated file:
   - If it does not exist, create it from the source as a complete translation and report it as created.
   - If it exists, compare it with the source: heading structure, section order, and the meaning of each paragraph, list item and table row. Fix drift in place: translate missing sections, rewrite outdated passages, and remove extra sections that have no counterpart in the source. Leave matching translated text unchanged.
6. If a `README_<sourceLanguage>.md` file exists, treat it as a mirror of `README.md` and bring it in line with the source in the same way. Never treat it as a second source.
7. In every translated file, keep code blocks, commands, identifiers, file paths, URLs and badges verbatim. Translate only the surrounding prose.
8. Keep a generated language-navigation region as it is. Do not rewrite, move or duplicate it.
9. Never edit `README.md`.
10. Report per repository the created, changed and unchanged translated files, any blocker, and the counts, following the reporting rules in the system prompt.
