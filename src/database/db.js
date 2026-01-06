import Database from 'better-sqlite3';
import { config } from '../config.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure the database directory exists
if (!fs.existsSync(__dirname)) {
    fs.mkdirSync(__dirname, { recursive: true });
}

const db = new Database(config.databasePath);

// Initialize tables
db.exec(`
    CREATE TABLE IF NOT EXISTS server_settings (
        guild_id TEXT PRIMARY KEY,
        prefix TEXT DEFAULT '/',
        language TEXT DEFAULT 'vi',
        autoplay INTEGER DEFAULT 1,
        mode_24_7 INTEGER DEFAULT 0,
        volume INTEGER DEFAULT 50
    );

    CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        name TEXT,
        tracks TEXT, -- JSON string of track objects
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

export default db;
