import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google"; // Google AI SDK provider
import { marked } from "marked";
import markedKatex from "marked-katex-extension";

// Configure marked to use the KaTeX extension
marked.use(
  markedKatex({
    throwOnError: false,
  })
);

interface AlocQuestion {
  id: number;
  question: string;
  option: { [key: string]: string | null };
  answer: string;
  solution?: string;
  section: string;
}

// Helper to extract JSON from AI response
function extractJson(text: string | null): any | null {
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

export async function POST(request: NextRequest) {
  try {
    const { userProfile, question, context } = await request.json();

    // Check if this is a JAMB/WAEC question request
    const isExamQuestion = context && (context.includes("JAMB") || context.includes("WAEC"));
    let retrievedQuestion: AlocQuestion | null = null;
    let prompt;

    if (isExamQuestion) {
      // Parse the question using AI
      const examType = context.includes("JAMB") ? "jamb" : "waec";
      const parsingPrompt = `Extract subject, year, and question number from: "${question}". Return JSON with keys: "subject", "year", "questionNumber". Set missing values to null.`;

      const { text: jsonText } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: parsingPrompt,
      });

      const parsedInfo = extractJson(jsonText);
      const subjectMatch = parsedInfo?.subject;
      const yearMatch = parsedInfo?.year;
      const questionNumberMatch = parsedInfo?.questionNumber;

      // Fetch from ALOC API if we have the required info
      if (subjectMatch && yearMatch && questionNumberMatch) {
        const apiUrl = `https://questions.aloc.com.ng/api/v2/m?subject=${subjectMatch}&year=${yearMatch}&type=${examType}`;
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
              const allQuestions: AlocQuestion[] = responseData.data;

              if (Array.isArray(allQuestions)) {
                const questionIndex = parseInt(questionNumberMatch) - 1;
                if (questionIndex >= 0 && questionIndex < allQuestions.length) {
                  retrievedQuestion = allQuestions[questionIndex];
                }
              }
            }
          } catch (error) {
            console.error("ALOC API error:", error);
          }
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

      prompt = `You are a world-class ${context.includes("JAMB") ? "JAMB" : "WAEC"} tutor. A student has asked for a specific past question.

Student Profile:
- Name: ${userProfile.name}
- Interests: ${userProfile.interests?.join(", ") || "Not specified"}

Retrieved Question:
- Question: "${retrievedQuestion.question}"
- Options:\n${optionsString}
- Correct Answer: ${retrievedQuestion.answer}

Task:
1. State the full question and options clearly.
2. Provide the correct answer explained in terms of the user's interests in layman's terms.
3. Give detailed, step-by-step explanation relating to the student's interests.
4. Use Markdown and LaTeX formatting ($ for inline, $$ for block math).`;
    } else {
      prompt = `You are an AI tutor helping a student with the following profile:

Student Profile:
- Name: ${userProfile.name}
- Exam: ${userProfile.examType}
- Learning Style: ${userProfile.learningStyle?.join(", ") || "Not specified"}
- Current Subjects: ${userProfile.subjects?.map((s: any) => `${s.subject} (Level ${s.currentLevel})`).join(", ") || "Not specified"}
- Learning Challenges: ${userProfile.learningChallenges?.join(", ") || "Not specified"}
- Motivation Factors: ${userProfile.motivationFactors?.join(", ") || "Not specified"}

Student Question: "${question}"
Context: ${context || "General help request"}

Provide a helpful, personalized response that:
1. Addresses their specific question conversationally.
2. Adapts to their learning style and level.
3. Provides step-by-step guidance if needed.
4. Suggests study materials or tips.
5. Encourages them based on their motivation factors.

${isExamQuestion ? "If you couldn't find the specific question, suggest they check subject, year, and question number format (e.g., 'chemistry 2019 question 6')." : ""}`;
    }

    let text: string | null = null;
    try {
      const result = await generateText({
        model: google("gemini-2.5-flash"),
        prompt,
        system: "You are a patient, encouraging AI tutor who adapts teaching methods to each student's unique learning profile.",
      });
      text = result.text;
    } catch (sdkError) {
      console.warn("Gemini SDK unavailable:", sdkError);
      text = "I'm sorry, I couldn't process your request at the moment. Please try again later.";
    }

    // Convert to HTML if it's an exam question (for LaTeX rendering)
    const response = retrievedQuestion ? await marked(text || "") : text;

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in AI tutor:", error);
    return NextResponse.json(
      { error: "Failed to get tutor response" },
      { status: 500 }
    );
  }
}
