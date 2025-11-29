import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
// 'mammoth' is dynamically imported in extractTextFromDOCX to avoid missing type declaration errors at compile time
import { createWorker } from "tesseract.js";
import puppeteer from "puppeteer";

// Helper to extract JSON from AI response
function extractJson(text: string | null): string | null {
  if (!text) return null;
  const startIndex = text.indexOf("{");
  const endIndex = text.lastIndexOf("}");
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex)
    return null;
  return text.substring(startIndex, endIndex + 1);
}

// Extract text from PDF
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use dynamic import to avoid bundling issues and ensure we call the default export
    const pdfModule = await import("pdf-parse");
    // Some bundlers/ESM interop place the callable function on the default export
    const pdfParse = (pdfModule as any).default ?? pdfModule;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    // Fallback to pdfjs-dist if pdf-parse fails
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      return text;
    } catch (fallbackError) {
      console.error("Fallback PDF extraction also failed:", fallbackError);
      throw new Error("Failed to extract text from PDF");
    }
  }
}

// Extract text from DOCX
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    // Dynamically import 'mammoth' at runtime to avoid TypeScript compile errors when type declarations are missing.
    const mammothModule = await import("mammoth");
    const mammothLib = (mammothModule as any).default ?? mammothModule;
    const result = await mammothLib.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

// Extract text from image using OCR
async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    const worker = await createWorker();
    // Use the standard worker startup sequence and cast to any to satisfy TypeScript typings
    await (worker as any).load();
    await (worker as any).loadLanguage("eng");
    await (worker as any).initialize("eng");
    const {
      data: { text },
    } = await (worker as any).recognize(buffer);
    await (worker as any).terminate();
    return text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to extract text from image");
  }
}

// Generate PDF from HTML content
async function generatePDF(htmlContent: string): Promise<Buffer> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "1in",
        right: "1in",
        bottom: "1in",
        left: "1in",
      },
    });
    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userProfile = JSON.parse(formData.get("userProfile") as string);

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload PDF, DOCX, or image files.",
        },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text based on file type
    let extractedText = "";
    try {
      if (file.type === "application/pdf") {
        extractedText = await extractTextFromPDF(buffer);
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        extractedText = await extractTextFromDOCX(buffer);
      } else if (file.type.startsWith("image/")) {
        extractedText = await extractTextFromImage(buffer);
      }
    } catch (error) {
      console.error("Text extraction failed:", error);
      return NextResponse.json(
        { error: "Failed to extract text from the uploaded file" },
        { status: 500 }
      );
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "No readable text found in the uploaded file" },
        { status: 400 }
      );
    }

    // Use AI to analyze content and identify topics
    const analysisPrompt = `
      Analyze the following educational material and identify key topics, concepts, and learning objectives.

      **Material Content:**
      ${extractedText.substring(0, 10000)} // Limit content for API

      **Instructions:**
      1. Identify the main subject area and specific topics covered
      2. Extract key concepts and learning objectives
      3. Determine the appropriate difficulty level
      4. Suggest how this material could be personalized for different learning styles

      **JSON Structure:**
      Format the response as a single, valid JSON object with the following keys:
      - "subject": string (main subject area)
      - "topics": string[] (key topics identified)
      - "concepts": string[] (important concepts)
      - "difficulty": string (beginner/intermediate/advanced)
      - "learningObjectives": string[] (what students should learn)
      - "personalizationSuggestions": object with keys for different learning styles (visual, auditory, kinesthetic, reading)
    `;

    let analysisText: string | null = null;
    try {
      const analysisResult = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: analysisPrompt,
        system:
          "You are an expert educational content analyzer. Always respond with a single, valid JSON object containing detailed analysis of educational material.",
      });
      analysisText = analysisResult.text;
    } catch (analysisError) {
      console.warn("AI analysis failed, using fallback:", analysisError);
    }

    let materialAnalysis;
    try {
      const jsonString = extractJson(analysisText);
      materialAnalysis = jsonString ? JSON.parse(jsonString) : null;
    } catch (e) {
      console.error("Failed to parse analysis response:", e);
      materialAnalysis = null;
    }

    // Fallback analysis
    if (!materialAnalysis) {
      materialAnalysis = {
        subject: "General Education",
        topics: ["Uploaded Material"],
        concepts: ["Various concepts from uploaded material"],
        difficulty: "intermediate",
        learningObjectives: ["Understand the content in the uploaded material"],
        personalizationSuggestions: {
          visual: "Use diagrams and charts to explain concepts",
          auditory: "Discuss concepts through audio explanations",
          kinesthetic: "Include hands-on activities",
          reading: "Provide detailed written explanations",
        },
      };
    }

    // Generate personalized explanations for each topic
    const personalizedExplanations: {
      topic: string;
      explanation: string;
      examples: string[];
      keyPoints: string[];
      connections: string[];
    }[] = [];

    for (const topic of materialAnalysis.topics.slice(0, 3)) {
      // Limit to 3 topics
      const explanationPrompt = `
        You are an expert AI educator. Generate a personalized explanation for the following topic based on the student's profile.

        **Student Profile:**
        - Name: ${userProfile.name}
        - Learning Style: ${userProfile.learningStyle.join(", ")}
        - Interests: ${userProfile.interests.join(", ")}
        - Current Level: ${userProfile.gradeLevel}

        **Topic:** ${topic}
        **Subject:** ${materialAnalysis.subject}
        **Difficulty:** ${materialAnalysis.difficulty}

        **Instructions:**
        1. Create a detailed, personalized explanation tailored to the student's learning style and interests
        2. Include real-world examples relevant to the student's interests
        3. Use appropriate language for the student's grade level
        4. Make connections to concepts the student might already know

        **JSON Structure:**
        Format the response as a single, valid JSON object with the following keys:
        - "topic": string
        - "explanation": string (detailed personalized explanation)
        - "examples": string[] (2-3 relevant examples)
        - "keyPoints": string[] (3-5 main points)
        - "connections": string[] (links to related concepts)
      `;

      let explanationText: string | null = null;
      try {
        const explanationResult = await generateText({
          model: google("gemini-2.5-flash"),
          prompt: explanationPrompt,
          system:
            "You are an expert educational content creator. Always respond with a single, valid JSON object containing personalized educational explanations.",
        });
        explanationText = explanationResult.text;
      } catch (explanationError) {
        console.warn("Explanation generation failed:", explanationError);
      }

      let explanation;
      try {
        const jsonString = extractJson(explanationText);
        explanation = jsonString ? JSON.parse(jsonString) : null;
      } catch (e) {
        console.error("Failed to parse explanation response:", e);
        explanation = null;
      }

      // Fallback explanation
      if (!explanation) {
        explanation = {
          topic,
          explanation: `This is a personalized explanation for ${topic}. The AI model may be temporarily unavailable. Please try again shortly.`,
          examples: ["Example 1", "Example 2"],
          keyPoints: ["Key point 1", "Key point 2", "Key point 3"],
          connections: ["Related concept 1", "Related concept 2"],
        };
      }

      personalizedExplanations.push(explanation);
    }

    // Generate HTML for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Personalized Learning Material - ${
            materialAnalysis.subject
          }</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            h2 { color: #34495e; margin-top: 30px; }
            .topic { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3498db; }
            .examples { background: #e8f5e8; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .key-points { background: #fff3cd; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .connections { background: #f8d7da; padding: 15px; margin: 10px 0; border-radius: 5px; }
            ul { padding-left: 20px; }
            li { margin: 5px 0; }
          </style>
        </head>
        <body>
          ${personalizedExplanations
            .map(
              (exp) => `
            <div class="topic">
              <h2>${exp.topic}</h2>
              <p>${exp.explanation}</p>

              <div class="examples">
                <h3>Examples</h3>
                <ul>
                  ${exp.examples.map((ex: string) => `<li>${ex}</li>`).join("")}
                </ul>
              </div>

              <div class="key-points">
                <h3>Key Points</h3>
                <ul>
                  ${exp.keyPoints
                    .map((point: string) => `<li>${point}</li>`)
                    .join("")}
                </ul>
              </div>

              <div class="connections">
                <h3>Connections to Other Concepts</h3>
                <ul>
                  ${exp.connections
                    .map((conn: string) => `<li>${conn}</li>`)
                    .join("")}
                </ul>
              </div>
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `;

    // Generate PDF
    const pdfBuffer = await generatePDF(htmlContent);

    // Return response with PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="personalized-${materialAnalysis.subject
          .toLowerCase()
          .replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error processing uploaded material:", error);
    return NextResponse.json(
      { error: "Failed to process uploaded material" },
      { status: 500 }
    );
  }
}
