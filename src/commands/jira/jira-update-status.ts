import { parseIssues } from '../../input-parser/parse-inputs.js';

import { addJiraComment, updateJiraStatus } from '../../libs/jira/api/index.js';
import * as core from '@actions/core';
import { BaseJiraCommand } from './base-jira-command.js';

export interface JiraUpdateStatusArgs {
  issues?: string;
  targetStatus?: string;
  comment?: string;
  applyToParent?: boolean;
  applyToSubtasks?: boolean;
}

export class JiraUpdateStatus extends BaseJiraCommand<JiraUpdateStatusArgs> {
  constructor() {
    super('jira', 'update-status');
  }

  async execute(args: JiraUpdateStatusArgs): Promise<void> {
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
    await this.eachIssue(issues, {
      applyToParent: args.applyToParent ?? false,
      applyToSubtasks: args.applyToSubtasks ?? true,
      callback: async (issue) => {
        await updateJiraStatus(issue, targetStatus);
        if (args.comment) {
          await addJiraComment(issue, args.comment);
        }
      }
    });
  }
}
