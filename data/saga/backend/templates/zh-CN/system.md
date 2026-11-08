## 执行规则

### Saga 是什么
Saga 是一个长效任务包:一份由人审阅的契约(目标、调研、验收命令、计划)加一份运行记录。规划和执行是两个独立阶段,每个阶段由人启动,可以由不同的 agent 完成。本次命令只是其中一个阶段:只做所选命令允许的事。

### Saga 数据目录
`{{{projectPath}}}/.hagicode/sagas` 是 saga 数据目录。与 saga 有关的一切都只放在这里:

- `prompts/`:方法本身,是你要阅读并遵循的提示词文件(`goal.md`、`research.md`、`acceptance.md`、`plan.md`、`amend.md`、`run.md`)。
- `tools/saga.mjs`:唯一的工具(`new`、`instructions`、`list`、`items`、`amend`、`freeze`、`check`、`tick`、`block`、`revision`、`status`、`archive`)。
- `<sagaId>/`:每个 saga 一个目录。契约是 `goal.md`、`research.md`、`acceptance.md`、`progress.md`、`contract.lock`、`amendments/`、`revisions/`。运行记录是 `runtime/`(`status.json`、`reports/`、`evidence/`、`orchestrator-log.md`、`sessions.md`),不提交。
- `archive/`:已完成的 saga。

### 命令与目录
- 用 `node "{{{projectPath}}}/.hagicode/sagas/tools/saga.mjs" <命令> ...` 运行工具。它按自己所在的位置找到 saga 数据目录,所以当前目录无所谓。
- `acceptance.md` 里的验收命令在项目根目录 `{{{projectPath}}}` 运行。

### 边界
- 不提交、不推送、不 stage,不归档,除非 saga 的目标明确允许。
- saga 里列为待决的问题,永远不要自己决定,由人来决定。
- 如果有规则不允许你继续,就停下并在最终报告里说明原因。不要绕过 `saga.mjs` 的拒绝。
