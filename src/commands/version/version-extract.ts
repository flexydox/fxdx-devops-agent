import { BaseCommand } from '../base-command.js';
import * as core from '@actions/core';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';
import { parseVersion } from '../../libs/version/parse-version.js';

export interface VersionExtractArgs {
  versionFile?: string;
  versionAttribute?: string;
}

export class VersionExtract extends BaseCommand<VersionExtractArgs> {
  constructor() {
    super('version', 'extract');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractNestedValue(obj: any, versionAttribute: string): string | null {
    const keys = versionAttribute.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    return typeof value === 'string' ? value : null;
  }

  async getJsonFileVersion(fileName: string, versionAttribute: string): Promise<string | null> {
    try {
      const fileContent = await fs.readFile(fileName, 'utf-8');
      const json = JSON.parse(fileContent);
      const value = this.extractNestedValue(json, versionAttribute);
      return value ? value : null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      core.error(`Failed to read or parse JSON file: ${fileName}`);
      return null;
    }
  }

  async getYamlFileVersion(fileName: string, versionAttribute: string): Promise<string | null> {
    try {
      const fileContent = await fs.readFile(fileName, 'utf-8');
      const content = yaml.load(fileContent);
      const value = this.extractNestedValue(content, versionAttribute);
      return value ? value : null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      core.error(`Failed to read or parse YAML file: ${fileName}`);
      return null;
    }
  }

  async execute(args: VersionExtractArgs): Promise<void> {
    const versionFile = args.versionFile;
    if (!versionFile) {
      core.info('No file name provided, skipping extraction.');
      return;
    }
    const versionAttribute = args.versionAttribute || 'version';
    core.debug(`Extracting version from file: ${versionFile} from attribute: ${versionAttribute}`);

    const fileExt = versionFile.split('.').pop()?.toLowerCase();
    if (!fileExt) {
      core.setFailed(
        `Invalid file name: ${versionFile}, missing extension. Currently supported extensions are: .json, .yaml, .yml`
      );
      return;
    }

    const supportedExtensions = ['json', 'yaml', 'yml'];
    if (!supportedExtensions.includes(fileExt)) {
      core.setFailed(
        `Unsupported file extension: .${fileExt}. Currently supported extensions are: ${supportedExtensions.map((ext) => `.${ext}`).join(', ')}`
      );
      return;
    }
    let rawVersion: string | null = null;
    if (fileExt === 'json') {
      rawVersion = await this.getJsonFileVersion(versionFile, versionAttribute);
    } else if (fileExt === 'yaml' || fileExt === 'yml') {
      rawVersion = await this.getYamlFileVersion(versionFile, versionAttribute);
    }
    if (!rawVersion) {
      core.setFailed(`Version attribute "${versionAttribute}" not found in file: ${versionFile}`);
      return;
    }
    core.debug(`Extracted raw version: ${rawVersion}`);
    core.setOutput('rawVersion', rawVersion);
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
