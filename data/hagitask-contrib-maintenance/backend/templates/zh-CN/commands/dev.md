## 命令：dev

将 Community Packages checkout 中的源包同步到 Contrib。

1. 将 `repos/hagitask-community-packages/data/<sourceTaskId>/` 作为只读源。
2. 要求源 manifest 存在，写入前比较全部源文件。
3. 源缺失或存在未解决本地差异时停止，除非明确指定覆盖。
4. 通过临时目录原子同步完整相对包布局，排除 catalog 和 archive。
5. 报告新增、修改、删除、冲突及跳过文件，然后运行 Contrib 校验和测试。
