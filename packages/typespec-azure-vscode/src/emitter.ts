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

export const PreDefinedEmitters: ReadonlyArray<Emitter> = [
  {
    language: ".NET",
    package: "@azure-tools/typespec-csharp",
    kind: EmitterKind.Client,
  },
  {
    language: "Java",
    package: "@azure-tools/typespec-java",
    kind: EmitterKind.Client,
  },
  {
    language: "JavaScript",
    package: "@azure-tools/typespec-ts",
    kind: EmitterKind.Client,
  },
  {
    language: "Python",
    package: "@azure-tools/typespec-python",
    kind: EmitterKind.Client,
  },
  {
    language: ".NET",
    package: "@typespec/http-server-csharp",
    kind: EmitterKind.Server,
  },
  {
    language: "JavaScript",
    package: "@typespec/http-server-js",
    kind: EmitterKind.Server,
  },
  {
    language: "OpenAPI3",
    package: "@typespec/openapi3",
    kind: EmitterKind.Schema,
  },
];

const languageAlias: Record<string, string> = {
  dotnet: ".NET",
  csharp: ".NET",
  js: "JavaScript",
  typescript: "JavaScript",
};
export function getRegisterEmitter(language: string, kind: string): Emitter | undefined {
  const languageRaw = languageAlias[language.toLocaleLowerCase()] ?? language.toLocaleLowerCase();
  return PreDefinedEmitters.find(
    (emitter) => emitter.language.toLocaleLowerCase() === languageRaw && emitter.kind === kind,
  );
}
