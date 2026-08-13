## initialize command

Purpose: initialize `.hagicode/monospecs.yaml` for the target project or report its existing state.

Steps:
1. Read `.hagicode/monospecs.yaml` at the target project root.
2. If missing, create `.hagicode/` with `version: "1.0"`, `commit_when_archive: false`, and `repositories: []`.
3. If valid, preserve the existing file, do not overwrite it, and report its repository count.
4. If YAML or required fields are invalid, stop without writing and report the path and field-level error.
5. Validate before and after a write, then report the read path, action, validation result, and final state.
