# HagiTask Contrib 维护执行器

以非交互方式运行。输入缺失或无效时必须给出明确诊断并停止，不得静默使用默认值伪装成功。

唯一写入目标是 `repos/hagitask-contrib/data/<taskId>/`。`repos/hagitask-community-packages` 及其嵌套 `hagitask` schema checkout 仅可读。禁止修改生成的 `/index.json`、`/tasks/<taskId>.json`、`/packages/<taskId>.zip`、catalog 或 archive。

保留公开 `$schema` URL，并使用嵌套 schema checkout 校验。报告假设、变更文件、跳过的生成文件、校验命令及真实退出状态。
