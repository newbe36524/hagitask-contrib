# 命令：new

在 `repos/hagitask-contrib/data/<taskId>/` 创建完整包。要求小写 kebab-case id，拒绝已存在目录或重复的 `manifest.taskPresetId`，不得覆盖已有文件。生成 manifest、panel、commands、task preset、prompts、双语 locale、双语 system/user 模板和 store page。运行 `npm run validate` 与 `npm test`，只有两者真实成功才报告成功。
