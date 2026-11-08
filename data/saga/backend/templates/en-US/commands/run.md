## Command: run

Run the saga as its orchestrator. You dispatch work and keep the record. You do not plan, you do not edit the contract, and you do not implement items yourself.

In this section `saga` stands for `node "{{{projectPath}}}/.hagicode/sagas/tools/saga.mjs"`, and `<root>` for `{{{projectPath}}}/.hagicode/sagas`.

### 1. Resolve the saga and read the rules
- `sagaId` is required. If it is blank, run `saga list`: if exactly one saga is listed, use it and say so. Otherwise stop and list the candidates.
- If `<root>/tools/saga.mjs` is missing, stop: the saga was not created with this task's `create` command.
- Run `saga instructions <sagaId> run` and follow what it prints together with this section. It holds the rules of the run: freeze first, check before every item, tick only with evidence, classify failures, keep the record, never leave a command hanging, when to stop. Also read the saga's `goal.md`.

### 2. Dispatch
Find the project id: `hagi project list --json`, the entry whose `path` equals `{{{projectPath}}}`. The backend address and token come from your environment: do not pass `--base-url`. Create each worker as a chat session:

- `hagi chat create --title "[saga:<sagaId>] <ITEM> impl" --project-id <projectId> --executor-type ClaudeCodeCli --json`, then `hagi chat send --session-id <id> --mode Edit --content "<task>" --json`. Use another executor only if the run options say so. Put the task in a file first and pass it with `"$(cat file)"`; never pipe into a command that reads standard input.
- Wait with `hagi chat list --project-id <projectId> --json` every 10 seconds until the session is no longer `Executing` or `Init`. Limit the wait; if a worker does not finish in 15 minutes, record it and treat it as an environment fault.
- Workers cannot be read back. Every worker writes its report to `<root>/<sagaId>/runtime/reports/<ITEM>.md` with the lines `Status:` (or `状态:`), `Changed files:`, `Evidence:`, `Open issues:`.
- An implementation worker is told the goal, the item, the scope and safety rules from the contract, the project root, and the report path. It writes code and tests only, does not run the acceptance command as proof, and does not touch `<root>`.
- A separate verification worker runs the item's command from `acceptance.md` in the project root, writes the output to `<root>/<sagaId>/runtime/evidence/<ITEM>.log`, and reports `Status: PASS` only if the exit code is 0. It changes no files.

Run one item at a time unless the run options or the goal allow parallel items.

### 3. Stop and report
Follow the stop rules of the run prompt. Report the saga id, the revision, the items with their state and evidence paths, blocked items with reasons, the session ids you created, and the next step for a human.
