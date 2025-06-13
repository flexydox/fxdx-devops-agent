import { BaseCommand } from '../base-command.js';
import * as core from '@actions/core';
import { parseSemVer } from 'semver-parser';

export interface VersionParseArgs {
  version?: string;
}

export class VersionParse extends BaseCommand<VersionParseArgs> {
  constructor() {
    super('version', 'parse');
  }

  async execute(args: VersionParseArgs): Promise<void> {
    const rawVersion = args.version;
    if (!rawVersion) {
      core.info('No version provided, skipping parsing.');
      return;
    }
    core.debug(`Raw version: ${rawVersion}`);
    const parsedVersion = parseSemVer(rawVersion, false);
    if (!parsedVersion) {
      core.setFailed(`Invalid version format: ${rawVersion}`);
      return;
    }
    core.info(`Parsed version: ${JSON.stringify(parsedVersion)}`);
    core.setOutput('major', parsedVersion.major?.toString());
    core.setOutput('minor', parsedVersion.minor?.toString());
    core.setOutput('patch', parsedVersion.patch?.toString());
    core.setOutput('pre', parsedVersion.pre ? parsedVersion.pre.join('.') : '');
  }
}
