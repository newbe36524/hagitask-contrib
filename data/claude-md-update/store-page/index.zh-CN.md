---
locale: zh-CN
slug: claude-md-update
title: AGENTS.md / CLAUDE.md 更新
summary: 一个结构化文档维护 task preset，以 AGENTS.md 为主要数据源，CLAUDE.md 保持为极简重定向，通过显式项目选择与 MonoSpecs 感知作用域管理。
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: 安装 task preset
secondaryCtaLabel: 预览契约
catalog:
  - documentation
  - maintenance
tags:
  - claude-md
  - agents-md
  - monospecs
badges:
  - 项目级作用域
  - MonoSpecs 感知
  - 迁移入口
---

AGENTS.md / CLAUDE.md 更新是一个面向团队的 task preset，用来把文档维护工作从旧的 prompt 快捷入口迁移到共享 preset-task 契约中。它以 `AGENTS.md` 为唯一事实来源，`CLAUDE.md` 保持为极简重定向。

## 为什么团队会安装它

### AGENTS 优先架构

该 preset 构建或更新 `AGENTS.md` 作为全面的项目文档源，然后写入一个精简的 `CLAUDE.md` 重定向到 `AGENTS.md`。

### 理解 MonoSpecs 作用域

当所选项目是 MonoSpecs 根仓库时，抽屉既可以只更新根目录 `AGENTS.md`/`CLAUDE.md`，也可以扩展到子仓库 `AGENTS.md` / `CLAUDE.md`。

### 平滑替代旧路由

它取代孤立的 `claudeMdUpdate` 旧入口，但在用户显式发起任务前，不会碰现有文档文件。

## 适用场景

- 最适合：仓库说明刷新、AGENTS.md 维护（含 CLAUDE.md 重定向），以及仍然需要显式作用域控制的 MonoSpecs 文档更新。
- 不适合：无约束的跨项目批量改动、随意编辑任意仓库，或与 AGENTS.md / CLAUDE.md 无关的任务。

## FAQ

### 迁移后会自动改写现有 AGENTS.md/CLAUDE.md 吗？

不会。只有用户明确执行这个 preset 时，现有文档才会被更新。

### 为什么只有 MonoSpecs 根仓库才显示作用域选择？

单仓库项目天然对应根目录 `AGENTS.md` + `CLAUDE.md`。只有存在子仓库时，才需要额外决定是否把它们一起纳入维护范围。
