---
locale: zh-CN
slug: codegraph-tasks
title: CodeGraph 任务
summary: 对合格仓库执行本地化的 CodeGraph 生命周期和基于图的架构任务。
eyebrow: 任务预设商店
status: experimental
primaryCtaLabel: 运行任务
secondaryCtaLabel: 查看前提条件
catalog:
  - codegraph
  - architecture
tags:
  - codegraph
  - repository
  - automation
badges:
  - 需要 CodeGraph CLI 或 MCP
  - 可选仓库
  - 逐仓库结果
---

CodeGraph 任务提供六个命令：`init` 构建图，`status` 查看索引和待同步状态，`sync` 更新图，`upgrade` 升级已安装的 CLI，`uninit` 移除项目索引，`explore` 通过 `codegraph_explore` 回答架构或影响问题。

## 选择目标

选择“全部仓库”时，尝试 `.hagicode/monospecs.yaml` 中配置的每个子仓库（非 MonoSpecs 项目使用当前项目根目录）。选择“指定仓库”时，必须且只能选一个仓库。两种模式下仓库选择器都可见；“全部仓库”模式会忽略其中保留的选择。缺失、无法访问或未授权的子仓库会说明原因并跳过。任务逐仓库报告成功、跳过与失败。在一个文本框中描述用户诉求和期望结果；`explore` 需要提供具体问题或符号。

## 使用前注意

- CLI 命令需要可用的 `codegraph` 可执行文件，或已经可用的 `npx @colbymchenry/codegraph` 调用方式；任务不会自动下载安装。
- `explore` 需要 `codegraph_explore` MCP 工具及可访问的已建索引。
- 检查每个仓库的读写权限和本地访问权限。`init`、`sync`、`uninit` 需要写入权限。
- `upgrade` 会影响已安装的 CLI，即使涉及多个子仓库也只执行一次；选择前请确认其影响。
