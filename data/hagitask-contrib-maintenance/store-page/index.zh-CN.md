---
locale: zh-CN
slug: hagitask-contrib-maintenance
title: HagiTask Contrib 维护
summary: 安全创建、开发同步并准备 Contrib HagiTask 包的本地发布副本。
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
  - 仅写入 Contrib
  - Community 只读
  - 本地发布
---

此维护任务提供三个命令：`new` 创建完整 Contrib 包，`dev` 读取 Community Packages 源并同步到 Contrib，`publish` 将已校验的包复制到本地发布目录并更新版本。

Contrib 是唯一写入目标。Community Packages 和嵌套 `hagitask` schema 只读。catalog、详情 JSON、ZIP archive 及其他生成物均被排除。

`new` 和 `dev` 会运行 `npm run validate` 与 `npm test`。`publish` 在本地复制、更新版本和发布校验前执行同样的 preflight；它不会 fork、push 或创建 Pull Request。
