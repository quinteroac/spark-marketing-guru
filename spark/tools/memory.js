'use strict';

/**
 * src/memory.js
 *
 * SQLite-backed memory module for the Spark skill.
 * Compiled to spark/tools/memory via: bun build --compile
 *
 * Database: spark/memory.db (relative to this script file — cwd-independent)
 *
 * CLI usage:
 *   bun spark/tools/memory.js loadProfile
 *   ./spark/tools/memory saveProfile '<json>'
 *   ./spark/tools/memory loadIdeas
 *   ./spark/tools/memory searchIdeas <keyword>
 *   ./spark/tools/memory saveIdea '<json>'
 *   ./spark/tools/memory discardIdea <title>
 *
 * Run all commands from the project root.
 */

const { Database } = require('bun:sqlite');
const path = require('node:path');

// DB lives at spark/memory.db — resolved relative to this script file,
// so it works regardless of the working directory the agent uses.
const DB_PATH = path.join(__dirname, '..', 'memory.db');

let _db = null;

function getDb() {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _initSchema(_db);
  return _db;
}

function _initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ideas (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      title             TEXT NOT NULL,
      type              TEXT,
      description       TEXT,
      effort            TEXT,
      sales_feasibility TEXT,
      saved_at          TEXT
    );

    CREATE TABLE IF NOT EXISTS discarded (
      title TEXT PRIMARY KEY
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS ideas_fts USING fts5(
      title,
      description,
      content='ideas',
      content_rowid='id'
    );

    CREATE TRIGGER IF NOT EXISTS ideas_ai AFTER INSERT ON ideas BEGIN
      INSERT INTO ideas_fts(rowid, title, description)
      VALUES (new.id, new.title, COALESCE(new.description, ''));
    END;
  `);
}

function loadProfile() {
  const db = getDb();
  const row = db.prepare("SELECT value FROM profile WHERE key = 'data'").get();
  return row ? JSON.parse(row.value) : null;
}

function saveProfile(data) {
  const db = getDb();
  db.prepare(
    "INSERT OR REPLACE INTO profile (key, value) VALUES ('data', ?)"
  ).run(JSON.stringify(data));
}

function loadIdeas() {
  const db = getDb();
  return db.prepare('SELECT * FROM ideas ORDER BY id ASC').all();
}

function saveIdea(idea) {
  const db = getDb();
  db.prepare(`
    INSERT INTO ideas (title, type, description, effort, sales_feasibility, saved_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    idea.title ?? '',
    idea.type ?? null,
    idea.description ?? null,
    idea.effort ?? null,
    idea.sales_feasibility ?? null,
    idea.saved_at ?? new Date().toISOString()
  );
}

function discardIdea(title) {
  const db = getDb();
  db.prepare('INSERT OR IGNORE INTO discarded (title) VALUES (?)').run(title);
}

function getDiscarded() {
  const db = getDb();
  return db.prepare('SELECT title FROM discarded ORDER BY title ASC').all().map(r => r.title);
}

function searchIdeas(query) {
  if (!query || query.trim() === '') return [];
  const db = getDb();
  try {
    return db.prepare(`
      SELECT i.*
      FROM ideas i
      JOIN ideas_fts ON ideas_fts.rowid = i.id
      WHERE ideas_fts MATCH ?
      ORDER BY rank
    `).all(query.trim());
  } catch {
    return [];
  }
}

// ── CLI dispatch ──────────────────────────────────────────────────────────────
// In a Bun compiled binary: argv[0]="bun", argv[1]=virtual path,
// argv[2]=sub-command, argv[3]=optional argument.
const cmd = process.argv[2];
const arg = process.argv[3];

if (cmd) {
  try {
    switch (cmd) {
      case 'loadProfile':
        process.stdout.write(JSON.stringify(loadProfile(), null, 2) + '\n');
        break;

      case 'saveProfile':
        if (!arg) throw new Error('saveProfile requires a JSON argument');
        saveProfile(JSON.parse(arg));
        break;

      case 'loadIdeas':
        process.stdout.write(
          JSON.stringify({ ideas: loadIdeas(), discarded: getDiscarded() }, null, 2) + '\n'
        );
        break;

      case 'searchIdeas':
        if (!arg) throw new Error('searchIdeas requires a keyword argument');
        process.stdout.write(JSON.stringify(searchIdeas(arg), null, 2) + '\n');
        break;

      case 'saveIdea':
        if (!arg) throw new Error('saveIdea requires a JSON argument');
        saveIdea(JSON.parse(arg));
        break;

      case 'discardIdea':
        if (!arg) throw new Error('discardIdea requires a title argument');
        discardIdea(arg);
        break;

      default:
        process.stderr.write(`Error: unknown command "${cmd}"\nAvailable: loadProfile, saveProfile, loadIdeas, searchIdeas, saveIdea, discardIdea\n`);
        process.exit(1);
    }
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    process.exit(1);
  }
}
