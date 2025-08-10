import { anthropicTool } from "./anthropic";
import { geminiTool } from "./gemini";
import { groqTool } from "./groq";
import { openaiTool } from "./openai";
import { xaiTool } from "./xai";

interface ProviderResponse {
    text: string;
    metadata?: any;
    promptType?: string;
}

export const getTool = {
    provider: (providerName: string, prompt: any): Promise<ProviderResponse> => {
        switch (providerName) {
            case "Anthropic":
                return anthropicTool(prompt);
            case "Gemini":
                return geminiTool(prompt);
            case "Groq":
                return groqTool(prompt);
            case "OpenAI":
                return openaiTool(prompt);
            case "Xai":
                return xaiTool(prompt);
            default:
                throw new Error(`Unknown provider: ${providerName}`);
        }
    }
};

// Export types for use by other modules
export type { ProviderResponse };