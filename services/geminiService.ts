
import { GoogleGenAI, Type } from "@google/genai";
import { COUNSELORS } from "../constants";

export const getAIAssistance = async (userInput: string) => {
  // Always use a named parameter with process.env.API_KEY directly for initialization.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const counselorData = COUNSELORS.map(c => ({
    id: c.id,
    name: c.name,
    specialties: c.specialties,
    tags: c.tags,
    bio: c.bio
  }));

  const prompt = `
    你是一位专业的心理导诊助手。用户正在描述他们的心理困惑。
    请根据以下咨询师的信息，为用户推荐1-2位最合适的咨询师。
    
    咨询师库: ${JSON.stringify(counselorData)}
    用户描述: "${userInput}"
    
    请以JSON格式返回：
    {
      "reason": "简短的推荐理由（温暖专业）",
      "counselorIds": ["ID1", "ID2"]
    }
  `;

  try {
    // Generate content using the recommended model and configuration.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reason: { type: Type.STRING },
            counselorIds: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["reason", "counselorIds"]
        }
      }
    });

    // Directly access the .text property of GenerateContentResponse.
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Matching failed:", error);
    return null;
  }
};
