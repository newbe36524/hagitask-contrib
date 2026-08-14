# Command: new

Create a complete package at `repos/hagitask-contrib/data/<taskId>/`. Require a lowercase kebab-case id, reject an existing directory or duplicate `manifest.taskPresetId`, and never overwrite existing files. Generate manifest, panel, commands, task preset, prompts, locale bundles, bilingual system/user templates, and store pages. Run `npm run validate` and `npm test`; report success only when both exit successfully.
