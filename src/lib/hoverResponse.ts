import { getTool, ProviderResponse } from "../tools";
import { getModel } from "./getmodel";
import { PromptManager } from "../prompt/PromptManager";
import { UserAction, CodeContext } from "../prompt/types";

export const modelHoverRes = async (data: object): Promise<ProviderResponse> => {
    const res = await getTool.provider(String(getModel()), data);
    
    return res;
};

/**
 * Enhanced hover response using the JSON prompt system
 * Provides structured debug analysis for error diagnostics
 */
export const modelHoverResWithPrompt = async (
    codeContext: CodeContext
): Promise<ProviderResponse> => {
    const promptManager = PromptManager.getInstance();
    
    // Process the request using the debug analysis prompt
    const processedPrompt = await promptManager.processRequest(UserAction.DEBUG_ERROR, codeContext);
    
    // Use the processed prompt with the model
    const response = await getTool.provider(String(getModel()), processedPrompt.content);
    
    return response;
};