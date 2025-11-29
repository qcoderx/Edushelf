const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Create lesson
router.post('/lessons', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('subject').trim().isLength({ min: 1 }),
  body('content').trim().isLength({ min: 1 }),
  body('difficultyLevel').optional().isInt({ min: 1, max: 5 }),
  body('estimatedDuration').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, subject, content, difficultyLevel = 1, estimatedDuration = 30 } = req.body;

    const result = await db.query(`
      INSERT INTO lessons (user_id, title, subject, content, difficulty_level, estimated_duration)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.user.id, title, subject, content, difficultyLevel, estimatedDuration]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's lessons
router.get('/lessons', authenticateToken, async (req, res) => {
  try {
    const { subject, completed, limit = 20, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM lessons WHERE user_id = $1';
    let params = [req.user.id];
    let paramCount = 1;

    if (subject) {
      paramCount++;
      query += ` AND subject = $${paramCount}`;
      params.push(subject);
    }

    if (completed !== undefined) {
      paramCount++;
      query += ` AND completed = $${paramCount}`;
      params.push(completed === 'true');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete lesson
router.patch('/lessons/:id/complete', authenticateToken, [
  body('timeSpent').optional().isInt({ min: 0 }),
  body('comprehensionScore').optional().isInt({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const { id } = req.params;
    const { timeSpent = 0, comprehensionScore = 75 } = req.body;

    // Calculate points based on difficulty and comprehension
    const lessonResult = await db.query('SELECT difficulty_level FROM lessons WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    
    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const difficultyLevel = lessonResult.rows[0].difficulty_level;
    const basePoints = difficultyLevel * 20;
    const comprehensionBonus = Math.floor((comprehensionScore / 100) * basePoints);
    const totalPoints = basePoints + comprehensionBonus;

    const result = await db.query(`
      UPDATE lessons 
      SET completed = true,
          points_awarded = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [totalPoints, id, req.user.id]);

    // Award points to user
    await db.query(`
      UPDATE users 
      SET total_points = total_points + $1
      WHERE id = $2
    `, [totalPoints, req.user.id]);

    // Auto-create note
    await db.query(`
      INSERT INTO notes (user_id, title, content, subject, note_type, tags)
      VALUES ($1, $2, $3, $4, 'lesson_summary', ARRAY[$5])
    `, [
      req.user.id,
      `Summary: ${result.rows[0].title}`,
      `Lesson completed with ${comprehensionScore}% comprehension. Key points: ${result.rows[0].content.substring(0, 200)}...`,
      result.rows[0].subject,
      result.rows[0].subject.toLowerCase()
    ]);

    res.json({ 
      ...result.rows[0], 
      pointsEarned: totalPoints 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create quiz
router.post('/quizzes', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('subject').trim().isLength({ min: 1 }),
  body('questions').isArray().custom((questions) => {
    return questions.length > 0 && questions.every(q => 
      q.question && q.options && Array.isArray(q.options) && q.correctAnswer !== undefined
    );
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, subject, questions } = req.body;

    const result = await db.query(`
      INSERT INTO quizzes (user_id, title, subject, questions, total_questions)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user.id, title, subject, JSON.stringify(questions), questions.length]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit quiz
router.patch('/quizzes/:id/submit', authenticateToken, [
  body('answers').isArray(),
  body('timeSpent').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent = 0 } = req.body;

    // Get quiz
    const quizResult = await db.query('SELECT * FROM quizzes WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = quizResult.rows[0];
    const questions = quiz.questions;

    // Calculate score
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (questions[index] && answer === questions[index].correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const pointsEarned = correctAnswers * 10 + (score >= 80 ? 20 : 0);

    // Update quiz
    const result = await db.query(`
      UPDATE quizzes 
      SET score = $1,
          points_earned = $2,
          time_taken = $3,
          completed_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `, [score, pointsEarned, timeSpent, id, req.user.id]);

    // Award points to user
    await db.query(`
      UPDATE users 
      SET total_points = total_points + $1
      WHERE id = $2
    `, [pointsEarned, req.user.id]);

    // Record progress
    await db.query(`
      INSERT INTO progress (user_id, subject, accuracy, questions_answered, correct_answers, time_spent)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [req.user.id, quiz.subject, score, questions.length, correctAnswers, timeSpent]);

    // Auto-create note
    await db.query(`
      INSERT INTO notes (user_id, title, content, subject, note_type, tags)
      VALUES ($1, $2, $3, $4, 'quiz_result', ARRAY[$5])
    `, [
      req.user.id,
      `Quiz: ${quiz.title}`,
      `Quiz Result • ${correctAnswers}/${questions.length} • ${quiz.subject}`,
      quiz.subject,
      quiz.subject.toLowerCase()
    ]);

    res.json({ 
      ...result.rows[0],
      correctAnswers,
      totalQuestions: questions.length,
      accuracy: score
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's quizzes
router.get('/quizzes', authenticateToken, async (req, res) => {
  try {
    const { subject, completed, limit = 20, offset = 0 } = req.query;
    
    let query = 'SELECT id, title, subject, total_questions, score, points_earned, completed_at, created_at FROM quizzes WHERE user_id = $1';
    let params = [req.user.id];
    let paramCount = 1;

    if (subject) {
      paramCount++;
      query += ` AND subject = $${paramCount}`;
      params.push(subject);
    }

    if (completed !== undefined) {
      paramCount++;
      query += ` AND ${completed === 'true' ? 'completed_at IS NOT NULL' : 'completed_at IS NULL'}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate content endpoint with AI
router.post('/generate', [
  body('subject').isString(),
  body('topic').isString(),
  body('difficulty').optional().isString(),
  body('contentType').optional().isString(),
  body('learningStyle').optional().isString(),
  body('userProfile').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      subject, 
      topic, 
      difficulty = 'medium', 
      contentType = 'lesson',
      learningStyle = 'visual',
      userProfile = {} 
    } = req.body;

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const interests = userProfile.interests || [];
    const studentName = userProfile.name || 'Student';

    let prompt;
    if (contentType === 'lesson') {
      prompt = `Create a comprehensive ${difficulty} level lesson on "${topic}" for ${subject}.

Student Profile:
- Name: ${studentName}
- Learning Style: ${learningStyle}
- Interests: ${interests.join(', ') || 'Not specified'}

Requirements:
1. Start with an engaging introduction
2. Break down complex concepts into digestible sections
3. ${interests.length > 0 ? `Use analogies and examples related to: ${interests.slice(0, 2).join(', ')}` : 'Use relatable real-world examples'}
4. Include practical applications
5. End with key takeaways
6. Adapt explanations to ${learningStyle} learning style
7. Use markdown formatting for better readability

Make it engaging and personalized for the student's interests!`;
    } else if (contentType === 'summary') {
      prompt = `Create a concise summary of "${topic}" in ${subject} at ${difficulty} level.

Student Profile:
- Interests: ${interests.join(', ') || 'Not specified'}

Requirements:
1. Key concepts in bullet points
2. Important formulas or definitions
3. ${interests.length > 0 ? `Examples relating to ${interests[0]}` : 'Practical examples'}
4. Quick review points
5. Use markdown formatting`;
    } else {
      prompt = `Generate 5 practice questions on "${topic}" for ${subject} at ${difficulty} level.

Student Profile:
- Interests: ${interests.join(', ') || 'Not specified'}

Requirements:
1. Multiple choice questions with 4 options each
2. Include correct answers and explanations
3. ${interests.length > 0 ? `Use examples from ${interests[0]} where possible` : 'Use practical scenarios'}
4. Progressive difficulty
5. Format as markdown`;
    }

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    res.json({
      content,
      subject,
      topic,
      difficulty,
      contentType,
      personalizedFor: interests.length > 0 ? interests.slice(0, 2) : null
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Get content statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM lessons WHERE user_id = $1) as total_lessons,
        (SELECT COUNT(*) FROM lessons WHERE user_id = $1 AND completed = true) as completed_lessons,
        (SELECT COUNT(*) FROM quizzes WHERE user_id = $1) as total_quizzes,
        (SELECT COUNT(*) FROM quizzes WHERE user_id = $1 AND completed_at IS NOT NULL) as completed_quizzes,
        (SELECT COALESCE(AVG(score), 0) FROM quizzes WHERE user_id = $1 AND completed_at IS NOT NULL) as avg_quiz_score,
        (SELECT COALESCE(SUM(points_awarded), 0) FROM lessons WHERE user_id = $1 AND completed = true) as lesson_points,
        (SELECT COALESCE(SUM(points_earned), 0) FROM quizzes WHERE user_id = $1 AND completed_at IS NOT NULL) as quiz_points
    `, [req.user.id]);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;