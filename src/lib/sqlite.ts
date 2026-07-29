"use client";

import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import { openDB, type IDBPDatabase } from "idb";
import type { CardProgress } from "@/lib/srs";

const IDB_NAME = "sap-c02-sqlite";
const IDB_STORE = "database";
const IDB_KEY = "db-bytes";
const IDB_VERSION = 1;

// The localStorage key the app used before this SQLite-backed store existed --
// read once on first load so existing progress isn't lost in the switch-over.
const LEGACY_LOCAL_STORAGE_KEY = "sap-c02-srs-state";

let sqlJsPromise: Promise<SqlJsStatic> | null = null;
function getSqlJs(): Promise<SqlJsStatic> {
  sqlJsPromise ??= initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
  return sqlJsPromise;
}

function getIdb(): Promise<IDBPDatabase> {
  return openDB(IDB_NAME, IDB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    },
  });
}

function readLegacyLocalStorageProgress(): Record<string, CardProgress> {
  try {
    const raw = window.localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CardProgress>) : {};
  } catch {
    return {};
  }
}

let dbPromise: Promise<Database> | null = null;

async function getDatabase(): Promise<Database> {
  dbPromise ??= (async () => {
    const [SQL, idb] = await Promise.all([getSqlJs(), getIdb()]);
    const savedBytes = await idb.get(IDB_STORE, IDB_KEY);
    const db = savedBytes ? new SQL.Database(new Uint8Array(savedBytes)) : new SQL.Database();

    db.run(`
      CREATE TABLE IF NOT EXISTS progress (
        front TEXT PRIMARY KEY,
        interval INTEGER NOT NULL,
        ease REAL NOT NULL,
        due INTEGER NOT NULL,
        reps INTEGER NOT NULL
      )
    `);

    // One-time migration: if this is a fresh SQLite database (nothing was in
    // IndexedDB yet) but the old localStorage-based store has data, import it
    // so switching storage backends doesn't wipe anyone's study progress.
    if (!savedBytes) {
      const legacyProgress = readLegacyLocalStorageProgress();
      const entries = Object.entries(legacyProgress);
      if (entries.length > 0) {
        const stmt = db.prepare(
          "INSERT INTO progress (front, interval, ease, due, reps) VALUES (?, ?, ?, ?, ?)"
        );
        try {
          for (const [front, p] of entries) {
            stmt.run([front, p.interval, p.ease, p.due, p.reps]);
          }
        } finally {
          stmt.free();
        }
        await persist(db, idb);
      }
    }

    return db;
  })();
  return dbPromise;
}

async function persist(db: Database, idb: IDBPDatabase): Promise<void> {
  await idb.put(IDB_STORE, db.export(), IDB_KEY);
}

export async function loadProgressFromSqlite(): Promise<Record<string, CardProgress>> {
  const db = await getDatabase();
  const result = db.exec("SELECT front, interval, ease, due, reps FROM progress");
  const progress: Record<string, CardProgress> = {};
  if (result.length > 0) {
    for (const row of result[0].values) {
      const [front, interval, ease, due, reps] = row as [string, number, number, number, number];
      progress[front] = { interval, ease, due, reps };
    }
  }
  return progress;
}

export async function saveProgressToSqlite(
  progress: Record<string, CardProgress>
): Promise<void> {
  const db = await getDatabase();
  db.run("DELETE FROM progress");
  const stmt = db.prepare(
    "INSERT INTO progress (front, interval, ease, due, reps) VALUES (?, ?, ?, ?, ?)"
  );
  try {
    for (const [front, p] of Object.entries(progress)) {
      stmt.run([front, p.interval, p.ease, p.due, p.reps]);
    }
  } finally {
    stmt.free();
  }
  const idb = await getIdb();
  await persist(db, idb);
}

// Deletes progress rows for exactly the given card fronts (e.g. one
// category's cards), leaving every other category's progress untouched.
export async function clearProgressForFrontsInSqlite(fronts: string[]): Promise<void> {
  if (fronts.length === 0) return;
  const db = await getDatabase();
  const stmt = db.prepare("DELETE FROM progress WHERE front = ?");
  try {
    for (const front of fronts) {
      stmt.run([front]);
    }
  } finally {
    stmt.free();
  }
  const idb = await getIdb();
  await persist(db, idb);
}
