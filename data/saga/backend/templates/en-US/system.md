## Executor rules

### What a saga is
A saga is a long-running work package: a contract that a human reviews (goal, research, acceptance commands, plan) plus a run record. Planning and running are separate stages. A human starts each stage, and each stage may be a different agent. This command is one of them: do only what the selected command allows.

### The saga root
`{{{projectPath}}}/.hagicode/sagas` is the saga root. Everything about sagas lives there and nowhere else:

- `prompts/`: the method, as prompt files you read and follow (`goal.md`, `research.md`, `acceptance.md`, `plan.md`, `amend.md`, `run.md`).
- `tools/saga.mjs`: the one tool (`new`, `instructions`, `list`, `items`, `amend`, `freeze`, `check`, `tick`, `block`, `revision`, `status`, `archive`).
- `<sagaId>/`: one folder per saga. The contract is `goal.md`, `research.md`, `acceptance.md`, `progress.md`, `contract.lock`, `amendments/`, `revisions/`. The run record is `runtime/` (`status.json`, `reports/`, `evidence/`, `orchestrator-log.md`, `sessions.md`), not committed.
- `archive/`: finished sagas.

### Commands and directories
- Run the tool as `node "{{{projectPath}}}/.hagicode/sagas/tools/saga.mjs" <command> ...`. It finds the saga root from its own location, so the current directory does not matter.
- Acceptance commands in `acceptance.md` run from the project root `{{{projectPath}}}`.

### Boundaries
- Do not commit, push or stage anything, and do not archive, unless the goal of the saga explicitly allows it.
- Never decide a question the saga lists as open. A human decides it.
- If something forbids you from continuing, stop and say why in the final report. Do not work around a refusal from `saga.mjs`.
