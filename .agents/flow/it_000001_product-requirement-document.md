# Requirement: Migrate spark.md to Standard SKILL.md Format

## Context

The project contains a `spark.md` file at the repo root that defines the Spark brainstorming skill. The repository follows a standard skill structure where each skill lives in its own folder under `skills/` (or equivalent) and its definition file is named `SKILL.md` with a specific frontmatter + markdown format. This migration aligns Spark with that convention so it can be discovered and loaded consistently by the agent runner.

## Goals

- Reformat `spark.md` content to match the standard `SKILL.md` structure (frontmatter + imperative markdown body).
- Relocate the file so it lives at `spark/SKILL.md`.
- Preserve all existing behavior described in the original `spark.md`.

## User Stories

### US-001: Rename and relocate spark.md

**As a** developer using the CLI agent, **I want** the Spark skill to live at `spark/SKILL.md` **so that** it follows the same layout as every other skill and can be loaded by the skill runner without special casing.

**Acceptance Criteria:**
- [ ] A folder named `spark/` is created at the appropriate location in the project.
- [ ] The file `spark/SKILL.md` exists and contains the full skill definition.
- [ ] The original `spark.md` at the repo root is removed.
- [ ] No other files reference the old `spark.md` path (or those references are updated).

---

### US-002: Reformat content to standard SKILL.md structure

**As a** developer using the CLI agent, **I want** `spark/SKILL.md` to follow the standard skill format **so that** the frontmatter and body are consistent with all other skills in the repo.

**Acceptance Criteria:**
- [ ] File begins with a YAML frontmatter block containing at minimum: `name`, `description`, and `user-invocable`.
- [ ] `name` is `spark` (kebab-case).
- [ ] `description` accurately summarises the skill in one sentence.
- [ ] `user-invocable: true` is set.
- [ ] The markdown body preserves all original sections: Trigger, Memory Paths, Behavior (Steps 1–6), and Notes.
- [ ] No behavioral logic is added, removed, or altered relative to the original `spark.md`.
- [ ] Manual review of `spark/SKILL.md` against a reference skill (e.g. `define-requirement/SKILL.md`) confirms structural parity.

---

## Functional Requirements

- FR-1: The skill folder must be named `spark` in kebab-case.
- FR-2: The definition file inside the folder must be named `SKILL.md` (uppercase).
- FR-3: The frontmatter must use the same keys as existing skills (`name`, `description`, `user-invocable`).
- FR-4: All original behavior from `spark.md` (onboarding flow, idea generation, feedback loop, memory read/write) must be present in the new file verbatim or equivalently.
- FR-5: The old `spark.md` at the repo root must be deleted after the migration.

## Non-Goals (Out of Scope)

- Adding new features or changing the behavior of the Spark skill.
- Writing automated tests for the skill.
- Creating a `profile.json` or `ideas.json` during this task.
- Updating any agent runner configuration beyond what's needed to point to the new path.

## Open Questions

- None.
