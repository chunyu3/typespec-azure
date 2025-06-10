import * as vscode from "vscode";
import { executeCommandInTerminal } from "./utils.js";
export interface IEmitCodeParameters {
  kind?: string;
  language?: string;
  entrypoint?: string;
  emtter?: string;
  currentStep?: string;
  status?: string;
}

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

    // const validate = false;
    if (!(await validateTspConfig("tspconfig.yaml"))) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `Invalid tspconfig.yaml, Missing package-dir option for @typespec/http-client-csharp. please modify tspconfig.yaml. `,
        ),
      ]);
    }
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
        new vscode.LanguageModelTextPart("Following are the steps to emit a code:"),
        new vscode.LanguageModelTextPart("step 1: verify the typespec project."),
        new vscode.LanguageModelTextPart(
          "step 2: execute command `npm install @typespec/http-client-csharp` to install necessary library",
        ),
        new vscode.LanguageModelTextPart(
          "step 3: run command `tsp compile ./ --emit @typespec/http-client-csharp`",
        ),
        new vscode.LanguageModelTextPart("stpe 4: completed. show result."),
        new vscode.LanguageModelTextPart(
          "guide to execute above steps one by one. And just run the command mentioned in the step, DoNot change the command. When any error occur in each step, the whole emit code will fail.",
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

    const result = await executeCommandInTerminal(
      "npm install @typespec/http-server-csharp; tsp compile ./main.tsp --emit @typespec/http-server-csharp",
    );
    if (result.exitCode === 0) {
      vscode.window.showInformationMessage("Generate server code... succeed.");
    } else {
      vscode.window.showErrorMessage("Generate server code... Failed.");
    }
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(
        `Generated web service server code with emitter @typespec/http-server-csharp`,
      ),
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
    if (isValid) {
      return new vscode.LanguageModelToolResult([
        // new vscode.LanguageModelTextPart("The tspProject is valid."),
        new vscode.LanguageModelTextPart(
          "edit tspconfig.yaml to add package-dir option for @typespec/http-client-csharp.",
        ),
      ]);
    } else {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          "Invalid tspconfig.yaml, Missing package-dir option for @typespec/http-client-csharp. please modify tspconfig.yaml.",
        ),
        new vscode.LanguageModelTextPart(
          "edit tspconfig.yaml to add package-dir option for @typespec/http-client-csharp.",
        ),
      ]);
    }
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
  return true;
}
export function registerEmitCodeTools(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.lm.registerTool("emit-code-from-typespec", new EmitCode()));
  context.subscriptions.push(
    vscode.lm.registerTool("verify-tsp-project", new validateTspProject()),
  );
}
