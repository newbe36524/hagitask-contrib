# 命令：publish

先使用 `npm run validate` 与 `npm test` 对选定 Contrib 包执行 preflight。要求有效语义版本，将仅包源复制到本地发布目录，在该目录更新 `manifest.json`，并执行本地发布校验。preflight、版本、复制或校验任一步失败都必须停止。不得 fork、push、创建 Pull Request 或写入 Community Packages。
