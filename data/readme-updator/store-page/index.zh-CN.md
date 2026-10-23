---
locale: zh-CN
slug: readme-updator
title: README 工具
summary: 一个按各仓库共享需求文件生成与刷新 README.md、并让翻译版 README 与源文件保持一致的 task preset，提供 init、update 和 translate 命令。
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: 安装 task preset
secondaryCtaLabel: 预览契约
catalog:
  - documentation
  - maintenance
tags:
  - readme
  - translation
  - repository-docs
badges:
  - 仓库级作用域
  - 需求驱动
  - 多语言感知
---

README 工具是一个用于让 README 文件与共享需求文件保持一致的 task preset。每个仓库在 `.hagicode/hagitask/readme-updator/index.md` 中声明其 README 必须覆盖的内容。preset 会读取该文件；遇到缺失或无效的值时报告阻塞，而不是猜测。

## 命令

命令包括：

- **init**：仓库尚无需求文件时，探索仓库现状并写出该文件；若仓库也没有 README.md，一并生成。绝不覆盖已有文件。
- **update**：依据仓库的需求和当前事实刷新源 `README.md`，只修改存在偏差的内容。
- **translate**：在不修改源文件的前提下，让每个已配置的翻译版 README 与源文件保持一致。

本工具是逐步扩展的命令集合的第一批。之后新增的 README 命令会加入同一目录，并复用同一份需求文件。

## 需求文件

可以由 `init` 命令根据仓库现状写出该文件，也可以自行在需要纳入管理的每个仓库根目录下手动添加。使用生成的文件前请先检查。frontmatter 声明 README 的契约，Markdown 正文补充自由格式的需求：

```markdown
---
public: true
multilingual: true
languages:
  - en-US
  - zh-CN
sourceLanguage: en-US
style: product
---

受众：评估本项目的开发者。
必需章节：概述、快速开始、配置。
排除：内部部署主机。
```

必需的键为 `public`、`multilingual`、`style`（取值 `product` 或 `technical`），以及当 `multilingual` 为 `true` 时必需的 `languages` 和 `sourceLanguage`。缺失或无效的必需键会使该仓库停止处理，并按键名报告。

## 适用场景

- 最适合：让各仓库的 README.md 保持一致，并让翻译与源文件对齐。
- 不适合：没有需求文件的自由改写，或不应被修改的仓库。
