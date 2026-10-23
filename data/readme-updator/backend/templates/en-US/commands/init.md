## Command: init

Create `.hagicode/hagitask/readme-updator/index.md` for each target repository that does not have one yet, derived from evidence in that repository. If the repository has no `README.md` either, create that too in the same run. This is the only command that creates the index file or a missing `README.md`, and it never overwrites an existing file.

1. Check whether `.hagicode/hagitask/readme-updator/index.md` exists. If it does, stop for that repository, report a conflict that names the path, and write nothing there.
2. Explore the repository's current state before you decide any value. Read the following where they exist: `README.md` and any `README_*.md`; package and build manifests such as `package.json`, `*.csproj`, `pyproject.toml`, `go.mod` and `Cargo.toml`; the license file; CI workflow files; the `docs/` tree; and the output of `git remote -v`.
   - Limits: read at most 40 files, and skip any file larger than 200 KB. Ignore `node_modules`, `dist`, `vendor`, `bin`, `obj`, build output and lock files.
   - Do not open secret or credential files (for example `.env*` or key files), and do not copy any value from them into the index file, the README or the report.
   - Before you use the `git remote -v` output, remove the user name and password from each URL. Use and report only the redacted form.
3. Derive each frontmatter key from that evidence:
   - `public`: `true` when the project is published openly. Judge in this order: an open-source license first, then whether the repository is hosted publicly. Treat the remote URL as a supporting hint only. When the evidence is mixed or absent, use `true`, because it only adds exclusions, and list the choice as an assumption.
   - `multilingual`: `true` only when translated variants or per-locale documentation already exist. A translated variant is `README_<locale>.md`, for example `README_zh-cn.md`, or the legacy form `README_cn.md`. Otherwise `false`.
   - `languages`: write it only when `multilingual` is `true`. List the source language first, then each locale that has a variant, as frontmatter locale codes such as `en-US` and `zh-CN`. Map each code to its file name in lowercase: `en-US` is `README_en-us.md`, and `zh-CN` is `README_zh-cn.md`. A `README_cn.md` file counts as `zh-CN`.
   - `sourceLanguage`: write it only when `multilingual` is `true`. Use the language `README.md` is written in, judged from its prose. When `README.md` does not exist yet, use the language step 4 gives it.
   - `style`: `product` when the project is an application or service that end users operate; `technical` when it is a library, SDK, command-line tool, framework or internal tool whose readers are developers. For a mixed project, judge by the main readers of the existing README, and list the choice as an assumption.
4. If `README.md` does not exist, create it now, before the index file. Check the blocker cases first:
   - If `README_en-us.md` exists without a `README.md`, report a blocker for that repository and write nothing there, because the source is ambiguous.
   - If translated variants (`README_<locale>.md` or `README_cn.md`) exist without any source README, report a blocker instead.

   Otherwise choose the language of the repository's existing docs, or `en-US` when they give no clear language, and list that choice as an assumption. Write the README from the evidence and the values from step 3:
   - for `style: product`, product prose about value, audience and usage;
   - for `style: technical`, a description of architecture, commands and conventions grounded in the code and configuration;
   - the project name, a one-sentence positioning statement and a core overview in the first 10 lines, so a reader understands the project without scrolling;
   - the sections the evidence supports, for example overview, installation, usage, configuration, contributing and license;
   - a Quick Start section only when the evidence supports one, with three steps or fewer;
   - a link to the maintenance or operational documentation when the repository has such documentation, instead of copying its content into the README;
   - no workflow rules, internal repository structure, maintenance or operations procedures, or repository map;
   - for a public project, none of the items that step 6 excludes;
   - no features the repository does not show.

   Report the README as created.
5. If `README.md` and `README_en-us.md` both exist and their content differs, change neither file. Report the difference as a note. Bringing them into line belongs to `translate`.
6. Write the body of the index file from the same evidence. It holds requirements only: the intended audience, the sections that the existing README and docs already rely on, and, for a public project, the exclusions the evidence supports (secrets, internal hosts or paths, private links). Do not copy README paragraphs into it, because the index file records requirements, not README content. Tie each line to something the repository shows, and do not describe features it does not have.
7. Write the index file with exactly the frontmatter keys listed in step 3, followed by the body. Then check the file: every required key is present; `style` is `product` or `technical`; `public` and `multilingual` are booleans; and when `multilingual` is `true`, `languages` and `sourceLanguage` are present. If the check fails, correct the file once and check again. If it still fails, report the failure for this repository and do not count it as a success. Except for the README that step 4 creates, do not edit an existing `README.md` or any translated README.
8. Report per repository: the created paths (the index file, and `README.md` when step 4 created it), the value of each key with the evidence it came from, every assumption (including the language choice and any mirror note from step 5), and the aggregate counts, following the reporting rules in the system prompt.
