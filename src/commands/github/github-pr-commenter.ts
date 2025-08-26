import * as core from '@actions/core';
import { getIssues } from '../../libs/jira/api/index.js';
import { validateIssues } from '../../libs/ai/validate-issues.js';
import { syncCommentsForPR } from '../../libs/github/sync-comments-for-pr.js';
import { getPRInfo } from '../../libs/github/get-pr-info.js';
import { BaseCommand } from '../base-command.js';
import { mapIssueInfo } from '../../libs/jira/issue-info-mapper.js';
import { parseIssues } from '../../input-parser/parse-inputs.js';

export interface GithubPRCommenterArgs {
  issues?: string;
  prNumber?: string;
  prTitleRegex?: string;
  failWhenNoIssues?: boolean | string | number;
  applyToParent?: boolean;
  applyToSubtasks?: boolean;
}

/**
 * Command to comment on a pull request with Jira issue validation.
 * It fetches the PR information, validates the issues against the PR title and description,
 * and syncs (create or update) comments based on the validation results.
 */
export class GithubPRCommenter extends BaseCommand<GithubPRCommenterArgs> {
  constructor() {
    super('github', 'pr-commenter');
  }

  async execute(args: GithubPRCommenterArgs): Promise<void> {
    const prNumber = args.prNumber ?? '';
    const prTitleRegex = typeof args.prTitleRegex === 'string' ? args.prTitleRegex : '.*';
    const failWhenNoIssues =
      args.failWhenNoIssues === true || args.failWhenNoIssues === 'true' || args.failWhenNoIssues === 1;
    core.debug(`prNumber: ${prNumber}`);
    core.debug(`prTitleRegex: ${prTitleRegex}`);
    core.debug(`failWhenNoIssues: ${failWhenNoIssues}`);

    if (!prNumber) {
      core.info('PR number is not set, skipping validation.');
      return;
    }

    core.debug(`Fetching PR info for PR number: ${prNumber}`);
    const prInfo = await getPRInfo(prNumber);
    core.debug(`PR title: ${prInfo.title}`);

    if (!prInfo) {
      core.setFailed('PR not found!');
      return;
    }
    if (prInfo.title && !new RegExp(prTitleRegex).test(prInfo.title)) {
      core.info(`PR title "${prInfo.title}" does not match regex "${prTitleRegex}", skipping validation.`);
      return;
    }

    const issuesNumbers = parseIssues(args.issues);
    if (issuesNumbers.length === 0) {
      core.info('Issues are not set, skipping validation.');
      if (failWhenNoIssues) {
        core.setFailed('No issues defined and failWhenNoIssues is set to true');
        return;
      }
      return;
    }

    const jiraIssues = await getIssues(issuesNumbers, {
      loadParent: args.applyToParent,
      skipSubtasks: !args.applyToSubtasks,
      searchParams: {
        fields: 'summary,description,issuetype,status,labels,components,parent'
      }
    });

    const issues = jiraIssues.map(mapIssueInfo);
    core.debug(`Mapped issues: ${JSON.stringify(issues)}`);

    if (!issues || issues.length === 0) {
      core.info('No issues found, skipping validation.');
      if (failWhenNoIssues) {
        core.setFailed('No issues found and failWhenNoIssues is set to true');
      }
      return;
    }
    const validationResults = await validateIssues(issues);
    core.debug(`validationResults: ${JSON.stringify(validationResults)}`);

    await syncCommentsForPR(prNumber, validationResults);

    core.debug('Comments synced successfully');

    const failedIssues = validationResults.filter((result) => {
      if (result.status === 'error') {
        return true;
      }
      return false;
    });

    const failedIssuesMessage = failedIssues
      .map((issue) => {
        return issue.issue.key;
      })
      .join(', ');

    if (failedIssues.length > 0) {
      core.setFailed(`Validation failed for issues: ${failedIssuesMessage}`);
      return;
    }

    core.debug('Issues validated successfully');
  }
}
