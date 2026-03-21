import OpenAI from "openai";

// Debugging environment variable loading
console.log("DEBUG [OPENAI INIT]: Checking environment variables...");
console.log("- OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);
if (process.env.OPENAI_API_KEY) {
  console.log("- OPENAI_API_KEY length:", process.env.OPENAI_API_KEY.length);
  console.log("- OPENAI_API_KEY prefix:", process.env.OPENAI_API_KEY.substring(0, 7) + "...");
}

// Checking for common typos
if (process.env.OPEN_AI_API_KEY) console.warn("WARNING: Detected OPEN_AI_API_KEY (with underscore after OPEN). Use OPENAI_API_KEY instead.");
if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) console.log("INFO: Detected NEXT_PUBLIC_OPENAI_API_KEY.");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing",
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
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set in environment variables");
    return {
      error: "OpenAI API key is missing",
      detail: "Please set OPENAI_API_KEY in your .env file",
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
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
            {
              type: "image_url",
              image_url: {
                url: imageBase64.startsWith("data:")
                  ? imageBase64
                  : `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content;
    console.log("RAW AI RESPONSE:", text);

    if (!text) {
        throw new Error("Empty response from AI");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("OPENAI ERROR:", error);
    return {
      error: "Failed to analyze bug",
      detail: String(error),
    };
  }
}
