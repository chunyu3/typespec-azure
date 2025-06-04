export const enum CommandName {
  ShowOutputChannel = "typespec.azure.showOutputChannel",
  RestartServer = "typespec.azure.restartServer",
  InstallGlobalCompilerCli = "typespec.azure.installGlobalCompilerCli",
  CreateProject = "typespec.azure.createProject",
  OpenUrl = "typespec.azure.openUrl",
  EmitCode = "typespec.azure.emitCode",
  ImportFromOpenApi3 = "typespec.azure.importFromOpenApi3",
  ShowOpenApi = "typespec.azure.showOpenApi",
}

export enum ResultCode {
  Success = "success",
  Fail = "fail",
  Cancelled = "cancelled",
  Timeout = "timeout",
}
