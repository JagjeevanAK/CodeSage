import { vscode } from "./vscode";

type TextEditor = typeof vscode.window.activeTextEditor;

/**
 * Maps file extensions to programming languages
 */
export const getLanguageFromExtension = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const languageMap: { [key: string]: string } = {
        // Web Technologies
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'scss': 'scss',
        'sass': 'sass',
        'less': 'less',
        'vue': 'vue',
        'svelte': 'svelte',

        // Python
        'py': 'python',
        'pyw': 'python',
        'pyi': 'python',

        // Java & JVM Languages
        'java': 'java',
        'kt': 'kotlin',
        'kts': 'kotlin',
        'scala': 'scala',
        'groovy': 'groovy',
        'clj': 'clojure',
        'cljs': 'clojure',

        // C Family
        'c': 'c',
        'h': 'c',
        'cpp': 'cpp',
        'cxx': 'cpp',
        'cc': 'cpp',
        'hpp': 'cpp',
        'hxx': 'cpp',
        'cs': 'csharp',

        // Systems Programming
        'rs': 'rust',
        'go': 'go',
        'swift': 'swift',

        // Functional Languages
        'hs': 'haskell',
        'lhs': 'haskell',
        'ml': 'ocaml',
        'mli': 'ocaml',
        'fs': 'fsharp',
        'fsi': 'fsharp',
        'fsx': 'fsharp',
        'elm': 'elm',

        // Scripting Languages
        'rb': 'ruby',
        'rbw': 'ruby',
        'php': 'php',
        'pl': 'perl',
        'pm': 'perl',
        'lua': 'lua',
        'sh': 'bash',
        'bash': 'bash',
        'zsh': 'zsh',
        'fish': 'fish',
        'ps1': 'powershell',
        'psm1': 'powershell',

        // Data & Config
        'sql': 'sql',
        'json': 'json',
        'yaml': 'yaml',
        'yml': 'yaml',
        'toml': 'toml',
        'xml': 'xml',
        'ini': 'ini',
        'cfg': 'config',
        'conf': 'config',

        // Mobile Development
        'dart': 'dart',
        'm': 'objective-c',
        'mm': 'objective-c',

        // Other Languages
        'r': 'r',
        'R': 'r',
        'jl': 'julia',
        'ex': 'elixir',
        'exs': 'elixir',
        'erl': 'erlang',
        'hrl': 'erlang',
        'nim': 'nim',
        'cr': 'crystal',
        'zig': 'zig',
        'v': 'vlang',
        'd': 'dlang',
        'pas': 'pascal',
        'pp': 'pascal',
        'ada': 'ada',
        'adb': 'ada',
        'ads': 'ada',
        'f90': 'fortran',
        'f95': 'fortran',
        'f03': 'fortran',
        'f08': 'fortran',
        'for': 'fortran',
        'cob': 'cobol',
        'cbl': 'cobol',

        // Assembly
        'asm': 'assembly',
        's': 'assembly',

        // Markup & Documentation
        'md': 'markdown',
        'markdown': 'markdown',
        'tex': 'latex',
        'rst': 'restructuredtext',
        'org': 'org',

        // DSLs and Specialized
        'dockerfile': 'dockerfile',
        'makefile': 'makefile',
        'cmake': 'cmake',
        'gradle': 'gradle',
        'sbt': 'sbt',
        'pom': 'maven'
    };

    return languageMap[extension || ''] || 'plaintext';
};

/**
 * Gets language from VS Code's language ID as fallback
 */
export const getLanguageFromVSCode = (editor: NonNullable<TextEditor>): string => {
    const vscodeLanguageId = editor.document.languageId;

    // Map some common VS Code language IDs to more descriptive names
    const vscodeLanguageMap: { [key: string]: string } = {
        'javascriptreact': 'javascript',
        'typescriptreact': 'typescript',
        'shellscript': 'bash',
        'powershell': 'powershell',
        'objective-c': 'objective-c',
        'objective-cpp': 'objective-c',
        'plaintext': 'plaintext'
    };

    return vscodeLanguageMap[vscodeLanguageId] || vscodeLanguageId;
};
