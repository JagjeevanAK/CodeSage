import { vscode } from "../helper/vscode";
import { getApiKey } from "../lib/getapi";
export const showApiKey = vscode.commands.registerCommand('CodeSage.getApiKey', async () => {
    const apiKey = await getApiKey();

    if (apiKey) {
        vscode.window.showInformationMessage(`Current API Key : ${apiKey}`);
    } else {
        const action = await vscode.window.showWarningMessage(
            'Currently there is no API Key',
            'Set API Key'
        );
        if (action === 'Set API Key') {
            vscode.commands.executeCommand('CodeSage.setApiKey');
        }
    }
});