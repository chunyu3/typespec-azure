import { readFile } from "fs/promises";
import path, { dirname } from "path";
import * as vscode from "vscode";
import { parseDocument } from "yaml";
import { TspConfigFileName } from "./constant.js";
import { getRegisterEmitter } from "./emitter.js";
import { getEntrypointTspFile, TraverseMainTspFileInWorkspace } from "./utils.js";

export interface IEmitCodeParameters {
  kind: string;
  language: string;
  entrypoint?: string;
  sdkRepoRoot: string;
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

    if (!params.kind) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(`please select code type, server, client or openapi`),
      ]);
    }
    if (!params.language) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `please select target language, .net, python, javascript, go, openapi`,
        ),
      ]);
    }

    /* get entrypoint tsp file. */
    const targetTspFiles = await getEntrypointTspFiles(params.entrypoint);
    if (targetTspFiles && targetTspFiles.length === 1) {
      params.entrypoint = targetTspFiles[0];
    } else {
      const results: Array<vscode.LanguageModelTextPart | vscode.LanguageModelPromptTsxPart> = [];
      results.push(new vscode.LanguageModelTextPart(`please select the entry point file.`));
      if (targetTspFiles && targetTspFiles.length > 1) {
        for (const tsp of targetTspFiles) {
          results.push(new vscode.LanguageModelTextPart(tsp));
        }
      }
      return new vscode.LanguageModelToolResult(results);
    }

    if (!params.sdkRepoRoot) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `please provide the root directory of one azure sdk repo e.g. d:/azure-sdk-for-net`,
        ),
      ]);
    }

    /* return emit code plan. */
    const emitterPackage = getRegisterEmitter(params.language, params.kind)?.package;
    if (!emitterPackage) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(
          `Cannot find available code generator to generate the code`,
        ),
      ]);
    }
    const tspConfigFile = path.join(dirname(params.entrypoint), TspConfigFileName);
    const emitterOutputDir = await resolveEmitterOutputDir(
      tspConfigFile,
      emitterPackage!,
      params.sdkRepoRoot,
    );
    const command = `tsp compile ./ --emit ${emitterPackage} --option ${emitterPackage}.emitter-output-dir=${emitterOutputDir}`;
    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart(
        "Use emitter @typespec/http-client-csharp to emit .NET client code.",
      ),
      new vscode.LanguageModelTextPart(
        "Please execute the following steps sequentially to emit code using TypeSpec. \
          Important: Do not modify any command. If any step fails, the entire process should be considered failed.",
      ),
      new vscode.LanguageModelTextPart("step 1: ask user to select azure sdk repo root directory."),
      new vscode.LanguageModelTextPart("step 2: verify the typespec project."),
      new vscode.LanguageModelTextPart(
        `step 3: install the required library. Run  "${emitterPackage}"`,
      ),
      new vscode.LanguageModelTextPart(`step 4: emit the code. Run "${command}"`),
      new vscode.LanguageModelTextPart(
        "step 5: Report the result. If all steps succeed, display a message indicating success and show the output.",
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

export function tryParseYaml(str: string): any | undefined {
  try {
    return parseDocument(str);
  } catch {
    return undefined;
  }
}
async function resolveEmitterOutputDir(
  configFile: string,
  emitter: string,
  outputDir?: string,
): Promise<string> {
  let data;
  try {
    data = await readFile(configFile, "utf8");
  } catch (err) {
    throw new Error(`Could not read tspconfig.yaml at ${configFile}. Error: ${err}`);
  }
  if (!data) {
    throw new Error(`tspconfig.yaml is empty at ${configFile}`);
  }
  const configYaml = tryParseYaml(data);
  if (!configYaml) {
    throw new Error(`tspconfig.yaml is not valid at ${configFile}`);
  }

  const serviceDir =
    configYaml.getIn(["options", emitter, "service-dir"]) ??
    configYaml.getIn(["parameters", "service-dir", "default"]);

  if (!serviceDir) {
    throw new Error(
      `Parameter service-dir is not defined correctly in tspconfig.yaml. Please refer to https://github.com/Azure/azure-rest-api-specs/blob/main/specification/contosowidgetmanager/Contoso.WidgetManager/tspconfig.yaml for the right schema.`,
    );
  }

  const packageDir: string | undefined = configYaml.getIn(["options", emitter, "package-dir"]);
  if (!packageDir) {
    throw new Error(
      `Missing package-dir in ${emitter} options of tspconfig.yaml. Please refer to https://github.com/Azure/azure-rest-api-specs/blob/main/specification/contosowidgetmanager/Contoso.WidgetManager/tspconfig.yaml for the right schema.`,
    );
  }
  const newPackageDir = path.join(outputDir ?? "{output-dir}", serviceDir, packageDir);
  return newPackageDir;
}

async function getEntrypointTspFiles(tspFilePath?: string): Promise<string[] | undefined> {
  if (!tspFilePath) {
    return await TraverseMainTspFileInWorkspace();
  } else {
    const isAbsolutePath = path.isAbsolute(tspFilePath);
    if (isAbsolutePath) {
      const entrypointFile = await getEntrypointTspFile(tspFilePath);
      if (entrypointFile) {
        return [entrypointFile];
      } else {
        return undefined;
      }
    } else {
      // invalid path, traverse in the workspace.
      return getEntrypointTspFiles();
    }
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
    const { isValid, errors } = await validateTspConfig(params.tspProject);
    const Edit_File_Tool = "copilot_insertEdit";
    const isEditToolInstalled =
      vscode.lm.tools.filter((tool) => tool.name === Edit_File_Tool).length > 0;
    if (!isValid && isEditToolInstalled) {
      /*TODO: convert errors to code changes and add it into explanation. */
      const invokeOptions: vscode.LanguageModelToolInvocationOptions<any> = {
        input: {
          explanation: "add package_dir option under @azure-tools/typespec-csharp",
          filePath: "D:/dev/demo/demoProject/tspconfig.yaml",
          code: "package_dir: azure.demoproject",
        },
        toolInvocationToken: options.toolInvocationToken,
      };

      const timeout = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Tool invocation timed out")), 60000), //timeout after 1 minute
      );

      try {
        await Promise.race([vscode.lm.invokeTool(Edit_File_Tool, invokeOptions, _token), timeout]);
      } catch (err) {
        return new vscode.LanguageModelToolResult([
          new vscode.LanguageModelTextPart(`Tool invocation failed or timed out:${err}`),
        ]);
      }
    }

    return new vscode.LanguageModelToolResult([
      new vscode.LanguageModelTextPart("The tspProject is valid."),
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
async function validateTspConfig(
  tspProjectPath: string,
): Promise<{ isValid: boolean; errors?: string[] }> {
  /*TODO: call tsv to validate the tspconfig. */
  return {
    isValid: false,
    errors: [""],
  };
}
export function registerEmitCodeTools(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.lm.registerTool("emit-code-from-typespec", new EmitCode()));
  context.subscriptions.push(
    vscode.lm.registerTool("verify-tsp-project", new validateTspProject()),
  );
}
