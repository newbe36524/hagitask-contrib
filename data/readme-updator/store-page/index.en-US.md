---
locale: en-US
slug: readme-updator
title: README tool
summary: A task preset that writes and refreshes README.md from each repository's shared requirements file and keeps translated READMEs in line with the source, with init, update and translate commands.
eyebrow: Task Preset Store
status: experimental
primaryCtaLabel: Install task preset
secondaryCtaLabel: Preview contract
catalog:
  - documentation
  - maintenance
tags:
  - readme
  - translation
  - repository-docs
badges:
  - Repository scoped
  - Requirements driven
  - Multilingual aware
---

README tool is a task preset for keeping README files consistent with a shared requirements file. Each repository declares what its README must cover in `.hagicode/hagitask/readme-updator/index.md`. The preset reads that file and reports a blocker instead of guessing a missing or invalid value.

## Commands

The commands are:

- **init** explores the repository and writes its requirements file when none exists, and creates `README.md` too when the repository has none. It never overwrites an existing file.
- **update** refreshes the source `README.md` against the repository's requirements and current facts, changing only the content that deviates.
- **translate** brings each configured translated README in line with the source, without editing the source.

The tool is the first of a growing set. Later README commands join the same catalog and reuse the same requirements file.

## The requirements file

The `init` command can write this file from the repository's current state. You can also add it by hand at the root of each repository the preset should manage. Review a generated file before you rely on it. The frontmatter declares the README contract, and the Markdown body adds free-form requirements:

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

Audience: developers evaluating the project.
Required sections: overview, quick start, configuration.
Exclude: internal deployment hosts.
```

The required keys are `public`, `multilingual`, `style` (`product` or `technical`), and, when `multilingual` is `true`, `languages` and `sourceLanguage`. A missing or invalid required key stops that repository and is reported by name.

## Best fit

- Best for: keeping README.md consistent across repositories and keeping translations aligned with the source.
- Not for: free-form README rewrites without a requirements file, or repositories that should not change.
