import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let _db;

export async function getDb() {
    if (_db) return _db;

    const SITE_NAME = process.env.WEBSITE_SITE_NAME || 'local';
    const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, `${SITE_NAME}.sqlite`);

    _db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    await _db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL
    );
  `);

    return _db;
}
