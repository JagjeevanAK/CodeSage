/**
 * Main entry point for the JSON prompt system
 * Provides structured prompt processing and management
 */

// Export everything from templates for backward compatibility
export * from './templates';

// Export core system components
export { PromptSystem } from './PromptSystem';
export { PromptRegistry } from './PromptRegistry';
export { PromptLoader } from './PromptLoader';
export { TemplateEngine } from './TemplateEngine';
export { OptimizedTemplateEngine } from './OptimizedTemplateEngine';
export { ContextAnalyzer } from './ContextAnalyzer';
export { PromptValidator } from './PromptValidator';
export { ErrorHandler, promptErrorHandler, withErrorHandling, withAsyncErrorHandling } from './ErrorHandler';
export { PromptManager } from './PromptManager';
export { ConfigurationManager } from './ConfigurationManager';
export { ValidationUtils } from './ValidationUtils';
export { PromptHotReloader } from './PromptHotReloader';
export { TemplateComposition } from './TemplateComposition';
export { PromptCache } from './PromptCache';
export { LazyPromptLoader } from './LazyPromptLoader';
export { MemoryMonitor } from './MemoryMonitor';

// Export types and interfaces
export * from './types';
export * from './interfaces';

// Convenience exports
export { promptRegistry } from './templates';