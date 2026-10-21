## Command: dev

Synchronize a source package from the Community Packages checkout into Contrib.

1. Read `repos/hagitask-community-packages/data/<sourceTaskId>/` as a read-only source.
2. Require its manifest, and compare all source files before writing.
3. Stop on a missing source or unresolved local differences unless overwrite is explicit.
4. Synchronize the complete relative package atomically through a temporary directory, excluding catalogs and archives.
5. Report added, modified, deleted, conflicted, and skipped files, then run Contrib validation and tests.
