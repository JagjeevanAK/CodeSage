import * as assert from 'assert';
import { HtmlTemplateSystem, TemplateData, TemplateOptions } from '../webview/HtmlTemplateSystem';

suite('HtmlTemplateSystem Test Suite', () => {
    let templateSystem: HtmlTemplateSystem;

    setup(() => {
        templateSystem = new HtmlTemplateSystem();
    });

    suite('escapeHtml', () => {
        test('should escape HTML special characters', () => {
            const input = '<script>alert("test")</script>';
            const expected = '&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;';
            assert.strictEqual(templateSystem.escapeHtml(input), expected);
        });

        test('should escape ampersands', () => {
            const input = 'Tom & Jerry';
            const expected = 'Tom &amp; Jerry';
            assert.strictEqual(templateSystem.escapeHtml(input), expected);
        });

        test('should escape single quotes', () => {
            const input = "It's working";
            const expected = 'It&#39;s working';
            assert.strictEqual(templateSystem.escapeHtml(input), expected);
        });
    });

    suite('getBaseTemplate', () => {
        test('should return a valid HTML template with placeholders', () => {
            const template = templateSystem.getBaseTemplate();
            
            assert.ok(template.includes('<!DOCTYPE html>'));
            assert.ok(template.includes('{{title}}'));
            assert.ok(template.includes('{{fileName}}'));
            assert.ok(template.includes('{{timestamp}}'));
            assert.ok(template.includes('{{content}}'));
            assert.ok(template.includes('{{customStyles}}'));
            assert.ok(template.includes('{{scripts}}'));
        });

        test('should include VS Code CSS variables', () => {
            const template = templateSystem.getBaseTemplate();
            
            assert.ok(template.includes('var(--vscode-font-family)'));
            assert.ok(template.includes('var(--vscode-foreground)'));
            assert.ok(template.includes('var(--vscode-editor-background)'));
        });
    });

    suite('renderTemplate', () => {
        test('should render template with basic data', () => {
            const templateData: TemplateData = {
                fileName: 'test.js',
                timestamp: '2024-01-01 12:00:00',
                content: '<p>Test content</p>'
            };

            const result = templateSystem.renderTemplate(templateData);

            assert.ok(result.includes('test.js'));
            assert.ok(result.includes('2024-01-01 12:00:00'));
            assert.ok(result.includes('<p>Test content</p>'));
            assert.ok(result.includes('CodeSage AI Response')); // default title
        });

        test('should render template with custom options', () => {
            const templateData: TemplateData = {
                fileName: 'custom.ts',
                timestamp: '2024-01-01 12:00:00',
                content: '<h1>Custom Content</h1>'
            };

            const options: TemplateOptions = {
                title: 'Custom Title',
                customStyles: '.custom { color: red; }',
                enableScripts: false
            };

            const result = templateSystem.renderTemplate(templateData, options);

            assert.ok(result.includes('Custom Title'));
            assert.ok(result.includes('.custom { color: red; }'));
            assert.ok(result.includes('custom.ts'));
            assert.ok(result.includes('<h1>Custom Content</h1>'));
            // Should not contain scripts when disabled
            assert.ok(!result.includes('window.addEventListener'));
        });

        test('should escape HTML in fileName and timestamp', () => {
            const templateData: TemplateData = {
                fileName: '<script>alert("hack")</script>',
                timestamp: '<img src="x" onerror="alert(1)">',
                content: '<p>Safe content</p>'
            };

            const result = templateSystem.renderTemplate(templateData);

            assert.ok(result.includes('&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;'));
            assert.ok(result.includes('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;'));
            assert.ok(result.includes('<p>Safe content</p>')); // Content should not be escaped
        });

        test('should include scripts by default', () => {
            const templateData: TemplateData = {
                fileName: 'test.js',
                timestamp: '2024-01-01 12:00:00',
                content: '<p>Test</p>'
            };

            const result = templateSystem.renderTemplate(templateData);

            assert.ok(result.includes('window.addEventListener'));
            assert.ok(result.includes('updateTheme'));
            assert.ok(result.includes('scrollToTop'));
        });

        test('should handle empty content gracefully', () => {
            const templateData: TemplateData = {
                fileName: '',
                timestamp: '',
                content: ''
            };

            const result = templateSystem.renderTemplate(templateData);

            assert.ok(result.includes('<!DOCTYPE html>'));
            assert.ok(result.includes('CodeSage Code Review'));
            // Should still be valid HTML even with empty data
        });
    });
});