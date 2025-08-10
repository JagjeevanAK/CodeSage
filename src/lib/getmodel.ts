import { vscode } from "../helper/vscode";

export function getModel() {
    return vscode.workspace.getConfiguration('DebugBuddy').get('model');
}
