# Requirement: Saved-Ideas Checkpoint in Spark Flow

## Context

Every time the user invokes `/spark`, the agent currently loads the ideas log (Step 3) and then immediately generates 3 new ideas (Step 4), regardless of whether the user already has saved ideas they may want to revisit. This wastes a Tavily search call and bypasses valuable previously-saved content. Adding a checkpoint after Step 3 lets the user decide whether to review their saved ideas or kick off a fresh ideation session.

## Goals

- When saved ideas exist, prompt the user to choose between reviewing them or generating new ones before proceeding to Step 4.
- Display saved ideas clearly when the user opts to review them.
- Keep the existing flow unchanged for new users (no saved ideas) and when the user explicitly requests new ideas.
- Make no changes to the compiled binaries or the `memory` binary interface.

## User Stories

### US-001: Prompt user when saved ideas exist

**As a** developer using `/spark`,
**I want** the agent to ask me whether I want to review my saved ideas or generate new ones — when saved ideas exist —
**so that** I don't skip previously-saved content and avoid unnecessary duplicate searches.

**Acceptance Criteria:**
- [ ] After running `./spark/tools/memory loadIdeas`, if the `ideas` array is non-empty, the agent asks: _"You have X saved idea(s). Would you like to review them or generate new ones?"_ (where X is the count).
- [ ] If the `ideas` array is empty, the agent skips this prompt and proceeds directly to Step 4 (unchanged behavior).
- [ ] The question is asked before any Tavily search is initiated.

---

### US-002: Display saved ideas on "review" choice

**As a** developer using `/spark`,
**I want** to see my saved ideas formatted clearly when I choose to review them,
**so that** I can recall what I've already explored and decide my next action.

**Acceptance Criteria:**
- [ ] When the user chooses to review, the agent displays all saved ideas using the same card format as Step 4:
  ```
  ### [N]. [Title]
  **Type:** …
  **Description:** …
  **Effort:** …
  **Sales feasibility:** …
  ```
- [ ] After displaying, the agent asks: _"Would you like to generate new ideas, discard any of these, or exit?"_ and handles responses the same way as Step 5 (save/discard/new/exit).
- [ ] Discarding from the review view calls `./spark/tools/memory discardIdea '<title>'` (no change to binary interface).

---

### US-003: Proceed with normal ideation on "new ideas" choice

**As a** developer using `/spark`,
**I want** to skip the review and go straight to generating new ideas when I choose so,
**so that** I get fresh suggestions without seeing the existing list.

**Acceptance Criteria:**
- [ ] When the user chooses "new ideas" (either at the checkpoint prompt or after reviewing), the agent proceeds to Step 4 as-is, generating 3 new ideas not already in the log.
- [ ] Existing duplicate-prevention logic (Step 3 note + `searchIdeas`) remains unchanged.

---

## Functional Requirements

- **FR-1:** The checkpoint is inserted in `spark/SKILL.md` between the current Step 3 and Step 4. No other files are modified.
- **FR-2:** The checkpoint reads the `ideas` array length from the `loadIdeas` output already obtained in Step 3 — no additional binary call is needed.
- **FR-3:** The "review" display uses the same card format already defined in Step 4, for consistency.
- **FR-4:** After displaying saved ideas, the agent re-enters a feedback loop equivalent to Step 5 (save / discard / generate new / exit).
- **FR-5:** The `memory` binary interface (`loadIdeas`, `saveIdea`, `discardIdea`, `loadProfile`, `saveProfile`, `searchIdeas`) is not modified.

## Non-Goals (Out of Scope)

- Changing the compiled binaries (`spark/tools/memory`, `spark/tools/tavily-search`).
- Adding pagination or filtering to the saved-ideas display.
- Editing or updating a saved idea (only discard is supported, as before).
- Any change to onboarding (Step 2) or profile handling (Step 1).

## Open Questions

- *(none — all resolved)*
