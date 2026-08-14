# Command: dev

Read `repos/hagitask-community-packages/data/<sourceTaskId>/` as a read-only source. Require its manifest, compare all source files before writing, and stop on missing source or unresolved local differences unless overwrite is explicit. Synchronize the complete relative package atomically through a temporary directory, excluding catalogs and archives. Report added, modified, deleted, conflicted, and skipped files, then run Contrib validation and tests.
