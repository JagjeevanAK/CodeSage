import * as vscode from 'vscode';
import { apiKeyCache } from "../lib/apiKeyCache";

export const deleteKey = vscode.commands.registerCommand('DebugBuddy.deleteKey', async () => {
    const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to clear the API key?',
        'Yes', 'No'
    );

    if (confirm === 'Yes') {
        await vscode.workspace.getConfiguration('DebugBuddy').update('apiKey', undefined, vscode.ConfigurationTarget.Global);
        apiKeyCache.clear();
        vscode.window.showInformationMessage('API Key has been deleted');
    }
});
