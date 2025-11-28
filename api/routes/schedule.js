const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get user's study schedule
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date, period = 'week' } = req.query;
    
    let dateFilter = '';
    let params = [req.user.id];
    
    if (date) {
      dateFilter = 'AND scheduled_date = $2';
      params.push(date);
    } else if (period === 'today') {
      dateFilter = 'AND scheduled_date = CURRENT_DATE';
    } else if (period === 'week') {
      dateFilter = 'AND scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL \'7 days\'';
    } else if (period === 'month') {
      dateFilter = 'AND scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL \'30 days\'';
    }

    const result = await db.query(`
      SELECT id, subject, topic, scheduled_date, start_time, duration, completed, points_earned, created_at
      FROM study_schedule 
      WHERE user_id = $1 ${dateFilter}
      ORDER BY scheduled_date ASC, start_time ASC
    `, params);

    // Group by date
    const scheduleByDate = {};
    result.rows.forEach(session => {
      const date = session.scheduled_date.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      let dateLabel;
      if (date === today) {
        dateLabel = 'Today';
      } else if (date === tomorrow) {
        dateLabel = 'Tomorrow';
      } else {
        dateLabel = new Date(session.scheduled_date).toLocaleDateString();
      }
      
      if (!scheduleByDate[dateLabel]) {
        scheduleByDate[dateLabel] = [];
      }
      
      scheduleByDate[dateLabel].push({
        ...session,
        time: session.start_time ? session.start_time.slice(0, 5) : null,
        duration: `${session.duration} min`
      });
    });

    res.json(scheduleByDate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create study session
router.post('/', authenticateToken, [
  body('subject').trim().isLength({ min: 1 }),
  body('topic').optional().trim(),
  body('scheduledDate').isISO8601().toDate(),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('duration').isInt({ min: 15, max: 480 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, topic, scheduledDate, startTime, duration } = req.body;

    const result = await db.query(`
      INSERT INTO study_schedule (user_id, subject, topic, scheduled_date, start_time, duration)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.user.id, subject, topic, scheduledDate, startTime, duration]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark session as completed
router.patch('/:id/complete', authenticateToken, [
  body('timeSpent').optional().isInt({ min: 0 }),
  body('performance').optional().isInt({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const { id } = req.params;
    const { timeSpent, performance = 75 } = req.body;

    // Calculate points based on completion and performance
    const basePoints = 25;
    const performanceBonus = Math.floor((performance / 100) * 25);
    const totalPoints = basePoints + performanceBonus;

    const result = await db.query(`
      UPDATE study_schedule 
      SET completed = true,
          points_earned = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [totalPoints, id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    // Award points to user
    await db.query(`
      UPDATE users 
      SET total_points = total_points + $1
      WHERE id = $2
    `, [totalPoints, req.user.id]);

    res.json({ 
      ...result.rows[0], 
      pointsEarned: totalPoints 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update study session
router.put('/:id', authenticateToken, [
  body('subject').optional().trim().isLength({ min: 1 }),
  body('topic').optional().trim(),
  body('scheduledDate').optional().isISO8601().toDate(),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('duration').optional().isInt({ min: 15, max: 480 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { subject, topic, scheduledDate, startTime, duration } = req.body;

    const result = await db.query(`
      UPDATE study_schedule 
      SET subject = COALESCE($1, subject),
          topic = COALESCE($2, topic),
          scheduled_date = COALESCE($3, scheduled_date),
          start_time = COALESCE($4, start_time),
          duration = COALESCE($5, duration)
      WHERE id = $6 AND user_id = $7
      RETURNING *
    `, [subject, topic, scheduledDate, startTime, duration, id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete study session
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM study_schedule WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    res.json({ message: 'Study session deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get schedule statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(*) FILTER (WHERE completed = true) as completed_sessions,
        COUNT(*) FILTER (WHERE scheduled_date = CURRENT_DATE) as today_sessions,
        COUNT(*) FILTER (WHERE scheduled_date = CURRENT_DATE AND completed = true) as today_completed,
        COALESCE(SUM(points_earned), 0) as total_points_earned,
        COALESCE(SUM(duration) FILTER (WHERE completed = true), 0) as total_study_time
      FROM study_schedule 
      WHERE user_id = $1
    `, [req.user.id]);

    const weeklyProgress = await db.query(`
      SELECT 
        scheduled_date,
        COUNT(*) as sessions,
        COUNT(*) FILTER (WHERE completed = true) as completed
      FROM study_schedule 
      WHERE user_id = $1 
        AND scheduled_date >= CURRENT_DATE - INTERVAL '7 days'
        AND scheduled_date <= CURRENT_DATE
      GROUP BY scheduled_date
      ORDER BY scheduled_date
    `, [req.user.id]);

    res.json({
      overall: stats.rows[0],
      weekly: weeklyProgress.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate smart schedule based on user performance
router.post('/generate', authenticateToken, [
  body('preferences').isObject(),
  body('subjects').isArray(),
  body('duration').isInt({ min: 7, max: 30 })
], async (req, res) => {
  try {
    const { preferences, subjects, duration } = req.body;
    
    // Get user's weak areas from progress
    const weakAreas = await db.query(`
      SELECT subject, AVG(accuracy) as avg_accuracy
      FROM progress 
      WHERE user_id = $1
      GROUP BY subject
      HAVING AVG(accuracy) < 70
      ORDER BY avg_accuracy ASC
    `, [req.user.id]);

    // Generate schedule for the next 'duration' days
    const schedule = [];
    const startDate = new Date();
    
    for (let i = 0; i < duration; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Skip weekends if preference is set
      if (preferences.skipWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
        continue;
      }
      
      // Prioritize weak subjects
      const subjectsToSchedule = weakAreas.rows.length > 0 
        ? weakAreas.rows.slice(0, 2).map(w => w.subject)
        : subjects.slice(0, 2);
      
      for (const subject of subjectsToSchedule) {
        schedule.push({
          subject,
          scheduledDate: currentDate.toISOString().split('T')[0],
          startTime: preferences.preferredTime || '09:00',
          duration: preferences.sessionDuration || 45
        });
      }
    }

    // Insert generated schedule
    for (const session of schedule) {
      await db.query(`
        INSERT INTO study_schedule (user_id, subject, scheduled_date, start_time, duration)
        VALUES ($1, $2, $3, $4, $5)
      `, [req.user.id, session.subject, session.scheduledDate, session.startTime, session.duration]);
    }

    res.json({ 
      message: 'Smart schedule generated successfully',
      sessionsCreated: schedule.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;