import * as vscode from 'vscode';
import { reviewFile } from '../helper/fileReview';

export const reviewCode = vscode.commands.registerCommand('DebugBuddy.reviewCurrentFile', async () => {
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
        vscode.window.showErrorMessage('No active file to review');
        return;
    }
    await reviewFile(activeEditor);
});