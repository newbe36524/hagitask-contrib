---
locale: zh-CN
slug: hagicode-monospecs-operations
title: HagiCode MonoSpecs 操作
summary: 通过结构化任务初始化 MonoSpecs 配置、批量添加仓库并按活跃状态调整仓库顺序。
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: 安装任务预设
secondaryCtaLabel: 查看操作契约
catalog:
  - configuration
  - repositories
tags:
  - monospecs
  - bilingual
  - validation
badges:
  - 只写入选定项目
  - 参考仓库只读
  - 写入前校验
---

HagiCode MonoSpecs 操作提供三个结构化命令：`initialize` 创建缺失的 `.hagicode/monospecs.yaml`，`add-repository` 接收一个或多个绝对 URL 并自动推断仓库元数据，`reorder-repositories` 根据可观察的活跃信号生成排序预览。

任务只写入用户选定的项目。附加仓库是只读参考。添加仓库会检查 URL、推断路径并拒绝重复项；调整顺序必须先展示预览并获得明确确认，且只改变 `repositories` 数组顺序。所有候选配置在写入前都会完整复核，失败时不会写入。
