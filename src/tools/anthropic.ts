import { generateText } from "ai";
import { createAnthropic } from '@ai-sdk/anthropic';
import { getApiKey } from "../lib/getapi";

const anthropic = createAnthropic({
    apiKey: String(getApiKey())
});

export const anthropicTool = async (prompt: object)=>{
    const res = await generateText({
        model: anthropic("claude-3-5-sonnet-latest"),
        prompt: JSON.stringify(prompt)
    });
    console.log(res.text);
    return res;
};