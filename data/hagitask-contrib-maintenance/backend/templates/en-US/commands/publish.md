# Command: publish

Preflight the selected Contrib package with `npm run validate` and `npm test`. Require a valid semantic version, copy only package source into a local publication directory, update `manifest.json` there, and run local publication validation. Stop on any failed preflight, missing/invalid version, copy failure, or validation failure. Do not fork, push, create a Pull Request, or write Community Packages.
