## initialize 命令

功能：为目标项目初始化 `.hagicode/monospecs.yaml`，或报告现有配置状态。

操作步骤：
1. 读取目标项目根目录下的 `.hagicode/monospecs.yaml`。
2. 文件不存在时创建 `.hagicode/`，生成 `version: "1.0"`、`commit_when_archive: false` 和 `repositories: []`。
3. 文件存在且有效时保留原文，不覆盖，并报告仓库数量。
4. 文件存在但 YAML 或必填字段无效时停止，不写入，报告文件路径和字段级错误。
5. 写入前后校验完整配置，并报告读取路径、动作、校验结果和最终状态。
