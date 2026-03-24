# Requirement: Cross-Platform Binary Support (macOS & Windows)

## Context

The `spark/tools/memory` and `spark/tools/tavily-search` binaries are currently compiled only for
Linux x64 (`bun build --compile --target=bun-linux-x64`). Developers running `/spark` on macOS
(Apple Silicon) or Windows x64 cannot use the skill because the binaries are incompatible with
their OS. Adding platform-specific binaries and auto-detection logic in `SKILL.md` will make the
full `/spark` flow available on all three platforms.

## Goals

- Compile and commit platform-specific binaries for macOS arm64 and Windows x64 alongside the
  existing Linux x64 binaries.
- Update `spark/SKILL.md` so the agent auto-detects the current OS and selects the correct binary
  path before invoking any tool.
- Keep the existing Linux x64 binaries and their behaviour unchanged.

## User Stories

### US-001: macOS arm64 binaries built and committed

**As a** developer running `/spark` on Apple Silicon macOS,
**I want** `spark/tools/memory-macos-arm64` and `spark/tools/tavily-search-macos-arm64` to exist
in the repository,
**so that** I can run the `/spark` skill without manually compiling binaries.

**Acceptance Criteria:**
- [ ] `spark/tools/memory-macos-arm64` is present in the repository and was compiled with
  `bun build --compile --target=bun-darwin-arm64 src/memory.js --outfile spark/tools/memory-macos-arm64`.
- [ ] `spark/tools/tavily-search-macos-arm64` is present and compiled with
  `bun build --compile --target=bun-darwin-arm64 src/tavily-search.js --outfile spark/tools/tavily-search-macos-arm64`.
- [ ] Both binaries execute successfully on macOS arm64 (manual invocation: `./spark/tools/memory-macos-arm64 loadProfile` returns valid JSON or an empty-profile response without error).
- [ ] Typecheck / lint passes.

---

### US-002: Windows x64 binaries built and committed

**As a** developer running `/spark` on Windows x64,
**I want** `spark/tools/memory-win-x64.exe` and `spark/tools/tavily-search-win-x64.exe` to exist
in the repository,
**so that** I can run the `/spark` skill on Windows without manually compiling binaries.

**Acceptance Criteria:**
- [ ] `spark/tools/memory-win-x64.exe` is present and was compiled with
  `bun build --compile --target=bun-windows-x64 src/memory.js --outfile spark/tools/memory-win-x64.exe`.
- [ ] `spark/tools/tavily-search-win-x64.exe` is present and compiled with
  `bun build --compile --target=bun-windows-x64 src/tavily-search.js --outfile spark/tools/tavily-search-win-x64.exe`.
- [ ] Both binaries execute successfully on Windows x64 (manual invocation via PowerShell or CMD).
- [ ] Typecheck / lint passes.

---

### US-003: SKILL.md OS detection and binary routing

**As a** developer using `/spark` on any supported OS,
**I want** the agent to automatically select the correct binary path based on the current OS,
**so that** I don't have to know or specify which binary to use.

**Acceptance Criteria:**
- [ ] `spark/SKILL.md` includes a step (before any binary invocation) that detects the OS using a
  shell command (e.g. `uname -s` on Unix, or `echo %OS%` / `$env:OS` on Windows) and sets a
  variable for the binary suffix (e.g. `` (Linux), `-macos-arm64` (macOS), `-win-x64.exe`
  (Windows)).
- [ ] All subsequent `./spark/tools/memory` and `./spark/tools/tavily-search` invocations in
  `SKILL.md` use the resolved binary path.
- [ ] On Linux x64, the renamed binary names (`memory-linux-x64`, `tavily-search-linux-x64`) are used.
- [ ] Manually verified: the skill runs end-to-end on macOS (arm64) and Windows (x64) without
  errors.

---

## Functional Requirements

- **FR-1:** Four new binaries are added to `spark/tools/`: `memory-macos-arm64`,
  `tavily-search-macos-arm64`, `memory-win-x64.exe`, and `tavily-search-win-x64.exe`. The
  existing Linux x64 binaries are renamed per FR-5.
- **FR-2:** Build commands for all platforms are documented in `PROJECT_CONTEXT.md` under a
  "Build" subsection.
- **FR-3:** `spark/SKILL.md` is updated to resolve the binary path once (early in the flow)
  based on OS detection, and all tool invocations use the resolved path variable.
- **FR-4:** No changes to `src/memory.js` or `src/tavily-search.js` — source files are
  platform-agnostic.
- **FR-5:** The existing Linux x64 binaries are **renamed** to `spark/tools/memory-linux-x64`
  and `spark/tools/tavily-search-linux-x64` for naming consistency across all platforms.
  `SKILL.md` is updated to reference the new names.
- **FR-6:** Windows OS detection in `SKILL.md` uses PowerShell (`$IsWindows` or `$env:OS`).

## Non-Goals (Out of Scope)

- macOS x64 (Intel Mac) support — only Apple Silicon (arm64) is in scope for this iteration.
- Linux arm64 support.
- Automated CI/CD builds for binaries.
- Code-signing or notarization of macOS/Windows binaries.
- Changing `src/memory.js` or `src/tavily-search.js`.
- Linux x64 backward compatibility via old binary names (`memory`, `tavily-search`) — these are renamed in this iteration.
- Any change to the memory schema or Tavily integration.

## Open Questions

- *(none — all resolved)*
