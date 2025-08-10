/**
 * Unit tests for ErrorHandler
 */

import * as assert from 'assert';
import { ErrorHandler, Logger, withErrorHandling, withAsyncErrorHandling } from '../prompt/ErrorHandler';
import { PromptError, FallbackStrategy } from '../prompt/types';

suite('ErrorHandler', () => {
    let errorHandler: ErrorHandler;
    let mockLogger: any;
    let consoleErrorCalls: any[];
    let consoleWarnCalls: any[];

    setup(() => {
        consoleErrorCalls = [];
        consoleWarnCalls = [];
        mockLogger = {
            error: (...args: any[]) => {
                consoleErrorCalls.push(args);
            },
            warn: (...args: any[]) => {
                consoleWarnCalls.push(args);
            }
        };
        errorHandler = new ErrorHandler(true, mockLogger);
    });

    teardown(() => {
        // No cleanup needed for mock logger
    });

    suite('handleError', () => {
        test('should handle template parse errors without fallback', () => {
            const context = { promptId: 'test-prompt', templateContent: 'invalid template' };
            const strategy = errorHandler.handleError(PromptError.TEMPLATE_PARSE_ERROR, context);

            assert.strictEqual(strategy.useSimplePrompt, false);
            assert.strictEqual(strategy.fallbackPromptId, undefined);
            assert.ok(strategy.errorMessage?.includes('Template parsing failed'));
        });

        test('should handle variable substitution errors without fallback', () => {
            const context = { promptId: 'test-prompt', missingVariables: ['code', 'language'] };
            const strategy = errorHandler.handleError(PromptError.VARIABLE_SUBSTITUTION_ERROR, context);

            assert.strictEqual(strategy.useSimplePrompt, false);
            assert.strictEqual(strategy.fallbackPromptId, undefined);
            assert.ok(strategy.errorMessage?.includes('Variable substitution failed'));
        });

        test('should handle validation errors without fallback', () => {
            const context = { promptId: 'invalid-prompt', validationErrors: ['Missing required field'] };
            const strategy = errorHandler.handleError(PromptError.VALIDATION_ERROR, context);

            assert.strictEqual(strategy.useSimplePrompt, false);
            assert.strictEqual(strategy.fallbackPromptId, undefined);
            assert.ok(strategy.errorMessage?.includes('Prompt validation failed'));
        });

        test('should handle configuration errors gracefully', () => {
            const context = { configKey: 'invalid.setting', configValue: 'invalid' };
            const strategy = errorHandler.handleError(PromptError.CONFIGURATION_ERROR, context);

            assert.strictEqual(strategy.useSimplePrompt, false);
            assert.ok(strategy.errorMessage?.includes('Configuration error'));
        });

        test('should handle prompt not found errors with descriptive message', () => {
            const context = { 
                requestedType: 'non-existent-prompt',
                availableTypes: ['code-review', 'debug-analysis']
            };
            const strategy = errorHandler.handleError(PromptError.PROMPT_NOT_FOUND, context);

            assert.strictEqual(strategy.useSimplePrompt, false);
            assert.strictEqual(strategy.fallbackPromptId, undefined);
            assert.ok(strategy.errorMessage?.includes('not found'));
            assert.ok(strategy.errorMessage?.includes('Available prompt types'));
        });

        test('should handle unknown errors with descriptive message', () => {
            const unknownError = 'unknown_error' as PromptError;
            const strategy = errorHandler.handleError(unknownError, {});

            assert.strictEqual(strategy.useSimplePrompt, false);
            assert.strictEqual(strategy.fallbackPromptId, undefined);
            assert.ok(strategy.errorMessage?.includes('Unknown error'));
        });
    });

    suite('logError', () => {
        test('should log error with timestamp and context', () => {
            const context = { promptId: 'test-prompt', details: 'test details' };
            errorHandler.logError(PromptError.TEMPLATE_PARSE_ERROR, 'Test error message', context);

            assert.ok(consoleErrorCalls.length > 0);
            const logMessage = consoleErrorCalls[0][0];
            assert.ok(logMessage.includes('[PromptSystem]'));
            assert.ok(logMessage.includes('template_parse_error'));
            assert.ok(logMessage.includes('Test error message'));
        });

        test('should handle context serialization errors gracefully', () => {
            const circularContext: any = { name: 'test' };
            circularContext.self = circularContext;

            assert.doesNotThrow(() => {
                errorHandler.logError(PromptError.VALIDATION_ERROR, 'Test message', circularContext);
            });

            assert.ok(consoleErrorCalls.length > 0);
        });

        test('should truncate very long context information', () => {
            const longContext = {
                data: 'x'.repeat(1000)
            };

            errorHandler.logError(PromptError.TEMPLATE_PARSE_ERROR, 'Test message', longContext);

            assert.ok(consoleErrorCalls.length > 0);
            const contextLog = consoleErrorCalls.find(call => 
                call[0] && call[0].toString().includes('Context:')
            );
            if (contextLog) {
                assert.ok(contextLog[0].includes('...'));
            }
        });

        test('should track error counts and show repeated error warnings', () => {
            errorHandler.logError(PromptError.TEMPLATE_PARSE_ERROR, 'First error', {});
            errorHandler.logError(PromptError.TEMPLATE_PARSE_ERROR, 'Second error', {});

            const warningLog = consoleWarnCalls.find(call => 
                call[0] && call[0].toString().includes('This error has occurred 2 times')
            );
            assert.ok(warningLog, 'Should show repeated error warning');
        });
    });

    suite('error callbacks', () => {
        test('should notify registered callbacks on error', () => {
            let callbackCalled = false;
            let callbackError: PromptError | undefined;
            let callbackMessage: string | undefined;
            let callbackContext: any;

            const callback = (error: PromptError, message: string, context?: any) => {
                callbackCalled = true;
                callbackError = error;
                callbackMessage = message;
                callbackContext = context;
            };

            errorHandler.onError(callback);

            const context = { test: 'data' };
            errorHandler.logError(PromptError.VALIDATION_ERROR, 'Test message', context);

            assert.strictEqual(callbackCalled, true);
            assert.strictEqual(callbackError, PromptError.VALIDATION_ERROR);
            assert.strictEqual(callbackMessage, 'Test message');
            assert.deepStrictEqual(callbackContext, context);
        });

        test('should handle callback errors gracefully', () => {
            const faultyCallback = () => {
                throw new Error('Callback error');
            };
            errorHandler.onError(faultyCallback);

            assert.doesNotThrow(() => {
                errorHandler.logError(PromptError.TEMPLATE_PARSE_ERROR, 'Test message', {});
            });
        });

        test('should call multiple callbacks', () => {
            let callback1Called = false;
            let callback2Called = false;

            const callback1 = () => { callback1Called = true; };
            const callback2 = () => { callback2Called = true; };

            errorHandler.onError(callback1);
            errorHandler.onError(callback2);

            errorHandler.logError(PromptError.CONFIGURATION_ERROR, 'Test message', {});

            assert.strictEqual(callback1Called, true);
            assert.strictEqual(callback2Called, true);
        });
    });

    suite('error statistics', () => {
        test('should track error counts correctly', () => {
            errorHandler.logError(PromptError.TEMPLATE_PARSE_ERROR, 'Error 1', {});
            errorHandler.logError(PromptError.TEMPLATE_PARSE_ERROR, 'Error 2', {});
            errorHandler.logError(PromptError.VALIDATION_ERROR, 'Error 3', {});

            const stats = errorHandler.getErrorStats();

            assert.strictEqual(stats[PromptError.TEMPLATE_PARSE_ERROR].count, 2);
            assert.strictEqual(stats[PromptError.VALIDATION_ERROR].count, 1);
            assert.strictEqual(stats[PromptError.CONFIGURATION_ERROR].count, 0);
        });

        test('should track last occurrence timestamps', () => {
            const beforeTime = new Date();
            errorHandler.logError(PromptError.TEMPLATE_PARSE_ERROR, 'Test error', {});
            const afterTime = new Date();

            const stats = errorHandler.getErrorStats();
            const lastOccurred = stats[PromptError.TEMPLATE_PARSE_ERROR].lastOccurred;

            assert.ok(lastOccurred);
            assert.ok(lastOccurred.getTime() >= beforeTime.getTime());
            assert.ok(lastOccurred.getTime() <= afterTime.getTime());
        });

        test('should clear error statistics', () => {
            errorHandler.logError(PromptError.TEMPLATE_PARSE_ERROR, 'Error', {});
            errorHandler.clearErrorStats();

            const stats = errorHandler.getErrorStats();
            assert.strictEqual(stats[PromptError.TEMPLATE_PARSE_ERROR].count, 0);
            assert.strictEqual(stats[PromptError.TEMPLATE_PARSE_ERROR].lastOccurred, undefined);
        });

        test('should identify frequent errors', () => {
            // Log 5 errors (default threshold)
            for (let i = 0; i < 5; i++) {
                errorHandler.logError(PromptError.TEMPLATE_PARSE_ERROR, `Error ${i}`, {});
            }

            assert.strictEqual(errorHandler.isErrorFrequent(PromptError.TEMPLATE_PARSE_ERROR), true);
            assert.strictEqual(errorHandler.isErrorFrequent(PromptError.VALIDATION_ERROR), false);
        });

        test('should use custom threshold for frequent error detection', () => {
            errorHandler.logError(PromptError.VALIDATION_ERROR, 'Error 1', {});
            errorHandler.logError(PromptError.VALIDATION_ERROR, 'Error 2', {});

            assert.strictEqual(errorHandler.isErrorFrequent(PromptError.VALIDATION_ERROR, 2), true);
            assert.strictEqual(errorHandler.isErrorFrequent(PromptError.VALIDATION_ERROR, 3), false);
        });
    });

    suite('recovery capabilities', () => {
        test('should validate recovery capabilities with no issues', () => {
            const callback = () => {};
            errorHandler.onError(callback);

            const result = errorHandler.validateRecoveryCapabilities();

            assert.strictEqual(result.canRecover, true);
            assert.strictEqual(result.issues.length, 0);
        });

        test('should detect frequent errors as recovery issue', () => {
            // Generate frequent errors
            for (let i = 0; i < 15; i++) {
                errorHandler.logError(PromptError.TEMPLATE_PARSE_ERROR, `Error ${i}`, {});
            }

            const result = errorHandler.validateRecoveryCapabilities();

            assert.strictEqual(result.canRecover, false);
            assert.ok(result.issues.some(issue => issue.includes('Frequent errors detected')));
        });

        test('should detect missing error callbacks as recovery issue', () => {
            const result = errorHandler.validateRecoveryCapabilities();

            assert.strictEqual(result.canRecover, false);
            assert.ok(result.issues.some(issue => issue.includes('No error callbacks registered')));
        });
    });


});

suite('withErrorHandling utility', () => {
    let errorHandler: ErrorHandler;

    setup(() => {
        errorHandler = new ErrorHandler(false); // Disable console logging for tests
    });

    test('should execute operation successfully and return result', () => {
        const operation = () => 'success result';
        const result = withErrorHandling(operation, PromptError.TEMPLATE_PARSE_ERROR);

        assert.strictEqual(result, 'success result');
    });

    test('should catch errors and return null', () => {
        const operation = () => {
            throw new Error('Test error');
        };

        const result = withErrorHandling(operation, PromptError.TEMPLATE_PARSE_ERROR, { test: 'context' });

        assert.strictEqual(result, null);
    });

    test('should handle async operations successfully', async () => {
        const asyncOperation = async () => 'async success';
        const result = await withAsyncErrorHandling(asyncOperation, PromptError.VALIDATION_ERROR);

        assert.strictEqual(result, 'async success');
    });

    test('should catch async errors and return null', async () => {
        const asyncOperation = async () => {
            throw new Error('Async error');
        };

        const result = await withAsyncErrorHandling(asyncOperation, PromptError.VALIDATION_ERROR, { test: 'context' });

        assert.strictEqual(result, null);
    });
});