# Requirement: Compile Spark Tools as Linux Binaries (Bun)

## Context

The `spark` skill currently invokes its tools (`memory.js`, `tavily-search.js`) via
`node -e` one-liners and `node spark/tools/...` script calls. This means the agent must
have Node.js and `better-sqlite3` (a native addon) installed in the environment.
Compiling these tools into self-contained Linux x64 binaries with Bun eliminates that
runtime dependency, making the skill more portable and easier for the AI agent to invoke.

## Goals

- Move source files (`memory.js`, `tavily-search.js`) from `spark/tools/` to a top-level `src/` directory alongside `spark/`.
- Produce self-contained Linux x64 binaries from those sources, output to `spark/tools/`.
- Remove the need for Node.js, npm, or `better-sqlite3` to be present at runtime.
- Update `SKILL.md` so every invocation uses the compiled binary paths.
- Provide a single build command to regenerate all binaries.

---

## User Stories

### US-000: Reorganize source files into `src/`

**As a** developer,
**I want** all `spark/tools/*.js` source files moved to `src/` (at the project root level, alongside the `spark/` directory),
**so that** sources and compiled binaries are clearly separated.

**Acceptance Criteria:**
- [ ] `src/memory.js` and `src/tavily-search.js` exist (moved from `spark/tools/`).
- [ ] `spark/tools/` no longer contains `.js` source files — only the compiled binaries.
- [ ] All internal `require` / `import` paths within the moved files are updated if needed.

---

### US-001: Compile `memory.js` to a self-contained binary

**As an** AI agent running the spark skill,
**I want** to call `./spark/tools/memory <operation> [args]` as a standalone executable,
**so that** I don't need Node.js or npm to perform memory operations.

**Acceptance Criteria:**
- [ ] `spark/tools/memory` exists and is executable after running the build command.
- [ ] The binary accepts the following sub-commands (matching all current `node -e` usage in SKILL.md):
  - `loadProfile` → prints profile JSON (or `null`) to stdout.
  - `saveProfile '<json>'` → saves profile from a JSON string argument.
  - `loadIdeas` → prints `{ ideas: [...], discarded: [...] }` JSON to stdout.
  - `searchIdeas <keyword>` → prints matching ideas JSON to stdout.
  - `saveIdea '<json>'` → saves an idea from a JSON string argument.
  - `discardIdea <title>` → marks an idea as discarded.
- [ ] All sub-commands exit with code `0` on success and non-zero on error.
- [ ] The binary runs on Linux x64 without Node.js installed.
- [ ] Typecheck / lint passes.

---

### US-002: Compile `tavily-search.js` to a self-contained binary

**As an** AI agent running the spark skill,
**I want** to call `./spark/tools/tavily-search "<query>"` as a standalone executable,
**so that** web search works without Node.js present.

**Acceptance Criteria:**
- [ ] `spark/tools/tavily-search` exists and is executable after running the build command.
- [ ] Calling `./spark/tools/tavily-search "<query>"` with `TAVILY_API_KEY` set produces the same JSON array output (`[{ title, url, content }]`) as the current script.
- [ ] The binary exits with code `0` on success and non-zero on error.
- [ ] The binary runs on Linux x64 without Node.js installed.
- [ ] Typecheck / lint passes.

---

### US-003: Build script to compile all binaries

**As a** developer or CI process,
**I want** a single command (`bun run build`) to compile all `spark/tools/*.js` files into binaries,
**so that** the binaries can be regenerated after any source change without manual steps.

**Acceptance Criteria:**
- [ ] `package.json` contains a `"build"` script that compiles `src/memory.js` → `spark/tools/memory` and `src/tavily-search.js` → `spark/tools/tavily-search` targeting Linux x64.
- [ ] Running `bun run build` from the project root completes without errors.
- [ ] Both binaries are present in `spark/tools/` after the build.
- [ ] The compiled binaries in `spark/tools/` are committed to the repository so the agent can use them without building first.

---

### US-004: Update SKILL.md to use binaries

**As an** AI agent,
**I want** `SKILL.md` to reference binary paths instead of `node -e` / `node script.js` calls,
**so that** following the skill instructions works in environments without Node.js.

**Acceptance Criteria:**
- [ ] Every `node -e "..."` block in SKILL.md is replaced with the equivalent `./spark/tools/memory <sub-command> [args]` call.
- [ ] The `node spark/tools/tavily-search.js "<query>"` call is replaced with `./spark/tools/tavily-search "<query>"`.
- [ ] The "Memory" section no longer mentions `npm install better-sqlite3` as a prerequisite.
- [ ] The updated SKILL.md instructions are verified end-to-end by tracing each step manually or with a dry-run in the agent.

---

## Functional Requirements

- **FR-1:** `bun build --compile --target=bun-linux-x64` (or equivalent) is used to produce each binary.
- **FR-2:** Source files live in `src/` (project root level); compiled binaries are output to `spark/tools/`.
- **FR-3:** The `memory` binary dispatches on `process.argv[2]` (the sub-command name) and `process.argv[3]` (optional JSON string or plain string argument).
- **FR-4:** For sub-commands that accept a JSON object (`saveProfile`, `saveIdea`), the binary parses `process.argv[3]` with `JSON.parse`.
- **FR-5:** The `tavily-search` binary accepts the search query as `process.argv[2]`, identical to the current script interface.
- **FR-6:** Both binaries write all output to **stdout** and all errors to **stderr**.
- **FR-7:** `spark/tools/` directory is created automatically by the build script if it does not exist.
- **FR-8:** The compiled binaries in `spark/tools/` are committed to the repository; they are **not** listed in `.gitignore`.

---

## Non-Goals (Out of Scope)

- Cross-platform builds (macOS, Windows, ARM64) — Linux x64 only for this iteration.
- Changing the behavior or logic of `memory.js` or `tavily-search.js` beyond what is needed for the CLI interface.
- Adding new memory operations or search capabilities.
- Automated tests / CI pipeline.

---

## Open Questions

- *(none — all resolved)*
