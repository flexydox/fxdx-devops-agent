import { parseVersion } from '../../libs/version/parse-version.js';
import { BaseCommand } from '../base-command.js';
import * as core from '@actions/core';

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
    const parsedVersion = parseVersion(rawVersion);
    if (!parsedVersion) {
      core.setFailed(`Invalid version format: ${rawVersion}`);
      return;
    }
    const preString = parsedVersion.pre ? parsedVersion.pre.join('.') : '';
    core.info(`Parsed version: ${JSON.stringify(parsedVersion)}`);
    core.setOutput('major', parsedVersion.major?.toString());
    core.setOutput('minor', parsedVersion.minor?.toString());
    core.setOutput('patch', parsedVersion.patch?.toString());
    core.setOutput('build', parsedVersion.build || '');
    core.setOutput('pre', preString);
    core.setOutput('majorMinor', `${parsedVersion.major}.${parsedVersion.minor}`);
    core.setOutput('majorMinorPatch', `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`);
    core.setOutput(
      'majorMinorPatchPre',
      `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}${preString ? `-${preString}` : ''}`
    );
  }
}
