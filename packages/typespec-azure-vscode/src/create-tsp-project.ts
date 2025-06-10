import * as vscode from "vscode";
export class CreateTypeSpecProject implements vscode.LanguageModelTool<void> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<void>,
    _token: vscode.CancellationToken,
  ) {
    vscode.window.showInformationMessage("CreateTypeSpecProject invoked!");
    const params = options.input;
    // return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Create Web service with emitter @typespec/http-client-csharp`)]);
    const toolResults: Array<vscode.LanguageModelTextPart | vscode.LanguageModelPromptTsxPart> = [];
    // const hasSpecification =
    //   (await vscode.workspace.findFiles("**/*.tsp", "**/node_modules/**")).length > 0;
    // if (!hasSpecification) {
    //   // let terminal = vscode.window.activeTerminal;
    //   // if (!terminal) {
    //   //     terminal = vscode.window.createTerminal('node');
    //   // }
    //   // terminal.show();
    //   // terminal.sendText('tsp init');
    //   // vscode.window.onDidEndTerminalShellExecution
    //   const result = await executeCommandInTerminal("tsp init");
    //   if (result.exitCode === 0) {
    //     vscode.window.showInformationMessage("typespec project created successfully.");
    //   } else {
    //     vscode.window.showErrorMessage("Created typespec project... Failed.");
    //   }
    //   toolResults.push(
    //     new vscode.LanguageModelTextPart(`Created a typespec project by 'tsp init'`),
    //   );
    // } else {
    //   toolResults.push(
    //     new vscode.LanguageModelTextPart("There exists a typespec project already."),
    //   );
    // }
    toolResults.push(new vscode.LanguageModelTextPart("Following are the steps to emit a code:"));
    toolResults.push(
      new vscode.LanguageModelTextPart("step 1: Run command `npm install -g @typespec/compiler`"),
    );
    toolResults.push(
      new vscode.LanguageModelTextPart(
        "step 2: Run command `tsp init https://aka.ms/typespec/azure-init`",
      ),
    );
    toolResults.push(new vscode.LanguageModelTextPart("stpe 3: completed. show result."));
    toolResults.push(
      new vscode.LanguageModelTextPart(
        "guide to execute above steps one by one. And just run the command mentioned in the step, DoNot change the command. When any error occur in each step, the whole emit code will fail.",
      ),
    );

    return new vscode.LanguageModelToolResult(toolResults);
    // return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`Run the command 'tsp init' in the terminal to initialize a new typespec project.`),
    // ]);
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
