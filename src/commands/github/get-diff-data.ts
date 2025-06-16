import { BaseCommand } from '../base-command.js';
import { getCommits } from '../../libs/github/gh-diff.js';
import * as core from '@actions/core';

export interface GetDiffDataArgs {
  prNumber?: string;
  issuePattern?: string;
  dataSeparator?: string;
}

/**
 * Command to get info about commits in a PR.
 * It fetches commit messages, filenames, and issues from the PR.
 * It uses the GitHub API to fetch the data.
 * The results are set as outputs:
 * - commit-messages: The commit messages in the PR.
 * - files: The filenames changed in the PR.
 * - issues: The issues inferred from the commit messages and from the PR title.
 */
export class GetDiffData extends BaseCommand<GetDiffDataArgs> {
  constructor() {
    super('github', 'get-diff-data');
  }

  async execute(_args: GetDiffDataArgs): Promise<void> {
    const result = await getCommits({
      prNumber: _args.prNumber ?? '',
      issuePattern: _args.issuePattern,
      dataSeparator: _args.dataSeparator ?? '\n',
      repo: process.env.GITHUB_REPOSITORY ?? '',
      token: process.env.GITHUB_TOKEN ?? ''
    });
    core.setOutput('commit-messages', result.commitMessages);
    core.setOutput('files', result.filenames);
    core.setOutput('issues', result.issues);
  }
}
// Outputs:
// - commit-messages: The commit messages in the PR.
// - files: The filenames changed in the PR.
// - issues: The issues inferred from the commit messages and PR title.
