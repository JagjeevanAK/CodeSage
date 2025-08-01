import debugPrompt from "./debug";
import { reviewPrompt } from "./review";

export const prompt ={
    getPrompt: (promptName: string): object => {
        const prompts: Record<string, object> = {
            'debug': debugPrompt,
            'review': reviewPrompt,
        // 'help': 'Here are some commands you can use: ...',
        };
        
        return prompts[promptName] || 'Prompt not found.';
    }
};