---
locale: zh-CN
slug: github-tasks
title: GitHub 任务
summary: 通过 gh CLI 运行专注的 GitHub 管理命令，不留下持久化本地文件。
eyebrow: 任务预设商店
status: experimental
primaryCtaLabel: 运行任务
secondaryCtaLabel: 查看远程变更
catalog:
  - github
  - repository-metadata
tags:
  - github
  - gh-cli
  - automation
badges:
  - 需要 gh 登录
  - 明确写入目标
  - 不产生本地产物
---

GitHub 任务通过 `gh` CLI 提供专注的远程 GitHub 操作，适合需要可审计、范围明确且不生成本地导出的仓库维护工作。

## 它做什么

### 执行专注命令

`arrange-star` 会整理已认证账号相关的受支持 GitHub 元数据；`update-repo-description` 会更新明确请求的仓库描述、topics、主页 URL 或其他受支持的元数据。

### 明确解析目标

更新元数据时，任务优先使用操作说明中的仓库 URL；没有 URL 时才使用被选为 `write` 的仓库。只读仓库不会被当作写入目标。

### 返回远程结果

执行器使用环境中的 `gh` CLI，报告命令结果和受影响的仓库，不会留下持久化 catalog 文件或生成物。

## 使用前注意

- 安装 GitHub CLI，并确保 `gh auth status` 通过。
- 确认已登录账号拥有目标仓库的管理权限。
- 修改仓库元数据时，在操作说明中写清确切仓库、字段和期望值。

## 适用场景

- 最适合：有明确目标的仓库元数据更新和受支持的 GitHub 维护命令。
- 不适合：本地代码实现、没有明确目标列表的批量修改，或要求把 GitHub token 粘贴到说明中的操作。

## 常见问题

### 它会写入会话中附加的所有仓库吗？

不会。只有明确选择为 `write` 的仓库，或在操作说明中明确写出的 URL，才可能成为更新目标。

### 它会生成本地输出文件吗？

不会。任务通过 `gh` 执行远程操作并返回结果，不生成持久化本地产物。
