const express = require('express');
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

// GET /api/notes
router.get('/', async (req, res) => {
  const { search } = req.query;
  const userId = req.user.userId;

  try {
    let query, params;

    if (search && search.trim()) {
      query = `
        SELECT * FROM nk_notes
        WHERE user_id = $1
        AND (title ILIKE $2 OR content ILIKE $2)
        ORDER BY pinned DESC, updated_at DESC
      `;
      params = [userId, `%${search.trim()}%`];
    } else {
      query = `
        SELECT * FROM nk_notes
        WHERE user_id = $1
        ORDER BY pinned DESC, updated_at DESC
      `;
      params = [userId];
    }

    const result = await pool.query(query, params);
    res.json({ notes: result.rows });
  } catch (err) {
    console.error('Fetch notes error:', err.message);
    res.status(500).json({ error: 'Could not fetch notes.' });
  }
});

// POST /api/notes
router.post('/', async (req, res) => {
  const { title, content, color } = req.body;
  const userId = req.user.userId;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Note title is required.' });
  }

  const allowedColors = ['#ffffff', '#fff9c4', '#d7f5e3', '#fce4ec', '#e3f2fd', '#f3e5f5', '#ffe0b2'];
  const noteColor = allowedColors.includes(color) ? color : '#ffffff';

  try {
    const result = await pool.query(
      'INSERT INTO nk_notes (user_id, title, content, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title.trim(), content || '', noteColor]
    );

    res.status(201).json({ message: 'Note saved!', note: result.rows[0] });
  } catch (err) {
    console.error('Create note error:', err.message);
    res.status(500).json({ error: 'Could not create note.' });
  }
});

// PUT /api/notes/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, color, pinned } = req.body;
  const userId = req.user.userId;

  try {
    const existing = await pool.query(
      'SELECT id FROM nk_notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    const allowedColors = ['#ffffff', '#fff9c4', '#d7f5e3', '#fce4ec', '#e3f2fd', '#f3e5f5', '#ffe0b2'];

    const result = await pool.query(
      `UPDATE nk_notes
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           color = CASE WHEN $3 = ANY($6::text[]) THEN $3 ELSE color END,
           pinned = COALESCE($4, pinned),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $7
       RETURNING *`,
      [
        title ? title.trim() : null,
        content !== undefined ? content : null,
        color || null,
        pinned !== undefined ? pinned : null,
        id,
        allowedColors,
        userId
      ]
    );

    res.json({ message: 'Note updated!', note: result.rows[0] });
  } catch (err) {
    console.error('Update note error:', err.message);
    res.status(500).json({ error: 'Could not update note.' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'DELETE FROM nk_notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.json({ message: 'Note deleted.', deletedId: result.rows[0].id });
  } catch (err) {
    console.error('Delete note error:', err.message);
    res.status(500).json({ error: 'Could not delete note.' });
  }
});

// PATCH /api/notes/:id/pin
router.patch('/:id/pin', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'UPDATE nk_notes SET pinned = NOT pinned, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    res.json({ note: result.rows[0] });
  } catch (err) {
    console.error('Pin toggle error:', err.message);
    res.status(500).json({ error: 'Could not update pin status.' });
  }
});

module.exports = router;