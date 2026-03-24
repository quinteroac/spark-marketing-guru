# Requirement: Tavily Search Tool for Spark Skill

## Context

The Spark skill (at `spark/SKILL.md`) currently instructs the agent to use a generic `WebSearch` call during Step 4 (idea generation) to research competition and market data. This is imprecise and unreliable across different agent runtimes. The improvement replaces that generic call with a dedicated Node.js script that wraps the Tavily Search API, giving Spark a deterministic, high-quality search tool it can always invoke the same way.

## Goals

- Provide a standalone Node.js script inside the `spark/` skill folder that queries Tavily and returns structured JSON results.
- Update `spark/SKILL.md` so Step 4 instructs the agent to call this script instead of a generic `WebSearch`.

## User Stories

### US-001: Tavily search script

**As a** developer using the Spark skill, **I want** a Node.js script bundled with the skill that accepts a search query and returns Tavily results as JSON **so that** the agent always uses a consistent, Tavily-powered search during idea research.

**Acceptance Criteria:**
- [ ] A file `spark/tools/tavily-search.js` exists.
- [ ] The script accepts a search query as a CLI argument (e.g. `node tavily-search.js "gumroad cli tools"`).
- [ ] The script reads the Tavily API key from the `TAVILY_API_KEY` environment variable; if absent, it exits with a non-zero code and prints a clear error message.
- [ ] On success, the script prints a JSON array of results to stdout; each result contains at minimum: `title`, `url`, and `content` (snippet).
- [ ] On API error, the script exits with a non-zero code and prints the error to stderr.
- [ ] Running the script with a valid `TAVILY_API_KEY` and a sample query returns populated JSON results.

---

### US-002: Update SKILL.md to use the Tavily script

**As a** developer using the Spark skill, **I want** `spark/SKILL.md` to explicitly instruct the agent to call `spark/tools/tavily-search.js` during Step 4 **so that** the agent no longer relies on a vague generic `WebSearch` directive.

**Acceptance Criteria:**
- [ ] In `spark/SKILL.md`, Step 4 no longer references a generic `WebSearch` call.
- [ ] Step 4 instructs the agent to run `node spark/tools/tavily-search.js "<query>"` (or equivalent relative path) and parse the JSON output to obtain research results.
- [ ] The instruction specifies that `TAVILY_API_KEY` must be set in the environment before calling the script.
- [ ] All other sections of `SKILL.md` remain unchanged.

---

## Functional Requirements

- FR-1: The script must be located at `spark/tools/tavily-search.js`.
- FR-2: CLI interface: `node tavily-search.js "<query string>"` — first positional argument is the query.
- FR-3: API key source: `process.env.TAVILY_API_KEY`. Missing key → non-zero exit + human-readable error on stderr.
- FR-4: Output format: a JSON array printed to stdout. Each element must have `title` (string), `url` (string), and `content` (string).
- FR-5: The script must use the Tavily Search API (`https://api.tavily.com/search`).
- FR-6: `spark/SKILL.md` Step 4 must reference the script path and `TAVILY_API_KEY` requirement explicitly.

## Non-Goals (Out of Scope)

- Caching or persisting search results to disk.
- Supporting multiple search engines or a fallback when Tavily is unavailable.
- A UI or interactive mode for the script.
- Modifying any other step in `SKILL.md` beyond Step 4's research instruction.
- Adding automated tests for the script.

## Open Questions

- None.
