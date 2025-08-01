import { vscode } from "../helper/vscode";
import explanationCache from "../helper/store";

export const deleteKey = vscode.commands.registerCommand('CodeSage.deleteKey', async () => {
    const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to clear the API key?',
        'Yes', 'No'
    );

    if (confirm === 'Yes') {
        await vscode.workspace.getConfiguration('CodeSage').update('apiKey', undefined, vscode.ConfigurationTarget.Global);
        explanationCache.clear();
        vscode.window.showInformationMessage('API Key has been deleted');
    }
});
