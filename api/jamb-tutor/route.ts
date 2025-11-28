import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";

// Configure marked to use the KaTeX extension
// KaTeX will respect $$...$$ for display math and $...$ for inline math by default,
// so we only configure known options here.
marked.use(
  markedKatex({
    throwOnError: false, // Don't throw errors for invalid LaTeX
  })
);

// The API uses 'option' (singular) and the value can be null.
interface AlocQuestion {
  id: number;
  question: string;
  option: { [key: string]: string | null };
  answer: string;
  solution?: string;
  section: string;
}

// Helper to extract JSON from the AI's potentially messy response string
function extractJson(text: string | null): any | null {
  if (!text) return null;
  const startIndex = text.indexOf("{");
  const endIndex = text.lastIndexOf("}");
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex)
    return null;
  try {
    return JSON.parse(text.substring(startIndex, endIndex + 1));
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question: userQuery, userProfile } = await request.json();
    console.log("--- NEW JAMB TUTOR REQUEST ---");
    console.log("User Query:", userQuery);

    // 1. Use Gemini to smartly parse the user's query
    const parsingPrompt = `You are an intelligent assistant that extracts specific information from a user's request.
      From the user's query: "${userQuery}", extract the subject, year, and question number for a JAMB exam.
      Return the information in a clean JSON object with the keys: "subject", "year", and "questionNumber".
      If any piece of information is missing, set its value to null.`;

    const { text: jsonText } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: parsingPrompt,
    });

    const parsedInfo = extractJson(jsonText);
    const subjectMatch = parsedInfo?.subject;
    const yearMatch = parsedInfo?.year;
    const questionNumberMatch = parsedInfo?.questionNumber;

    console.log("Parsed Details via Gemini:", {
      subjectMatch,
      yearMatch,
      questionNumberMatch,
    });

    let retrievedQuestion: AlocQuestion | null = null;
    let prompt;

    // 2. Retrieve the question from the live API if keywords are found
    if (subjectMatch && yearMatch && questionNumberMatch) {
      // Use 'utme' for JAMB questions
      const apiUrl = `https://questions.aloc.com.ng/api/v2/m?subject=${subjectMatch}&year=${yearMatch}&type=utme`;
      const apiToken = process.env.ALOC_API_TOKEN;

      if (!apiToken) {
        throw new Error("ALOC_API_TOKEN is not set in environment variables.");
      }

      console.log("Fetching from ALOC API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          AccessToken: apiToken,
          Accept: "application/json",
        },
      });

      console.log("ALOC API Response Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`ALOC API Error: ${response.statusText}`, errorData);
        prompt = `You are a JAMB UTME tutor. The user asked for a question but there was an error fetching it from the database: "${errorData.error}". The request was for ${subjectMatch} ${yearMatch} question ${questionNumberMatch}. Politely inform the user that you couldn't retrieve questions for that specific subject or year and ask them to try another.`;
      } else {
        const responseData = await response.json();
        const allQuestions: AlocQuestion[] = responseData.data;

        if (!Array.isArray(allQuestions)) {
          console.error(
            "API did not return an array of questions in the 'data' property.",
            responseData
          );
          prompt = `You are a JAMB UTME tutor. I received an unexpected response from the question database for ${subjectMatch} ${yearMatch}. Please ask the user to try again shortly.`;
        } else {
          console.log(`Found ${allQuestions.length} questions from API.`);

          const questionIndex = parseInt(questionNumberMatch) - 1;
          console.log(`Attempting to get question at index: ${questionIndex}`);

          if (questionIndex >= 0 && questionIndex < allQuestions.length) {
            retrievedQuestion = allQuestions[questionIndex];
            console.log(
              "Successfully retrieved question:",
              retrievedQuestion.id
            );
          } else {
            console.log("Question index is out of bounds.");
          }
        }
      }
    }

    // 3. Augment the prompt and Generate the response
    if (retrievedQuestion) {
      console.log("Building prompt for retrieved question...");
      const optionsString = retrievedQuestion.option
        ? Object.entries(retrievedQuestion.option)
            .map(([key, value]) => `${key.toUpperCase()}. ${value || ""}`)
            .join("\n")
        : "No options provided.";

      prompt = `You are a world-class JAMB UTME tutor. A student has asked for a specific past question which has been retrieved from a live database.
      When writing chemical or mathematical formulas, ALWAYS enclose them in single dollar signs for inline math (e.g., $H_{2}SO_{4}$) or double dollar signs for block math (e.g., $$\\frac{a}{b} = \\frac{n(a)}{n(b)}$$). Ensure that any text within parentheses containing LaTeX is also correctly formatted, e.g., use $(\\text{H}_2\\text{SO}_4)$ to ensure proper rendering.

      Student Profile:
      - Name: ${userProfile.name}
      - Interests: ${userProfile.interests?.join(", ") || "Not specified"}

      Retrieved Past Question Details:
      - Subject: ${subjectMatch}
      - Year: ${yearMatch}
      - Question Number: ${questionNumberMatch}
      - Question: "${retrievedQuestion.question}"
      - Options:\n${optionsString}
      - Correct Answer: ${retrievedQuestion.answer}

      Task:
      1. First, state the full question and options clearly for the student.
      2. Provide the correct answer in the concept of one or two of the interests of the user. THe user does not understand  the subject, so explain in a layman's term. Do not just say the correct answer without explanation. THAT EXPLANATION MUST IMMEDIATELY BE IN THE CONCEPT OF the user's interest. If the user has no interest, explain in a general concept.
      3. Most importantly, give a detailed, step-by-step explanation of the underlying concept. **If possible, try to relate the explanation to one of the student's interests to make it more engaging.**
      4. Maintain an encouraging and helpful tone. Format your response using Markdown and LaTeX for all formulas.`;
    } else {
      console.log("Building 'question not found' prompt...");
      prompt = `You are a world-class JAMB UTME tutor AI. The user sent a message: "${userQuery}".
      You could not find a specific past question.
      Task:
      - Politely inform the student that you couldn't find that exact question.
      - Suggest they check the subject, year, and question number for typos (e.g., "chemistry 2019 question 6").
      - Offer to help with a topic in a general sense if they provide the question text or describe the topic.
      - Maintain a helpful and conversational tone.`;
    }

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
    });

    // Convert the Markdown + LaTeX response to HTML
    const htmlResponse = await marked(text);

    return NextResponse.json({ response: htmlResponse });
  } catch (error) {
    console.error("Error in JAMB Tutor API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to get tutor response", details: errorMessage },
      { status: 500 }
    );
  }
}
