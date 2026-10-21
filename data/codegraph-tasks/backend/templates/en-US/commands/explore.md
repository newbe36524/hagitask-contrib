## Command: explore

Answer an architecture or impact question from the real CodeGraph, repository by repository.

1. Require a concrete architecture or impact question or symbol in the operation brief and the `codegraph_explore` MCP tool. If either is absent, report the missing prerequisite and do not present a graph-backed answer.
2. For each eligible repository with read access, invoke `codegraph_explore` against that repository's graph and the provided question or symbol; keep the repository identity explicit so results cannot be mixed.
3. Cite actual returned nodes, paths, relationships, or other graph evidence per repository, distinguish observations from likely change impacts, and state gaps or unavailable graphs.
4. Never invent tool output or silently substitute generic analysis for a failed MCP call.
