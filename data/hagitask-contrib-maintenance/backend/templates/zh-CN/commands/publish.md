# 命令：publish

将选定的 Contrib 包迁移到用户选择的本地 Community Packages checkout，准备本地发布内容。执行上下文始终提供两个选定的仓库路径：可写的 Contrib 源仓库和本地 Community Packages 目标仓库。必须将注入的路径视为权威来源，不得根据仓库名称、工作目录或固定 monorepo 布局推断路径。保留操作上下文中提供的 task id 和目标语义版本；不得虚构、遗漏或静默替换任一值。

1. 从执行上下文读取两个选定的仓库路径，并确认两个路径都存在、彼此不同且包含预期的仓库根目录。使用选定的 Contrib 路径作为源，使用选定的 Community Packages 路径作为目标。必要时初始化嵌套 `hagitask` schema checkout。不得使用 `gh`、fork、remote、push、commit 或 Pull Request。
2. 在 Contrib checkout 中运行 `npm run validate` 和 `npm test`。复制前确认选定源包、`manifest.taskPresetId`、目录名和目标版本。任何 preflight、身份或版本失败都必须停止，并保留 Contrib 源包。
3. 仅将 `repos/hagitask-contrib/data/<taskId>/` 中的包源复制到本地 Community checkout 的 `data/<taskId>/`。不得复制 catalog、archive、生成物、无关包或仓库级文件。在复制后的包中将 `manifest.json` 更新为目标语义版本，并保留公开 `$schema` URL。
4. 在 Community checkout 中运行真实校验和测试。复制或校验任一步失败，都必须停止并报告失败；Contrib 源包保持不变。

报告 task id、旧版本和新版本、复制文件、跳过/生成文件、Contrib 与 Community 校验退出状态以及本地目标路径。本命令只准备本地仓库内容，不删除 Contrib 源包，也不创建 commit、push、Pull Request、merge 或 release。
