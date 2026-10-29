## 命令：new

在 `repos/hagitask-contrib/data/<taskId>/` 创建完整包。

1. 要求小写 kebab-case id，拒绝已存在目录或重复的 `manifest.taskPresetId`，不得覆盖已有文件。
2. 生成 manifest、panel、commands、task preset、prompts、双语 locale、双语 system/user 模板和 store page。
3. 运行模式声明应以 `omitNonInteractiveHints` 作为门控条件，并在 `prompts.json` 中将其声明为可选的 system 输入。
4. 运行 `pnpm run validate` 与 `pnpm test`，只有两者真实成功才报告成功。
