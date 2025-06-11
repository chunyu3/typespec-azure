import * as vscode from "vscode";
import { checkInstalledExecutable } from "./utils.js";
export class CreateTypeSpecProject implements vscode.LanguageModelTool<void> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<void>,
    _token: vscode.CancellationToken,
  ) {
    vscode.window.showInformationMessage("CreateTypeSpecProject invoked!");
    const params = options.input;
    const toolResults: Array<vscode.LanguageModelTextPart | vscode.LanguageModelPromptTsxPart> = [];
    toolResults.push(
      new vscode.LanguageModelTextPart(
        "Please execute the following steps sequentially to create a typespec project. \
              Important: Do not modify any command. If any step fails, the entire process should be considered failed.",
      ),
    );
    let step: number = 1;
    /* verify tsp cli */
    const executable = process.platform === "win32" ? "tsp.cmd" : "tsp";
    const executableExists = await checkInstalledExecutable(executable);
    if (!executableExists) {
      toolResults.push(
        new vscode.LanguageModelTextPart(
          `step ${step}: Run command "npm install -g @typespec/compiler"`,
        ),
      );
      step++;
    }
    toolResults.push(
      new vscode.LanguageModelTextPart(
        `step ${step}: Run command "tsp init https://aka.ms/typespec/azure-init"`,
      ),
    );
    step++;
    toolResults.push(
      new vscode.LanguageModelTextPart(
        `step ${step}: Report the result. If all steps succeed, display a message indicating success and show the output.`,
      ),
    );

    return new vscode.LanguageModelToolResult(toolResults);
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<void>,
    _token: vscode.CancellationToken,
  ) {
    const confirmationMessages = {
      title: "Create a TypeSpec project",
      message: new vscode.MarkdownString("Run command: tsp init"),
    };

    return {
      invocationMessage: "Create a TypeSpec project",
      confirmationMessages,
    };
  }
}

export function registerCreateTypespecProjectTools(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.lm.registerTool("create-typespec-project", new CreateTypeSpecProject()),
  );
}
