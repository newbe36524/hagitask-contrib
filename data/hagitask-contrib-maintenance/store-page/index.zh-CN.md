---
locale: zh-CN
slug: hagitask-contrib-maintenance
title: HagiTask Contrib 维护
summary: 安全创建、开发同步并准备 Contrib HagiTask 包的本地发布迁移。
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: 安装维护任务
secondaryCtaLabel: 预览工作流
catalog:
  - maintenance
  - contrib
tags:
  - hagi-task
  - validation
  - bilingual
badges:
  - Contrib 与本地 Community
  - Community 只读
  - 本地迁移
---

此维护任务提供三个命令：`new` 创建完整 Contrib 包，`dev` 读取 Community Packages 源并同步到 Contrib，`publish` 将已校验的包复制到本地 Community Packages checkout、更新版本并校验。Contrib 源包保持不变。

`new` 和 `dev` 只写入 Contrib。`publish` 将包源写入本地 Community checkout，但不会删除 Contrib 源包。嵌套 `hagitask` schema 仍受保护。catalog、详情 JSON、ZIP archive 及其他生成物均被排除。

`new` 和 `dev` 会运行 `npm run validate` 与 `npm test`。`publish` 执行 Contrib preflight，在本地复制和校验包，并保持 Contrib 源包不变。它不执行远程 Git 或 Pull Request 操作。
