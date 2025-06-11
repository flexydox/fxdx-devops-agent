import * as core from '@actions/core';
import { getIssues } from '../../libs/jira/jira-issue-info.js';
import { validateIssues } from '../../libs/ai/validate-issues.js';
import { syncCommentsForPR } from '../../libs/github/sync-comments-for-pr.js';
import { getPRInfo } from '../../libs/github/get-pr-info.js';
import { BaseCommand } from '../base-command.js';

export interface IssuePRCommenterArgs {
  issues?: string;
  prNumber?: string;
  prTitleRegex?: string;
  failWhenNoIssues?: boolean | string | number;
}

function parseIssuesString(issuesString: string): string[] {
  return issuesString
    .split(',')
    .map((issue) => issue.trim())
    .filter((issue) => issue.length > 0);
}

export class IssuePRCommenter extends BaseCommand<IssuePRCommenterArgs> {
  constructor() {
    super('jira', 'issue-pr-commenter');
  }

  async execute(args: IssuePRCommenterArgs): Promise<void> {
    const issuesString = typeof args.issues === 'string' ? args.issues : '';
    const issuesArray = Array.isArray(args.issues) ? args.issues : [];
    const prNumber = args.prNumber ?? '';
    const prTitleRegex = typeof args.prTitleRegex === 'string' ? args.prTitleRegex : '.*';
    const failWhenNoIssues =
      args.failWhenNoIssues === true || args.failWhenNoIssues === 'true' || args.failWhenNoIssues === 1;
    core.debug(`issuesString: ${issuesString}`);
    core.debug(`issuesArray: ${JSON.stringify(issuesArray)}`);
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

    const issuesNumbers = issuesArray.length > 0 ? issuesArray : parseIssuesString(issuesString);
    if (issuesNumbers.length === 0) {
      core.info('Issues are not set, skipping validation.');
      if (failWhenNoIssues) {
        core.setFailed('No issues defined and failWhenNoIssues is set to true');
        return;
      }
      return;
    }

    const issues = await getIssues(issuesNumbers);

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
