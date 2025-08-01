import { anthropicTool } from "./anthropic";
import { geminiTool } from "./gemini";
import { openaiTool } from "./openai";
import { xaiTool } from "./xai";

export const getTool = {
    provider: (providerName: string, prompt: any) : object => {
        switch (providerName) {
            case "Anthropic":
                return anthropicTool(prompt);
            case "Gemeni":
                return geminiTool(prompt);
            case "OpenAI":
                return openaiTool(prompt);
            case "Xai":
                return xaiTool(prompt);
            default:
                throw new Error(`Unknown provider: ${providerName}`);
        }
    }
};
// getTool.provider("gemini", "Hello world");