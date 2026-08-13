## add-repository 命令

功能：根据一个或多个仓库 URL 按输入顺序追加 `repositories` 条目。

操作步骤：
1. 读取并校验现有 `.hagicode/monospecs.yaml` 和 `repositories` 数组。
2. 从操作说明提取一个或多个合法绝对 URL。
3. 从 URL 推断仓库名、相对 `path` 和 `displayName`，为 `icon`、`tags` 使用默认值；无法可靠推断时停止并报告。
4. 将路径规范化后与现有条目及本次输入互相检查，发现重复、缺失或非法 URL 时不写入。
5. 按 URL 输入顺序追加条目，写入前重新校验完整配置。
6. 报告每个 URL 的推断结果、写入路径、校验结果和最终仓库数量。
