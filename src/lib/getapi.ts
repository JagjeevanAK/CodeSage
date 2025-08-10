import { vscode } from "../helper/vscode";
import { apiKeyCache } from "./apiKeyCache";

export function getApiKey() {
    try {
        // Try to use cache if initialized
        if (apiKeyCache.isInitialized()) {
            try {
                const cachedKey = apiKeyCache.get();
                return cachedKey;
            } catch (error) {
                // Log cache retrieval error and fall back to direct query
                console.error('DebugBuddy: Error retrieving API key from cache, falling back to direct VSCode query:', error);
            }
        }
        
        // Cache miss or cache failure: query VSCode settings directly
        const apiKey = vscode.workspace.getConfiguration('DebugBuddy').get('apiKey') as string | undefined;
        
        // Try to cache the result, but don't fail if caching fails
        try {
            apiKeyCache.set(apiKey);
        } catch (error) {
            // Log cache update error but continue with the retrieved key
            console.error('DebugBuddy: Error updating API key cache, continuing with direct query result:', error);
        }
        
        return apiKey;
        
    } catch (error) {
        // Log the error and return undefined as fallback
        console.error('DebugBuddy: Critical error in getApiKey function:', error);
        
        // Try one more fallback attempt to get the API key directly
        try {
            return vscode.workspace.getConfiguration('DebugBuddy').get('apiKey') as string | undefined;
        } catch (fallbackError) {
            console.error('DebugBuddy: Fallback API key retrieval also failed:', fallbackError);
            return undefined;
        }
    }
}
