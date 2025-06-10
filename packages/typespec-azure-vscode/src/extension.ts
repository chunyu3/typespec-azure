// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { registerEmitCodeTools } from "../emit-code.js";
import { registerCreateTypespecProjectTools } from "./create-tsp-project.js";

export async function activate(context: vscode.ExtensionContext) {
  /* register create tsp project tool. */
  registerCreateTypespecProjectTools(context);

  /* register emit code tools. */
  registerEmitCodeTools(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
