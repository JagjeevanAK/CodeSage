// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { vscode } from "./helper/vscode";
import {
	deleteKey,
	setApiKey,
	showApiKey,
	reviewCode
} from "./command";
import {
	OnErrorHover
} from "./extractors";
import { apiKeyCache } from "./lib/apiKeyCache";
import { configChangeHandler } from "./lib/configChangeHandler";
import { webviewManager } from "./webview/WebviewManager";

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "CodeSage" is now active!');

	// Initialize API key cache manager
	// Note: Cache uses lazy initialization, so no immediate setup needed
	try {
		// Test cache initialization by checking if it's accessible
		apiKeyCache.isInitialized();
		console.log('CodeSage: API key cache manager initialized successfully');
	} catch (error) {
		console.error('CodeSage: Error initializing API key cache manager:', error);
		console.log('CodeSage: Extension will continue with degraded caching functionality');
	}

	// Initialize and register configuration change listener
	try {
		configChangeHandler.initialize();
		console.log('CodeSage: Configuration change listener registered successfully');
	} catch (error) {
		console.error('CodeSage: Error registering configuration change listener:', error);
		console.log('CodeSage: Extension will continue without automatic cache updates');
	}

	// Initialize webview manager
	try {
		webviewManager.initialize(context);
		console.log('CodeSage: Webview manager initialized successfully');
	} catch (error) {
		console.error('CodeSage: Error initializing webview manager:', error);
		console.log('CodeSage: Extension will continue with terminal display fallback');
	}

	context.subscriptions.push(
		deleteKey,
		OnErrorHover,
		reviewCode,
		setApiKey,
		showApiKey,
		configChangeHandler,
		vscode.commands.registerCommand("CodeSage.showWebview", () => {
			webviewManager.toggleWebview();
		}),
		vscode.commands.registerCommand("CodeSage.hideWebview", () => {
			webviewManager.dispose();
		}),
		vscode.commands.registerCommand("CodeSage.refreshWebview", () => {
			webviewManager.refreshWebview();
		}),
		vscode.commands.registerCommand("CodeSage.clearWebview", () => {
			webviewManager.clearContent();
		}),
		vscode.commands.registerCommand("CodeSage.showWebviewHistory", () => {
			const history = webviewManager.getContentHistory();
			if (history.length === 0) {
				vscode.window.showInformationMessage('CodeSage: No webview history available');
				return;
			}
			
			const items = history.map((item, index) => ({
				label: `${item.fileName}`,
				description: `${item.timestamp}`,
				detail: `${item.content.substring(0, 100)}...`,
				index
			}));
			
			vscode.window.showQuickPick(items, {
				placeHolder: 'Select a previous AI response to view'
			}).then(selection => {
				if (selection) {
					const selectedContent = history[selection.index];
					webviewManager.displayResponse(selectedContent.content, selectedContent.fileName);
				}
			});
		}),
		vscode.commands.registerCommand("CodeSage.webviewHealthCheck", () => {
			const stats = webviewManager.getErrorStats();
			const healthStatus = webviewManager.getErrorStats().healthStatus || 'unknown';
			
			vscode.window.showInformationMessage(
				`CodeSage Webview Status: ${healthStatus}\nTotal errors: ${stats.totalErrors || 0}\nFallback usage: ${stats.fallbackUsageCount || 0}`,
				'Show Detailed Log',
				'Reset Webview'
			).then(selection => {
				if (selection === 'Show Detailed Log') {
					vscode.commands.executeCommand('CodeSage.showErrorLog');
				} else if (selection === 'Reset Webview') {
					webviewManager.dispose();
					webviewManager.initialize(context);
					vscode.window.showInformationMessage('CodeSage: Webview system reset successfully');
				}
			});
		}),
		vscode.commands.registerCommand("CodeSage.showErrorLog", () => {
			const { WebviewErrorLogger } = require('./webview/WebviewErrorLogger');
			const errorLogger = WebviewErrorLogger.getInstance();
			errorLogger.showErrorLog();
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// Clear the API key cache to remove sensitive data from memory
	try {
		apiKeyCache.clear();
		console.log('CodeSage: API key cache cleared during deactivation');
	} catch (error) {
		console.error('CodeSage: Error clearing API key cache during deactivation:', error);
	}

	// Dispose of configuration change handler
	try {
		configChangeHandler.dispose();
		console.log('CodeSage: Configuration change handler disposed during deactivation');
	} catch (error) {
		console.error('CodeSage: Error disposing configuration change handler during deactivation:', error);
	}

	// Dispose of webview manager
	try {
		webviewManager.dispose();
		console.log('CodeSage: Webview manager disposed during deactivation');
	} catch (error) {
		console.error('CodeSage: Error disposing webview manager during deactivation:', error);
	}
}
