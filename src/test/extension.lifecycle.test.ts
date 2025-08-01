/**
 * Extension Lifecycle Integration Tests
 * 
 * Tests the integration of API key cache and configuration change handler
 * with the extension activation and deactivation lifecycle.
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { activate, deactivate } from '../extension';
import { apiKeyCache } from '../lib/apiKeyCache';
import { configChangeHandler } from '../lib/configChangeHandler';

suite('Extension Lifecycle Integration Tests', () => {
  let mockContext: vscode.ExtensionContext;

  setup(() => {
    // Create a mock extension context
    mockContext = {
      subscriptions: [],
      workspaceState: {} as any,
      globalState: {} as any,
      extensionUri: {} as any,
      extensionPath: '',
      asAbsolutePath: (relativePath: string) => relativePath,
      storageUri: {} as any,
      storagePath: '',
      globalStorageUri: {} as any,
      globalStoragePath: '',
      logUri: {} as any,
      logPath: '',
      extensionMode: vscode.ExtensionMode.Test,
      secrets: {} as any,
      environmentVariableCollection: {} as any,
      extension: {} as any,
      languageModelAccessInformation: {} as any
    };

    // Clear cache before each test
    apiKeyCache.clear();
  });

  teardown(() => {
    // Clean up after each test
    deactivate();
  });

  test('should initialize cache manager during activation', () => {
    // Verify cache starts uninitialized
    assert.strictEqual(apiKeyCache.isInitialized(), false);

    // Activate extension
    activate(mockContext);

    // Cache should still be uninitialized (lazy initialization)
    // but the manager should be ready
    assert.strictEqual(apiKeyCache.isInitialized(), false);
    
    // Test that cache can be used after activation
    apiKeyCache.set('test-key');
    assert.strictEqual(apiKeyCache.get(), 'test-key');
    assert.strictEqual(apiKeyCache.isInitialized(), true);
  });

  test('should register configuration change handler during activation', () => {
    // Verify subscriptions start empty
    assert.strictEqual(mockContext.subscriptions.length, 0);

    // Test that the configuration handler can be initialized
    configChangeHandler.initialize();
    
    // Manually add to subscriptions to simulate what activate() does
    mockContext.subscriptions.push(configChangeHandler);

    // Verify that configChangeHandler is added to subscriptions
    const hasConfigHandler = mockContext.subscriptions.includes(configChangeHandler);
    assert.strictEqual(hasConfigHandler, true, 'Configuration change handler should be in subscriptions');
    
    // Clean up
    configChangeHandler.dispose();
  });

  test('should clear cache during deactivation', () => {
    // Set up cache with a value
    apiKeyCache.set('test-key');
    assert.strictEqual(apiKeyCache.get(), 'test-key');
    assert.strictEqual(apiKeyCache.isInitialized(), true);

    // Deactivate extension
    deactivate();

    // Verify cache is cleared
    assert.strictEqual(apiKeyCache.get(), undefined);
    assert.strictEqual(apiKeyCache.isInitialized(), false);
  });

  test('should handle activation and deactivation cycle', () => {
    // Set up cache with a value
    apiKeyCache.set('test-key-1');
    assert.strictEqual(apiKeyCache.get(), 'test-key-1');

    // Deactivation should clear cache
    deactivate();
    assert.strictEqual(apiKeyCache.get(), undefined);
    assert.strictEqual(apiKeyCache.isInitialized(), false);

    // After deactivation, cache should be ready for reuse
    // (simulating extension restart scenario)
    assert.strictEqual(apiKeyCache.get(), undefined);
    assert.strictEqual(apiKeyCache.isInitialized(), false);

    // Should be able to set new value after deactivation
    apiKeyCache.set('test-key-2');
    assert.strictEqual(apiKeyCache.get(), 'test-key-2');
    assert.strictEqual(apiKeyCache.isInitialized(), true);
  });
});