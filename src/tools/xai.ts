import { generateText } from "ai";
import { createXai } from '@ai-sdk/xai';
import { getApiKey } from "../lib/getapi";

const xai = createXai({
    apiKey: String(getApiKey()),
});

export const xaiTool = async (prompt: object)=>{
    const res = await generateText({
        model: xai("grok-3-beta"),
        prompt: JSON.stringify(prompt)
    });
    return res;
    console.log(res.text);
};