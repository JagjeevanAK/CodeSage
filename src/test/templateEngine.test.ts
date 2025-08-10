/**
 * Unit tests for TemplateEngine
 */

import * as assert from 'assert';
import { TemplateEngine } from '../prompt/TemplateEngine';
import { JsonPrompt, VariableMap, PromptCategory } from '../prompt/types';

suite('TemplateEngine Test Suite', () => {
    let templateEngine: TemplateEngine;

    setup(() => {
        templateEngine = new TemplateEngine();
    });

    suite('substituteVariables', () => {
        test('should substitute simple variables', () => {
            const template = 'Hello ${name}, welcome to ${app}!';
            const variables: VariableMap = {
                name: 'John',
                app: 'DebugBuddy'
            };

            const result = templateEngine.substituteVariables(template, variables);
            assert.strictEqual(result, 'Hello John, welcome to DebugBuddy!');
        });

        test('should substitute nested object variables', () => {
            const template = 'User: ${user.name}, Email: ${user.email}';
            const variables: VariableMap = {
                user: {
                    name: 'Jane Doe',
                    email: 'jane@example.com'
                }
            };

            const result = templateEngine.substituteVariables(template, variables);
            assert.strictEqual(result, 'User: Jane Doe, Email: jane@example.com');
        });

        test('should handle deeply nested variables', () => {
            const template = 'Error: ${error.details.message} at line ${error.location.line}';
            const variables: VariableMap = {
                error: {
                    details: {
                        message: 'Syntax error'
                    },
                    location: {
                        line: 42
                    }
                }
            };

            const result = templateEngine.substituteVariables(template, variables);
            assert.strictEqual(result, 'Error: Syntax error at line 42');
        });

        test('should leave missing variables as placeholders', () => {
            const template = 'Hello ${name}, your score is ${score}';
            const variables: VariableMap = {
                name: 'Alice'
                // score is missing
            };

            const result = templateEngine.substituteVariables(template, variables);
            assert.strictEqual(result, 'Hello Alice, your score is ${score}');
        });

        test('should handle different data types', () => {
            const template = 'Count: ${count}, Active: ${active}';
            const variables: VariableMap = {
                count: 42,
                active: true
            };

            const result = templateEngine.substituteVariables(template, variables);
            assert.strictEqual(result, 'Count: 42, Active: true');
        });

        test('should handle null and undefined values', () => {
            const template = 'Null: ${nullValue}, Undefined: ${undefinedValue}';
            const variables: VariableMap = {
                nullValue: null,
                undefinedValue: undefined
            };

            const result = templateEngine.substituteVariables(template, variables);
            assert.strictEqual(result, 'Null: null, Undefined: undefined');
        });
    });

    suite('processTemplate', () => {
        let mockPrompt: JsonPrompt;

        setup(() => {
            mockPrompt = {
                id: 'test-prompt',
                name: 'Test Prompt',
                description: 'A test prompt',
                category: PromptCategory.CODE_REVIEW,
                version: '1.0.0',
                schema_version: '1.0',
                template: {
                    task: 'Review the ${language} code',
                    context: {
                        file: '${file.path}',
                        language: '${language}',
                        user_level: '${user.experience}'
                    },
                    instructions: 'Please review this ${language} code and provide ${suggestions.count} suggestions',
                    output_format: {
                        structure: 'json',
                        include_line_numbers: true
                    },
                    variables: ['language', 'file.path', 'user.experience', 'suggestions.count']
                },
                config: {
                    configurable_fields: [],
                    default_values: {},
                    validation_rules: {}
                }
            };
        });

        test('should process a complete template with all variables', () => {
            const variables: VariableMap = {
                language: 'TypeScript',
                file: {
                    path: '/src/test.ts'
                },
                user: {
                    experience: 'intermediate'
                },
                suggestions: {
                    count: 5
                }
            };

            const result = templateEngine.processTemplate(mockPrompt, variables);

            assert.strictEqual((result.content as any).task, 'Review the TypeScript code');
            assert.strictEqual((result.content as any).context.file, '/src/test.ts');
            assert.strictEqual((result.content as any).context.language, 'TypeScript');
            assert.strictEqual((result.content as any).context.user_level, 'intermediate');
            assert.strictEqual((result.content as any).instructions, 'Please review this TypeScript code and provide 5 suggestions');

            assert.ok(result.variables_used.includes('language'));
            assert.ok(result.variables_used.includes('file.path'));
            assert.ok(result.variables_used.includes('user.experience'));
            assert.ok(result.variables_used.includes('suggestions.count'));
        });

        test('should handle missing variables gracefully', () => {
            const variables: VariableMap = {
                language: 'JavaScript'
                // Other variables are missing
            };

            const result = templateEngine.processTemplate(mockPrompt, variables);

            assert.strictEqual((result.content as any).task, 'Review the JavaScript code');
            assert.strictEqual((result.content as any).context.file, '${file.path}');
            assert.strictEqual((result.content as any).context.language, 'JavaScript');
            assert.strictEqual((result.content as any).context.user_level, '${user.experience}');
            assert.strictEqual((result.content as any).instructions, 'Please review this JavaScript code and provide ${suggestions.count} suggestions');

            assert.ok(result.variables_used.includes('language'));
            assert.ok(result.variables_used.includes('file.path'));
            assert.ok(result.variables_used.includes('user.experience'));
            assert.ok(result.variables_used.includes('suggestions.count'));
        });

        test('should not modify the original prompt template', () => {
            const originalTask = mockPrompt.template.task;
            const variables: VariableMap = {
                language: 'TypeScript'
            };

            templateEngine.processTemplate(mockPrompt, variables);

            assert.strictEqual(mockPrompt.template.task, originalTask);
        });

        test('should track unique variables used', () => {
            const promptWithDuplicates: JsonPrompt = {
                ...mockPrompt,
                template: {
                    ...mockPrompt.template,
                    task: 'Review ${language} code',
                    instructions: 'Analyze this ${language} file for ${language} best practices'
                }
            };

            const variables: VariableMap = {
                language: 'TypeScript'
            };

            const result = templateEngine.processTemplate(promptWithDuplicates, variables);

            // Should only contain 'language' once despite multiple uses
            const languageCount = result.variables_used.filter(v => v === 'language').length;
            assert.strictEqual(languageCount, 1);
        });
    });

    suite('validateTemplate', () => {
        test('should validate a correct template', () => {
            const validTemplate = {
                task: 'Review code',
                instructions: 'Please review this code',
                context: { language: 'TypeScript' },
                output_format: { structure: 'json' },
                variables: ['language']
            };

            const result = templateEngine.validateTemplate(validTemplate);

            assert.strictEqual(result.isValid, true);
            assert.strictEqual(result.errors.length, 0);
        });

        test('should reject template with missing task', () => {
            const invalidTemplate = {
                instructions: 'Please review this code',
                context: { language: 'TypeScript' },
                output_format: { structure: 'json' }
            };

            const result = templateEngine.validateTemplate(invalidTemplate);

            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.includes('Template task cannot be empty'));
        });

        test('should reject template with empty task', () => {
            const invalidTemplate = {
                task: '',
                instructions: 'Please review this code',
                context: { language: 'TypeScript' },
                output_format: { structure: 'json' }
            };

            const result = templateEngine.validateTemplate(invalidTemplate);

            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.includes('Template task cannot be empty'));
        });

        test('should reject template with missing instructions', () => {
            const invalidTemplate = {
                task: 'Review code',
                context: { language: 'TypeScript' },
                output_format: { structure: 'json' }
            };

            const result = templateEngine.validateTemplate(invalidTemplate);

            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.includes('Template must have non-empty instructions field'));
        });

        test('should reject template with missing context', () => {
            const invalidTemplate = {
                task: 'Review code',
                instructions: 'Please review this code',
                output_format: { structure: 'json' }
            };

            const result = templateEngine.validateTemplate(invalidTemplate);

            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.includes('Template must have a context object'));
        });

        test('should reject template with missing output_format', () => {
            const invalidTemplate = {
                task: 'Review code',
                instructions: 'Please review this code',
                context: { language: 'TypeScript' }
            };

            const result = templateEngine.validateTemplate(invalidTemplate);

            assert.strictEqual(result.isValid, false);
            assert.ok(result.errors.includes('Template must have an output_format object'));
        });

        test('should warn about missing variables array', () => {
            const templateWithoutVariables = {
                task: 'Review code',
                instructions: 'Please review this code',
                context: { language: 'TypeScript' },
                output_format: { structure: 'json' }
            };

            const result = templateEngine.validateTemplate(templateWithoutVariables);

            assert.strictEqual(result.isValid, true);
            assert.ok(result.warnings.includes('Template should have a variables array listing expected variables'));
        });

        test('should reject null or undefined template', () => {
            const result1 = templateEngine.validateTemplate(null);
            const result2 = templateEngine.validateTemplate(undefined);

            assert.strictEqual(result1.isValid, false);
            assert.ok(result1.errors.includes('Template is null or undefined'));

            assert.strictEqual(result2.isValid, false);
            assert.ok(result2.errors.includes('Template is null or undefined'));
        });
    });

    suite('error handling', () => {
        test('should throw error for invalid template during processing', () => {
            const invalidPrompt: JsonPrompt = {
                id: 'invalid',
                name: 'Invalid',
                description: 'Invalid prompt',
                category: PromptCategory.GENERAL,
                version: '1.0.0',
                schema_version: '1.0',
                template: null as any,
                config: {
                    configurable_fields: [],
                    default_values: {},
                    validation_rules: {}
                }
            };

            assert.throws(() => {
                templateEngine.processTemplate(invalidPrompt, {});
            }, /Template processing failed/);
        });

        test('should handle circular references in variables gracefully', () => {
            const circularObj: any = { name: 'test' };
            circularObj.self = circularObj;

            const template = 'Object: ${obj}';
            const variables: VariableMap = {
                obj: circularObj
            };

            // Should not throw, should handle gracefully
            const result = templateEngine.substituteVariables(template, variables);
            assert.ok(result.includes('[Object]'));
        });
    });
});