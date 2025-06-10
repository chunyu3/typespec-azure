import * as vscode from "vscode";

export interface commandExeOutput {
  exitCode: number;
  error?: string;
}
export async function executeCommandInTerminal(command: string): Promise<commandExeOutput> {
  const terminal = vscode.window.createTerminal({ name: "My Terminal" });
  terminal.show();
  terminal.sendText(command, false);

  return new Promise((resolve, reject) => {
    const dispose = vscode.window.onDidEndTerminalShellExecution((e) => {
      if (e.terminal === terminal) {
        if (e.exitCode === 0) {
          resolve({
            exitCode: e.exitCode,
          });
        } else {
          reject({
            exitCode: -1,
            error: `${e.execution.commandLine} failed with exit code ${e.exitCode}`,
          });
        }
      }
    });
  });
  // terminal.sendText('; exit');

  // return new Promise((resolve, reject) => {
  //     const disposeToken = vscode.window.onDidCloseTerminal((closedTerminal) => {
  //         if (closedTerminal === terminal) {
  //             disposeToken.dispose();
  //             if (terminal.exitStatus !== undefined) {
  //                 resolve(terminal.exitStatus);
  //             } else {
  //                 reject('Terminal exited with undefined status');
  //             }
  //         }
  //     });
  // });
}
