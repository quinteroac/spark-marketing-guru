# Requirement: Project Folder Scaffolding After Saving an Idea

## Context

When a user saves an idea in the Spark flow (Step 7), the flow ends with a confirmation message
and no next step. There is currently no way to immediately bootstrap a project folder for the
chosen idea. Adding a scaffolding prompt right after Step 7 lets the user go from "saved idea"
to "folder ready to open in an editor" without leaving the `/spark` session.

Scaffolding is intentionally minimal: one folder + one `README.md`. Spark is an ideation tool,
not a code generator.

## Goals

- After the user saves an idea, offer to create a project folder for that idea in the current
  working directory.
- Let the user choose a product name from 5 agent-suggested options before the folder is created.
- Write a `README.md` inside the folder with the idea's core description.
- End the flow cleanly after folder creation (or if the user declines).
- Make no changes to compiled binaries or the `memory` binary interface.

## User Stories

### US-001: Post-save scaffolding prompt

**As a** developer using `/spark`,
**I want** the agent to ask me whether I want to scaffold a project folder immediately after I save
an idea,
**so that** I can jump-start the project without any extra steps.

**Acceptance Criteria:**
- [ ] Immediately after running `./spark/tools/memory saveIdea …` for each saved idea, the agent
  asks: _"Would you like to scaffold a project folder for '[idea title]'?"_
- [ ] If the user says **no** (or skips), the flow ends normally with the existing confirmation
  message — no folder is created.
- [ ] The prompt is only shown for ideas the user explicitly chose to **save** (not for discarded
  ideas, and not for ideas reviewed from the existing log unless the user takes an explicit
  "scaffold this" action).
- [ ] If the user saved multiple ideas in the same session, the prompt is shown once per saved
  idea, sequentially.

---

### US-002: Product name selection

**As a** developer using `/spark`,
**I want** the agent to suggest 5 product name options derived from the idea,
**so that** I can pick a good name without having to brainstorm from scratch.

**Acceptance Criteria:**
- [ ] When the user chooses to scaffold, the agent presents exactly **5 name options** as a
  numbered list.
- [ ] Each name option is in `kebab-case` (suitable as a folder name and future package name).
- [ ] Names are derived from the idea's title and description (concise, marketable, memorable).
- [ ] The user can select a number (1–5) or type a custom name.
- [ ] The selected or custom name is used as the folder name verbatim (after converting to
  kebab-case if the user typed a custom name with spaces).

---

### US-003: Folder and README creation

**As a** developer using `/spark`,
**I want** the agent to create a folder and a `README.md` in my current working directory,
**so that** I have an immediately usable project root with context about the idea.

**Acceptance Criteria:**
- [ ] The agent runs `mkdir <chosen-name>` in the current working directory.
- [ ] The agent creates `<chosen-name>/README.md` with the following structure:
  ```markdown
  # <Chosen Name (title-cased)>

  <idea description (one sentence from the saved idea)>

  ---

  **Type:** <CLI / TUI / GUI / Agent tool>
  **Effort:** <S / M / L>
  **Sales feasibility:** <Low / Medium / High>
  ```
- [ ] After creation the agent confirms: _"✅ Project folder `<chosen-name>/` created with
  `README.md`."_
- [ ] The flow ends after the confirmation — no further prompts.
- [ ] If a folder with that name already exists in the working directory, the agent warns the user
  and asks them to pick a different name before proceeding.

---

## Functional Requirements

- **FR-1:** The scaffolding prompt is inserted in `spark/SKILL.md` as a new **Step 8**, executed
  after Step 7 completes for each saved idea.
- **FR-2:** The agent generates the 5 name suggestions itself (no binary call required) using the
  idea's `title` and `description` fields already in memory from Step 7.
- **FR-3:** Folder and file creation is performed by the agent via shell commands (`mkdir`,
  writing a file). No new binary or source file is added.
- **FR-4:** The `README.md` content uses only data already collected during Step 5/7:
  `title`, `description`, `type`, `effort`, `sales_feasibility`.
- **FR-5:** No changes to `src/memory.js`, `src/tavily-search.js`, or their compiled binaries.
- **FR-6:** Custom name input must be sanitised to kebab-case (lowercase, spaces → hyphens,
  special characters stripped) before use as a folder name.

## Non-Goals (Out of Scope)

- Scaffolding any source code files, `package.json`, or project templates.
- Creating folders outside the current working directory.
- Updating the idea record in `memory.db` with the chosen folder name.
- Offering scaffolding for ideas viewed during the review flow (Step 4) unless re-saved.
- Any change to onboarding (Step 2), profile handling (Step 1), or compiled binaries.

## Open Questions

- *(none — all resolved)*
