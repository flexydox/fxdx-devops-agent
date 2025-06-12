import { parseIssues } from '../../input-parser/parse-inputs.js';
import { BaseCommand } from '../base-command.js';

import { getJiraIssueTransitions } from '../../libs/jira/api/index.js';
import * as core from '@actions/core';

export interface UpdateStatusArgs {
  issues?: string;
  targetStatus?: string;
}

export class UpdateStatus extends BaseCommand<UpdateStatusArgs> {
  constructor() {
    super('jira', 'update-status');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(args: UpdateStatusArgs): Promise<void> {
    const issues = parseIssues(args.issues);
    const targetStatus = args.targetStatus;
    if (issues.length === 0) {
      core.info('No issues provided, skipping status update.');
      return;
    }
    if (!targetStatus) {
      core.info('No target status provided, skipping status update.');
      return;
    }
    const transitions = await getJiraIssueTransitions(issues[0]);
    core.info(`Available transitions for issue ${issues[0]}: ${JSON.stringify(transitions)}`);
  }
}
