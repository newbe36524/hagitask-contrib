---
locale: zh-CN
slug: hagicode-release-notes-auto-update
title: HagiCode 版本说明自动更新
summary: 根据应用仓库最近 30 天内的内容补齐版本说明，并同步文档站落地页。
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: 安装 task preset
secondaryCtaLabel: 查看契约
catalog:
  - release-notes
  - maintenance
tags:
  - release-notes
  - bilingual
badges:
  - 从应用仓库 tag 发现版本
  - 按权限写入
  - 使用 Docs 现有同步流程
---

HagiCode 版本说明自动更新会从所选应用仓库（例如 web 和后端）发现版本，根据各仓库自身的 tag 范围推导缺失历史，并仅使用任务开始前 30 天内的提交，为截至最新有效 tag 的版本创建有证据支持的说明。任务只接受一条必填自然语言请求，不提供版本字段。

## 功能

- 检查所选应用仓库的 tag，以及 release-notes 中现有历史和说明文件。
- 根据已核实的逐仓库 Git tag 范围创建缺失历史和版本说明；保留并报告冲突的既有历史。
- 以固定的 UTC 时间窗口限制为最近 30 天；窗口内没有提交的版本会跳过，不回溯补齐更早内容。
- 将生成 JSON 和本地化 Markdown 写入 release-notes 中的 `artifacts/generated/<tag>.json` 和 `published/<tag>.<locale>.md`。
- 对照 Docs 核实本地化落地页路由和版本锚点，再通过其现有同步工作流更新受管版本说明视图。
- 跳过内容相同的输出，并保留冲突的版本说明文件，不会覆盖。

## 仓库权限

任务接受传入范围中的仓库，包括额外仓库和只读仓库；不要求固定数量或固定名称。操作需要仓库路径但路径不可用时，该操作会停止；只有解析权限为 write 的仓库才允许写入。HagiTask Contrib 是任务包的安装位置，不是隐式执行目标。

## 限制

本任务不会发布 GitHub Release，也不会创建逐版本 Docs 页面。它只通过 Docs 现有同步工作流更新 Docs，并会报告证据缺口、语言不完整、文件冲突和兼容性阻塞。

任务界面支持英语和简体中文。生成说明必须覆盖 release-notes 仓库当前支持的语言集合；语言不完整时不得报告为可供 Docs 同步。
