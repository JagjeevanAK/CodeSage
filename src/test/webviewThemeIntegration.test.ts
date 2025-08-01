import * as assert from 'assert';
import * as vscode from 'vscode';
import { HtmlTemplateSystem, TemplateData } from '../webview/HtmlTemplateSystem';
import { ThemeManager } from '../webview/ThemeManager';

suite('Webview Theme Integration Tests', () => {
    let htmlTemplateSystem: HtmlTemplateSystem;
    let themeManager: ThemeManager;

    setup(() => {
        htmlTemplateSystem = new HtmlTemplateSystem();
        themeManager = new ThemeManager();
    });

    teardown(() => {
        htmlTemplateSystem.dispose();
        themeManager.dispose();
    });

    test('should render template with theme styles', () => {
        const templateData: TemplateData = {
            fileName: 'test.js',
            timestamp: '2025-01-01 12:00:00',
            content: '<p>Test content</p>'
        };

        const currentTheme = themeManager.getCurrentTheme();
        const html = htmlTemplateSystem.renderTemplate(templateData, {
            themeConfiguration: currentTheme
        });

        assert.ok(html, 'HTML should be generated');
        assert.ok(html.includes('--theme-background'), 'HTML should contain theme CSS variables');
        assert.ok(html.includes('--theme-foreground'), 'HTML should contain theme foreground variable');
        assert.ok(html.includes('test.js'), 'HTML should contain file name');
        assert.ok(html.includes('Test content'), 'HTML should contain content');
    });

    test('should include theme-specific CSS classes', () => {
        const templateData: TemplateData = {
            fileName: 'example.py',
            timestamp: '2025-01-01 12:00:00',
            content: '<pre><code>print("hello")</code></pre>'
        };

        const currentTheme = themeManager.getCurrentTheme();
        const html = htmlTemplateSystem.renderTemplate(templateData, {
            themeConfiguration: currentTheme
        });

        // Check for theme-aware styling
        assert.ok(html.includes('background-color: var(--theme-background)'), 'Should use theme background');
        assert.ok(html.includes('color: var(--theme-foreground)'), 'Should use theme foreground');
        assert.ok(html.includes('.error-message'), 'Should include error message styling');
        assert.ok(html.includes('--theme-error-foreground'), 'Should include error color variable');
    });

    test('should handle light and dark theme differences', () => {
        const templateData: TemplateData = {
            fileName: 'test.css',
            timestamp: '2025-01-01 12:00:00',
            content: '<p>Theme test</p>'
        };

        const currentTheme = themeManager.getCurrentTheme();
        const css = themeManager.generateThemeCSS(currentTheme);

        // Check for theme kind specific opacity values
        assert.ok(css.includes('--theme-opacity-light'), 'Should include light opacity variable');
        assert.ok(css.includes('--theme-opacity-medium'), 'Should include medium opacity variable');
        assert.ok(css.includes('--theme-opacity-heavy'), 'Should include heavy opacity variable');

        // Check for scrollbar styling
        assert.ok(css.includes('::-webkit-scrollbar'), 'Should include scrollbar styling');
        assert.ok(css.includes('::selection'), 'Should include selection styling');
    });

    test('should generate valid CSS without syntax errors', () => {
        const currentTheme = themeManager.getCurrentTheme();
        const css = themeManager.generateThemeCSS(currentTheme);

        // Basic CSS validation - check for balanced braces
        const openBraces = (css.match(/{/g) || []).length;
        const closeBraces = (css.match(/}/g) || []).length;
        assert.strictEqual(openBraces, closeBraces, 'CSS should have balanced braces');

        // Check for required CSS properties
        assert.ok(css.includes('background-color:'), 'Should include background-color properties');
        assert.ok(css.includes('color:'), 'Should include color properties');
        assert.ok(css.includes('border-color:'), 'Should include border-color properties');
    });
});