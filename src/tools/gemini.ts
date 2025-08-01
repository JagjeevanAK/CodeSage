import { generateText } from "ai";
import { prompt } from "../prompt";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getApiKey } from "../lib/getapi";

const google = createGoogleGenerativeAI({
    apiKey: String(getApiKey())
});

export const geminiTool = async (prompt:object)=> {
    console.log(`Using prompt: ${JSON.stringify(prompt)}`);
    const res = await generateText({
        model: google("models/gemini-2.5-flash"),
        prompt: JSON.stringify(prompt),
    });
    console.log(res.text);
    return res;
};

geminiTool(prompt.getPrompt('debug'));