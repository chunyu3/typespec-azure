import { stat } from "fs/promises";

export async function isFile(path: string) {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}

export async function isDirectory(path: string) {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

const backslashRegExp = /\\/g;
export const directorySeparator = "/";
/**
 * Normalize path separators, converting `\` into `/`.
 */
export function normalizeSlashes(path: string): string {
  const index = path.indexOf("\\");
  if (index === -1) {
    return path;
  }
  backslashRegExp.lastIndex = index; // prime regex with known position
  return path.replace(backslashRegExp, directorySeparator);
}