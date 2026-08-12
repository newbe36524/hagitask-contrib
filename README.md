# hagitask-contrib

HagiCode Team's internal development repository for HagiTask packages.

Packages in this repository are temporary development versions. After a task
stabilizes, it may be promoted to
[hagitask-community-packages](https://github.com/HagiCode-org/hagitask-community-packages)
for public distribution. This repository is the intermediate source of truth
while the team develops and validates a task.

## Repository layout

```text
data/<taskId>/
  manifest.json
  frontend/
  backend/
  locales/
  store-page/
scripts/
  validate-contrib-packages.mjs
test/
  validate.test.mjs
hagitask/                         # nested schema source
```

The package layout and schema contracts intentionally match the community
repository so a stabilized task can be moved without restructuring.

## Current development package

- `data/add-community-task/`

## Validate locally

```bash
git submodule update --init --recursive
npm ci
npm run validate
npm test
```

Only packages under `data/` are discovered. Generated catalogs and archives do
not belong in this repository.
