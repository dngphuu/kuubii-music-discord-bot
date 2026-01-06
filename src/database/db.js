import mysql from 'mysql2/promise';
import { config } from '../../config.js';

const dbUrl = config.database.url;

// Handle jdbc: prefix if present (common in some hosting environments)
const connectionUri = dbUrl.startsWith('jdbc:') ? dbUrl.replace('jdbc:', '') : dbUrl;

// Create the connection pool
const pool = mysql.createPool({
    uri: connectionUri,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize tables
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS server_settings (
                guild_id VARCHAR(255) PRIMARY KEY,
                prefix VARCHAR(10) DEFAULT '/',
                language VARCHAR(10) DEFAULT 'vi',
                autoplay TINYINT(1) DEFAULT 1,
                mode_24_7 TINYINT(1) DEFAULT 0,
                volume INT DEFAULT 50
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS playlists (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(255),
                name VARCHAR(255),
                tracks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        connection.release();
        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

initializeDatabase();

export default pool;
