/**
 * Core interfaces for the JSON prompt system
 */

import { JsonPrompt, ValidationResult, VariableMap, ProcessedPrompt, PromptContext, UserAction, CodeContext, PromptConfig, GlobalPromptSettings, PromptError, FallbackStrategy } from './types';

export interface IPromptRegistry {
    /**
     * Register a new prompt in the registry
     */
    registerPrompt(name: string, prompt: JsonPrompt): void;
    
    /**
     * Retrieve a prompt by name (async for lazy loading)
     */
    getPrompt(name: string): Promise<JsonPrompt | null>;
    
    /**
     * Get all registered prompts
     */
    getAllPrompts(): Map<string, JsonPrompt>;
    
    /**
     * Reload all prompts from storage
     */
    reloadPrompts(): Promise<void>;
    
    /**
     * Check if a prompt exists
     */
    hasPrompt(name: string): boolean;
    
    /**
     * Remove a prompt from the registry
     */
    unregisterPrompt(name: string): boolean;
    
    /**
     * Get prompts by category
     */
    getPromptsByCategory(category: string): JsonPrompt[];
    
    /**
     * Enable hot reloading for custom directories
     */
    enableHotReload(directories: string[]): void;
    
    /**
     * Disable hot reloading
     */
    disableHotReload(): void;
}

export interface IPromptLoader {
    /**
     * Load prompts from the specified directory
     */
    loadPromptsFromDirectory(directory: string): Promise<JsonPrompt[]>;
    
    /**
     * Load a single prompt from file
     */
    loadPromptFromFile(filePath: string): Promise<JsonPrompt>;
    
    /**
     * Validate prompt file format
     */
    validatePromptFile(filePath: string): Promise<ValidationResult>;
    
    /**
     * Scan multiple custom directories for prompts
     */
    scanCustomDirectories(directories: string[]): Promise<Map<string, JsonPrompt[]>>;
    
    /**
     * Watch directory for changes
     */
    watchDirectory(directory: string, callback: (eventType: string, filename: string) => void): any;
    
    /**
     * Get directory metadata and statistics
     */
    getDirectoryMetadata(directory: string): Promise<{
        exists: boolean;
        readable: boolean;
        promptFiles: number;
        totalFiles: number;
        lastModified: Date | null;
        size: number;
    }>;
}

export interface ITemplateEngine {
    /**
     * Process a prompt template with variable substitution
     */
    processTemplate(prompt: JsonPrompt, variables: VariableMap): ProcessedPrompt;
    
    /**
     * Validate a prompt template
     */
    validateTemplate(template: any): ValidationResult;
    
    /**
     * Substitute variables in a template string
     */
    substituteVariables(template: string, variables: VariableMap): string;
}

export interface IContextAnalyzer {
    /**
     * Analyze context to determine appropriate prompt
     */
    analyzeContext(action: UserAction, context: CodeContext): PromptContext;
    
    /**
     * Determine the best prompt type for the given context
     */
    determinePromptType(context: PromptContext): string;
}

export interface IConfigurationManager {
    /**
     * Get configuration for a specific prompt
     */
    getPromptConfig(promptId: string): PromptConfig;
    
    /**
     * Update prompt configuration
     */
    updatePromptConfig(promptId: string, config: Partial<PromptConfig>): void;
    
    /**
     * Get global prompt settings
     */
    getGlobalSettings(): GlobalPromptSettings;
    
    /**
     * Register callback for configuration changes
     */
    onConfigurationChange(callback: (config: any) => void): void;
}

export interface IPromptValidator {
    /**
     * Validate a JSON prompt structure
     */
    validatePrompt(prompt: JsonPrompt): ValidationResult;
    
    /**
     * Validate prompt template integrity
     */
    validateTemplate(template: any): ValidationResult;
    
    /**
     * Validate prompt configuration
     */
    validateConfig(config: PromptConfig): ValidationResult;
}

export interface IPromptManager {
    /**
     * Process a request through the prompt system
     */
    processRequest(action: UserAction, context: CodeContext): Promise<ProcessedPrompt>;
    
    /**
     * Load all prompts into the system
     */
    loadPrompts(): Promise<void>;
    
    /**
     * Validate all prompt integrity
     */
    validatePromptIntegrity(): ValidationResult[];
    
    /**
     * Get available prompt types
     */
    getAvailablePromptTypes(): string[];
}

export interface IErrorHandler {
    /**
     * Handle prompt system errors
     */
    handleError(error: PromptError, context: any): FallbackStrategy;
    
    /**
     * Log error with context
     */
    logError(error: PromptError, message: string, context?: any): void;
}