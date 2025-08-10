import { modelFileReview, modelFileReviewWithPrompt } from "../lib/modelFileReview";
import { DebugBuddyOutputChannel } from "./cannel";
import { getLanguageFromExtension, getLanguageFromVSCode } from "./getlang";
import { displayReview } from "./terminalDisplay";
import { vscode } from "./vscode";
import { webviewManager } from "../webview/WebviewManager";
import { PromptManager } from "../prompt/PromptManager";
import { UserAction, CodeContext } from "../prompt/types";

type TextEditor = typeof vscode.window.activeTextEditor;

/**
 * Enhanced file review function that uses the new JSON prompt system
 * for comprehensive code analysis and review
 */
export const reviewFile = async (editor: TextEditor) => {
    if (!editor) {
        vscode.window.showErrorMessage('DebugBuddy: No active editor found.');
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
        title: `DebugBuddy is reviewing your ${fileLanguage} code...`,
        cancellable: false
    }, async () => {
        try {
            let response;
            
            // Use the enhanced file review with new prompt system
            const codeContext: CodeContext = {
                selectedText: code,
                fullText: code,
                filePath: fileName,
                language: fileLanguage
            };

            // Use the enhanced function with JSON prompt system
            response = await modelFileReviewWithPrompt(codeContext);
            
            // Display the review results
            try {
                displayReview(response, fileName);
            } catch (displayError) {
                console.error('DebugBuddy: Error displaying review, using terminal display:', displayError);
                // Use terminal display as alternative
                displayReview(response, fileName);
            }

        } catch (error) {
            console.error('Code review error:', error);
            
            // For errors, always use terminal display to ensure visibility
            DebugBuddyOutputChannel.appendLine(`Failed to get code review for ${fileLanguage} file: ${error}`);
            DebugBuddyOutputChannel.show(true);
            vscode.window.showErrorMessage('DebugBuddy: Failed to get code review. Check your connection and API key.');
        }
    });
};