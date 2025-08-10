/**
 * Unit tests for PromptValidator
 */

import * as assert from 'assert';
import { PromptValidator } from '../prompt/PromptValidator';
import { JsonPrompt, PromptCategory, PromptTemplate, PromptConfig } from '../prompt/types';

suite('PromptValidator', () => {
    let validator: PromptValidator;

    setup(() => {
        validator = new PromptValidator();
    });

    suite('validatePrompt', () => {
        test('should validate a complete valid prompt', () => {
            const validPrompt: JsonPrompt = {
                id: 'test-prompt',
                name: 'Test Prompt',
                description: 'A test prompt for validation',
                category: PromptCategory.CODE_REVIEW,
                version: '1.0.0',
                schema_version: '1.0',
                template: {
                    task: 'Review the provided code',
                    instructions: 'Analyze the code for issues',
                    context: { focus: 'quality' },
                    output_format: { structure: 'list' },
                    variables: ['code', 'language']
                },
                config: {
                    configurable_fields: ['focus'],
                    default_values: { focus: 'quality' },
                    validation_rules: {}
                }
            };

            const result = validator.validatePrompt(validPrompt);
            assert.strictEqual(result.isValid, true);
            assert.strictEqual(result.errors.length, 0);
        });

        test('should reject null or undefined prompt', () => {
            const result = validator.validatePrompt(null as any);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('null or undefined')));
        });

        test('should reject prompt missing required fields', () => {
            const incompletePrompt = {
                id: 'test-prompt',
                name: 'Test Prompt'
                // Missing other required fields
            } as JsonPrompt;

            const result = validator.validatePrompt(incompletePrompt);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('Missing required field')));
        });

        test('should validate prompt ID format', () => {
            const promptWithInvalidId: JsonPrompt = {
                id: 'invalid id with spaces!',
                name: 'Test Prompt',
                description: 'Test',
                category: PromptCategory.CODE_REVIEW,
                version: '1.0.0',
                schema_version: '1.0',
                template: {
                    task: 'Test',
                    instructions: 'Test',
                    context: {},
                    output_format: { structure: 'list' },
                    variables: []
                },
                config: {
                    configurable_fields: [],
                    default_values: {},
                    validation_rules: {}
                }
            };

            const result = validator.validatePrompt(promptWithInvalidId);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('alphanumeric characters')));
        });

        test('should validate category values', () => {
            const promptWithInvalidCategory = {
                id: 'test-prompt',
                name: 'Test Prompt',
                description: 'Test',
                category: 'invalid_category' as PromptCategory,
                version: '1.0.0',
                schema_version: '1.0',
                template: {
                    task: 'Test',
                    instructions: 'Test',
                    context: {},
                    output_format: { structure: 'list' },
                    variables: []
                },
                config: {
                    configurable_fields: [],
                    default_values: {},
                    validation_rules: {}
                }
            } as JsonPrompt;

            const result = validator.validatePrompt(promptWithInvalidCategory);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('Invalid prompt category')));
        });

        test('should warn about unsupported schema versions', () => {
            const promptWithUnsupportedSchema: JsonPrompt = {
                id: 'test-prompt',
                name: 'Test Prompt',
                description: 'Test',
                category: PromptCategory.CODE_REVIEW,
                version: '1.0.0',
                schema_version: '2.0', // Unsupported version
                template: {
                    task: 'Test',
                    instructions: 'Test',
                    context: {},
                    output_format: { structure: 'list' },
                    variables: []
                },
                config: {
                    configurable_fields: [],
                    default_values: {},
                    validation_rules: {}
                }
            };

            const result = validator.validatePrompt(promptWithUnsupportedSchema);
            assert.ok(result.warnings.some(warning => warning.includes('Unsupported schema version')));
        });
    });

    suite('validateTemplate', () => {
        test('should validate a complete valid template', () => {
            const validTemplate: PromptTemplate = {
                task: 'Review code for quality issues',
                instructions: 'Analyze the provided code and identify potential improvements',
                context: { focus: 'quality', severity: 'medium' },
                output_format: { 
                    structure: 'list',
                    include_line_numbers: true,
                    include_severity: true
                },
                variables: ['code', 'language', 'focus']
            };

            const result = validator.validateTemplate(validTemplate);
            assert.strictEqual(result.isValid, true);
            assert.strictEqual(result.errors.length, 0);
        });

        test('should reject null or undefined template', () => {
            const result = validator.validateTemplate(null);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('null or undefined')));
        });

        test('should reject template with empty task', () => {
            const templateWithEmptyTask = {
                task: '',
                instructions: 'Test instructions',
                context: {},
                output_format: { structure: 'list' },
                variables: []
            };

            const result = validator.validateTemplate(templateWithEmptyTask);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('task cannot be empty')));
        });

        test('should reject template with empty instructions', () => {
            const templateWithEmptyInstructions = {
                task: 'Test task',
                instructions: '   ', // Only whitespace
                context: {},
                output_format: { structure: 'list' },
                variables: []
            };

            const result = validator.validateTemplate(templateWithEmptyInstructions);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('instructions cannot be empty')));
        });

        test('should validate output format structure', () => {
            const templateWithInvalidOutputFormat = {
                task: 'Test task',
                instructions: 'Test instructions',
                context: {},
                output_format: { 
                    // Missing structure field
                    include_line_numbers: true
                },
                variables: []
            };

            const result = validator.validateTemplate(templateWithInvalidOutputFormat);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('structure field')));
        });

        test('should validate variables array', () => {
            const templateWithInvalidVariables = {
                task: 'Test task',
                instructions: 'Test instructions',
                context: {},
                output_format: { structure: 'list' },
                variables: ['valid_var', '', 'another_valid_var'] // Empty string in variables
            };

            const result = validator.validateTemplate(templateWithInvalidVariables);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('cannot be empty')));
        });

        test('should warn about duplicate variables', () => {
            const templateWithDuplicateVariables = {
                task: 'Test task',
                instructions: 'Test instructions',
                context: {},
                output_format: { structure: 'list' },
                variables: ['code', 'language', 'code'] // Duplicate 'code'
            };

            const result = validator.validateTemplate(templateWithDuplicateVariables);
            assert.ok(result.warnings.some(warning => warning.includes('duplicate variables')));
        });

        test('should warn about unused declared variables', () => {
            const templateWithUnusedVariables = {
                task: 'Review ${code} in ${language}',
                instructions: 'Analyze the code',
                context: { focus: '${focus}' },
                output_format: { structure: 'list' },
                variables: ['code', 'language', 'focus', 'unused_variable']
            };

            const result = validator.validateTemplate(templateWithUnusedVariables);
            assert.ok(result.warnings.some(warning => warning.includes('unused_variable')));
        });

        test('should warn about undeclared used variables', () => {
            const templateWithUndeclaredVariables = {
                task: 'Review ${code} in ${language}',
                instructions: 'Focus on ${undeclared_var}',
                context: {},
                output_format: { structure: 'list' },
                variables: ['code', 'language']
            };

            const result = validator.validateTemplate(templateWithUndeclaredVariables);
            assert.ok(result.warnings.some(warning => warning.includes('undeclared_var')));
        });
    });

    suite('validateConfig', () => {
        test('should validate a complete valid config', () => {
            const validConfig: PromptConfig = {
                configurable_fields: ['focus', 'severity'],
                default_values: { focus: 'quality', severity: 'medium' },
                validation_rules: { focus: { type: 'string' } },
                focus_areas: ['performance', 'security'],
                severity_threshold: 'low'
            };

            const result = validator.validateConfig(validConfig);
            assert.strictEqual(result.isValid, true);
            assert.strictEqual(result.errors.length, 0);
        });

        test('should reject null or undefined config', () => {
            const result = validator.validateConfig(null as any);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('null or undefined')));
        });

        test('should reject config with invalid configurable_fields type', () => {
            const configWithInvalidFields = {
                configurable_fields: 'not_an_array',
                default_values: {},
                validation_rules: {}
            } as any;

            const result = validator.validateConfig(configWithInvalidFields);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('must be an array')));
        });

        test('should reject config with non-string configurable fields', () => {
            const configWithInvalidFieldTypes = {
                configurable_fields: ['valid_field', 123, 'another_valid_field'],
                default_values: {},
                validation_rules: {}
            } as any;

            const result = validator.validateConfig(configWithInvalidFieldTypes);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('must be strings')));
        });

        test('should reject config with invalid default_values type', () => {
            const configWithInvalidDefaults = {
                configurable_fields: ['field1'],
                default_values: 'not_an_object',
                validation_rules: {}
            } as any;

            const result = validator.validateConfig(configWithInvalidDefaults);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('must be an object')));
        });

        test('should reject config with invalid focus_areas type', () => {
            const configWithInvalidFocusAreas = {
                configurable_fields: ['field1'],
                default_values: {},
                validation_rules: {},
                focus_areas: 'not_an_array'
            } as any;

            const result = validator.validateConfig(configWithInvalidFocusAreas);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('must be an array')));
        });
    });

    suite('edge cases and error scenarios', () => {
        test('should handle extremely long field values', () => {
            const promptWithLongFields: JsonPrompt = {
                id: 'test-prompt',
                name: 'Test Prompt',
                description: 'Test',
                category: PromptCategory.CODE_REVIEW,
                version: '1.0.0',
                schema_version: '1.0',
                template: {
                    task: 'x'.repeat(20000), // Extremely long task
                    instructions: 'Test instructions',
                    context: {},
                    output_format: { structure: 'list' },
                    variables: []
                },
                config: {
                    configurable_fields: [],
                    default_values: {},
                    validation_rules: {}
                }
            };

            const result = validator.validatePrompt(promptWithLongFields);
            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.some(error => error.includes('too long')));
        });

        test('should handle templates with many variables', () => {
            const manyVariables = Array.from({ length: 60 }, (_, i) => `var${i}`);
            const templateWithManyVariables = {
                task: 'Test task',
                instructions: 'Test instructions',
                context: {},
                output_format: { structure: 'list' },
                variables: manyVariables
            };

            const result = validator.validateTemplate(templateWithManyVariables);
            assert.ok(result.warnings.some(warning => warning.includes('many variables')));
        });

        test('should handle deeply nested context objects', () => {
            const deeplyNestedContext = {
                level1: {
                    level2: {
                        level3: {
                            level4: {
                                level5: {
                                    level6: 'too deep'
                                }
                            }
                        }
                    }
                }
            };

            const templateWithDeepNesting = {
                task: 'Test task',
                instructions: 'Test instructions',
                context: deeplyNestedContext,
                output_format: { structure: 'list' },
                variables: []
            };

            const result = validator.validateTemplate(templateWithDeepNesting);
            assert.ok(result.warnings.some(warning => warning.includes('deep nesting')));
        });

        test('should handle validation errors gracefully', () => {
            // Create a circular reference that would cause JSON.stringify to fail
            const circularObject: any = { name: 'test' };
            circularObject.self = circularObject;

            const promptWithCircularRef = {
                id: 'test-prompt',
                name: 'Test Prompt',
                description: 'Test',
                category: PromptCategory.CODE_REVIEW,
                version: '1.0.0',
                schema_version: '1.0',
                template: {
                    task: 'Test task',
                    instructions: 'Test instructions',
                    context: circularObject,
                    output_format: { structure: 'list' },
                    variables: []
                },
                config: {
                    configurable_fields: [],
                    default_values: {},
                    validation_rules: {}
                }
            } as JsonPrompt;

            // Should not throw an error, but handle it gracefully
            assert.doesNotThrow(() => validator.validatePrompt(promptWithCircularRef));
        });
    });
});