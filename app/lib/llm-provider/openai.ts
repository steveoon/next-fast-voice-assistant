import { createOpenAI } from "@ai-sdk/openai";

let openaiInstance: ReturnType<typeof createOpenAI> | null = null;

export function getOpenai() {
  if (!openaiInstance) {
    const baseUrl = "https://api.ohmygpt.com/v1/";

    if (!baseUrl) {
      throw new Error("openai-baseUrl is not defined.");
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined.");
    }

    openaiInstance = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: baseUrl,
      compatibility: "strict",
    });
  }
  return openaiInstance;
}
