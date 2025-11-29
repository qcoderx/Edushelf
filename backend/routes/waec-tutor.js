const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to extract JSON from AI response
function extractJson(text) {
  if (!text) return null;
  const startIndex = text.indexOf("{");
  const endIndex = text.lastIndexOf("}");
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex)
    return null;
  try {
    return JSON.parse(text.substring(startIndex, endIndex + 1));
  } catch (e) {
    return null;
  }
}

router.post('/', async (req, res) => {
  try {
    const { question: userQuery, userProfile } = req.body;
    console.log("--- NEW WAEC TUTOR REQUEST ---");
    console.log("User Query:", userQuery);

    // Parse the user's query using AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const parsingPrompt = `Extract subject, year, and question number from: "${userQuery}". Return JSON with keys: "subject", "year", "questionNumber". Set missing values to null.`;

    const parsingResult = await model.generateContent(parsingPrompt);
    const parsedInfo = extractJson(parsingResult.response.text());
    const subjectMatch = parsedInfo?.subject;
    const yearMatch = parsedInfo?.year;
    const questionNumberMatch = parsedInfo?.questionNumber;

    console.log("Parsed Details:", { subjectMatch, yearMatch, questionNumberMatch });

    let retrievedQuestion = null;
    let prompt;

    // Fetch from ALOC API if we have the required info
    if (subjectMatch && yearMatch && questionNumberMatch) {
      const apiUrl = `https://questions.aloc.com.ng/api/v2/m?subject=${subjectMatch}&year=${yearMatch}&type=waec`;
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

          console.log("ALOC API Response Status:", response.status);

          if (response.ok) {
            const responseData = await response.json();
            const allQuestions = responseData.data;

            if (Array.isArray(allQuestions)) {
              console.log(`Found ${allQuestions.length} questions from API.`);
              const questionIndex = parseInt(questionNumberMatch) - 1;
              console.log(`Attempting to get question at index: ${questionIndex}`);

              if (questionIndex >= 0 && questionIndex < allQuestions.length) {
                retrievedQuestion = allQuestions[questionIndex];
                console.log("Successfully retrieved question:", retrievedQuestion.id);
              } else {
                console.log("Question index is out of bounds.");
              }
            }
          }
        } catch (error) {
          console.error("ALOC API error:", error);
        }
      }
    }

    // Build the appropriate prompt
    if (retrievedQuestion) {
      const optionsString = retrievedQuestion.option
        ? Object.entries(retrievedQuestion.option)
            .map(([key, value]) => `${key.toUpperCase()}. ${value || ""}`)
            .join("\n")
        : "No options provided.";

      prompt = `You are a world-class WAEC tutor. A student has asked for a specific past question.

Student Profile:
- Name: ${userProfile.name}
- Interests: ${userProfile.interests?.join(", ") || "Not specified"}

Retrieved Question:
- Subject: ${subjectMatch}
- Year: ${yearMatch}
- Question Number: ${questionNumberMatch}
- Question: "${retrievedQuestion.question}"
- Options:
${optionsString}
- Correct Answer: ${retrievedQuestion.answer}

Task:
1. State the full question and options clearly.
2. Provide the correct answer explained in terms of the user's interests in layman's terms.
3. Give detailed, step-by-step explanation relating to the student's interests.
4. Maintain an encouraging and helpful tone.`;
    } else {
      prompt = `You are a world-class WAEC tutor. The user asked: "${userQuery}".
You could not find a specific past question.
Task:
- Politely inform the student that you couldn't find that exact question.
- Suggest they check the subject, year, and question number format (e.g., "chemistry 2019 question 6").
- Offer to help with a topic in general if they provide the question text or describe the topic.
- Maintain a helpful and conversational tone.`;
    }

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ response });
  } catch (error) {
    console.error("Error in WAEC Tutor:", error);
    res.status(500).json({
      error: "Failed to get tutor response",
      details: error.message
    });
  }
});

module.exports = router;