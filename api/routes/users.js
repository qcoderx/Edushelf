const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, name, avatar_url, exam_focus, learning_style, interests,
             total_points, current_streak, longest_streak, created_at
      FROM users WHERE id = $1
    `, [req.user.id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('examFocus').optional().isIn(['JAMB', 'WAEC', 'POST-UTME', 'A-LEVELS']),
  body('learningStyle').optional().isIn(['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, examFocus, learningStyle, interests } = req.body;
    
    const result = await db.query(`
      UPDATE users 
      SET name = COALESCE($1, name),
          exam_focus = COALESCE($2, exam_focus),
          learning_style = COALESCE($3, learning_style),
          interests = COALESCE($4, interests),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, email, name, exam_focus, learning_style, interests
    `, [name, examFocus, learningStyle, interests, req.user.id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user interests
router.put('/interests', authenticateToken, [
  body('interests').isArray().custom((interests) => {
    return interests.every(interest => typeof interest === 'string');
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { interests } = req.body;
    
    await db.query(
      'UPDATE users SET interests = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [interests, req.user.id]
    );

    res.json({ message: 'Interests updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Award points to user
router.post('/award-points', authenticateToken, [
  body('points').isInt({ min: 1 }),
  body('activity').isString()
], async (req, res) => {
  try {
    const { points, activity } = req.body;
    
    await db.query(`
      UPDATE users 
      SET total_points = total_points + $1,
          last_activity = CURRENT_DATE,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [points, req.user.id]);

    // Update streak
    const streakResult = await db.query(`
      SELECT last_activity, current_streak FROM users WHERE id = $1
    `, [req.user.id]);

    const user = streakResult.rows[0];
    const today = new Date().toDateString();
    const lastActivity = new Date(user.last_activity).toDateString();
    
    let newStreak = user.current_streak;
    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivity === yesterday.toDateString()) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      await db.query(`
        UPDATE users 
        SET current_streak = $1,
            longest_streak = GREATEST(longest_streak, $1)
        WHERE id = $2
      `, [newStreak, req.user.id]);
    }

    res.json({ message: 'Points awarded successfully', points, newStreak });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;