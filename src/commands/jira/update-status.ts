import { BaseCommand } from '../base-command.js';

export interface UpdateStatusArgs {
  issues?: string;
  prNumber?: string;
  prTitleRegex?: string;
  failWhenNoIssues?: boolean | string | number;
}

export class UpdateStatus extends BaseCommand<UpdateStatusArgs> {
  constructor() {
    super('jira', 'update-status');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_args: UpdateStatusArgs): Promise<void> {
    return;
  }
}
