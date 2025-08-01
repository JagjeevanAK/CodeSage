
import * as vscode from 'vscode';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

export interface ContentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface IMarkdownRenderer {
  renderMarkdown(content: string): string;
  validateContent(content: string): ContentValidationResult;
  renderWithErrorHandling(content: string): { html: string; hasErrors: boolean; errors: string[] };
}

export class MarkdownRenderer implements IMarkdownRenderer {
  private md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: this.highlightCode.bind(this),
    });
  }

  public renderMarkdown(content: string): string {
    try {
      if (!this.validateBasicContent(content)) {
        return this.renderErrorContent('Invalid or empty content provided');
      }
      return this.md.render(content);
    } catch (error) {
      console.error('CodeSage: Markdown rendering error:', error);
      return this.renderErrorContent(`Markdown rendering failed: ${(error as Error).message}`);
    }
  }

  public validateContent(content: string): ContentValidationResult {
    const result: ContentValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check for basic content validity
    if (!content || typeof content !== 'string') {
      result.isValid = false;
      result.errors.push('Content is null, undefined, or not a string');
      return result;
    }

    if (content.trim().length === 0) {
      result.isValid = false;
      result.errors.push('Content is empty or contains only whitespace');
      return result;
    }

    // Check for extremely large content that might cause performance issues
    if (content.length > 1000000) { // 1MB limit
      result.warnings.push('Content is very large and may affect performance');
    }

    // Check for potential markdown parsing issues
    try {
      this.md.render(content);
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Markdown parsing error: ${(error as Error).message}`);
    }

    return result;
  }

  public renderWithErrorHandling(content: string): { html: string; hasErrors: boolean; errors: string[] } {
    const validation = this.validateContent(content);
    
    if (!validation.isValid) {
      return {
        html: this.renderErrorContent(`Content validation failed: ${validation.errors.join(', ')}`),
        hasErrors: true,
        errors: validation.errors
      };
    }

    try {
      const html = this.md.render(content);
      return {
        html,
        hasErrors: false,
        errors: []
      };
    } catch (error) {
      const errorMessage = `Rendering failed: ${(error as Error).message}`;
      return {
        html: this.renderErrorContent(errorMessage),
        hasErrors: true,
        errors: [errorMessage]
      };
    }
  }

  private validateBasicContent(content: string): boolean {
    return !!(content && typeof content === 'string' && content.trim().length > 0);
  }

  private renderErrorContent(errorMessage: string): string {
    return `
      <div class="error-container" style="
        padding: 20px;
        background-color: var(--vscode-errorForeground, #f48771);
        color: var(--vscode-editor-background, #ffffff);
        border-radius: 4px;
        margin: 10px 0;
        border-left: 4px solid var(--vscode-errorForeground, #f48771);
      ">
        <h3 style="margin-top: 0; color: var(--vscode-editor-background, #ffffff);">
          Content Error
        </h3>
        <p style="margin-bottom: 0;">
          ${this.md.utils.escapeHtml(errorMessage)}
        </p>
        <details style="margin-top: 10px;">
          <summary style="cursor: pointer; color: var(--vscode-editor-background, #ffffff);">
            Troubleshooting Tips
          </summary>
          <ul style="margin-top: 10px; color: var(--vscode-editor-background, #ffffff);">
            <li>Ensure the AI response contains valid content</li>
            <li>Check if the content is properly formatted markdown</li>
            <li>Try refreshing the webview or rerunning the command</li>
            <li>Check the VS Code output panel for detailed error logs</li>
          </ul>
        </details>
      </div>
    `;
  }

  private highlightCode(str: string, lang: string): string {
    try {
      if (lang && hljs.getLanguage(lang)) {
        return (
          '<pre><code class="hljs ' +
          lang +
          '">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        );
      }
    } catch (error) {
      console.warn('CodeSage: Syntax highlighting failed for language:', lang, error);
      // Fall through to safe rendering
    }

    return (
      '<pre><code class="hljs">' +
      this.md.utils.escapeHtml(str) +
      '</code></pre>'
    );
  }
}
