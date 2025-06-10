import * as vscode from "vscode";
export interface IEmitCodeParameters {
  kind?: string;
  language?: string;
  entrypoint?: string;
  emtter?: string;
  currentStep?: string;
  status?: string;
  outputdir?: string;
}

let returnValid = false;
export interface IEmitCodeOutputSchema {
  status: "in-progress" | "cancelled" | "success" | "failed";
  message: string;
  nextStep: string;
}
export class EmitCode implements vscode.LanguageModelTool<IEmitCodeParameters> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IEmitCodeParameters>,
    _token: vscode.CancellationToken,
  ) {
    vscode.window.showInformationMessage("GenerateCode invoked!");
    const params = options.input;
    // const result = await executeCommandInTerminal(
    //   "npm install @typespec/http-server-csharp; tsp compile ./main.tsp --emit @typespec/http-server-csharp",
    // );
    // if (result.exitCode === 0) {
    //   vscode.window.showInformationMessage("Generate server code... succeed.");
    // } else {
    //   vscode.window.showErrorMessage("Generate server code... Failed.");
    // }
    // return new vscode.LanguageModelToolResult([
    //   new vscode.LanguageModelTextPart(
    //     `Generated web service server code with emitter @typespec/http-server-csharp`,
    //   ),
    // ]);
    if (!params.kind) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `please select code type, server code, client code or openapi`,
        ),
      ]);
    }
    if (!params.language) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `please select target language, .net, python, javascript, go, openapi`,
        ),
      ]);
    }

    if (!params.entrypoint) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(`please select the entry point file:`),
        new vscode.LanguageModelTextPart("main.tsp"),
        new vscode.LanguageModelTextPart("client.tsp"),
      ]);
    }

    if (!params.outputdir) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `please give the output directory, it should be the root directory of one azure sdk repo e.g. d:/azure-sdk-for-net`,
        ),
      ]);
    }

    // const validate = false;
    // if (!(await validateTspConfig("tspconfig.yaml"))) {
    //   return new vscode.LanguageModelToolResult([
    //     new vscode.LanguageModelTextPart(
    //       `Invalid tspconfig.yaml, Missing package-dir option for @typespec/http-client-csharp. please modify tspconfig.yaml. `,
    //     ),
    //   ]);
    // }
    // return new vscode.LanguageModelToolResult([
    //   new vscode.LanguageModelPromptTsxPart({
    //     status: "in-progress",
    //     message: "tspconfig.yaml is valid.",
    //     nextStep: "install necessary liabrary.",
    //   }),
    // ]);
    if (!params.status) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          "Use emitter @typespec/http-client-csharp to emit .NET client code.",
        ),
        new vscode.LanguageModelTextPart(
          "Use emitter @typespec/http-client-csharp to emit .NET client code.",
        ),
        // new vscode.LanguageModelTextPart(
        //   "please display following steps in the chat as information and execute following steps one by one. \
        //   step 1: execute command `npm install @typespec/http-client-csharp` to install necessary library. \
        //   step 2: run command `tsp compile ./ --emit @typespec/http-client-csharp` \
        //   stpe 3: completed. show result. \
        //   ",
        // ),
        new vscode.LanguageModelTextPart(
          "Please execute the following steps sequentially to emit code using TypeSpec. \
          Important: Do not modify any command. If any step fails, the entire process should be considered failed.",
        ),
        new vscode.LanguageModelTextPart(
          "step 1: ask user to select azure sdk repo root directory.",
        ),
        new vscode.LanguageModelTextPart("step 2: verify the typespec project."),
        new vscode.LanguageModelTextPart(
          "step 3: install the requied libary. Run  `npm install @azure-tools/typespec-csharp`",
        ),
        new vscode.LanguageModelTextPart(
          "step 4: emit the code. Run `tsp compile ./ --emit @azure-tools/typespec-csharp` --option @azure-tools/typespec-csharp.emitter-output-dir=d:/project/azure-sdk-for-net/sdk/demoproject/Azure.Contoso",
        ),
        new vscode.LanguageModelTextPart(
          "stpe 5: Report the result. If all steps succeed, display a message indicating success and show the output.",
        ),
        new vscode.LanguageModelTextPart(
          "Emit code succeed. You can compile the generated code and  onboard it.",
        ),
      ]);
    }
    if (params.status && params.status !== "in-progress") {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart("emit code completed."),
      ]);
    }

    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart("status: in-progress"),
      new vscode.LanguageModelTextPart("next step: install necessary library."),
    ]);
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IEmitCodeParameters>,
    _token: vscode.CancellationToken,
  ) {
    const confirmationMessages = {
      title: "Generate code from typespec",
      message: new vscode.MarkdownString(`Generate code from typespec?`),
    };

    return {
      invocationMessage: "Generate code from typespec",
      confirmationMessages,
    };
  }
}

export interface IValidateTypeSpecProject {
  tspProject: string;
}
export class validateTspProject implements vscode.LanguageModelTool<IValidateTypeSpecProject> {
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<IValidateTypeSpecProject>,
    _token: vscode.CancellationToken,
  ) {
    vscode.window.showInformationMessage("verifyTspProject invoked!");
    const params = options.input;
    const isValid = await validateTspConfig(params.tspProject);
    if (!isValid) {
      const Edit_File_Tool = "copilot_insertEdit";
      const invokeOptions: vscode.LanguageModelToolInvocationOptions<any> = {
        input: {
          explantation: "add package_dir",
          filePath: "D:/dev/demo/demoProject/tspconfig.yaml",
          code: "package_dir: azure.demoproject",
        },
        toolInvocationToken: options.toolInvocationToken,
      };
      await vscode.lm.invokeTool(Edit_File_Tool, invokeOptions, _token);
    }
    // if (isValid) {
    //   return new vscode.LanguageModelToolResult([
    //     new vscode.LanguageModelTextPart("The tspProject is valid."),
    //     // new vscode.LanguageModelTextPart(
    //     //   "Please edit the tspconfig.yaml file to include the package-dir option for the @typespec/http-client-csharp emitter.",
    //     // ),
    //   ]);
    // } else {
    //   return new vscode.LanguageModelToolResult([
    //     new vscode.LanguageModelTextPart(
    //       "Invalid tspconfig.yaml, Missing package-dir option for @typespec/http-client-csharp. please modify tspconfig.yaml.",
    //     ),
    //     new vscode.LanguageModelTextPart(
    //       "Please edit the tspconfig.yaml file to include the package-dir option for the @typespec/http-client-csharp emitter.",
    //     ),
    //     new vscode.LanguageModelTextPart("verify the typespec project again. "),
    //   ]);
    // }
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart("The tspProject is valid."),
      // new vscode.LanguageModelTextPart(
      //   "Please edit the tspconfig.yaml file to include the package-dir option for the @typespec/http-client-csharp emitter.",
      // ),
    ]);
  }

  async prepareInvocation(
    options: vscode.LanguageModelToolInvocationPrepareOptions<IValidateTypeSpecProject>,
    _token: vscode.CancellationToken,
  ) {
    const confirmationMessages = {
      title: "Verify the tsp project.",
      message: new vscode.MarkdownString(
        `Validate the tsp project file: invalid the tspconfig.yaml?`,
      ),
    };

    return {
      invocationMessage: "Verify the tsp project",
      confirmationMessages,
    };
  }
}
async function validateTspConfig(tspProjectPath: string): Promise<boolean> {
  return false;
}
export function registerEmitCodeTools(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.lm.registerTool("emit-code-from-typespec", new EmitCode()));
  context.subscriptions.push(
    vscode.lm.registerTool("verify-tsp-project", new validateTspProject()),
  );
}
