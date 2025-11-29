const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Record progress
router.post('/record', authenticateToken, [
  body('subject').isString().isLength({ min: 1 }),
  body('topic').optional().isString(),
  body('questionsAnswered').isInt({ min: 0 }),
  body('correctAnswers').isInt({ min: 0 }),
  body('timeSpent').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, topic, questionsAnswered, correctAnswers, timeSpent } = req.body;
    const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;

    // Insert progress record
    await db.query(`
      INSERT INTO progress (user_id, subject, topic, accuracy, questions_answered, correct_answers, time_spent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [req.user.id, subject, topic, accuracy, questionsAnswered, correctAnswers, timeSpent]);

    // Award points based on performance
    const basePoints = correctAnswers * 10;
    const bonusPoints = accuracy >= 80 ? Math.floor(basePoints * 0.2) : 0;
    const totalPoints = basePoints + bonusPoints;

    if (totalPoints > 0) {
      await db.query(`
        UPDATE users 
        SET total_points = total_points + $1
        WHERE id = $2
      `, [totalPoints, req.user.id]);
    }

    res.json({ 
      message: 'Progress recorded successfully',
      pointsEarned: totalPoints,
      accuracy: accuracy.toFixed(2)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user progress analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case 'week':
        dateFilter = "AND date >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND date >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      case 'year':
        dateFilter = "AND date >= CURRENT_DATE - INTERVAL '365 days'";
        break;
    }

    // Overall stats
    const overallStats = await db.query(`
      SELECT 
        COALESCE(AVG(accuracy), 0) as overall_accuracy,
        COALESCE(SUM(questions_answered), 0) as total_questions,
        COALESCE(SUM(correct_answers), 0) as total_correct,
        COALESCE(SUM(time_spent), 0) as total_time
      FROM progress 
      WHERE user_id = $1 ${dateFilter}
    `, [req.user.id]);

    // Subject breakdown
    const subjectStats = await db.query(`
      SELECT 
        subject,
        COALESCE(AVG(accuracy), 0) as accuracy,
        COALESCE(SUM(questions_answered), 0) as questions_answered,
        COALESCE(SUM(correct_answers), 0) as correct_answers
      FROM progress 
      WHERE user_id = $1 ${dateFilter}
      GROUP BY subject
      ORDER BY accuracy DESC
    `, [req.user.id]);

    // Daily progress for charts
    const dailyProgress = await db.query(`
      SELECT 
        date,
        COALESCE(AVG(accuracy), 0) as accuracy,
        COALESCE(SUM(questions_answered), 0) as questions_answered
      FROM progress 
      WHERE user_id = $1 ${dateFilter}
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `, [req.user.id]);

    // User streak and points
    const userStats = await db.query(`
      SELECT current_streak, total_points, longest_streak
      FROM users WHERE id = $1
    `, [req.user.id]);

    res.json({
      overall: overallStats.rows[0],
      subjects: subjectStats.rows,
      daily: dailyProgress.rows,
      user: userStats.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get subject-specific progress
router.get('/subject/:subject', authenticateToken, async (req, res) => {
  try {
    const { subject } = req.params;
    
    const progress = await db.query(`
      SELECT 
        topic,
        AVG(accuracy) as accuracy,
        SUM(questions_answered) as questions_answered,
        SUM(correct_answers) as correct_answers,
        SUM(time_spent) as time_spent,
        MAX(date) as last_practiced
      FROM progress 
      WHERE user_id = $1 AND subject = $2
      GROUP BY topic
      ORDER BY last_practiced DESC
    `, [req.user.id, subject]);

    res.json(progress.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;