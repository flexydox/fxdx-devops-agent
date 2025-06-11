import { BaseCommand } from '../base-command.js';

export interface GetDiffDataArgs {
  issues?: string;
  prNumber?: string;
  prTitleRegex?: string;
  failWhenNoIssues?: boolean | string | number;
}

export class GetDiffData extends BaseCommand<GetDiffDataArgs> {
  constructor() {
    super('git', 'get-diff-data');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_args: GetDiffDataArgs): Promise<void> {
    return;
  }
}
