---
locale: zh-CN
slug: add-community-task
title: Add Community Task
summary: 在一个集中说明中收集 Community Task 意图，由提示词完成结构化整理，生成全部必需的包文件，真实执行校验，并从你自己的 GitHub fork 创建 Pull Request。
eyebrow: Task Preset 商店
status: experimental
primaryCtaLabel: 安装 task preset
secondaryCtaLabel: 查看契约
catalog:
  - authoring
  - community
tags:
  - community-packages
  - 脚手架
  - github-pull-request
  - 双语
badges:
  - 写入限定在 fork
  - 强制校验
  - 双语产出
---

Add Community Task 面向想要发布 HagiTask Community Task、但不想手工拼装十几个互相关联文件的贡献者。一个 Community 包由 manifest、panel、task preset、prompt package、分语言模板、locale bundle 和分语言 store page 组成，而这些文件必须彼此对齐。少写一个，校验器直接拒绝；写错一处细节，包就带着缺陷发布出去。

这个任务把格式规范前置到面板和提示词里，并把贡献流程一直推进到 Pull Request。

## 它做什么

### 生成之前先收集一份完整说明

面板提供一个必填的多行说明区域，用于集中描述目标、用户价值、输入约束、执行与质量规则、验收标准以及可选发布说明。提示词会先从这段连续说明中提炼和结构化信息，再生成包文件，因此不需要把同一意图拆到多个文本框。

### 只在你的 fork 中写入

仓库、Vault 和项目选择都是只读上下文。执行器通过公开 GitHub URL 解析上游仓库，复用已有 fork 或用 `gh` 创建一个，在临时 checkout 中工作，并且只在工作分支的 `data/<task-id>/` 下写入。既不会写入你附加的仓库，也不会写入只读的 `hagitask` Schema 子模块。

### 把校验作为完成条件

生成包之后，执行器会初始化嵌套 Schema 子模块，并运行仓库自带的 `npm run validate` 与 `npm test`，如实报告真实退出状态。修改生成产物或忽略错误来让运行看起来干净，是被明令禁止的。

### 完成整个贡献闭环

校验通过后，执行器在工作分支提交、推送到你的 fork，并用 `gh pr create` 向上游默认分支创建 Pull Request。结果中会报告 fork、分支、校验结论和 PR 地址。若登录失败或无法创建 fork，任务会带着诊断信息停止，而不是谎报一个并不存在的 PR。

## 前置要求

- 已安装并登录 `gh`（`gh auth status` 必须通过）
- 执行环境中具备 `git` 与 Node.js
- 拥有可以 fork 上游 Community Packages 仓库的 GitHub 账号

## 适用场景

- 最适合：发布一个新的 Community Task，并从说明一路推进到 Pull Request。
- 也适合：通过生成一个正确的包并阅读 diff 来熟悉包格式。
- 不适合：修改已发布的包、变更 HagiTask Schema，或改动站点构建。

## 常见问题

### 它会写入我在面板中选择的仓库吗？

不会。仓库选择只有 `read` 权限，作用是让执行器把你的代码作为参考来塑造新任务。唯一的写入范围是 fork 分支中的 `data/<task-id>/`。

### 如果我已经 fork 过 Community Packages 仓库怎么办？

会直接复用。执行器在调用 `gh repo fork` 之前先用 `gh repo view` 检查已有 fork，因此不会产生重复 fork。

### 校验通过是否意味着包可以直接合并？

不是。校验器检查的是结构：Schema、canonical id、声明路径、locale 覆盖、模板解析和 store page frontmatter。它不判断提示词文本是否通顺、两个 locale bundle 的 key 是否一致，也不判断 store page 描述是否与真实行为相符。任务会把这些列为人工审阅项，合并决策仍然由人来做。
