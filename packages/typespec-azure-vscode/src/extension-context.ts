export let typespecExtensionApis: any | undefined = undefined;

export function setTypespecExtensionApis(exports: any) {
  typespecExtensionApis = exports;
}

export let logger: any;
export function setLogger(log: any) {
  logger = log;
}

export let telemetryClient: any;

export function configExtensionContext(exports: any) {
  typespecExtensionApis = exports;
  logger = exports.logger;
  telemetryClient = exports.telemetryClient;
}
