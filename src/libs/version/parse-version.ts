import { parseSemVer } from 'semver-parser';

export interface ParsedVersion {
  major?: number;
  minor?: number;
  patch?: number;
  build?: string;
  pre?: (string | number)[];
}

export function parseVersion(version: string): ParsedVersion | null {
  if (!version) {
    return null;
  }

  const parsed = parseSemVer(version, false);
  if (!parsed) {
    return null;
  }

  return {
    major: parsed.major,
    minor: parsed.minor,
    patch: parsed.patch,
    build: parsed.build ? parsed.build.join('.') : undefined,
    pre: parsed.pre
  };
}
