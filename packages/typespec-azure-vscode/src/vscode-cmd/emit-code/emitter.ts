export enum EmitterKind {
    Schema = "openapi",
    Client = "client",
    Server = "server",
    Unknown = "unknown",
  }
  
  export interface Emitter {
    language: string;
    package: string;
    version?: string;
    sourceRepo?: string;
    requisites?: string[];
    kind: EmitterKind;
  }

// TODO: remove this when we can load default emitters from the compiler
export const PreDefinedEmitters: ReadonlyArray<Emitter> = [
    {
      language: ".NET",
      package: "@azure-tools/typespec-csharp",
      sourceRepo: "https://github.com/Azure/autorest.csharp",
      requisites: [".NET 8.0 SDK"],
      kind: EmitterKind.Client,
    },
    {
      language: "Java",
      package: "@azure-tools/typespec-java",
      sourceRepo: "https://github.com/Azure/autorest.java/tree/main/typespec-extension",
      requisites: ["Java 17 or above", "Maven"],
      kind: EmitterKind.Client,
    },
    {
      language: "JavaScript",
      package: "@azure-tools/typespec-ts",
      sourceRepo: "https://github.com/Azure/autorest.typescript/tree/main/packages/typespec-ts",
      kind: EmitterKind.Client,
    },
    {
      language: "Python",
      package: "@azure-tools/typespec-python",
      sourceRepo: "https://github.com/Azure/autorest.python/tree/main/packages/typespec-python",
      kind: EmitterKind.Client,
    },
    {
      language: ".NET",
      package: "@typespec/http-server-csharp",
      sourceRepo: "https://github.com/microsoft/typespec/tree/main/packages/http-server-csharp",
      kind: EmitterKind.Server,
    },
    {
      language: "JavaScript",
      package: "@typespec/http-server-js",
      sourceRepo: "https://github.com/microsoft/typespec/tree/main/packages/http-server-js",
      kind: EmitterKind.Server,
    },
    {
      language: "OpenAPI3",
      package: "@typespec/openapi3",
      sourceRepo: "https://github.com/microsoft/typespec/tree/main/packages/openapi3",
      kind: EmitterKind.Schema,
    },
  ];