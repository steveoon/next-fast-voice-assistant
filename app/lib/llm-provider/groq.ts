import { createOpenAI } from "@ai-sdk/openai";

let groqInstance: ReturnType<typeof createOpenAI> | null = null;

export function getGroq() {
  if (!groqInstance) {
    const baseUrl = "https://api.groq.com/openai/v1";

    if (!baseUrl) {
      throw new Error("groq-baseUrl is not defined.");
    }

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not defined.");
    }

    groqInstance = createOpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: baseUrl,
    });
  }
  return groqInstance;
}
