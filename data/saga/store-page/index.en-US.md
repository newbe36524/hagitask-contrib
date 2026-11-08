---
locale: en-US
slug: saga
title: Saga
summary: Plan a long-running work package, review it, then run it with an orchestrator that dispatches workers and records evidence.
eyebrow: Task preset store
status: experimental
tags:
  - long-running
  - orchestration
  - prompts
---

A saga is a long-running work package. It has a contract a human reviews (goal, research, acceptance commands, plan) and a run record (status, reports, evidence). Everything lives in one folder per project: `.hagicode/sagas`.

## Two commands

### create

Turns your objective, constraints, known work items and verification notes into a saga. It only plans. Anything it cannot decide becomes an open question for you. Run `create` again with an existing saga id to add an amendment.

### run

Acts as the orchestrator. It freezes the contract (and refuses while open questions or amendments remain), dispatches implementation and separate verification workers, and ticks an item only with a passing report and an evidence file. Running it again resumes from the unticked items.

## What to expect

- Planning and running are separate stages, started by you.
- The orchestrator does not implement items and does not decide open questions.
- Needs `node` on the host. `run` also needs the `hagi` CLI. Nothing else is installed: the tool and the method prompts are written into the project the first time you run `create`.
