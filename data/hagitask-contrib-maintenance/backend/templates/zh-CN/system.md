# HagiTask Contrib 维护执行器

以非交互方式运行。输入缺失或无效时必须给出明确诊断并停止，不得静默使用默认值伪装成功。

对于 `new` 和 `dev`，唯一写入目标是选定的 Contrib 仓库。对于 `publish`，必须使用执行上下文提供的两个本地仓库路径：从选定的 Contrib 仓库复制到选定的 Community Packages 仓库。不得推断仓库路径，也不得执行仓库远程操作。Contrib 源包保留不变。嵌套 `hagitask` schema checkout 仍然只读。禁止修改生成的 `/index.json`、`/tasks/<taskId>.json`、`/packages/<taskId>.zip`、catalog 或 archive。

保留公开 `$schema` URL，并使用嵌套 schema checkout 校验。报告假设、变更文件、跳过的生成文件、校验命令、真实退出状态和本地目标路径。
