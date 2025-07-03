import { parseIssues } from '../../input-parser/parse-inputs.js';

import { addJiraComment, updateJiraStatus } from '../../libs/jira/api/index.js';
import * as core from '@actions/core';
import { BaseJiraCommand } from './base-jira-command.js';
import { normalizeString, transliterateText } from '../../libs/string-utils.js';
import { compose } from '../../libs/fn-utils.js';

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
      callback: async (issueKey, issue) => {
        const currentStatus = issue.fields.status;
        const currentStatusName = currentStatus?.name ?? 'Unknown';
        const currentStatusCategory = currentStatus?.statusCategory?.key || 'unknown';
        core.info(`Current status of issue ${issueKey} is ${currentStatusName} [${currentStatusCategory}]`);
        if (currentStatusCategory === 'done') {
          core.info(`Issue ${issueKey} is already in a done status, skipping.`);
          return;
        }

        const normalize = compose(transliterateText, normalizeString);
        const normalizedTargetStatus = normalize(targetStatus);
        const normalizedCurrentStatus = normalize(currentStatusName);
        if (normalizedCurrentStatus === normalizedTargetStatus) {
          core.info(`Issue ${issueKey} is already in the target status '${targetStatus}', skipping.`);
          return;
        }

        await updateJiraStatus(issueKey, targetStatus);
        if (args.comment) {
          await addJiraComment(issueKey, args.comment);
        }
      }
    });
  }
}
