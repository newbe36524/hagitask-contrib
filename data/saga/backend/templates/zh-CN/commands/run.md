## 命令:run

作为主控运行这个 saga。你负责派发工作和维护记录。你不做规划,不修改契约,不亲自实现条目。

本节里的 `saga` 指 `node "{{{projectPath}}}/.hagicode/sagas/tools/saga.mjs"`,`<root>` 指 `{{{projectPath}}}/.hagicode/sagas`。

### 1. 确定 saga 并读规则
- `sagaId` 必填。留空时运行 `saga list`:恰好只有一个 saga 就使用它并说明。否则停下并列出候选。
- 如果 `<root>/tools/saga.mjs` 不存在就停下:这个 saga 不是用本任务的 `create` 命令创建的。
- 运行 `saga instructions <sagaId> run`,与本节一起遵循它打印的内容。执行的规则都在里面:先冻结、每项之前先检查、只有带证据才勾选、对失败分类、维护记录、不让命令挂住、何时停止。同时阅读这个 saga 的 `goal.md`。

### 2. 派发
找到项目 id:`hagi project list --json` 里 `path` 等于 `{{{projectPath}}}` 的那一项。后端地址和令牌来自你的环境:不要传 `--base-url`。每个 worker 都创建成一个聊天会话:

- `hagi chat create --title "[saga:<sagaId>] <ITEM> impl" --project-id <projectId> --executor-type ClaudeCodeCli --json`,然后 `hagi chat send --session-id <id> --mode Edit --content "<任务>" --json`。只有执行选项指定了别的执行器才换。任务先写进文件,再用 `"$(cat 文件)"` 传入;不要往会读取标准输入的命令里管道输入。
- 用 `hagi chat list --project-id <projectId> --json` 每 10 秒轮询一次,直到该会话不再是 `Executing` 或 `Init`。要限制等待:worker 15 分钟还没结束就记录下来,按环境故障处理。
- 读不到 worker 的回复。每个 worker 都要把报告写到 `<root>/<sagaId>/runtime/reports/<ITEM>.md`,包含 `状态:`(或 `Status:`)、`改动文件:`、`证据路径:`、`未解决问题:` 这几行。
- 实现 worker 会拿到契约里的目标、该项、范围和安全规则、项目根目录和报告路径。它只写代码和测试,不拿验收命令当证明,也不碰 `<root>`。
- 另一个独立的验证 worker 在项目根目录运行 `acceptance.md` 里该项的命令,把输出写到 `<root>/<sagaId>/runtime/evidence/<ITEM>.log`,只有退出码为 0 时才报告 `状态: PASS`。它不改任何文件。

默认一次只做一项,除非执行选项或目标允许并行。

### 3. 停止并报告
遵循执行提示词里的停止规则。报告 saga id、修订号、各条目的状态和证据路径、阻塞项及原因、你创建的会话 id,以及给人的下一步。
