## reorder-repositories 命令

功能：根据可观察的活跃信号整理现有仓库顺序，并通过 `ui.collapseToMore` 让常用仓库直接显示、低频仓库收进 More。

操作步骤：
1. 读取完整 `repositories` 数组。
2. 检查近期提交、当前分支同步状态、未提交变更和最近使用记录等信号。
3. 将常用或近期活跃仓库排在前面并设置 `ui.collapseToMore: false`；将长期不活跃仓库排在后面并设置 `ui.collapseToMore: true`，使用户可以优先看到常用仓库。无法判断时保持原有相对顺序和现有 `collapseToMore` 值。
4. 生成包含活跃依据、新位置和新的 `collapseToMore` 值的预览，等待用户明确确认。
5. 确认后只调整 `repositories` 数组顺序和每个条目的 `ui.collapseToMore`；不得新增、删除或改写其他仓库字段。
6. 校验完整配置；未确认或校验失败时不写入，并报告原因、新顺序和 More 分组结果。
