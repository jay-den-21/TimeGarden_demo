import { GoogleGenerativeAI } from "@google/generative-ai";

export interface PriceRecommendation {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidenceScore: number; // 0-100
  reasoning: string;
  acceptanceRate: string; // e.g., "High", "Medium", "Low"
}

export interface RecommendationResult {
  recommendation: PriceRecommendation | null;
  error: string | null;
}

export const getPriceRecommendation = async (
  title: string,
  description: string,
  category: string,
  skills: string[]
): Promise<RecommendationResult> => {
  if (!process.env.API_KEY || process.env.API_KEY === "your_gemini_api_key") {
    const errorMsg = "API Key is not configured. Please add it to your frontend/.env file.";
    console.warn(errorMsg);
    return { recommendation: null, error: errorMsg };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert pricing algorithm for a university task marketplace called TimeGarden.
      Tasks use "Time Coins" (TC) as currency. 1 hour of unskilled labor is approx 10 TC. Specialized coding/tutoring is 20-50 TC/hr.
      
      Analyze the following task and suggest a fixed price budget.
      Task Title: ${title}
      Category: ${category}
      Description: ${description}
      Required Skills: ${skills.join(", ")}

      Return ONLY a raw JSON object (no markdown formatting) with the following structure:
      {
        "recommendedPrice": number,
        "minPrice": number,
        "maxPrice": number,
        "confidenceScore": number (0-100),
        "reasoning": "string",
        "acceptanceRate": "High" | "Medium" | "Low"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    if (!text.startsWith("{")) {
        throw new Error("Invalid response format from API. Expected a JSON object.");
    }
    
    const recommendation = JSON.parse(text) as PriceRecommendation;
    return { recommendation, error: null };

  } catch (error: any) {
    console.error("Error fetching price recommendation:", error);
    const errorMessage = error.message.includes("API key not valid")
      ? "Your API Key is not valid. Please check your .env file or Google AI Studio."
      : `An error occurred: ${error.message}`;
    return { recommendation: null, error: errorMessage };
  }
};