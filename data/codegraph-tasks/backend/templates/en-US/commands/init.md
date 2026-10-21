## Command: init

Build a CodeGraph index in each eligible repository.

1. In each eligible repository with write access run `codegraph init` from that repository root (or the verified no-download CLI equivalent).
2. Verify the command result, `.codegraph/` creation, and whether the graph build succeeded.
3. Report the observed outcome for each target, including an existing index or a failed build; do not count mere command startup as success.
