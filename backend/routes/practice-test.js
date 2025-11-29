const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate practice test questions
router.post('/generate', async (req, res) => {
  try {
    const { examType, subject, difficulty, questionCount = 10, userProfile } = req.body;
    console.log("--- PRACTICE TEST GENERATION ---");
    console.log("Request:", { examType, subject, difficulty, questionCount });

    let questions = [];

    if (examType === 'JAMB' || examType === 'WAEC') {
      // Use ALOC API for JAMB/WAEC questions
      const apiUrl = `https://questions.aloc.com.ng/api/v2/m?subject=${subject}&type=${examType.toLowerCase() === 'jamb' ? 'utme' : 'waec'}`;
      const apiToken = process.env.ALOC_API_TOKEN;

      if (apiToken) {
        try {
          const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
              AccessToken: apiToken,
              Accept: "application/json",
            },
          });

          if (response.ok) {
            const responseData = await response.json();
            const allQuestions = responseData.data;

            if (Array.isArray(allQuestions) && allQuestions.length > 0) {
              // Randomly select questions based on difficulty
              const shuffled = allQuestions.sort(() => 0.5 - Math.random());
              const selectedQuestions = shuffled.slice(0, questionCount);

              questions = selectedQuestions.map((q, index) => ({
                id: index + 1,
                question: q.question,
                options: q.option ? Object.entries(q.option).map(([key, value]) => ({
                  id: key.toLowerCase(),
                  text: value || ''
                })).filter(opt => opt.text) : [],
                correctAnswer: q.answer?.toLowerCase() || 'a',
                explanation: q.solution || 'No explanation available',
                subject: subject,
                difficulty: difficulty
              }));

              console.log(`Generated ${questions.length} questions from ALOC API`);
            }
          }
        } catch (error) {
          console.error("ALOC API error:", error);
        }
      }
    }

    // If no questions from ALOC or General exam, generate with AI
    if (questions.length === 0) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `Generate ${questionCount} multiple choice questions for ${examType} ${subject} exam at ${difficulty} difficulty level.

Student Profile:
- Interests: ${userProfile?.interests?.join(", ") || "Not specified"}

Requirements:
1. Each question should have 4 options (A, B, C, D)
2. Include the correct answer
3. Provide a brief explanation for each answer
4. ${userProfile?.interests?.length > 0 ? `Try to relate examples to student interests: ${userProfile.interests.join(", ")}` : ''}
5. Format as JSON array with this structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "options": [
        {"id": "a", "text": "Option A"},
        {"id": "b", "text": "Option B"},
        {"id": "c", "text": "Option C"},
        {"id": "d", "text": "Option D"}
      ],
      "correctAnswer": "a",
      "explanation": "Explanation here",
      "subject": "${subject}",
      "difficulty": "${difficulty}"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          questions = parsedResponse.questions || [];
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
      }
    }

    if (questions.length === 0) {
      return res.status(500).json({ error: "Failed to generate questions" });
    }

    res.json({
      examType,
      subject,
      difficulty,
      questionCount: questions.length,
      questions
    });

  } catch (error) {
    console.error("Error generating practice test:", error);
    res.status(500).json({
      error: "Failed to generate practice test",
      details: error.message
    });
  }
});

module.exports = router;