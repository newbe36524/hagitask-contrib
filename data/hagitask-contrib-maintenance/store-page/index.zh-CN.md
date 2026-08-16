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

## 它做什么

### 创建并校验新包

`new` 会在 Contrib 中创建统一的 manifest、前端、后端、locale 和商场页面结构，要求使用小写 kebab-case task ID，并通过仓库真实的校验和测试命令。

### 同步开发源

`dev` 从选定的 Community Packages 源读取并复制到 Contrib 供开发使用。Community 源始终只读；发现本地差异时必须明确处理冲突，不能静默覆盖。

### 准备本地发布迁移

`publish` 执行 Contrib preflight，只把任务源文件复制到本地 Community Packages checkout，更新指定的语义化版本并校验目标。它不会推送、创建 Pull Request，也不会删除 Contrib 源包。

## 使用前注意

- 确保 Contrib checkout 与本地 Community Packages checkout 是两个不同的仓库根目录。
- 使用小写 kebab-case task ID，并在发布时提供有效的语义化版本。
- 将嵌套 schema、catalog、详情 JSON、ZIP archive 和其他生成物视为受保护内容。

## 写入边界

`new` 和 `dev` 只写入 Contrib；只有 `publish` 会写入本地 Community checkout，并且会保留 Contrib 源包。任何 preflight、身份、复制、校验或测试失败都会停止流程，不会报告成功。

`new` 和 `dev` 会运行 `npm run validate` 与 `npm test`。`publish` 执行 Contrib preflight，在本地复制和校验包，并保持 Contrib 源包不变。它不执行远程 Git 或 Pull Request 操作。

## 适用场景

- 最适合：在本地推广到 Community 前安全开发和维护任务包。
- 不适合：远程发布、编辑站点生成物，或绕过包校验。
