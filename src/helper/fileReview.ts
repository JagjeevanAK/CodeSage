import { modelFileReview } from "../lib/modelFileReview";
import { CodeSageOutputChannel } from "./cannel";
import { getLanguageFromExtension, getLanguageFromVSCode } from "./getlang";
import { displayReview } from "./terminalDisplay";
import { vscode } from "./vscode";
import { webviewManager } from "../webview/WebviewManager";

type TextEditor = typeof vscode.window.activeTextEditor;

export const reviewFile = async (editor: TextEditor) => {
    if (!editor) {
        vscode.window.showErrorMessage('CodeSage: No active editor found.');
        return;
    }

    const code = editor.document.getText();
    const fileName = editor.document.fileName;

    let fileLanguage = getLanguageFromExtension(fileName);

    // If extension-based detection fails, use VS Code's language detection
    if (fileLanguage === 'plaintext') {
        fileLanguage = getLanguageFromVSCode(editor);
    }

    // Special handling for files without extensions but with recognizable names
    const baseName = fileName.split('/').pop()?.toLowerCase() || '';
    if (fileLanguage === 'plaintext') {
        if (baseName === 'dockerfile') {
            fileLanguage = 'dockerfile';
        } else if (baseName === 'makefile') {
            fileLanguage = 'makefile';
        } else if (baseName === 'rakefile') {
            fileLanguage = 'ruby';
        } else if (baseName === 'gemfile') {
            fileLanguage = 'ruby';
        } else if (baseName === 'vagrantfile') {
            fileLanguage = 'ruby';
        } else if (baseName.startsWith('.env')) {
            fileLanguage = 'dotenv';
        }
    }

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `CodeSage is reviewing your ${fileLanguage} code...`,
        cancellable: false
    }, async () => {

        const reviewData = {
            code: code,
            fileName: fileName,
            fileLanguage: fileLanguage,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await modelFileReview(reviewData);
            
            // Try to display in webview first, with automatic fallback to terminal
            try {
                displayReview(response, fileName);
            } catch (displayError) {
                console.error('CodeSage: Error displaying review, attempting fallback:', displayError);
                // Force terminal display as fallback
                displayReview(response, fileName);
            }

        } catch (error) {
            console.error('Code review error:', error);
            
            // For errors, always use terminal display to ensure visibility
            CodeSageOutputChannel.appendLine(`Failed to get code review for ${fileLanguage} file`);
            CodeSageOutputChannel.show(true);
            vscode.window.showErrorMessage('CodeSage: Failed to get code review. Check your connection and API key.');
        }
    });
};