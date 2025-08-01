import { reviewFile } from "../helper/fileReview";
import { vscode } from "../helper/vscode";

export const reviewCode = vscode.commands.registerCommand('CodeSage.reviewCurrentFile', async () => {
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
        vscode.window.showErrorMessage('No active file to review');
        return;
    }
    await reviewFile(activeEditor);
});