# Requirement: SQLite Memory + FTS5 Full-Text Search for Spark

## Context

The Spark skill currently persists user profile and ideas in two flat JSON files (`profile.json`, `ideas.json`). This approach has no query capability and will degrade as the ideas log grows. This iteration replaces the flat-file storage with a SQLite database (using Node.js's built-in `node:sqlite` module, available since Node 22) and adds an FTS5 virtual table for full-text search over saved ideas. The `SKILL.md` instructions are updated to reference the new storage layer.

## Goals

- Replace flat JSON files with a SQLite database at `spark/memory.db` (co-located with the skill files).
- Enable full-text search over saved ideas using SQLite FTS5.
- Update `spark/SKILL.md` so the agent uses the new memory module for all reads and writes.

## User Stories

### US-001: SQLite memory module

**As a** developer running `/spark`, **I want** profile and ideas to be persisted in a SQLite database **so that** data is durable, structured, and queryable across sessions.

**Acceptance Criteria:**
- [ ] A file `spark/tools/memory.js` exists and exports functions: `loadProfile()`, `saveProfile(data)`, `loadIdeas()`, `saveIdea(idea)`, `discardIdea(title)`, `getDiscarded()`.
- [ ] The database file is created automatically at `spark/memory.db` (relative to the project root, co-located with the skill) on first use (no manual setup required).
- [ ] Schema includes at minimum:
  - `profile` table: `key TEXT PRIMARY KEY, value TEXT` (stores profile fields as key-value rows, or a single JSON blob row).
  - `ideas` table: `id INTEGER PRIMARY KEY, title TEXT, type TEXT, description TEXT, effort TEXT, sales_feasibility TEXT, saved_at TEXT`.
  - `discarded` table: `title TEXT PRIMARY KEY`.
- [ ] `loadProfile()` returns `null` if no profile is saved yet.
- [ ] `saveProfile(data)` upserts the profile.
- [ ] `loadIdeas()` returns an array of all saved ideas.
- [ ] `saveIdea(idea)` inserts a new idea row.
- [ ] `discardIdea(title)` inserts the title into `discarded`.
- [ ] `getDiscarded()` returns an array of discarded titles.
- [ ] The module uses only Node.js built-ins (`node:sqlite`, `node:path`, `node:fs`) — no external npm packages.
- [ ] The DB is created and all functions work correctly on a fresh run (no prior `memory.db`).

---

### US-002: FTS5 full-text search on ideas

**As a** developer running `/spark`, **I want** to search saved ideas by keyword **so that** the agent can detect semantic duplicates and avoid re-suggesting ideas the user has already explored.

**Acceptance Criteria:**
- [ ] An FTS5 virtual table `ideas_fts` is created alongside the `ideas` table, indexing `title` and `description`.
- [ ] `spark/tools/memory.js` exports a function `searchIdeas(query)` that performs an FTS5 query and returns matching idea rows.
- [ ] `searchIdeas("some keyword")` returns an array of matching ideas (may be empty, never throws on no results).
- [ ] When a new idea is inserted via `saveIdea()`, the FTS5 index is updated automatically (via triggers or explicit insert into `ideas_fts`).
- [ ] Running `searchIdeas("cli")` after saving an idea with "cli" in its title or description returns that idea.
- [ ] The module uses only Node.js built-ins — no external npm packages.

---

### US-003: Update SKILL.md to use the new memory module

**As a** developer running `/spark`, **I want** `spark/SKILL.md` to instruct the agent to call `spark/tools/memory.js` for all profile and ideas operations **so that** the agent no longer reads or writes the legacy JSON files.

**Acceptance Criteria:**
- [ ] `spark/SKILL.md` Step 1 instructs the agent to call `loadProfile()` from `spark/tools/memory.js` instead of reading `profile.json`.
- [ ] Step 2 (onboarding) instructs the agent to call `saveProfile(data)` instead of writing `profile.json`.
- [ ] Step 3 instructs the agent to call `loadIdeas()` and `getDiscarded()` instead of reading `ideas.json`.
- [ ] Step 4 instructs the agent to call `searchIdeas(query)` to check for semantic duplicates before presenting ideas.
- [ ] Step 5/6 instructs the agent to call `saveIdea(idea)` and `discardIdea(title)` instead of writing `ideas.json`.
- [ ] The legacy memory paths section (`profile.json`, `ideas.json`) is removed or updated to reference `spark/memory.db`.
- [ ] All other sections of `SKILL.md` remain unchanged.
- [ ] A full `/spark` run (onboarding → generate ideas → save/discard) completes without errors using the new module.

---

## Functional Requirements

- FR-1: The memory module must be located at `spark/tools/memory.js`.
- FR-2: Database path: `spark/memory.db` (resolved relative to the project root using `import.meta.url` or `__dirname`). The directory already exists; no creation needed.
- FR-3: Only Node.js built-in modules are allowed (`node:sqlite`, `node:path`, `node:fs`, `node:os`). No `npm install` required.
- FR-4: The `ideas_fts` FTS5 virtual table indexes the `title` and `description` columns of `ideas`.
- FR-5: FTS5 index must stay in sync with `ideas` table on every insert (trigger or explicit dual-write).
- FR-6: All exported functions must be synchronous (use the synchronous `node:sqlite` API).
- FR-7: `spark/SKILL.md` must not reference `profile.json` or `ideas.json` after this change.

## Non-Goals (Out of Scope)

- Migrating existing data from `profile.json` / `ideas.json` to the new database.
- Exposing a CLI interface for the memory module (it is an internal module only).
- Adding automated tests for the module.
- Supporting databases other than SQLite.
- Modifying the Tavily search tool or any other part of the Spark skill beyond the memory layer and `SKILL.md`.

## Open Questions

- None.
