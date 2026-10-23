## 命令：init

为尚无索引文件的每个目标仓库，依据该仓库自身的证据创建 `.hagicode/hagitask/readme-updator/index.md`。若该仓库也没有 `README.md`，同一次运行中一并创建。本命令是唯一会创建索引文件或缺失 `README.md` 的命令，并且绝不覆盖已有文件。

1. 检查 `.hagicode/hagitask/readme-updator/index.md` 是否存在。若已存在，停止该仓库的处理，报告包含该路径的冲突，并且不在其中写入任何内容。
2. 在决定任何取值之前，先探索仓库的现状。在文件存在时读取以下内容：`README.md` 以及所有 `README_*.md`；包和构建清单，例如 `package.json`、`*.csproj`、`pyproject.toml`、`go.mod` 和 `Cargo.toml`；许可证文件；CI 工作流文件；`docs/` 目录；以及 `git remote -v` 的输出。
   - 上限：最多读取 40 个文件，跳过大于 200 KB 的文件。忽略 `node_modules`、`dist`、`vendor`、`bin`、`obj`、构建产物和锁文件。
   - 不得打开密钥或凭据文件（例如 `.env*` 或密钥文件），也不得将其中的任何值复制到索引文件、README 或报告中。
   - 使用 `git remote -v` 的输出前，先去掉每个 URL 中的用户名与口令，只使用和报告脱敏后的形式。
3. 依据上述证据推导每个 frontmatter 键：
   - `public`：项目以公开方式发布时为 `true`。判据按以下顺序：先看开源许可证；再看仓库是否公开托管；远程地址只作辅助提示。证据不一致或缺失时使用 `true`，因为它只会增加排除项，并将该选择列为假设。
   - `multilingual`：仅当已存在译文或按语言划分的文档时为 `true`。译文是 `README_<locale>.md`（如 `README_zh-cn.md`），或旧式的 `README_cn.md`。否则为 `false`。
   - `languages`：仅当 `multilingual` 为 `true` 时写入。先列出源语言，再列出每个拥有译文的 locale，使用 `en-US`、`zh-CN` 这样的 frontmatter 语言码。语言码与文件名的映射为：`en-US` 对应 `README_en-us.md`，`zh-CN` 对应 `README_zh-cn.md`（文件名使用小写）。`README_cn.md` 计为 `zh-CN`。
   - `sourceLanguage`：仅当 `multilingual` 为 `true` 时写入。根据 `README.md` 正文判断其所用语言。若 `README.md` 尚不存在，使用第 4 步为它确定的语言。
   - `style`：项目是终端用户使用的应用或服务时为 `product`；项目是库、SDK、命令行工具、框架或读者为开发者的内部工具时为 `technical`。混合项目以现有 README 的主要读者为准，并将该选择列为假设。
4. 若 `README.md` 不存在，先于索引文件创建它。先检查阻塞情形：
   - 若存在 `README_en-us.md` 却没有 `README.md`，为该仓库报告阻塞，不在其中写入任何文件，因为源文件不明确。
   - 若存在译文（`README_<locale>.md` 或 `README_cn.md`）却没有任何源 README，改为报告阻塞。

   否则，选用现有文档的语言；若文档没有明确语言，则使用 `en-US`，并将该选择列为假设。依据证据和第 3 步的取值撰写 README：
   - `style: product`：以产品语言描述价值、受众和用法；
   - `style: technical`：描述以代码和配置为依据的架构、命令和约定；
   - 前 10 行包含项目名、一句话定位和核心概述，访客不需要滚动即可理解项目是什么；
   - 覆盖证据所支持的章节，例如概述、安装、使用、配置、贡献指南和许可证；
   - 只有证据支持快速开始时才加入该章节，且不超过 3 步；
   - 若仓库有维护或运维文档，链接到该文档，而不是把内容复制进 README；
   - 不包含工作流规则、仓库内部结构、维护或运维流程，也不包含仓库地图；
   - 公开项目不包含第 6 步排除的任何内容；
   - 不描述仓库中不存在的功能。

   将该 README 报告为已创建。
5. 若 `README.md` 与 `README_en-us.md` 同时存在且内容不同，两个文件都不修改，把差异作为备注报告。同步两者属于 `translate` 的工作。
6. 依据相同证据撰写索引文件的正文，只写要求：预期受众、现有 README 和文档已经依赖的章节，以及公开项目证据支持的排除项（密钥、内部主机或路径、私有链接）。不复制 README 的段落，因为索引文件记录的是要求，不是 README 内容。每一行都必须对应仓库中可见的内容，不描述仓库没有的功能。
7. 按第 3 步列出的 frontmatter 键写入索引文件，之后是正文。然后检查文件：必需键齐全；`style` 为 `product` 或 `technical`；`public` 与 `multilingual` 为布尔值；`multilingual` 为 `true` 时 `languages` 与 `sourceLanguage` 存在。检查不通过则修正一次并再次检查。仍不通过则报告该仓库的失败，不计为成功。除第 4 步创建的 README 外，不编辑已存在的 `README.md` 或任何译文 README。
8. 逐仓库报告：创建的路径（索引文件，以及第 4 步创建的 `README.md`）、每个键的取值及其证据来源、所有假设（包括语言选择和第 5 步的镜像差异备注），以及汇总计数，并遵循系统提示中的报告规则。
