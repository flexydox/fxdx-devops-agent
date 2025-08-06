import { BaseCommand } from '../base-command.js';
import * as core from '@actions/core';
import * as fs from 'fs/promises';

export interface VersionUpdateArgs {
  version?: string;
  versionFile?: string;
  versionAttribute?: string;
}

export class VersionUpdate extends BaseCommand<VersionUpdateArgs> {
  constructor() {
    super('version', 'update');
  }

  async execute(args: VersionUpdateArgs): Promise<void> {
    const versionFile = args.versionFile;
    if (!versionFile) {
      core.info('No file name provided, skipping version update.');
      return;
    }
    const version = args.version;
    if (!version) {
      core.info('No version provided, skipping update.');
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

    if (fileExt === 'json') {
      await this.updateJsonFileVersion(versionFile, versionAttribute, version);
    } else if (fileExt === 'yaml' || fileExt === 'yml') {
      await this.inPlaceUpdateYamlFileVersion(versionFile, versionAttribute, version);
    }
  }
  async updateJsonFileVersion(fileName: string, versionAttribute: string, version: string): Promise<void> {
    try {
      const fileContent = await fs.readFile(fileName, 'utf-8');
      const json = JSON.parse(fileContent);
      json[versionAttribute] = version;
      await fs.writeFile(fileName, JSON.stringify(json, null, 2));
      core.info(`Updated version in JSON file: ${fileName}, ${versionAttribute}: ${version}`);
    } catch (error) {
      core.error(`Failed to read or write JSON file: ${fileName}`);
      throw error;
    }
  }
  async inPlaceUpdateYamlFileVersion(fileName: string, versionAttribute: string, version: string): Promise<void> {
    // use regex to find and replace the version attribute in the YAML file
    try {
      const fileContent = await fs.readFile(fileName, 'utf-8');
      const regex = new RegExp(`^(\\s*${versionAttribute}\\s*:\\s*).+$`, 'gm');
      const updatedContent = fileContent.replace(regex, `$1${version}`);
      await fs.writeFile(fileName, updatedContent);
      core.info(`Updated version in YAML file: ${fileName}, ${versionAttribute}: ${version}`);
    } catch (error) {
      core.error(`Failed to read or write YAML file: ${fileName}`);
      throw error;
    }
  }
}
