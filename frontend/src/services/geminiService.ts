import { GoogleGenerativeAI } from "@google/generative-ai";

export interface PriceRecommendation {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidenceScore: number; // 0-100
  reasoning: string;
  acceptanceRate: string; // e.g., "High", "Medium", "Low"
}

export const getPriceRecommendation = async (
  title: string,
  description: string,
  category: string,
  skills: string[]
): Promise<PriceRecommendation | null> => {
  if (!process.env.API_KEY) {
    console.warn("No API KEY found");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

    return JSON.parse(text) as PriceRecommendation;

  } catch (error) {
    console.error("Error fetching price recommendation:", error);
    return null;
  }
};