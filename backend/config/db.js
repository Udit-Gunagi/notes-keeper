const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // using "nk_" prefix (noteskeeper) so our tables never clash with other projects
    await client.query(`
      CREATE TABLE IF NOT EXISTS nk_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_color VARCHAR(7) DEFAULT '#6C63FF',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS nk_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES nk_users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        color VARCHAR(7) DEFAULT '#ffffff',
        pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_nk_notes_user_id ON nk_notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_nk_notes_updated_at ON nk_notes(updated_at DESC);
    `);

    console.log('Database tables ready');
  } catch (err) {
    console.error('Error setting up database tables:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, initializeDatabase };