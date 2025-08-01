/**
 * Configuration Change Handler
 * 
 * Handles VSCode configuration changes for CodeSage settings,
 * specifically monitoring API key changes and updating the cache accordingly.
 */

import { vscode } from "../helper/vscode";
import { apiKeyCache } from "./apiKeyCache";

interface ConfigChangeHandler {
  onConfigurationChanged(event: vscode.ConfigurationChangeEvent): void;
  dispose(): void;
}

class ConfigurationChangeHandler implements ConfigChangeHandler {
  private disposable: vscode.Disposable | undefined;

  /**
   * Initialize the configuration change listener
   */
  public initialize(): void {
    try {
      // Register listener for configuration changes
      this.disposable = vscode.workspace.onDidChangeConfiguration(
        this.onConfigurationChanged.bind(this)
      );
      console.log('CodeSage: Configuration change listener initialized successfully');
    } catch (error) {
      console.error('CodeSage: Failed to initialize configuration change listener:', error);
      // Don't throw - allow extension to continue without configuration monitoring
    }
  }

  /**
   * Handle configuration change events
   * @param event The configuration change event
   */
  public onConfigurationChanged(event: vscode.ConfigurationChangeEvent): void {
    try {
      // Filter events to only respond to CodeSage API key changes
      if (event.affectsConfiguration('CodeSage.apiKey')) {
        try {
          // Get the new API key value from configuration
          const newApiKey = vscode.workspace.getConfiguration('CodeSage').get<string>('apiKey');
          
          // Update the cache with the new value
          apiKeyCache.set(newApiKey);
          
          console.log('CodeSage: API key configuration changed, cache updated');
        } catch (cacheError) {
          // Log cache update error but don't crash
          console.error('CodeSage: Error updating cache after configuration change:', cacheError);
          console.log('CodeSage: Cache update failed, but configuration change was detected');
        }
      }
    } catch (error) {
      // Log errors but don't crash the extension
      console.error('CodeSage: Error handling configuration change:', error);
    }
  }

  /**
   * Dispose of the configuration change listener
   */
  public dispose(): void {
    try {
      if (this.disposable) {
        this.disposable.dispose();
        this.disposable = undefined;
        console.log('CodeSage: Configuration change listener disposed successfully');
      }
    } catch (error) {
      console.error('CodeSage: Error disposing configuration change listener:', error);
      // Still set to undefined to prevent memory leaks
      this.disposable = undefined;
    }
  }
}

// Export singleton instance
export const configChangeHandler = new ConfigurationChangeHandler();