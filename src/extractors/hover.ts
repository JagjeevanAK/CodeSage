import { getModelResponse } from "../helper/modelResponse";
import { vscode } from "../helper/vscode";

export const OnErrorHover = vscode.languages.registerHoverProvider('*', {
    async provideHover(document, position) {
        const diagnostics = vscode.languages.getDiagnostics(document.uri);

        const diagnostic = diagnostics.find(d => d.range.contains(position));

        if (diagnostic) {
            const aiRes = await getModelResponse({ diagnostic, uri: document.uri });

            if (aiRes) {
                const markdown = new vscode.MarkdownString();

                markdown.appendMarkdown(`**Explanation:**\n\n ${aiRes}`);
                markdown.appendMarkdown(`\n\n----\n\n**Original Error:** ${diagnostic.message}`);

                return new vscode.Hover(markdown);
            }
        }
        return null;
    }

});