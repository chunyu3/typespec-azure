// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { registerCreateTypespecProjectTools } from "./create-tsp-project.js";
import { registerEmitCodeTools } from "./emit-code.js";

export async function activate(context: vscode.ExtensionContext) {
  /* register create tsp project tool. */
  registerCreateTypespecProjectTools(context);

  /* register emit code tools. */
  registerEmitCodeTools(context);

  /* register mcp. */
  /* NOTE: mcpServerDefinitionProvider api is proposed-api, so use code-insiders */
  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider("azure-sdk-python-mcp", {
      // onDidChangeMcpServerDefinitions: didChangeEmitter.event,
      provideMcpServerDefinitions: async () => {
        const output: vscode.McpServerDefinition[] = [];
        const mcpServerDefinition = new vscode.McpStdioServerDefinition(
          "azure sdk python mcp server",
          "uv",
          [
            "--directory",
            "C:/project/azure-sdk-for-python/tools/mcp/azure-sdk-python-mcp/", //TODO: update to the realpath when python mcp is published
            "run",
            "main.py",
          ],
        );
        mcpServerDefinition.cwd = vscode.Uri.file("C:/project/azure-sdk-for-python");
        output.push(mcpServerDefinition);
        return output;
      },
    }),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
