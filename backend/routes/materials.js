const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents are allowed'));
    }
  }
});

// Initialize Gemini 2.5 Flash
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Upload and convert material
router.post('/convert', authenticateToken, upload.single('material'), async (req, res) => {
  try {
    const { interests, learningStyle, difficulty } = req.body;
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file content (simplified for text files)
    const filePath = req.file.path;
    let content = '';
    
    if (req.file.mimetype === 'text/plain') {
      content = await fs.readFile(filePath, 'utf8');
    } else {
      // For demo purposes, use filename as content indicator
      content = `Academic Material: ${req.file.originalname}\n\nThis document contains complex academic content that needs to be personalized for better understanding. The material covers advanced concepts that can be simplified and related to student interests.`;
    }

    // Generate personalized content using Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
You are an expert educational content personalizer and academic tutor. Transform the following confusing academic material into a clear, personalized, and engaging format.

Student Profile:
- Interests: ${interests}
- Learning Style: ${learningStyle}
- Difficulty Level: ${difficulty}

Original Confusing Material:
${content}

Your Task:
1. **Simplify Complex Concepts**: Break down difficult academic jargon into simple, understandable language
2. **Use Interest-Based Analogies**: Create analogies and examples using the student's interests (${interests}) to explain concepts
3. **Adapt to Learning Style**: Structure content for ${learningStyle} learners:
   - Visual: Use diagrams, charts, visual metaphors
   - Auditory: Include rhythm, rhymes, verbal explanations
   - Kinesthetic: Add hands-on activities, movement-based learning
   - Reading/Writing: Provide structured notes, summaries, written exercises
4. **Adjust Difficulty**: Make content appropriate for ${difficulty} level
5. **Add Practical Applications**: Show real-world relevance using student's interests
6. **Include Memory Aids**: Create mnemonics, acronyms, or memory tricks
7. **Structure for Understanding**: Use clear headings, bullet points, step-by-step explanations

Format your response as a comprehensive study guide with:
- Clear section headings
- Simplified explanations with interest-based examples
- Key takeaways
- Practice questions or activities
- Memory aids and tips

Make this material engaging, memorable, and easy to understand for a university student!
`;

    const result = await model.generateContent(prompt);
    const personalizedContent = result.response.text();

    // Save conversion record to database
    try {
      const conversionResult = await db.query(
        'INSERT INTO material_conversions (user_id, original_filename, personalized_content, interests, learning_style, difficulty, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
        [userId, req.file.originalname, personalizedContent, interests, learningStyle, difficulty]
      );

      // Clean up uploaded file
      await fs.unlink(filePath);

      res.json({
        success: true,
        conversion: conversionResult.rows[0],
        personalizedContent
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Still return the converted content even if DB save fails
      await fs.unlink(filePath);
      
      res.json({
        success: true,
        conversion: {
          id: Date.now(),
          original_filename: req.file.originalname,
          created_at: new Date().toISOString()
        },
        personalizedContent
      });
    }

  } catch (error) {
    console.error('Material conversion error:', error);
    res.status(500).json({ error: 'Failed to convert material: ' + error.message });
  }
});

// Get user's conversion history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT id, original_filename, interests, learning_style, difficulty, created_at FROM material_conversions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    res.json({ conversions: result.rows });
  } catch (error) {
    console.error('History fetch error:', error);
    // Return empty array if DB fails
    res.json({ conversions: [] });
  }
});

// Get specific conversion
router.get('/conversion/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT * FROM material_conversions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

    res.json({ conversion: result.rows[0] });
  } catch (error) {
    console.error('Conversion fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch conversion' });
  }
});

module.exports = router;