import { generateText } from "ai";
import { createOpenAI } from '@ai-sdk/openai';
import { getApiKey } from "../lib/getapi";

const openai = createOpenAI({
    apiKey: String(getApiKey()),
    compatibility: 'strict', 
});

export const openaiTool = async (prompt: object)=>{
    const res = await generateText({
        model: openai("o3-mini"),
        prompt: JSON.stringify(prompt)
    });
    return res;
    console.log(res.text);
};