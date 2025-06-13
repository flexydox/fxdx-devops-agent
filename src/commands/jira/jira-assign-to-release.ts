import { updateIssueFields } from '../../libs/jira/api/index.js';
import * as core from '@actions/core';
import { parseIssues } from '../../input-parser/parse-inputs.js';
import { BaseJiraCommand } from './base-jira-command.js';
export interface JiraAssignToReleaseArgs {
  issues?: string;
  version?: string;
  applyToParent?: boolean;
  applyToSubtasks?: boolean;
}

export class JiraAssignToRelease extends BaseJiraCommand<JiraAssignToReleaseArgs> {
  constructor() {
    super('jira', 'assign-to-release');
  }

  async execute(args: JiraAssignToReleaseArgs): Promise<void> {
    const issues = parseIssues(args.issues);
    const version = args.version;
    if (issues.length === 0) {
      core.info('No issues provided, skipping comment addition.');
      return;
    }
    if (!version) {
      core.info('No version provided, skipping comment addition.');
      return;
    }
    await this.eachIssue(issues, {
      applyToParent: args.applyToParent ?? false,
      applyToSubtasks: args.applyToSubtasks ?? true,
      callback: async (issue) => {
        await updateIssueFields(issue, {
          fixVersions: [
            {
              name: version
            }
          ]
        });
      }
    });
  }
}
