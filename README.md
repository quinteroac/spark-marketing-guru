<div align="center">
  <img src="assets/icon.svg" width="120" alt="marketing-guru icon" />
  <h1>spark-marketing-guru</h1>
  <p>Personalized brainstorming agent that generates sellable utility ideas (CLI, TUI, GUI, agent tools) tailored to your stack and niche, with persistent memory of past suggestions.</p>
</div>

---

## What is this?

**spark-marketing-guru** is an agent skills pack built around the `/spark` skill. Spark runs an interactive brainstorming session to surface small, sellable utility ideas — personalized to your tech stack, preferred format, time budget, and target marketplace. It remembers every suggestion and discard across sessions using a local SQLite database, so ideas improve over time.

**Trigger:** `/spark`

## Skills

| Skill | Description |
|-------|-------------|
| `spark` | Personalized brainstorming agent. Generates sellable utility ideas and tracks them with persistent memory. |

## Installation

Install using [`npx skills`](https://github.com/vercel-labs/agent-skills):

```bash
npx skills add quinteroac/spark-marketing-guru
```

Or clone the repo and add it directly:

```bash
git clone https://github.com/quinteroac/spark-marketing-guru
npx skills add ./spark-marketing-guru
```

## Requirements

| Requirement | Details |
|-------------|---------|
| Platform | Linux x64, macOS arm64, Windows x64 (pre-compiled binaries) |
| Tavily API key | Set `TAVILY_API_KEY` in your environment for web research during idea generation |
| SQLite | Bundled — no separate install needed |

## Usage

Once installed, trigger the skill from any agent session:

```
/spark
```

On first run, Spark will ask 5 onboarding questions to build your profile (stack, preferred formats, time budget, marketplaces, target niche). Subsequent runs skip onboarding and go straight to idea generation.

## Building from Source

Binaries in `spark/tools/` are compiled from `src/` using Bun:

```bash
bun install

# Linux x64
bun build --compile --target=bun-linux-x64   src/memory.js        --outfile spark/tools/memory-linux-x64
bun build --compile --target=bun-linux-x64   src/tavily-search.js --outfile spark/tools/tavily-search-linux-x64

# macOS arm64
bun build --compile --target=bun-darwin-arm64 src/memory.js        --outfile spark/tools/memory-macos-arm64
bun build --compile --target=bun-darwin-arm64 src/tavily-search.js --outfile spark/tools/tavily-search-macos-arm64

# Windows x64
bun build --compile --target=bun-windows-x64 src/memory.js        --outfile spark/tools/memory-win-x64.exe
bun build --compile --target=bun-windows-x64 src/tavily-search.js --outfile spark/tools/tavily-search-win-x64.exe
```

Requires [Bun](https://bun.sh) ≥ 1.0.

## Project Structure

```
spark-marketing-guru/
├── spark/
│   ├── SKILL.md          # Skill definition (agent instructions)
│   ├── memory.db         # Runtime SQLite DB (created on first use)
│   └── tools/
│       ├── memory-linux-x64          # Linux x64
│       ├── memory-macos-arm64        # macOS Apple Silicon
│       ├── memory-win-x64.exe        # Windows x64
│       ├── tavily-search-linux-x64   # Linux x64
│       ├── tavily-search-macos-arm64 # macOS Apple Silicon
│       └── tavily-search-win-x64.exe # Windows x64
├── src/
│   ├── memory.js         # Source for memory binary
│   └── tavily-search.js  # Source for tavily-search binary
└── assets/
    └── icon.svg
```

## License

MIT
