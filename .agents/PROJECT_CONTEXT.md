# Project Context

<!-- Created or updated by `nvst create project-context`. Cap: 250 lines. -->

## Conventions
- Naming: kebab-case for folders and skill names; camelCase for JS variables/functions; UPPER_SNAKE for env vars
- Formatting: no enforced formatter; keep files consistent with their existing style
- Git flow: trunk-based — commits directly to `main`
- Workflow: each iteration has a PRD in `.agents/flow/it_XXXXXX_product-requirement-document.md`; binaries are committed to `spark/tools/`

## Tech Stack
- Language: JavaScript (CommonJS + ESM where needed)
- Runtime: Bun (used for build and as the execution environment for source files)
- Frameworks: none (pure Node/Bun builtins)
- Key libraries: `bun:sqlite` (SQLite access), `better-sqlite3` (listed in package.json, superseded by bun:sqlite in binaries)
- Package manager: Bun (`bun install`, `bun build`)
- Build: `bun build --compile --target=bun-linux-x64 src/<file>.js --outfile spark/tools/<binary>`
- External APIs: Tavily Search API (`TAVILY_API_KEY` env var required)

## Code Standards
- Style: single-file scripts; each source file in `src/` compiles to one binary in `spark/tools/`
- Error handling: non-zero exit codes on error; errors to stderr, results to stdout
- Module organisation: sources live in `src/`; compiled binaries in `spark/tools/`; skill definition at `spark/SKILL.md`; DB at `spark/memory.db`
- CLI interface: sub-command pattern — `./spark/tools/<binary> <command> [args]`; all commands run from project root

## Testing Strategy
- Approach: no automated tests
- Verification: manual invocation of compiled binaries from the project root

## Product Architecture
- This repo is a **skills pack** for a CLI AI agent (GitHub Copilot CLI / similar)
- The primary skill is `spark`: a personalized brainstorming agent that suggests small, sellable utilities
- Spark uses persistent SQLite memory (`spark/memory.db`) to track user profile, saved ideas, and discards
- Research is powered by a compiled Tavily search binary (`spark/tools/tavily-search`)
- Skills are discovered via `spark/SKILL.md` (frontmatter: `name`, `description`, `user-invocable`)

## Modular Structure
- `src/memory.js`: SQLite memory layer — profile, ideas, FTS5 search; compiles to `spark/tools/memory`
- `src/tavily-search.js`: Tavily API wrapper; compiles to `spark/tools/tavily-search`
- `spark/SKILL.md`: agent-facing skill definition (trigger, behavior steps, memory/tool invocations)
- `spark/memory.db`: runtime SQLite database (not committed)
- `spark/tools/memory`: compiled binary for all memory operations
- `spark/tools/tavily-search`: compiled binary for web search
- `.agents/flow/`: per-iteration PRDs

## Implemented Capabilities
- it_000001: Migrated `spark.md` → `spark/SKILL.md` with standard frontmatter format
- it_000002: Added `spark/tools/tavily-search.js`; SKILL.md Step 4 uses Tavily instead of generic WebSearch
- it_000003: Replaced flat JSON files with SQLite + FTS5; `spark/tools/memory.js` with full CRUD + search
- it_000004: Compiled both tools to self-contained Linux x64 binaries via `bun build --compile`; sources moved to `src/`
