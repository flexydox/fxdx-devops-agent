import { getTimeOfDayCode } from '../../libs/date-utils.js';
import { BaseCommand } from '../base-command.js';
import * as core from '@actions/core';

export interface VersionCreateDateVersionArgs {
  version?: string;
}

export class VersionCreateDateVersion extends BaseCommand<VersionCreateDateVersionArgs> {
  constructor() {
    super('version', 'create-date-version');
  }

  async execute(): Promise<void> {
    const dt = new Date();
    const timeOfDayCode = getTimeOfDayCode(dt);
    const year = dt.getFullYear().toString().slice(-2);
    const month = (dt.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = dt.getDate().toString().padStart(2, '0');
    const dateVersion = `${year}${month}${day}${timeOfDayCode}`;
    core.setOutput('version', dateVersion);
    core.setOutput('timeOfDay', timeOfDayCode);
    core.setOutput('year', year);
    core.setOutput('month', month);
    core.setOutput('day', day);
  }
}
