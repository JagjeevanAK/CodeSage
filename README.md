# CodeSage

CodeSage is your AI mentor — it helps you understand and resolve errors by offering thoughtful suggestions, encouraging you to think instead of instantly solving everything for you.

## Features

- **AI-Powered Code Review**: Get intelligent code analysis and suggestions using multiple AI providers (OpenAI, Anthropic, Google Gemini, xAI)
- **Interactive Webview**: View formatted AI responses with syntax highlighting in a dedicated panel
- **Hover Assistance**: Get instant help for errors and code issues by hovering over problems
- **Multi-Provider Support**: Choose from different AI models based on your preference and API availability
- **Secure API Management**: Safely store and manage your API keys with built-in encryption

## Setup

1. Install the extension
2. Set your API key using `Ctrl+Shift+P` → "Set API Key for CodeSage"
3. Start reviewing code with `Ctrl+Shift+P` → "Review Current File"

## Commands

- `CodeSage: Set API Key` - Configure your AI provider API key
- `CodeSage: Review Current File` - Get AI analysis of the current file
- `CodeSage: Show Webview` - Open the CodeSage response panel
- `CodeSage: Show API Key` - Display your current API key
- `CodeSage: Delete API Key` - Remove stored API key

## Requirements

- VS Code 1.102.0 or higher
- API key from one of the supported AI providers (OpenAI, Anthropic, Google, xAI)

## Configuration

Configure CodeSage behavior in VS Code settings:

- `codeSage.webview.autoShow` - Automatically show webview for responses
- `codeSage.webview.retainContext` - Keep webview state when hidden
- `codeSage.webview.enableSyntaxHighlighting` - Enable code syntax highlighting

---

**Enjoy coding with AI assistance!**
