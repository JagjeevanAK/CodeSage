# Creating Custom Prompts

This guide explains how to create, validate, and manage custom JSON prompts for the DebugBuddy extension.

## Table of Contents

1. [Overview](#overview)
2. [Prompt Structure](#prompt-structure)
3. [Creating Your First Prompt](#creating-your-first-prompt)
4. [Template Variables](#template-variables)
5. [Configuration Options](#configuration-options)
6. [Template Inheritance](#template-inheritance)
7. [Validation and Testing](#validation-and-testing)
8. [Hot Reloading](#hot-reloading)
9. [Best Practices](#best-practices)
10. [Examples](#examples)
11. [Troubleshooting](#troubleshooting)

## Overview

The DebugBuddy extension supports a comprehensive JSON prompt system that allows you to create structured, configurable prompts for various code analysis tasks. Custom prompts enable you to:

- Define specialized prompts for your specific use cases
- Configure prompt behavior through VS Code settings
- Use template inheritance to build upon existing prompts
- Leverage hot reloading for rapid development
- Validate prompts before deployment

## Prompt Structure

Every JSON prompt follows a standardized schema with the following main sections:

```json
{
  "id": "unique-prompt-identifier",
  "name": "Human Readable Name",
  "description": "Description of what this prompt does",
  "category": "code_review",
  "version": "1.0.0",
  "author": "Your Name",
  "created_date": "2024-01-01",
  "last_modified": "2024-01-01",
  "schema_version": "1.0",
  
  "template": {
    "task": "Brief description of the task",
    "language": "auto-detect",
    "context": {},
    "instructions": "Detailed instructions for the AI",
    "output_format": {
      "structure": "Description of expected output format",
      "include_line_numbers": true,
      "include_severity": true,
      "include_explanation": true,
      "include_fix_suggestion": false
    },
    "variables": ["code", "language", "errorMessage"]
  },
  
  "config": {
    "configurable_fields": ["max_suggestions", "severity_threshold"],
    "default_values": {
      "max_suggestions": 5,
      "severity_threshold": "medium"
    },
    "validation_rules": {
      "max_suggestions": { "type": "number", "min": 1, "max": 20 }
    }
  },
  
  "metadata": {
    "supported_languages": ["javascript", "typescript", "python"],
    "required_context": ["code"],
    "performance_notes": "Optimized for small to medium code files"
  }
}
```

### Required Fields

- `id`: Unique identifier (alphanumeric, hyphens, underscores only)
- `name`: Human-readable name
- `description`: Brief description of the prompt's purpose
- `category`: One of the predefined categories (see [Categories](#categories))
- `version`: Semantic version (e.g., "1.0.0")
- `schema_version`: Schema version (currently "1.0")
- `template`: Template configuration object
- `config`: Configuration options

### Categories

Available prompt categories:

- `code_review`: Code review and quality analysis
- `debug_analysis`: Error debugging and analysis
- `refactoring`: Code refactoring suggestions
- `documentation`: Documentation generation
- `security_analysis`: Security vulnerability analysis
- `performance_analysis`: Performance optimization
- `test_generation`: Test case generation
- `code_explanation`: Code explanation and learning
- `general`: General-purpose prompts

## Creating Your First Prompt

Let's create a simple code review prompt:

1. **Create the prompt file** (`my-code-review.json`):

```json
{
  "id": "my-code-review",
  "name": "My Custom Code Review",
  "description": "A personalized code review prompt focusing on readability and maintainability",
  "category": "code_review",
  "version": "1.0.0",
  "schema_version": "1.0",
  
  "template": {
    "task": "Review the provided code for readability and maintainability issues",
    "instructions": "Analyze the following ${language} code and provide suggestions for improving readability and maintainability:\n\n${code}\n\nFocus on:\n- Variable naming\n- Function structure\n- Code organization\n- Comments and documentation\n\nProvide specific, actionable feedback with examples where possible.",
    "context": {
      "focus_areas": ["readability", "maintainability"],
      "experience_level": "${experienceLevel}"
    },
    "output_format": {
      "structure": "Provide a numbered list of suggestions with explanations",
      "include_line_numbers": true,
      "include_explanation": true
    },
    "variables": ["code", "language", "experienceLevel"]
  },
  
  "config": {
    "configurable_fields": ["focus_areas", "max_suggestions"],
    "default_values": {
      "focus_areas": ["readability", "maintainability"],
      "max_suggestions": 5
    },
    "validation_rules": {
      "max_suggestions": { "type": "number", "min": 1, "max": 10 }
    }
  }
}
```

2. **Place the file** in your custom prompts directory (configured in VS Code settings)

3. **Test the prompt** using the validation utilities

## Template Variables

Template variables allow dynamic content insertion. Variables are defined in the `variables` array and used in templates with `${variableName}` syntax.

### Built-in Variables

The system provides several built-in variables:

- `code`: Selected or full code content
- `selectedCode`: Currently selected code
- `fullCode`: Complete file content
- `filePath`: Path to the current file
- `fileName`: Name of the current file
- `language`: Detected programming language
- `errorMessage`: Error message (for debug prompts)
- `errorLine`: Line number of error
- `errorColumn`: Column number of error
- `surroundingCode`: Code around the error/selection
- `experienceLevel`: User's experience level setting
- `maxSuggestions`: Maximum number of suggestions
- `outputVerbosity`: Output verbosity level

### Custom Variables

You can define custom variables in your prompt configuration:

```json
{
  "template": {
    "instructions": "Review this ${language} code with focus on ${customFocus}:\n\n${code}",
    "variables": ["code", "language", "customFocus"]
  },
  "config": {
    "configurable_fields": ["customFocus"],
    "default_values": {
      "customFocus": "performance"
    }
  }
}
```

### Nested Variables

Variables can access nested properties:

```json
{
  "template": {
    "instructions": "Analyze this code for ${context.framework} best practices",
    "variables": ["context"]
  }
}
```

## Configuration Options

### Configurable Fields

Define which aspects of your prompt can be customized:

```json
{
  "config": {
    "configurable_fields": [
      "max_suggestions",
      "severity_threshold",
      "focus_areas",
      "include_examples"
    ],
    "default_values": {
      "max_suggestions": 5,
      "severity_threshold": "medium",
      "focus_areas": ["bugs", "performance"],
      "include_examples": true
    }
  }
}
```

### Validation Rules

Ensure configuration values are valid:

```json
{
  "config": {
    "validation_rules": {
      "max_suggestions": {
        "type": "number",
        "min": 1,
        "max": 20
      },
      "severity_threshold": {
        "type": "string",
        "enum": ["low", "medium", "high", "critical"]
      },
      "focus_areas": {
        "type": "array",
        "items": { "type": "string" },
        "maxItems": 10
      }
    }
  }
}
```

## Template Inheritance

Create prompts that extend existing ones:

### Basic Inheritance

```json
{
  "id": "enhanced-code-review",
  "name": "Enhanced Code Review",
  "description": "Extended code review with additional security focus",
  "category": "code_review",
  "version": "1.0.0",
  "schema_version": "1.0",
  
  "metadata": {
    "inheritance": {
      "extends": "code-review"
    }
  },
  
  "template": {
    "instructions": "Additionally, check for security vulnerabilities and potential exploits."
  }
}
```

### Using Mixins

```json
{
  "metadata": {
    "inheritance": {
      "extends": "code-review",
      "mixins": ["security-checks", "performance-tips"],
      "overrides": {
        "task": "Comprehensive code analysis with security and performance focus"
      }
    }
  }
}
```

### Composition Rules

```json
{
  "metadata": {
    "inheritance": {
      "composition": [
        {
          "type": "append",
          "target": "template.instructions",
          "value": "\n\nAdditional security considerations:\n- Check for input validation\n- Look for potential injection vulnerabilities"
        },
        {
          "type": "merge",
          "target": "template.context",
          "value": { "security_focus": true }
        }
      ]
    }
  }
}
```

## Validation and Testing

### Using Validation Utils

```typescript
import { ValidationUtils } from '../src/prompt/ValidationUtils';

const validator = new ValidationUtils();

// Validate a single file
const result = await validator.validateSingleFile('path/to/prompt.json');
console.log(result);

// Validate entire directories
const report = await validator.validateDirectories(['./custom-prompts']);
console.log(validator.generateReport(report, 'markdown'));
```

### Command Line Validation

```bash
# Validate all prompts in a directory
node scripts/validate-prompts.js ./custom-prompts

# Generate validation report
node scripts/validate-prompts.js ./custom-prompts --format markdown --output report.md
```

### VS Code Integration

The extension automatically validates prompts when:
- Files are loaded
- Hot reloading detects changes
- Manual validation is triggered

## Hot Reloading

Enable hot reloading for rapid development:

### Configuration

```json
{
  "DebugBuddy.prompts.hotReload": {
    "enabled": true,
    "watchDirectories": ["./custom-prompts", "./team-prompts"],
    "debounceMs": 500,
    "validateOnReload": true,
    "notifyOnReload": true
  }
}
```

### Usage

1. Enable hot reloading in settings
2. Make changes to your prompt files
3. Changes are automatically detected and applied
4. Validation errors are shown in the output panel

### Hot Reload Events

```typescript
import { PromptHotReloader } from '../src/prompt/PromptHotReloader';

const reloader = PromptHotReloader.getInstance(registry);

reloader.onReload((event) => {
  console.log(`Prompt ${event.type}: ${event.filePath}`);
  if (!event.success) {
    console.error(`Error: ${event.error}`);
  }
});
```

## Best Practices

### 1. Naming Conventions

- Use kebab-case for IDs: `my-custom-review`
- Use descriptive names: "Security-Focused Code Review"
- Include version in breaking changes

### 2. Template Design

- Keep instructions clear and specific
- Use appropriate variable names
- Provide context for the AI model
- Structure output format requirements

### 3. Configuration

- Make commonly changed values configurable
- Provide sensible defaults
- Add validation rules for user inputs
- Document configuration options

### 4. Testing

- Test with various code samples
- Validate with different languages
- Check edge cases and error conditions
- Use the validation utilities

### 5. Documentation

- Include clear descriptions
- Document required variables
- Explain configuration options
- Provide usage examples

### 6. Performance

- Avoid overly complex templates
- Limit variable substitution depth
- Use appropriate caching strategies
- Monitor prompt processing time

## Examples

### Debug Analysis Prompt

```json
{
  "id": "detailed-debug-analysis",
  "name": "Detailed Debug Analysis",
  "description": "Comprehensive error analysis with fix suggestions",
  "category": "debug_analysis",
  "version": "1.0.0",
  "schema_version": "1.0",
  
  "template": {
    "task": "Analyze the error and provide detailed debugging assistance",
    "instructions": "I'm encountering an error in my ${language} code. Here's the error message:\n\n${errorMessage}\n\nHere's the relevant code:\n\n${code}\n\nThe error occurs at line ${errorLine}, column ${errorColumn}.\n\nPlease:\n1. Explain what's causing this error\n2. Provide step-by-step debugging approach\n3. Suggest specific fixes\n4. Recommend preventive measures\n\nContext: ${surroundingCode}",
    "context": {
      "error_context": {
        "line": "${errorLine}",
        "column": "${errorColumn}",
        "message": "${errorMessage}"
      },
      "debugging_level": "${experienceLevel}"
    },
    "output_format": {
      "structure": "Structured analysis with numbered steps and code examples",
      "include_line_numbers": true,
      "include_fix_suggestion": true,
      "include_explanation": true
    },
    "variables": [
      "code", "language", "errorMessage", "errorLine", 
      "errorColumn", "surroundingCode", "experienceLevel"
    ]
  },
  
  "config": {
    "configurable_fields": ["debugging_depth", "include_prevention_tips"],
    "default_values": {
      "debugging_depth": "detailed",
      "include_prevention_tips": true
    },
    "validation_rules": {
      "debugging_depth": {
        "type": "string",
        "enum": ["basic", "detailed", "comprehensive"]
      }
    }
  },
  
  "metadata": {
    "supported_languages": ["javascript", "typescript", "python", "java", "csharp"],
    "required_context": ["code", "errorMessage"],
    "performance_notes": "Best for runtime and compilation errors"
  }
}
```

### Performance Analysis Prompt

```json
{
  "id": "performance-optimizer",
  "name": "Performance Optimizer",
  "description": "Analyzes code for performance bottlenecks and optimization opportunities",
  "category": "performance_analysis",
  "version": "1.0.0",
  "schema_version": "1.0",
  
  "template": {
    "task": "Analyze code for performance optimization opportunities",
    "instructions": "Analyze the following ${language} code for performance issues and optimization opportunities:\n\n${code}\n\nFocus on:\n- Algorithm complexity\n- Memory usage\n- I/O operations\n- Caching opportunities\n- Language-specific optimizations\n\nProvide specific recommendations with before/after examples where applicable.\n\nExperience level: ${experienceLevel}\nMax suggestions: ${maxSuggestions}",
    "context": {
      "analysis_type": "performance",
      "optimization_level": "${optimizationLevel}",
      "target_metrics": ["speed", "memory", "scalability"]
    },
    "output_format": {
      "structure": "Categorized list of optimizations with impact assessment",
      "include_line_numbers": true,
      "include_explanation": true,
      "include_fix_suggestion": true
    },
    "variables": [
      "code", "language", "experienceLevel", 
      "maxSuggestions", "optimizationLevel"
    ]
  },
  
  "config": {
    "configurable_fields": [
      "optimization_level", "focus_areas", "include_benchmarks"
    ],
    "default_values": {
      "optimization_level": "moderate",
      "focus_areas": ["speed", "memory"],
      "include_benchmarks": false
    },
    "validation_rules": {
      "optimization_level": {
        "type": "string",
        "enum": ["conservative", "moderate", "aggressive"]
      },
      "focus_areas": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["speed", "memory", "scalability", "readability"]
        }
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Prompt Not Loading

**Problem**: Custom prompt doesn't appear in the system

**Solutions**:
- Check file syntax with JSON validator
- Verify file is in configured custom directory
- Check VS Code output panel for error messages
- Ensure prompt ID is unique

#### 2. Variable Substitution Errors

**Problem**: Variables not being replaced correctly

**Solutions**:
- Verify variable names match exactly (case-sensitive)
- Check that variables are declared in the `variables` array
- Ensure variable values are available in context
- Use validation utilities to check template

#### 3. Validation Failures

**Problem**: Prompt fails validation

**Solutions**:
- Run validation utilities to get detailed error messages
- Check required fields are present
- Verify schema version compatibility
- Review field types and constraints

#### 4. Inheritance Issues

**Problem**: Template inheritance not working

**Solutions**:
- Verify parent template exists and is loaded
- Check for circular inheritance
- Ensure inheritance configuration is correct
- Clear composition cache if needed

### Debugging Tools

#### Enable Debug Logging

```json
{
  "DebugBuddy.prompts.debug": true,
  "DebugBuddy.prompts.logLevel": "verbose"
}
```

#### Validation Command

```typescript
// Validate specific prompt
const validator = new ValidationUtils();
const result = await validator.validateSingleFile('path/to/prompt.json');

// Check template analysis
const analysis = validator.analyzeTemplate(prompt.template);
console.log('Template complexity:', analysis.complexity);
console.log('Variable usage:', analysis.variableUsage);
```

#### Hot Reload Status

```typescript
const reloader = PromptHotReloader.getInstance();
const stats = reloader.getStats();
console.log('Hot reload stats:', stats);
```

### Getting Help

1. **Check the output panel** in VS Code for detailed error messages
2. **Use validation utilities** to identify specific issues
3. **Review example prompts** in the templates directory
4. **Enable debug logging** for detailed troubleshooting information
5. **Check the GitHub repository** for known issues and solutions

### Performance Tips

1. **Keep templates concise** - Avoid overly long instructions
2. **Limit variable complexity** - Use simple variable substitution
3. **Cache composed prompts** - Enable composition caching
4. **Monitor validation time** - Complex prompts may slow down loading
5. **Use appropriate categories** - Helps with prompt organization and selection

---

This documentation should help you create effective custom prompts for the DebugBuddy extension. For more advanced use cases or specific questions, refer to the source code examples in the `src/prompt/templates/` directory.