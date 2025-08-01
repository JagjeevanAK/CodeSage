import { errorDetails } from "../extractors";
import { vscode } from "../helper/vscode";
import { modelHoverRes } from "../lib/hoverResponse";
import explanationCache from "./store";

type Param  = {
    diagnostic: vscode.Diagnostic
    uri: vscode.Uri
}

export  const getModelResponse = async (
    { diagnostic, uri }: Param
) => {

    const key = `${uri.toString()}-${diagnostic.message}`;

    if (explanationCache.has(key)) {
        return explanationCache.get(key);
    }

    try {
        const errDetails = errorDetails({uri, diagnostic});

        if (errDetails) {
            const response = await modelHoverRes(errDetails);
            // @ts-ignore
            explanationCache.set(key, response.text);
            // @ts-ignore
            return response.text;
        }
    }
    catch (err) {
        console.log("Failed to get AI Explanation:", err);
        vscode.window.showErrorMessage('CodeSage: Failed to get AI explanation. Check your connection and API key.');
    }

    return null;
};