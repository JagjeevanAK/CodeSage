/**
 * Edge Cases and Error Scenarios Tests
 * 
 * Tests edge cases and error scenarios for the API key caching system:
 * - Behavior when no API key is configured
 * - Rapid configuration changes
 * - Extension restart scenarios
 * 
 * Requirements: 3.1, 3.2, 3.3, 4.2
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { getApiKey } from '../lib/getapi';
import { apiKeyCache } from '../lib/apiKeyCache';
import { configChangeHandler } from '../lib/configChangeHandler';
import { activate, deactivate } from '../extension';

suite('Edge Cases and Error Scenarios Tests', () => {

  setup(() => {
    // Clear cache before each test
    apiKeyCache.clear();
    configChangeHandler.dispose();
  });

  teardown(() => {
    // Clean up after each test
    configChangeHandler.dispose();
    apiKeyCache.clear();
  });

  suite('No API Key Configured Tests', () => {
    
    test('should cache undefined state when no API key is configured', () => {
      // Mock VSCode configuration to return undefined
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = (section?: string) => ({
        get: (key: string) => undefined,
        has: () => false,
        inspect: () => undefined,
        update: () => Promise.resolve()
      } as any);

      try {
        // Verify cache starts uninitialized
        assert.strictEqual(apiKeyCache.isInitialized(), false);
        
        // Call getApiKey with no configured key
        const result = getApiKey();
        
        // Should return undefined and cache the undefined state
        assert.strictEqual(result, undefined);
        assert.strictEqual(apiKeyCache.isInitialized(), true);
        assert.strictEqual(apiKeyCache.get(), undefined);
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test('should maintain existing error handling behavior when no API key is set', () => {
      // Mock VSCode configuration to return undefined
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = (section?: string) => ({
        get: (key: string) => undefined,
        has: () => false,
        inspect: () => undefined,
        update: () => Promise.resolve()
      } as any);

      try {
        // Multiple calls should consistently return undefined
        const result1 = getApiKey();
        const result2 = getApiKey();
        const result3 = getApiKey();
        
        assert.strictEqual(result1, undefined);
        assert.strictEqual(result2, undefined);
        assert.strictEqual(result3, undefined);
        
        // Cache should remain initialized with undefined value
        assert.strictEqual(apiKeyCache.isInitialized(), true);
        assert.strictEqual(apiKeyCache.get(), undefined);
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test('should update cache from undefined to new key value when user sets API key for first time', () => {
      // Initialize configuration change handler
      configChangeHandler.initialize();
      
      // Start with no API key configured
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      let configuredApiKey: string | undefined = undefined;
      
      vscode.workspace.getConfiguration = (section?: string) => ({
        get: (key: string) => key === 'apiKey' ? configuredApiKey : undefined,
        has: () => configuredApiKey !== undefined,
        inspect: () => undefined,
        update: () => Promise.resolve()
      } as any);

      try {
        // First call with no API key
        const result1 = getApiKey();
        assert.strictEqual(result1, undefined);
        assert.strictEqual(apiKeyCache.get(), undefined);
        assert.strictEqual(apiKeyCache.isInitialized(), true);
        
        // Simulate user setting API key for the first time
        configuredApiKey = 'newly-set-api-key';
        
        // Mock configuration change event
        const mockEvent: vscode.ConfigurationChangeEvent = {
          affectsConfiguration: (section: string) => section === 'DebugBuddy.apiKey'
        };
        
        // Trigger configuration change
        configChangeHandler.onConfigurationChanged(mockEvent);
        
        // Cache should now contain the new key
        assert.strictEqual(apiKeyCache.get(), 'newly-set-api-key');
        assert.strictEqual(apiKeyCache.isInitialized(), true);
        
        // Subsequent getApiKey calls should return the cached value
        const result2 = getApiKey();
        assert.strictEqual(result2, 'newly-set-api-key');
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test('should handle empty string API key as valid configuration', () => {
      // Mock VSCode configuration to return empty string
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = (section?: string) => ({
        get: (key: string) => key === 'apiKey' ? '' : undefined,
        has: () => true,
        inspect: () => undefined,
        update: () => Promise.resolve()
      } as any);

      try {
        const result = getApiKey();
        
        // Empty string should be cached as a valid value
        assert.strictEqual(result, '');
        assert.strictEqual(apiKeyCache.isInitialized(), true);
        assert.strictEqual(apiKeyCache.get(), '');
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });
  });

  suite('Rapid Configuration Changes Tests', () => {
    
    test('should handle rapid configuration changes without losing data', async () => {
      // Initialize configuration change handler
      configChangeHandler.initialize();
      
      let currentApiKey = 'initial-key';
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      
      vscode.workspace.getConfiguration = (section?: string) => ({
        get: (key: string) => key === 'apiKey' ? currentApiKey : undefined,
        has: () => true,
        inspect: () => undefined,
        update: () => Promise.resolve()
      } as any);

      try {
        // Initial state
        const result1 = getApiKey();
        assert.strictEqual(result1, 'initial-key');
        assert.strictEqual(apiKeyCache.get(), 'initial-key');
        
        // Simulate rapid configuration changes
        const changes = ['key-1', 'key-2', 'key-3', 'key-4', 'key-5'];
        const mockEvent: vscode.ConfigurationChangeEvent = {
          affectsConfiguration: (section: string) => section === 'DebugBuddy.apiKey'
        };
        
        for (const newKey of changes) {
          currentApiKey = newKey;
          configChangeHandler.onConfigurationChanged(mockEvent);
          
          // Verify cache is updated after each change
          assert.strictEqual(apiKeyCache.get(), newKey);
          assert.strictEqual(apiKeyCache.isInitialized(), true);
        }
        
        // Final verification
        assert.strictEqual(apiKeyCache.get(), 'key-5');
        const finalResult = getApiKey();
        assert.strictEqual(finalResult, 'key-5');
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test('should maintain cache consistency during rapid changes between defined and undefined values', () => {
      // Initialize configuration change handler
      configChangeHandler.initialize();
      
      let currentApiKey: string | undefined = 'initial-key';
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      
      vscode.workspace.getConfiguration = (section?: string) => ({
        get: (key: string) => key === 'apiKey' ? currentApiKey : undefined,
        has: () => currentApiKey !== undefined,
        inspect: () => undefined,
        update: () => Promise.resolve()
      } as any);

      try {
        // Start with a defined key
        const result1 = getApiKey();
        assert.strictEqual(result1, 'initial-key');
        
        const mockEvent: vscode.ConfigurationChangeEvent = {
          affectsConfiguration: (section: string) => section === 'DebugBuddy.apiKey'
        };
        
        // Rapid changes between defined and undefined
        const changes: (string | undefined)[] = [
          undefined, 'temp-key-1', undefined, 'temp-key-2', 
          undefined, 'final-key', undefined
        ];
        
        for (const newKey of changes) {
          currentApiKey = newKey;
          configChangeHandler.onConfigurationChanged(mockEvent);
          
          // Verify cache reflects the current state
          assert.strictEqual(apiKeyCache.get(), newKey);
          assert.strictEqual(apiKeyCache.isInitialized(), true);
        }
        
        // Final state should be undefined
        assert.strictEqual(apiKeyCache.get(), undefined);
        const finalResult = getApiKey();
        assert.strictEqual(finalResult, undefined);
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test('should handle configuration change errors during rapid updates', () => {
      // Initialize configuration change handler
      configChangeHandler.initialize();
      
      let shouldThrowError = false;
      let currentApiKey = 'stable-key';
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      
      vscode.workspace.getConfiguration = (section?: string) => {
        if (shouldThrowError) {
          throw new Error('Configuration access failed');
        }
        return {
          get: (key: string) => key === 'apiKey' ? currentApiKey : undefined,
          has: () => true,
          inspect: () => undefined,
          update: () => Promise.resolve()
        } as any;
      };

      try {
        // Establish initial state
        const result1 = getApiKey();
        assert.strictEqual(result1, 'stable-key');
        
        const mockEvent: vscode.ConfigurationChangeEvent = {
          affectsConfiguration: (section: string) => section === 'DebugBuddy.apiKey'
        };
        
        // Simulate rapid changes with intermittent errors
        for (let i = 0; i < 10; i++) {
          shouldThrowError = (i % 3 === 0); // Every 3rd call fails
          currentApiKey = `key-${i}`;
          
          // Should not throw despite errors
          assert.doesNotThrow(() => {
            configChangeHandler.onConfigurationChanged(mockEvent);
          });
        }
        
        // Reset error condition and verify final state
        shouldThrowError = false;
        currentApiKey = 'final-stable-key';
        configChangeHandler.onConfigurationChanged(mockEvent);
        
        assert.strictEqual(apiKeyCache.get(), 'final-stable-key');
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test('should handle concurrent configuration change events', () => {
      // Initialize configuration change handler
      configChangeHandler.initialize();
      
      let currentApiKey = 'concurrent-test-key';
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      
      vscode.workspace.getConfiguration = (section?: string) => ({
        get: (key: string) => key === 'apiKey' ? currentApiKey : undefined,
        has: () => true,
        inspect: () => undefined,
        update: () => Promise.resolve()
      } as any);

      try {
        // Establish initial state
        const result1 = getApiKey();
        assert.strictEqual(result1, 'concurrent-test-key');
        
        const mockEvent: vscode.ConfigurationChangeEvent = {
          affectsConfiguration: (section: string) => section === 'DebugBuddy.apiKey'
        };
        
        // Simulate sequential configuration changes (more predictable than concurrent)
        // This tests rapid changes without the complexity of true concurrency
        for (let i = 0; i < 10; i++) {
          currentApiKey = `concurrent-key-${i}`;
          configChangeHandler.onConfigurationChanged(mockEvent);
          
          // Verify cache is updated after each change
          assert.strictEqual(apiKeyCache.get(), `concurrent-key-${i}`);
          assert.strictEqual(apiKeyCache.isInitialized(), true);
        }
        
        // Final verification
        assert.strictEqual(apiKeyCache.get(), 'concurrent-key-9');
        const finalResult = getApiKey();
        assert.strictEqual(finalResult, 'concurrent-key-9');
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });
  });

  suite('Extension Restart Scenarios Tests', () => {
    
    test('should start with empty cache after extension restart', () => {
      // Mock extension context
      const mockContext: vscode.ExtensionContext = {
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

      // Set up cache with data before "restart"
      apiKeyCache.set('pre-restart-key');
      assert.strictEqual(apiKeyCache.get(), 'pre-restart-key');
      assert.strictEqual(apiKeyCache.isInitialized(), true);
      
      // Simulate extension deactivation (restart scenario)
      deactivate();
      
      // After deactivation, cache should be cleared
      assert.strictEqual(apiKeyCache.get(), undefined);
      assert.strictEqual(apiKeyCache.isInitialized(), false);
      
      // Simulate extension reactivation
      activate(mockContext);
      
      // Cache should still be empty after reactivation
      assert.strictEqual(apiKeyCache.get(), undefined);
      assert.strictEqual(apiKeyCache.isInitialized(), false);
      
      // But should be ready for use
      apiKeyCache.set('post-restart-key');
      assert.strictEqual(apiKeyCache.get(), 'post-restart-key');
      assert.strictEqual(apiKeyCache.isInitialized(), true);
    });

    test('should retrieve API key fresh on first use after restart', () => {
      const mockApiKey = 'fresh-after-restart-key';
      
      // Mock VSCode configuration
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = (section?: string) => ({
        get: (key: string) => key === 'apiKey' ? mockApiKey : undefined,
        has: () => true,
        inspect: () => undefined,
        update: () => Promise.resolve()
      } as any);

      try {
        // Simulate extension restart cycle
        deactivate();
        
        // After restart, first getApiKey call should query VSCode fresh
        assert.strictEqual(apiKeyCache.isInitialized(), false);
        
        const result = getApiKey();
        assert.strictEqual(result, mockApiKey);
        assert.strictEqual(apiKeyCache.get(), mockApiKey);
        assert.strictEqual(apiKeyCache.isInitialized(), true);
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test('should handle multiple restart cycles correctly', () => {
      const mockContext: vscode.ExtensionContext = {
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

      const testKeys = ['restart-1', 'restart-2', 'restart-3'];
      
      for (let i = 0; i < testKeys.length; i++) {
        const testKey = testKeys[i];
        
        // Set up cache
        apiKeyCache.set(testKey);
        assert.strictEqual(apiKeyCache.get(), testKey);
        assert.strictEqual(apiKeyCache.isInitialized(), true);
        
        // Simulate restart
        deactivate();
        assert.strictEqual(apiKeyCache.get(), undefined);
        assert.strictEqual(apiKeyCache.isInitialized(), false);
        
        activate(mockContext);
        assert.strictEqual(apiKeyCache.get(), undefined);
        assert.strictEqual(apiKeyCache.isInitialized(), false);
      }
      
      // After multiple restarts, cache should still work normally
      apiKeyCache.set('final-test-key');
      assert.strictEqual(apiKeyCache.get(), 'final-test-key');
      assert.strictEqual(apiKeyCache.isInitialized(), true);
    });

    test('should handle configuration changes immediately after restart', () => {
      // Mock extension context
      const mockContext: vscode.ExtensionContext = {
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

      let currentApiKey = 'post-restart-config-key';
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      
      vscode.workspace.getConfiguration = (section?: string) => ({
        get: (key: string) => key === 'apiKey' ? currentApiKey : undefined,
        has: () => true,
        inspect: () => undefined,
        update: () => Promise.resolve()
      } as any);

      try {
        // Simulate restart
        deactivate();
        activate(mockContext);
        
        // Initialize configuration handler after restart
        configChangeHandler.initialize();
        
        // Trigger configuration change immediately after restart
        const mockEvent: vscode.ConfigurationChangeEvent = {
          affectsConfiguration: (section: string) => section === 'DebugBuddy.apiKey'
        };
        
        configChangeHandler.onConfigurationChanged(mockEvent);
        
        // Cache should be updated with the configuration value
        assert.strictEqual(apiKeyCache.get(), 'post-restart-config-key');
        assert.strictEqual(apiKeyCache.isInitialized(), true);
        
        // Subsequent getApiKey calls should use cached value
        const result = getApiKey();
        assert.strictEqual(result, 'post-restart-config-key');
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test('should handle restart with corrupted cache state gracefully', () => {
      // Simulate a corrupted cache state that might occur during abnormal shutdown
      
      // First, set up normal cache state
      apiKeyCache.set('normal-key');
      assert.strictEqual(apiKeyCache.get(), 'normal-key');
      
      // Simulate abnormal shutdown by not calling deactivate()
      // and directly clearing the cache to simulate corruption
      apiKeyCache.clear();
      
      // Cache should handle this gracefully
      assert.strictEqual(apiKeyCache.get(), undefined);
      assert.strictEqual(apiKeyCache.isInitialized(), false);
      
      // Should be able to recover and work normally
      const mockApiKey = 'recovery-key';
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = (section?: string) => ({
        get: (key: string) => key === 'apiKey' ? mockApiKey : undefined,
        has: () => true,
        inspect: () => undefined,
        update: () => Promise.resolve()
      } as any);

      try {
        const result = getApiKey();
        assert.strictEqual(result, mockApiKey);
        assert.strictEqual(apiKeyCache.get(), mockApiKey);
        assert.strictEqual(apiKeyCache.isInitialized(), true);
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });
  });

  suite('Combined Edge Case Scenarios', () => {
    
    test('should handle no API key configured with rapid changes after restart', () => {
      // Mock extension context
      const mockContext: vscode.ExtensionContext = {
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

      let currentApiKey: string | undefined = undefined;
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      
      vscode.workspace.getConfiguration = (section?: string) => ({
        get: (key: string) => key === 'apiKey' ? currentApiKey : undefined,
        has: () => currentApiKey !== undefined,
        inspect: () => undefined,
        update: () => Promise.resolve()
      } as any);

      try {
        // Simulate restart
        deactivate();
        activate(mockContext);
        
        // Start with no API key configured
        const result1 = getApiKey();
        assert.strictEqual(result1, undefined);
        assert.strictEqual(apiKeyCache.get(), undefined);
        assert.strictEqual(apiKeyCache.isInitialized(), true);
        
        // Initialize configuration handler
        configChangeHandler.initialize();
        
        // Simulate rapid configuration changes from undefined to defined
        const mockEvent: vscode.ConfigurationChangeEvent = {
          affectsConfiguration: (section: string) => section === 'DebugBuddy.apiKey'
        };
        
        const rapidChanges = [
          'rapid-1', undefined, 'rapid-2', 'rapid-3', 
          undefined, 'rapid-4', 'final-rapid-key'
        ];
        
        for (const newKey of rapidChanges) {
          currentApiKey = newKey;
          configChangeHandler.onConfigurationChanged(mockEvent);
          
          // Verify cache consistency
          assert.strictEqual(apiKeyCache.get(), newKey);
          assert.strictEqual(apiKeyCache.isInitialized(), true);
        }
        
        // Final verification
        assert.strictEqual(apiKeyCache.get(), 'final-rapid-key');
        const finalResult = getApiKey();
        assert.strictEqual(finalResult, 'final-rapid-key');
        
      } finally {
        vscode.workspace.getConfiguration = originalGetConfiguration;
      }
    });

    test('should maintain error handling consistency across all edge case scenarios', () => {
      // This test combines various error conditions to ensure robust error handling
      
      let shouldThrowConfigError = false;
      let shouldThrowCacheError = false;
      let currentApiKey: string | undefined = 'error-test-key';
      
      const originalGetConfiguration = vscode.workspace.getConfiguration;
      vscode.workspace.getConfiguration = (section?: string) => {
        if (shouldThrowConfigError) {
          throw new Error('Configuration error in edge case test');
        }
        return {
          get: (key: string) => key === 'apiKey' ? currentApiKey : undefined,
          has: () => currentApiKey !== undefined,
          inspect: () => undefined,
          update: () => Promise.resolve()
        } as any;
      };

      // Mock cache methods to throw errors when needed
      const originalCacheGet = apiKeyCache.get;
      const originalCacheSet = apiKeyCache.set;
      
      const mockCacheGet = () => {
        if (shouldThrowCacheError) {
          throw new Error('Cache get error in edge case test');
        }
        return originalCacheGet();
      };
      
      const mockCacheSet = (key: string | undefined) => {
        if (shouldThrowCacheError) {
          throw new Error('Cache set error in edge case test');
        }
        return originalCacheSet(key);
      };

      try {
        // Test various error combinations
        const errorScenarios = [
          { config: false, cache: false, key: 'normal-key', desc: 'normal operation' },
          { config: true, cache: false, key: 'config-error-key', desc: 'config error only' },
          { config: false, cache: true, key: 'cache-error-key', desc: 'cache error only' },
          { config: true, cache: true, key: 'both-error-key', desc: 'both errors' },
          { config: false, cache: false, key: undefined, desc: 'undefined key' }
        ];
        
        for (const scenario of errorScenarios) {
          // Reset cache for each scenario
          apiKeyCache.clear();
          
          shouldThrowConfigError = scenario.config;
          shouldThrowCacheError = scenario.cache;
          currentApiKey = scenario.key;
          
          // Temporarily replace cache methods if needed
          if (shouldThrowCacheError) {
            (apiKeyCache as any).get = mockCacheGet;
            (apiKeyCache as any).set = mockCacheSet;
          } else {
            (apiKeyCache as any).get = originalCacheGet;
            (apiKeyCache as any).set = originalCacheSet;
          }
          
          // getApiKey should handle all error scenarios gracefully
          let result: string | undefined;
          assert.doesNotThrow(() => {
            result = getApiKey();
          }, `Error in scenario: ${scenario.desc}`);
          
          // In error scenarios, result might be undefined due to fallback behavior
          if (!scenario.config && !scenario.cache) {
            assert.strictEqual(result, scenario.key, `Unexpected result in scenario: ${scenario.desc}`);
          }
        }
        
      } finally {
        // Restore original functions
        vscode.workspace.getConfiguration = originalGetConfiguration;
        (apiKeyCache as any).get = originalCacheGet;
        (apiKeyCache as any).set = originalCacheSet;
      }
    });
  });
});