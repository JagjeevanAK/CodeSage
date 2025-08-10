import { PromptRegistry } from "../PromptRegistry";

// Initialize the JSON prompt registry
export const promptRegistry = new PromptRegistry();

// Export new interfaces and types for external use
export * from '../types';
export * from '../interfaces';
export { PromptRegistry } from '../PromptRegistry';
export { PromptSystem } from '../PromptSystem';