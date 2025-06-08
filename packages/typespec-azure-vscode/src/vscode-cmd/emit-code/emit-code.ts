import { readFile } from "fs/promises";
import path from "path";
import * as vscode from "vscode";
import { logger, typespecExtensionApis } from "../../extension-context.js";
import { ResultCode } from "../../type.js";
import { getEntrypointTspFile, TraverseMainTspFileInWorkspace } from "../../typespec-utils.js";
import { tryParseYaml } from "../../utils.js";
import { isAzureSDKEmitter, PreDefinedEmitters } from "./emitter.js";

export async function emitCode(uri: vscode.Uri, tel: any): Promise<ResultCode> {
  // vscode.commands.executeCommand(
  //   "typespec.emitCode",
  //   uri,
  //   PreDefinedEmitters,
  //   getEntrypointTspFiles,
  // );
  // const result = await typespecExtensionApis.emitCodeFunc(
  //   PreDefinedEmitters,
  //   typespecExtensionApis.context,
  //   uri,
  //   tel,
  //   getEntrypointTspFiles,
  //   resolveEmitterOutputDir,
  // );

  const tspProjectFile = await typespecExtensionApis.chooseTspProjectFile(
    typespecExtensionApis.context,
    uri,
    tel,
    getEntrypointTspFiles,
  );
  if (!tspProjectFile) {
    logger.info("No project selected. Emitting Cancelled.", [], {
      showOutput: true,
      showPopup: true,
    });
    tel.lastStep = "Select project for entrypoint";
    return ResultCode.Cancelled;
  }

  const selectedEmitters = await typespecExtensionApis.selectEmitter(
    tspProjectFile,
    PreDefinedEmitters,
    typespecExtensionApis.context,
    uri,
    tel,
  );
  if (!selectedEmitters || selectedEmitters.length === 0) {
    logger.info("No emitter selected. Emitting Cancelled.", [], {
      showOutput: true,
      showPopup: true,
    });
    tel.lastStep = "Select emitters";
    return ResultCode.Cancelled;
  }
  /* validate tspconfig.yaml. */
  /* set the root output dir. */
  const result = typespecExtensionApis.emitCode(
    tspProjectFile,
    selectedEmitters,
    tel,
    resolveEmitterOutputDir,
  );
  /* other operaion. */
  return result;
}

async function getEntrypointTspFiles(uri: vscode.Uri): Promise<string[] | undefined> {
  if (!uri) {
    return await TraverseMainTspFileInWorkspace();
  } else {
    const tspFile = await getEntrypointTspFile(uri.fsPath);
    if (tspFile) {
      return [tspFile];
    } else {
      return undefined;
    }
  }
}

async function resolveEmitterOutputDir(
  configFile: string,
  emitter: string,
  outputDir?: string,
): Promise<string> {
  if (!isAzureSDKEmitter(emitter)) {
    return "";
  }
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
