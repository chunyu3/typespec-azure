// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { configExtensionContext, telemetryClient } from "./extension-context.js";
import { CommandName, ResultCode } from "./type.js";
import { emitCode } from "./vscode-cmd/emit-code/emit-code.js";

export async function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("Hello World from Typespec Azure VS Code!");
  const typespecExtension = vscode.extensions.getExtension("typespec.typespec-vscode");
  if (typespecExtension) {
    vscode.window.showInformationMessage("Typespec extension is installed.");

    await typespecExtension.activate();
    // setTypespecExtensionApis(typespecExtension.exports);
    configExtensionContext(typespecExtension.exports);
    // await client.emitCodeFunc(undefined, PreDefinedEmitters);
  } else {
    vscode.window.showErrorMessage(
      "Typespec extension is not installed. Please install it to use this extension.",
    );
  }

  await telemetryClient.doOperationWithTelemetry("start-extension", async (tel) => {});
  /* emit command. */
  /* reuse the emit command from typespec extension*/
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandName.EmitCode, async (uri: vscode.Uri) => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Window,
          title: "Emit from TypeSpec Azure...",
          cancellable: false,
        },
        async () => {
          // await emitCode(uri);
          await telemetryClient.doOperationWithTelemetry(
            "emit-code",
            async (tel: any): Promise<ResultCode> => {
              return await emitCode(uri, tel);
            },
          );
        },
      );
    }),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
