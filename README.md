# DebugBuddy

DebugBuddy is your AI mentor — it helps you understand and resolve errors by offering thoughtful suggestions, encouraging you to think instead of instantly solving everything for you.

## Features

- **AI-Powered Code Review**: Get intelligent code analysis and suggestions using multiple AI providers (OpenAI, Anthropic, Google Gemini, xAI)
- **Interactive Webview**: View formatted AI responses with syntax highlighting in a dedicated panel
- **Hover Assistance**: Get instant help for errors and code issues by hovering over problems
- **Multi-Provider Support**: Choose from different AI models based on your preference and API availability
- **Secure API Management**: Safely store and manage your API keys with built-in encryption

## Setup

1. Install the extension
2. Set your API key using `Ctrl+Shift+P` → "Set API Key for DebugBuddy"
3. Start reviewing code with `Ctrl+Shift+P` → "Review Current File"

## Commands

- `DebugBuddy: Set API Key` - Configure your AI provider API key
- `DebugBuddy: Review Current File` - Get AI analysis of the current file
- `DebugBuddy: Show Webview` - Open the DebugBuddy response panel
- `DebugBuddy: Show API Key` - Display your current API key
- `DebugBuddy: Delete API Key` - Remove stored API key

## Requirements

- VS Code 1.102.0 or higher
- API key from one of the supported AI providers (OpenAI, Anthropic, Google, xAI)

## Configuration

Configure DebugBuddy behavior in VS Code settings:

- `debugBuddy.webview.autoShow` - Automatically show webview for responses
- `debugBuddy.webview.retainContext` - Keep webview state when hidden
- `debugBuddy.webview.enableSyntaxHighlighting` - Enable code syntax highlighting

---

**Enjoy coding with AI assistance!**
