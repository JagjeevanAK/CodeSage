import { CodeSageOutputChannel } from "./cannel";
import { webviewManager } from "../webview/WebviewManager";

import { vscode } from "./vscode";

export const displayReview = (reviewResponse: any, fileName: any) => {
    const config = vscode.workspace.getConfiguration('CodeSage');
    const useWebview = config.get<boolean>('useWebview', true);
    const autoShow = config.get<boolean>('webviewAutoShow', true);
    
    // Validate input parameters
    if (!reviewResponse || typeof reviewResponse.text !== 'string') {
        console.error('CodeSage: Invalid review response provided to displayReview');
        CodeSageOutputChannel.appendLine('Error: Invalid review response received');
        CodeSageOutputChannel.show(true);
        return;
    }

    if (!fileName || typeof fileName !== 'string') {
        console.error('CodeSage: Invalid fileName provided to displayReview');
        fileName = 'Unknown file';
    }

    // Try to use webview first if enabled and available
    if (useWebview && autoShow) {
        try {
            // Use the enhanced fallback mechanism
            webviewManager.displayResponseWithFallback(reviewResponse.text, fileName);
            return;
        } catch (error) {
            console.error('CodeSage: Failed to display in webview with fallback, using terminal:', error);
            // Fall through to terminal display
        }
    }

    // Terminal display (fallback or explicitly requested)
    try {
        CodeSageOutputChannel.clear();
        CodeSageOutputChannel.appendLine('CodeSage Code Review\n');
        CodeSageOutputChannel.appendLine(`File: ${fileName}`);
        CodeSageOutputChannel.appendLine(`Analyzed: ${new Date().toLocaleString()}\n`);
        CodeSageOutputChannel.appendLine('---\n');
        CodeSageOutputChannel.appendLine(reviewResponse.text);
        CodeSageOutputChannel.appendLine('\n---');
        
        if (useWebview) {
            CodeSageOutputChannel.appendLine('\nNote: Displayed in terminal due to webview issues. Check error log for details.');
        }

        CodeSageOutputChannel.show(true);
    } catch (terminalError) {
        console.error('CodeSage: Critical error - even terminal display failed:', terminalError);
        // Last resort: show error message
        const vscode = require('vscode');
        vscode.window.showErrorMessage(
            'CodeSage: Critical display error. Unable to show review results.',
            'Show in New Document'
        ).then((selection: string) => {
            if (selection === 'Show in New Document') {
                vscode.workspace.openTextDocument({
                    content: `CodeSage Code Review\n\nFile: ${fileName}\nAnalyzed: ${new Date().toLocaleString()}\n\n${reviewResponse.text}`,
                    language: 'markdown'
                }).then((doc: any) => {
                    vscode.window.showTextDocument(doc);
                });
            }
        });
    }
};