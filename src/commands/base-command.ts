import { getIssues } from '../libs/jira/api/index.js';
import { CommandArgs } from '../types/command-types.js';

export interface EachIssueOptions {
  applyToParent?: boolean;
  applyToSubtasks?: boolean;
  callback?: (issueKey: string) => Promise<void>;
}

export abstract class BaseCommand<TArgs extends CommandArgs> {
  command: string;
  subcommand: string;

  constructor(command: string, subcommand: string) {
    this.command = command;
    this.subcommand = subcommand;
  }

  abstract execute(args: TArgs): Promise<void>;

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
