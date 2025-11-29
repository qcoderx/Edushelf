const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get all notes for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { subject, search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT id, title, content, subject, note_type, tags, is_favorite, created_at, updated_at
      FROM notes 
      WHERE user_id = $1
    `;
    let params = [req.user.id];
    let paramCount = 1;

    if (subject && subject !== 'All') {
      paramCount++;
      query += ` AND subject = $${paramCount}`;
      params.push(subject);
    }

    if (search) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);
    
    // Group by date for timeline view
    const notesByDate = {};
    result.rows.forEach(note => {
      const date = new Date(note.created_at).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      let dateLabel;
      if (date === today) {
        dateLabel = 'Today';
      } else if (date === yesterday) {
        dateLabel = 'Yesterday';
      } else {
        dateLabel = new Date(note.created_at).toLocaleDateString();
      }
      
      if (!notesByDate[dateLabel]) {
        notesByDate[dateLabel] = [];
      }
      notesByDate[dateLabel].push({
        ...note,
        time: new Date(note.created_at).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      });
    });

    res.json(notesByDate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new note
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('content').trim().isLength({ min: 1 }),
  body('subject').optional().isString(),
  body('noteType').optional().isIn(['user_note', 'lesson_summary', 'quiz_result', 'generated_summary']),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, subject, noteType = 'user_note', tags = [] } = req.body;

    const result = await db.query(`
      INSERT INTO notes (user_id, title, content, subject, note_type, tags)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.user.id, title, content, subject, noteType, tags]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update note
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('content').optional().trim().isLength({ min: 1 }),
  body('subject').optional().isString(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, content, subject, tags } = req.body;

    const result = await db.query(`
      UPDATE notes 
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          subject = COALESCE($3, subject),
          tags = COALESCE($4, tags),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `, [title, content, subject, tags, id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle favorite
router.patch('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      UPDATE notes 
      SET is_favorite = NOT is_favorite,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING is_favorite
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ isFavorite: result.rows[0].is_favorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete note
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get note statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_notes,
        COUNT(*) FILTER (WHERE is_favorite = true) as favorite_notes,
        COUNT(DISTINCT subject) as subjects_count,
        COUNT(*) FILTER (WHERE note_type = 'user_note') as user_notes,
        COUNT(*) FILTER (WHERE note_type = 'lesson_summary') as lesson_summaries,
        COUNT(*) FILTER (WHERE note_type = 'quiz_result') as quiz_results
      FROM notes 
      WHERE user_id = $1
    `, [req.user.id]);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auto-create note from lesson/quiz
router.post('/auto-create', authenticateToken, [
  body('type').isIn(['lesson_summary', 'quiz_result']),
  body('title').trim().isLength({ min: 1 }),
  body('content').trim().isLength({ min: 1 }),
  body('subject').isString(),
  body('metadata').optional().isObject()
], async (req, res) => {
  try {
    const { type, title, content, subject, metadata = {} } = req.body;

    const result = await db.query(`
      INSERT INTO notes (user_id, title, content, subject, note_type, tags)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.user.id, title, content, subject, type, [subject.toLowerCase()]]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;