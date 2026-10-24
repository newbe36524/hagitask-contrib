# hagitask-contrib

[![last commit](https://img.shields.io/github/last-commit/newbe36524/hagitask-contrib)](https://github.com/newbe36524/hagitask-contrib/commits/main)

HagiCode Team's internal development repository for HagiTask packages.

Packages in this repository are temporary development versions. After a task
stabilizes, it may be promoted to
[hagitask-community-packages](https://github.com/HagiCode-org/hagitask-community-packages)
for public distribution. This repository is the intermediate source of truth
while the team develops and validates a task.

The package layout and schema contracts intentionally match the community
repository so a stabilized task can be moved without restructuring.

## Current development packages

- `data/add-community-task/`
- `data/agents-md-update/`
- `data/codegraph-tasks/`
- `data/github-tasks/`
- `data/hagicode-release-notes-auto-update/`
- `data/hagitask-contrib-maintenance/`
- `data/readme-updator/`

## Validate locally

```bash
npm ci
npm run validate
npm test
```

Only packages under `data/` are discovered. Generated catalogs and archives do
not belong in this repository.
