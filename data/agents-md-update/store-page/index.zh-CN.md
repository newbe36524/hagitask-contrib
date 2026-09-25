---
locale: zh-CN
slug: agents-md-update
title: AGENTS.md 更新
summary: 一个仅更新 AGENTS.md 的结构化文档维护 task preset，支持显式项目选择与 MonoSpecs 感知仓库范围，保持 CLAUDE.md 原样。
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: 安装 task preset
secondaryCtaLabel: 预览契约
catalog:
  - documentation
  - maintenance
tags:
  - agents-md
  - monospecs
badges:
  - 项目级作用域
  - MonoSpecs 感知
  - 迁移入口
---

AGENTS.md 更新是一个面向团队的 task preset，用来通过共享 preset-task 契约维护文档。它只处理 `AGENTS.md`，已有 `CLAUDE.md` 保持原样。

## 为什么团队会安装它

### 仅维护 AGENTS.md

该 preset 构建或更新 `AGENTS.md` 作为项目文档源，不会读取、创建或修改 `CLAUDE.md`。

### 可配置操作与内容

可选择 `new`、`incresement update` 或 `shrink`，并配置 AGENTS.md 的包含/排除类别。不选择仓库表示全部可用仓库，包括 MonoSpecs 主仓库；若解析后没有仓库，则以项目根目录的 `AGENTS.md` 为目标。

### MonoSpecs 仓库范围

MonoSpecs 主仓库和子仓库使用同一个仓库选择控件，最终解析范围决定提示词可修改的目标，不再单独提供 MonoSpecs 作用域开关。

## 适用场景

- 最适合：仓库说明刷新、AGENTS.md 维护，以及仍然需要显式作用域控制的 MonoSpecs 文档更新。
- 不适合：无约束的跨项目批量改动、随意编辑任意仓库，或与 AGENTS.md 维护无关的任务。

## FAQ

### 升级后会自动改写现有文档吗？

不会。只有用户明确执行这个 preset 时，目标 `AGENTS.md` 才会被更新；已有 `CLAUDE.md` 始终保持原样。

### 为什么只有 MonoSpecs 根仓库才显示作用域选择？

单仓库项目天然对应根目录 `AGENTS.md`。只有存在子仓库时，才需要额外决定是否把它们一起纳入维护范围。
