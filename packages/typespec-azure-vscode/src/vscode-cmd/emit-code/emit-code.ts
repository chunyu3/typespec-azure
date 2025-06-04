import * as vscode from "vscode";
import { logger, typespecExtensionApis } from "../../extension-context.js";
import { ResultCode } from "../../type.js";
import { getEntrypointTspFile, TraverseMainTspFileInWorkspace } from "../../typespec-utils.js";
import { PreDefinedEmitters } from "./emitter.js";

export async function emitCode(uri: vscode.Uri, tel: any): Promise<ResultCode> {
  // vscode.commands.executeCommand(
  //   "typespec.emitCode",
  //   uri,
  //   PreDefinedEmitters,
  //   getEntrypointTspFiles,
  // );
  const result = await typespecExtensionApis.emitCodeFunc(
    PreDefinedEmitters,
    typespecExtensionApis.context,
    uri,
    tel,
    getEntrypointTspFiles,
  );
  /* other operaion. */
  logger.info(`crystal->Emit code ${result}.`);
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
