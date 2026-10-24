---
public: true
multilingual: false
style: product
---

# README requirements

## Product focus

- Introduce this repository as the HagiCode Team's internal workspace where HagiTask task packages are drafted and validated before they are promoted to the public `hagitask-community-packages` repository. There is no end-user product here; describe the capability it gives its direct users: a place to develop and validate temporary HagiTask packages under `data/<taskId>/`.
- Address HagiCode Team members who author task packages. Keep the README's wording that this is an internal development repository.
- Lead with what the workspace lets the team do (develop a package, validate it locally, promote it once stable) before any file-level detail.

## Required content

- Open with a short statement of purpose and the promotion path, keeping the link to `hagitask-community-packages`.
- Name the packages currently under development, as the README lists them, and keep that list consistent with the real `data/` directories.
- Show how to validate a package locally (`npm ci`, `npm run validate`, `npm test`); the commands must match `package.json`.
- State that package layout and schema contracts match the community repository, so a stabilized task moves over unchanged.

## Exclusions

- Exclude tokens, secret values, internal hosts, machine-specific paths and private links.
- Keep repository maintenance instructions out of the README: directory trees, internal architecture, CI, build internals and command-prompt authoring rules. Do not list features the repository does not show.
