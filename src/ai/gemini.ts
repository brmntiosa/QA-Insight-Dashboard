import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  apiVersion: "v1",
});

interface AnalyzeResult {
  title?: string;
  description?: string;
  steps_to_reproduce?: string[];
  expected_result?: string;
  actual_result?: string;
  severity?: string;
  error?: string;
  detail?: string;
}

export async function analyzeBug(imageBase64: string): Promise<AnalyzeResult> {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing");
    return {
      error: "Gemini API key is missing",
      detail: "Please set GEMINI_API_KEY in your .env file",
    };
  }

  try {
    // Strip data URL prefix if present
    const base64Data = imageBase64.includes("base64,")
      ? imageBase64.split("base64,")[1]
      : imageBase64;

    console.log("DEBUG [GEMINI]: Sending request to gemini-1.5-pro (v1)...");

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
            {
              text: `
Analyze this bug screenshot and return a JSON object with the following structure:
{
  "title": "Short descriptive title",
  "description": "Clear description of the bug",
  "steps_to_reproduce": ["Step 1", "Step 2", ...],
  "expected_result": "What should have happened",
  "actual_result": "What actually happened",
  "severity": "Low" | "Medium" | "High" | "Critical"
}

Return ONLY the JSON object.
              `,
            },
          ],
        },
      ],
    });

    // Handle response structure correctly for @google/genai
    const text = response.text || "";
    console.log("DEBUG [GEMINI]: RAW AI RESPONSE:", text);

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Clean Markdown if AI included it
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("GEMINI ERROR:", error);
    return {
      error: "Failed to analyze bug",
      detail: String(error),
    };
  }
}
