# Project Context

<!-- Created or updated by `nvst create project-context`. Cap: 250 lines. -->

## Conventions
- Naming: kebab-case for folders and skill names; camelCase for JS variables/functions; UPPER_SNAKE for env vars
- Formatting: no enforced formatter; keep files consistent with their existing style
- Git flow: trunk-based — commits directly to `main`
- Workflow: each iteration has a PRD in `.agents/flow/it_XXXXXX_product-requirement-document.md`

## Tech Stack
- Language: JavaScript (CommonJS + ESM where needed)
- Runtime: Bun ≥ 1.0 — required at runtime; the skill installs it automatically if missing
- Frameworks: none (pure Bun builtins)
- Key libraries: `bun:sqlite` (built-in SQLite — no npm install needed)
- Package manager: Bun (`bun run`)
- Build: none — scripts run directly with `bun spark/tools/<file>.js`
- Supported platforms: Linux, macOS, Windows (Bun handles cross-platform)
- External APIs: Tavily Search API (`TAVILY_API_KEY` env var required)

## Code Standards
- Style: single-file scripts; tools live in `spark/tools/` as plain JS files
- Error handling: non-zero exit codes on error; errors to stderr, results to stdout
- Module organisation: tools in `spark/tools/`; skill definition at `spark/SKILL.md`; DB at `spark/memory.db`
- CLI interface: sub-command pattern — `bun spark/tools/<script>.js <command> [args]`; all commands run from project root

## Testing Strategy
- Approach: no automated tests
- Verification: manual invocation of scripts via `bun spark/tools/memory.js <command>` from project root

## Product Architecture
- This repo is a **skills pack** for Claude Code (and compatible CLI AI agents)
- The primary skill is `spark`: a personalized brainstorming agent that suggests small, sellable utilities
- Spark uses persistent SQLite memory (`spark/memory.db`) to track user profile, saved ideas, and discards
- Research is powered by `spark/tools/tavily-search.js` via the Tavily Search API
- Skills are discovered via `spark/SKILL.md` (frontmatter: `name`, `description`, `user-invocable`)
- Step 0 of SKILL.md verifies Bun is installed; if not, asks user authorization then installs via the platform-appropriate command

## Modular Structure
- `spark/tools/memory.js`: SQLite memory layer — profile, ideas, FTS5 search; run with `bun`
- `spark/tools/tavily-search.js`: Tavily API wrapper; run with `bun`
- `spark/SKILL.md`: agent-facing skill definition (trigger, behavior steps, memory/tool invocations)
- `spark/memory.db`: runtime SQLite database (not committed)
- `.agents/flow/`: per-iteration PRDs

## Implemented Capabilities
- it_000001: Migrated `spark.md` → `spark/SKILL.md` with standard frontmatter format
- it_000002: Added `spark/tools/tavily-search.js`; SKILL.md Step 4 uses Tavily instead of generic WebSearch
- it_000003: Replaced flat JSON files with SQLite + FTS5; `spark/tools/memory.js` with full CRUD + search
- it_000004: Compiled both tools to self-contained Linux x64 binaries via `bun build --compile`; sources moved to `src/`
- it_000007: Added macOS arm64 and Windows x64 binaries; renamed Linux binaries to `-linux-x64` suffix; SKILL.md updated with OS detection and binary routing
- it_000008: Eliminated pre-compiled binaries; tools now run directly as JS scripts via `bun`; Bun becomes explicit runtime requirement; SKILL.md Step 0 simplified to Bun detection + optional install
