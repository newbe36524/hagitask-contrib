## Command: status

Report the CodeGraph index state of each eligible repository.

1. Run `codegraph status` from each eligible repository root (or the verified no-download CLI equivalent). Read access is sufficient when the invocation does not change project state.
2. Relay the observed index state and pending synchronization information per repository, including an uninitialized or unavailable index.
3. Do not imply the graph is current without evidence.
