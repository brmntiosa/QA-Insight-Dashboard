import { NextRequest, NextResponse } from "next/server";
import { analyzeBug } from "../../../src/ai/gemini";

export async function POST(req: NextRequest) {
  console.log("POST /api/analyze: Request received");
  console.log("DEBUG [ROUTE]: GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
  
  try {
    const { image } = await req.json();

    if (!image) {
      console.warn("POST /api/analyze: No image in request");
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 },
      );
    }

    console.log("POST /api/analyze: Calling analyzeBug...");
    const analysis = await analyzeBug(image);
    console.log("POST /api/analyze: analyzeBug returned:", analysis);

    if (analysis.error) {
      console.error("POST /api/analyze: analyzeBug reported error:", analysis.error);
      return NextResponse.json(
        { error: analysis.error, detail: analysis.detail },
        { status: 500 },
      );
    }

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST /api/analyze: API Analyze Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to analyze image" },
      { status: 500 },
    );
  }
}
