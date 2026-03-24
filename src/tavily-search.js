#!/usr/bin/env node

/**
 * src/tavily-search.js
 *
 * Queries the Tavily Search API and prints results as a JSON array to stdout.
 * Compiled to spark/tools/tavily-search via: bun build --compile
 *
 * Usage:
 *   ./spark/tools/tavily-search "<query>"
 *
 * Environment:
 *   TAVILY_API_KEY  — required Tavily API key
 *
 * Output (stdout):
 *   JSON array of { title, url, content } objects
 *
 * Exit codes:
 *   0  success
 *   1  missing API key or query argument
 *   2  API request failed
 */

const TAVILY_API_URL = "https://api.tavily.com/search";

async function main() {
  const query = process.argv[2];

  if (!query || query.trim() === "") {
    process.stderr.write(
      'Error: missing search query.\nUsage: ./spark/tools/tavily-search "<query>"\n'
    );
    process.exit(1);
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    process.stderr.write(
      "Error: TAVILY_API_KEY environment variable is not set.\n" +
        "Export it before running: export TAVILY_API_KEY=tvly-...\n"
    );
    process.exit(1);
  }

  let response;
  try {
    response = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        include_answer: false,
        max_results: 5,
      }),
    });
  } catch (err) {
    process.stderr.write(`Error: network request failed — ${err.message}\n`);
    process.exit(2);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "(no body)");
    process.stderr.write(
      `Error: Tavily API returned HTTP ${response.status} ${response.statusText}\n${body}\n`
    );
    process.exit(2);
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    process.stderr.write(`Error: failed to parse API response — ${err.message}\n`);
    process.exit(2);
  }

  const results = (data.results ?? []).map((r) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    content: r.content ?? "",
  }));

  process.stdout.write(JSON.stringify(results, null, 2) + "\n");
}

main();
