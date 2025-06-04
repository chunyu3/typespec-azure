import { readFile } from "fs/promises";
import path, { dirname } from "path";
import * as vscode from "vscode";
import { isFile, normalizeSlashes } from "./utils.js";
import { ClientFileName, MainFileName } from "./constant.js";

export async function getEntrypointTspFile(
  tspPath: string
): Promise<string | undefined> {
  const isFilePath = await isFile(tspPath);
  let baseDir = isFilePath ? dirname(tspPath) : tspPath;

  while (true) {
    const pkgPath = path.resolve(baseDir, "package.json");
    if (await isFile(pkgPath)) {
      /* get the tspMain from package.json. */
      try {
        const data = await readFile(pkgPath, { encoding: "utf-8" });
        const packageJson = JSON.parse(data);
        const tspMain = packageJson.tspMain;
        if (typeof tspMain === "string") {
          const tspMainFile = path.resolve(baseDir, tspMain);
          if (await isFile(tspMainFile)) {
            console.debug(
              `tspMain file ${tspMainFile} selected as entrypoint file.`
            );
            return tspMainFile;
          }
        }
      } catch (error) {
        console.error(
          `An error occurred while reading the package.json file ${pkgPath}`,
          [error]
        );
      }
    }

    const clientTspFile = path.resolve(baseDir, ClientFileName);
    if (await isFile(clientTspFile)) {
      return clientTspFile;
    }

    const mainTspFile = path.resolve(baseDir, MainFileName);
    if (await isFile(mainTspFile)) {
      return mainTspFile;
    }
    const parentDir = dirname(baseDir);
    if (parentDir === baseDir) {
      break;
    }
    baseDir = parentDir;
  }

  return undefined;
}

export async function TraverseMainTspFileInWorkspace() {
  const mainFiles = (
    await vscode.workspace.findFiles(`**/${MainFileName}`, "**/node_modules/**")
  )
    .filter(
      (uri) => uri.scheme === "file" && !uri.fsPath.includes("node_modules")
    )
    .map((uri) => normalizeSlashes(uri.fsPath));
  const clientFiles = (
    await vscode.workspace.findFiles(
      `**/${ClientFileName}`,
      "**/node_modules/**"
    )
  )
    .filter(
      (uri) => uri.scheme === "file" && !uri.fsPath.includes("node_modules")
    )
    .map((uri) => normalizeSlashes(uri.fsPath));
  const foldersContainsClientFiles = clientFiles.map((clientFile) =>
    path.dirname(clientFile)
  );
  const targetMainFiles = mainFiles.filter((mainFile) => {
    const mainFileDir = path.dirname(mainFile);
    return !foldersContainsClientFiles.some((clientFileDir) => {
      return mainFileDir === clientFileDir;
    });
  });
  return clientFiles.concat(targetMainFiles);
  // const mainFiles =  vscode.workspace
  // .findFiles(`**/${MainFileName}`, "**/node_modules/**")
  // .then((uris) =>
  //   uris
  //     .filter((uri) => uri.scheme === "file" && !uri.fsPath.includes("node_modules"))
  //     .map((uri) => normalizeSlashes(uri.fsPath)),
  // );

  // const clientFiles =  vscode.workspace
  // .findFiles(`**/${ClientFileName}`, "**/node_modules/**")
  // .then((uris) =>
  //   uris
  //     .filter((uri) => uri.scheme === "file" && !uri.fsPath.includes("node_modules"))
  //     .map((uri) => normalizeSlashes(uri.fsPath)),
  // );

  // const entrypointFiles = await Promise.all([mainFiles, clientFiles]);
}
