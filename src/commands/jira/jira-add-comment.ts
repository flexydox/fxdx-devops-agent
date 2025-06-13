import { addJiraComment } from '../../libs/jira/api/index.js';
import * as core from '@actions/core';
import { parseIssues } from '../../input-parser/parse-inputs.js';
import { BaseJiraCommand } from './base-jira-command.js';
export interface JiraAddCommentArgs {
  issues?: string;
  comment?: string;
  applyToParent?: boolean;
  applyToSubtasks?: boolean;
}

export class JiraAddComment extends BaseJiraCommand<JiraAddCommentArgs> {
  constructor() {
    super('jira', 'add-comment');
  }

  async execute(args: JiraAddCommentArgs): Promise<void> {
    const issues = parseIssues(args.issues);
    const comment = args.comment;
    if (issues.length === 0) {
      core.info('No issues provided, skipping comment addition.');
      return;
    }
    if (!comment) {
      core.info('No comment provided, skipping comment addition.');
      return;
    }
    core.debug(`Adding comment to issues: ${issues.join(', ')}`);

    await this.eachIssue(issues, {
      applyToParent: args.applyToParent ?? false,
      applyToSubtasks: args.applyToSubtasks ?? true,
      callback: async (issue) => {
        core.debug(`Adding comment to issue ${issue}: ${comment}`);
        await addJiraComment(issue, comment);
      }
    });
  }
}
