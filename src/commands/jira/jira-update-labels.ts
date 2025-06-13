import { updateIssueByPatch } from '../../libs/jira/api/index.js';
import * as core from '@actions/core';
import { parseIssues } from '../../input-parser/parse-inputs.js';
import { BaseJiraCommand } from './base-jira-command.js';
export interface JiraUpdateLabelsArgs {
  issues?: string;
  labelsToAdd?: string;
  labelsToRemove?: string;
  applyToParent?: boolean;
  applyToSubtasks?: boolean;
}

export class JiraUpdateLabels extends BaseJiraCommand<JiraUpdateLabelsArgs> {
  constructor() {
    super('jira', 'update-labels');
  }

  async execute(args: JiraUpdateLabelsArgs): Promise<void> {
    const issues = parseIssues(args.issues);
    const labelsToAddSerialized = args.labelsToAdd;
    const labelsToRemoveSerialized = args.labelsToRemove;
    if (!labelsToAddSerialized && !labelsToRemoveSerialized) {
      core.info('No labels provided, skipping label update.');
      return;
    }
    const labelsToAdd = labelsToAddSerialized ? labelsToAddSerialized.split(',').map((label) => label.trim()) : [];
    const labelsToRemove = labelsToRemoveSerialized
      ? labelsToRemoveSerialized.split(',').map((label) => label.trim())
      : [];
    if (issues.length === 0) {
      core.info('No issues provided, skipping label update.');
      return;
    }
    core.debug(`Updating labels for issues: ${issues.join(', ')}`);

    await this.eachIssue(issues, {
      applyToParent: args.applyToParent ?? false,
      applyToSubtasks: args.applyToSubtasks ?? true,
      callback: async (issue) => {
        core.debug(`Updating labels for issue ${issue}: ${labelsToAdd} (add), ${labelsToRemove} (remove)`);
        await updateIssueByPatch(issue, {
          labels: [
            ...labelsToAdd.map((label) => ({ add: label })),
            ...labelsToRemove.map((label) => ({ remove: label }))
          ]
        });
      }
    });
  }
}
