const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { generateContent, generateStructuredContent } = require('../config/gemini');
const router = express.Router();

// AI Tutor Chat
router.post('/tutor/chat', authenticateToken, [
  body('message').trim().isLength({ min: 1 }),
  body('subject').optional().isString(),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, subject = 'General', context = {} } = req.body;
    
    const prompt = `You are an expert ${subject} tutor for Nigerian students preparing for JAMB and WAEC exams. 
    
Student's question: "${message}"
Subject: ${subject}
Context: ${JSON.stringify(context)}

Provide a helpful, educational response that:
1. Directly answers the student's question
2. Uses simple, clear language
3. Includes relevant examples from Nigerian curriculum
4. Encourages further learning
5. Stays focused on ${subject}

Keep response under 200 words and be encouraging.`;

    const response = await generateContent(prompt);

    res.json({
      response,
      subject,
      timestamp: new Date().toISOString(),
      suggestions: [
        "Can you explain this with an example?",
        "What are the key points to remember?",
        "How does this relate to JAMB/WAEC exams?"
      ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Generate personalized content
router.post('/generate/content', authenticateToken, [
  body('type').isIn(['lesson', 'summary', 'practice']),
  body('subject').isString(),
  body('topic').isString(),
  body('difficulty').optional().isInt({ min: 1, max: 5 }),
  body('learningStyle').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, subject, topic, difficulty = 3, learningStyle = 'Visual' } = req.body;

    let prompt = '';
    
    if (type === 'lesson') {
      prompt = `Create a comprehensive ${subject} lesson on "${topic}" for Nigerian students.

Requirements:
- Difficulty level: ${difficulty}/5
- Learning style: ${learningStyle}
- Include JAMB/WAEC exam relevance
- Use Nigerian examples where applicable
- Structure: Introduction, Key Concepts, Examples, Practice Questions, Summary

Format as JSON with: title, content (markdown), estimatedDuration (minutes), difficultyLevel, keyPoints (array)`;
    } else if (type === 'summary') {
      prompt = `Create a concise study summary for ${subject} topic "${topic}".

Requirements:
- Quick revision format
- Key formulas/concepts
- Memory aids
- Exam tips for JAMB/WAEC

Format as JSON with: title, content (markdown), keyPoints (array), studyTips (array)`;
    } else if (type === 'practice') {
      prompt = `Generate practice questions for ${subject} topic "${topic}".

Requirements:
- ${difficulty === 1 ? 'Basic' : difficulty === 2 ? 'Intermediate' : difficulty === 3 ? 'Standard' : difficulty === 4 ? 'Advanced' : 'Expert'} level
- JAMB/WAEC style questions
- Include solutions and explanations

Format as JSON with: title, questions (array with question, options, correctAnswer, explanation)`;
    }

    let generatedContent;
    try {
      generatedContent = await generateStructuredContent(prompt, 'json');
    } catch (error) {
      console.error('Structured content generation failed:', error);
      // Fallback to simple content generation
      const simpleContent = await generateContent(prompt);
      generatedContent = {
        title: `${topic} - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        content: simpleContent,
        estimatedDuration: difficulty * 15,
        difficultyLevel: difficulty
      };
    }
    
    res.json({
      ...generatedContent,
      subject,
      topic,
      learningStyle,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Generate quiz questions
router.post('/generate/quiz', authenticateToken, [
  body('subject').isString(),
  body('topic').isString(),
  body('questionCount').isInt({ min: 1, max: 20 }),
  body('difficulty').optional().isInt({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, topic, questionCount, difficulty = 3 } = req.body;

    const prompt = `Generate ${questionCount} multiple choice questions for ${subject} on "${topic}".

Requirements:
- Nigerian JAMB/WAEC exam style
- Difficulty: ${difficulty}/5
- Each question should have 4 options (A, B, C, D)
- Include detailed explanations
- Use Nigerian context where relevant

Format as JSON:
{
  "title": "Quiz title",
  "subject": "${subject}",
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation",
      "difficulty": ${difficulty},
      "points": ${difficulty * 10}
    }
  ],
  "totalQuestions": ${questionCount},
  "estimatedTime": ${questionCount * 2}
}`;

    const quiz = await generateStructuredContent(prompt, 'json');
    
    res.json({
      ...quiz,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Analyze performance and provide recommendations
router.post('/analyze/performance', authenticateToken, async (req, res) => {
  try {
    const db = require('../config/database');
    
    // Get user's recent performance data
    const performanceData = await db.query(`
      SELECT 
        subject,
        AVG(accuracy) as avg_accuracy,
        COUNT(*) as attempts,
        SUM(questions_answered) as total_questions,
        SUM(correct_answers) as total_correct
      FROM progress 
      WHERE user_id = $1 
        AND date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY subject
      ORDER BY avg_accuracy ASC
    `, [req.user.id]);

    const prompt = `Analyze this student's performance data and provide personalized recommendations:

Performance Data:
${JSON.stringify(performanceData.rows, null, 2)}

Student Profile:
- Exam Focus: ${req.user.exam_focus}
- Learning Style: ${req.user.learning_style}
- Interests: ${req.user.interests}

Provide analysis as JSON:
{
  "overallScore": number,
  "recommendations": [
    {
      "type": "improvement|practice|advanced",
      "subject": "subject name",
      "message": "recommendation message",
      "action": "specific action",
      "priority": "high|medium|low"
    }
  ],
  "learningPath": [
    {
      "subject": "subject",
      "suggestedDuration": "time period",
      "focusAreas": ["area1", "area2"],
      "estimatedImprovement": "percentage"
    }
  ],
  "insights": ["insight1", "insight2"]
}`;

    const analysis = await generateStructuredContent(prompt, 'json');
    
    res.json({
      performance: performanceData.rows,
      ...analysis,
      analyzedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze performance' });
  }
});

// Generate study schedule based on AI analysis
router.post('/generate/schedule', authenticateToken, [
  body('duration').isInt({ min: 7, max: 90 }),
  body('dailyHours').isInt({ min: 1, max: 8 }),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const { duration, dailyHours, preferences = {} } = req.body;
    const db = require('../config/database');
    
    // Get user's weak subjects
    const weakSubjects = await db.query(`
      SELECT subject, AVG(accuracy) as avg_accuracy
      FROM progress 
      WHERE user_id = $1
      GROUP BY subject
      ORDER BY avg_accuracy ASC
      LIMIT 5
    `, [req.user.id]);

    const prompt = `Create a personalized study schedule for a Nigerian student:

Student Info:
- Exam Focus: ${req.user.exam_focus}
- Learning Style: ${req.user.learning_style}
- Weak Subjects: ${JSON.stringify(weakSubjects.rows)}

Schedule Requirements:
- Duration: ${duration} days
- Daily Hours: ${dailyHours}
- Preferences: ${JSON.stringify(preferences)}

Generate as JSON:
{
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "sessions": [
        {
          "subject": "subject name",
          "duration": minutes,
          "startTime": "HH:MM",
          "type": "study|review|practice",
          "priority": "high|medium|low",
          "topics": ["topic1", "topic2"]
        }
      ]
    }
  ],
  "totalDays": number,
  "totalHours": number,
  "focusSubjects": ["subject1", "subject2"],
  "tips": ["tip1", "tip2"]
}`;

    const scheduleData = await generateStructuredContent(prompt, 'json');
    
    res.json({
      ...scheduleData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate schedule' });
  }
});

// AI Chat endpoint (matching swagger documentation)
router.post('/chat', authenticateToken, [
  body('message').trim().isLength({ min: 1 }),
  body('subject').optional().isString(),
  body('context').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, subject = 'General', context = '' } = req.body;
    
    const prompt = `You are an expert ${subject} tutor for Nigerian students preparing for JAMB and WAEC exams. 
    
Student's question: "${message}"
Subject: ${subject}
Context: ${context}

Provide a helpful, educational response that:
1. Directly answers the student's question
2. Uses simple, clear language
3. Includes relevant examples from Nigerian curriculum
4. Encourages further learning
5. Stays focused on ${subject}

Keep response under 200 words and be encouraging.`;

    const response = await generateContent(prompt);

    res.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Explain past questions
router.post('/explain/question', authenticateToken, [
  body('question').trim().isLength({ min: 1 }),
  body('subject').isString(),
  body('options').optional().isArray(),
  body('correctAnswer').optional().isString()
], async (req, res) => {
  try {
    const { question, subject, options = [], correctAnswer } = req.body;

    const prompt = `Explain this ${subject} exam question for a Nigerian student:

Question: ${question}
${options.length > 0 ? `Options: ${options.join(', ')}` : ''}
${correctAnswer ? `Correct Answer: ${correctAnswer}` : ''}

Provide a detailed explanation that:
1. Breaks down the question
2. Explains the concept being tested
3. Shows step-by-step solution
4. Explains why other options are wrong (if applicable)
5. Gives study tips for similar questions

Keep it educational and encouraging.`;

    const explanation = await generateContent(prompt);

    res.json({
      question,
      subject,
      explanation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to explain question' });
  }
});

module.exports = router;