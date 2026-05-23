import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserProfile, Scheme, Message, Language } from "../types";

const getApiKey = () => {
  if (typeof window !== "undefined") {
    // Client-side Vite environment
    return process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
  }
  // Server-side Node environment
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export async function analyzeEligibility(profile: UserProfile, schemes: Scheme[], language: Language = "en"): Promise<string> {
  const prompt = `
    You are an expert Eligibility Engine. Analyze the following user profile against the provided schemes.
    IMPORTANT: Respond in the language requested: ${language}.
    
    User Profile:
    ${JSON.stringify(profile, null, 2)}
    
    Schemes:
    ${JSON.stringify(schemes, null, 2)}
    
    Task:
    1. Identify which schemes the user is likely eligible for.
    2. Provide a brief explanation for each recommendation.
    3. If they are ineligible for a scheme, explain why and suggest what might change.
    4. Format the response in clear Markdown.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Unable to generate recommendations.";
  } catch (error: any) {
    console.error("Eligibility reasoning error:", error);
    return `Error analyzing eligibility: ${error?.message || error}`;
  }
}

export async function chatWithAssistant(history: Message[], userInput: string, language: Language = "en"): Promise<string> {
  const langNames: Record<Language, string> = {
    en: "English",
    hi: "Hindi",
    te: "Telugu",
    ta: "Tamil",
    bn: "Bengali",
    kn: "Kannada"
  };

  const systemInstruction = `
    You are JanaSeva, a helpful multilingual assistant for government schemes.
    Current interaction language: ${langNames[language]}. 
    IMPORTANT: You MUST respond primarily in ${langNames[language]} unless the user specifically asks to switch.
    Your goal is to help users understand schemes, eligibility, and application procedures.
    You support multiple languages, including regional ones (Hindi, Telugu, Tamil, Bengali, etc.).
    Keep your tone professional, empathetic, and clear.
    If you don't know something about a specific scheme, suggest the user check the official guidance in the app.

    CRITICAL INSTRUCTION: Whenever a user asks about, mentions, or requests information regarding any government scheme, you MUST provide a complete, detailed breakdown of the scheme, including:
    1. **Eligibility Criteria**: Detail who qualifies (e.g. age limits, income level, specific occupations like farmers/students, region, gender, differently-abled status).
    2. **Scheme Benefits**: Explain exactly what the beneficiary receives (cash transfers, subsidies, scholarships, pensions, loans).
    3. **Eligible States/Regions**: Specify where this scheme is active (e.g. Central scheme or active in specific states/UTs).
    4. **Required Documents**: List all documents required for the application (e.g. Income Certificate, Aadhaar, Domicile, Land Records).
    5. **Step-by-step Roadmap**: Provide a clear, actionable application checklist.
    
    Ensure this is presented using rich Markdown formatting (such as tables, bullet points, and bold text) so it is beautifully readable.
  `;

  try {
    // Gemini API requires history to start with a "user" role message.
    // Filter out leading "model" messages (e.g. the initial greeting) to prevent API errors.
    const filteredHistory = history.filter(msg => msg.role !== "assistant" || history.indexOf(msg) !== 0);
    
    // Also ensure alternating user/model pattern by building valid pairs
    const validHistory: { role: string; parts: { text: string }[] }[] = [];
    for (const msg of filteredHistory) {
      const role = msg.role === "assistant" ? "model" : "user";
      // Avoid consecutive same-role messages
      if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === role) {
        continue;
      }
      validHistory.push({ role, parts: [{ text: msg.content }] });
    }
    // Ensure history starts with "user" if it has entries
    if (validHistory.length > 0 && validHistory[0].role === "model") {
      validHistory.shift();
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: { systemInstruction },
      history: validHistory
    });

    // Add the constant instruction suffix to ensure the model always provides the scheme details
    const constantPromptSuffix = `\n\n[System Instruction: If the user is asking about or referencing a scheme, you MUST provide: 1. Eligibility Criteria, 2. Scheme Benefits, 3. Eligible States/Regions, 4. Required Documents, and 5. a Step-by-step Roadmap in ${langNames[language]} using clear and beautifully formatted Markdown.]`;

    const response: GenerateContentResponse = await chat.sendMessage({ message: userInput + constantPromptSuffix });
    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error: any) {
    console.error("Chat error:", error?.message || error);
    const diag = typeof window !== "undefined"
      ? `client [has process.env.GEMINI_API_KEY: ${!!process.env.GEMINI_API_KEY}, has VITE_GEMINI_API_KEY: ${!!(import.meta as any).env?.VITE_GEMINI_API_KEY}]`
      : `server [has process.env.GEMINI_API_KEY: ${!!process.env.GEMINI_API_KEY}]`;
    return `Chat error: ${error?.message || error} (Diagnostics: ${diag})`;
  }
}

export async function verifyDocument(imageData: string, schemeName: string, language: Language = "en"): Promise<string> {
  const prompt = `
    Analyze this document image for a scheme application: ${schemeName}.
    IMPORTANT: Respond in ${language}.
    1. Identify the type of document (Aadhaar, PAN, Income Certificate, etc.).
    2. Extract key information (Name, ID number, Expiry, etc.).
    3. Verify if this document typically fulfills the requirements for ${schemeName}.
    4. Flag any inconsistencies or blurred areas.
    Format your response in Markdown.
  `;

  try {
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageData.split(",")[1] || imageData,
      },
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, { text: prompt }] },
    });
    return response.text || "Document analysis failed.";
  } catch (error: any) {
    console.error("OCR error:", error);
    return `Error scanning document: ${error?.message || error}`;
  }
}
