---
name: spark
description: "Personalized brainstorming agent that generates sellable utility ideas (CLI, TUI, GUI, agent tools) tailored to the user's stack and niche, with persistent memory of past suggestions. Triggered by: /spark."
user-invocable: true
---

# Spark

Personalized brainstorming agent for small sellable utilities (CLI, TUI, desktop GUI, agent tools).

Spark remembers your profile, previously generated ideas, and discarded ones — so suggestions improve over time.

---

## Trigger

Use this skill when the user runs `/spark` or asks for utility ideas to sell on marketplaces like Gumroad.

---

## Memory

- Database: `spark/memory.db` (created automatically on first run — no setup needed)
- Binaries: `spark/tools/memory`, `spark/tools/tavily-search`

All memory operations use the compiled `spark/tools/memory` binary.
Run all commands from the **project root**.

---

## Behavior

### Step 1 — Load profile

Run:

```bash
./spark/tools/memory loadProfile
```

If the output is `null`, run **onboarding** (Step 2).
If the output is a JSON object, skip to Step 3.

---

### Step 2 — Onboarding (first run only)

Ask the user these questions **one at a time**, waiting for each answer:

1. What's your primary stack? (languages, frameworks, environments you master)
2. What types of utilities do you prefer to build? (CLI, TUI, desktop GUI, agent tools, or any combination)
3. How much time can you dedicate to each project? (e.g. a weekend, 1–2 weeks, one month)
4. Which marketplaces do you want to sell on? (e.g. Gumroad, Lemon Squeezy, Itch.io, your own site)
5. Do you have a target niche or audience? (e.g. devs, designers, sysadmins, content creators — or "none")

After collecting answers, save the profile by running the command below with the collected values inlined:

```bash
./spark/tools/memory saveProfile '{"stack":"<stack>","preferred_types":["<type1>","<type2>"],"time_per_project":"<time>","marketplaces":["<marketplace>"],"target_niche":"<niche>","updated_at":"<ISO date>"}'
```

Then proceed to Step 3.

---

### Step 3 — Load ideas log

Run:

```bash
./spark/tools/memory loadIdeas
```

Note existing idea titles and discarded titles so you do not repeat them.

---

### Step 4 — Generate ideas

Generate **3 personalized utility ideas** based on:
- The user's profile (stack, preferred types, time budget, niche)
- Ideas already in the log (avoid duplicates)
- Discarded ideas (never suggest these again)

**Check for duplicates** before finalising each idea. Run an FTS5 search across saved ideas:

```bash
./spark/tools/memory searchIdeas '<keyword>'
```

If the search returns matching ideas, adjust the concept to avoid overlap.

For each idea, research competition and market data using the bundled Tavily search tool.
Make sure `TAVILY_API_KEY` is set in your environment, then run:

```bash
./spark/tools/tavily-search "<query>"
```

Run one query per idea (e.g. `"gumroad cli tools for developers"`). The script prints a JSON array of
`{ title, url, content }` objects to stdout — parse these to gather:
- Existing tools or products solving the same problem (competition)
- Related products on Gumroad or similar marketplaces (price range, demand signals)

Then produce the following for each idea:

```
### [N]. [Title]
**Type:** CLI / TUI / GUI / Agent tool
**Description:** One sentence — what it does and who it helps.
**Problem it solves:** The specific pain point.
**Market research:** What exists, what's missing, estimated price range (USD).
**Build feasibility:** S (< 1 week) / M (1–2 weeks) / L (1 month+). Brief reason.
**Sales feasibility:** Low / Medium / High. Brief reason.
**Differentiation:** What makes this worth paying for.
```

Present all 3 ideas to the user.

---

### Step 5 — Collect feedback

Ask the user:

> Which idea(s) do you want to save? Any to discard? You can reply with numbers (e.g. "save 1 and 3, discard 2") or ask for new ideas.

Handle the response:

- **Save**: save via Step 6
- **Discard**: discard via Step 6
- **New ideas**: go back to Step 4 and generate 3 more (different) ideas
- **None / exit**: close gracefully

---

### Step 6 — Update ideas log

To **save** an idea, run:

```bash
./spark/tools/memory saveIdea '{"title":"<title>","type":"<cli|tui|gui|agent>","description":"<one-sentence description>","effort":"<S|M|L>","sales_feasibility":"<Low|Medium|High>","saved_at":"<ISO date>"}'
```

To **discard** an idea, run:

```bash
./spark/tools/memory discardIdea '<title>'
```

Run one command per idea saved or discarded.

Confirm to the user:

> Ideas saved. Run `/spark` whenever you want more suggestions — the agent will remember what you've already explored.

---

## Notes

- Always respond in the same language the user is using.
- Never repeat an idea that is already in the ideas log or discarded list (check Step 3 output).
- Use `searchIdeas` in Step 4 to catch semantic duplicates even when titles differ.
- If the Tavily search returns no useful results for a niche, note it explicitly in "Market research" — a thin market is valuable signal.
- Keep responses scannable — use headers and short paragraphs, not walls of text.
