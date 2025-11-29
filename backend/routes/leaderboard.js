const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get global leaderboard
router.get('/global', authenticateToken, async (req, res) => {
  try {
    const { subject = 'overall', limit = 50 } = req.query;
    
    let query;
    let params = [parseInt(limit)];
    
    if (subject === 'overall') {
      query = `
        SELECT 
          u.id,
          u.name,
          u.avatar_url,
          u.total_points as points,
          u.current_streak as streak,
          COALESCE(AVG(p.accuracy), 0) as accuracy,
          ROW_NUMBER() OVER (ORDER BY u.total_points DESC, u.current_streak DESC) as rank,
          CASE WHEN u.id = $2 THEN true ELSE false END as is_current_user
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        GROUP BY u.id, u.name, u.avatar_url, u.total_points, u.current_streak
        ORDER BY u.total_points DESC, u.current_streak DESC
        LIMIT $1
      `;
      params.push(req.user.id);
    } else {
      query = `
        SELECT 
          u.id,
          u.name,
          u.avatar_url,
          COALESCE(SUM(p.correct_answers * 10), 0) as points,
          u.current_streak as streak,
          COALESCE(AVG(p.accuracy), 0) as accuracy,
          ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(p.accuracy), 0) DESC, COALESCE(SUM(p.correct_answers), 0) DESC) as rank,
          CASE WHEN u.id = $3 THEN true ELSE false END as is_current_user
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id AND p.subject = $2
        GROUP BY u.id, u.name, u.avatar_url, u.current_streak
        HAVING COUNT(p.id) > 0
        ORDER BY COALESCE(AVG(p.accuracy), 0) DESC, COALESCE(SUM(p.correct_answers), 0) DESC
        LIMIT $1
      `;
      params = [parseInt(limit), subject, req.user.id];
    }

    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's rank
router.get('/my-rank', authenticateToken, async (req, res) => {
  try {
    const { subject = 'overall' } = req.query;
    
    let query;
    let params = [req.user.id];
    
    if (subject === 'overall') {
      query = `
        WITH ranked_users AS (
          SELECT 
            id,
            total_points,
            current_streak,
            ROW_NUMBER() OVER (ORDER BY total_points DESC, current_streak DESC) as rank
          FROM users
        )
        SELECT rank, total_points as points, current_streak as streak
        FROM ranked_users
        WHERE id = $1
      `;
    } else {
      query = `
        WITH subject_rankings AS (
          SELECT 
            u.id,
            COALESCE(AVG(p.accuracy), 0) as accuracy,
            COALESCE(SUM(p.correct_answers * 10), 0) as points,
            ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(p.accuracy), 0) DESC, COALESCE(SUM(p.correct_answers), 0) DESC) as rank
          FROM users u
          LEFT JOIN progress p ON u.id = p.user_id AND p.subject = $2
          GROUP BY u.id
          HAVING COUNT(p.id) > 0
        )
        SELECT rank, accuracy, points
        FROM subject_rankings
        WHERE id = $1
      `;
      params.push(subject);
    }

    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.json({ rank: null, message: 'No ranking data available' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get leaderboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        AVG(total_points) as avg_points,
        MAX(total_points) as max_points,
        AVG(current_streak) as avg_streak,
        MAX(current_streak) as max_streak
      FROM users
      WHERE total_points > 0
    `);

    const topPerformers = await db.query(`
      SELECT name, total_points, current_streak
      FROM users
      ORDER BY total_points DESC
      LIMIT 3
    `);

    res.json({
      stats: stats.rows[0],
      topPerformers: topPerformers.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get leaderboard (matching swagger documentation)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { subject = 'overall', limit = 50 } = req.query;
    
    let query;
    let params = [parseInt(limit)];
    
    if (subject === 'overall') {
      query = `
        SELECT 
          u.id,
          u.name,
          u.avatar_url,
          u.total_points as points,
          u.current_streak as streak,
          COALESCE(AVG(p.accuracy), 0) as accuracy,
          ROW_NUMBER() OVER (ORDER BY u.total_points DESC, u.current_streak DESC) as rank,
          CASE WHEN u.id = $2 THEN true ELSE false END as isCurrentUser
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        GROUP BY u.id, u.name, u.avatar_url, u.total_points, u.current_streak
        ORDER BY u.total_points DESC, u.current_streak DESC
        LIMIT $1
      `;
      params.push(req.user.id);
    } else {
      query = `
        SELECT 
          u.id,
          u.name,
          u.avatar_url,
          COALESCE(SUM(p.correct_answers * 10), 0) as points,
          u.current_streak as streak,
          COALESCE(AVG(p.accuracy), 0) as accuracy,
          ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(p.accuracy), 0) DESC, COALESCE(SUM(p.correct_answers), 0) DESC) as rank,
          CASE WHEN u.id = $3 THEN true ELSE false END as isCurrentUser
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id AND p.subject = $2
        GROUP BY u.id, u.name, u.avatar_url, u.current_streak
        HAVING COUNT(p.id) > 0
        ORDER BY COALESCE(AVG(p.accuracy), 0) DESC, COALESCE(SUM(p.correct_answers), 0) DESC
        LIMIT $1
      `;
      params = [parseInt(limit), subject, req.user.id];
    }

    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update leaderboard (called periodically)
router.post('/update', authenticateToken, async (req, res) => {
  try {
    // This would typically be called by a cron job
    // For now, we'll allow manual updates
    
    await db.query('DELETE FROM leaderboard');
    
    // Overall leaderboard
    await db.query(`
      INSERT INTO leaderboard (user_id, subject, rank, points, accuracy, streak)
      SELECT 
        u.id,
        'overall',
        ROW_NUMBER() OVER (ORDER BY u.total_points DESC, u.current_streak DESC),
        u.total_points,
        COALESCE(AVG(p.accuracy), 0),
        u.current_streak
      FROM users u
      LEFT JOIN progress p ON u.id = p.user_id
      GROUP BY u.id, u.total_points, u.current_streak
    `);

    // Subject-specific leaderboards
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
    
    for (const subject of subjects) {
      await db.query(`
        INSERT INTO leaderboard (user_id, subject, rank, points, accuracy, streak)
        SELECT 
          u.id,
          $1,
          ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(p.accuracy), 0) DESC, COALESCE(SUM(p.correct_answers), 0) DESC),
          COALESCE(SUM(p.correct_answers * 10), 0),
          COALESCE(AVG(p.accuracy), 0),
          u.current_streak
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id AND p.subject = $1
        GROUP BY u.id, u.current_streak
        HAVING COUNT(p.id) > 0
      `, [subject]);
    }

    res.json({ message: 'Leaderboard updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;