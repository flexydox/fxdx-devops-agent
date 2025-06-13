import { getIssues } from '../../libs/jira/api/index.js';
import { CommandArgs } from '../../types/command-types.js';
import { BaseCommand } from '../base-command.js';

export interface EachIssueOptions {
  applyToParent?: boolean;
  applyToSubtasks?: boolean;
  callback?: (issueKey: string) => Promise<void>;
}

export abstract class BaseJiraCommand<TArgs extends CommandArgs> extends BaseCommand<TArgs> {
  async eachIssue(issues: string[], options: EachIssueOptions): Promise<void> {
    const { applyToParent = true, applyToSubtasks = false, callback = async () => {} } = options;
    const jiraIssues = await getIssues(issues, {
      loadParent: applyToParent,
      skipSubtasks: !applyToSubtasks,
      searchParams: {
        fields: 'summary,description,issuetype,status,labels,components,parent'
      }
    });

    Promise.all(
      jiraIssues.map(async (issue) => {
        try {
          await callback(issue.key);
        } catch (error) {
          console.error(`Error processing issue ${issue.key}:`, error);
        }
      })
    );
  }
}
