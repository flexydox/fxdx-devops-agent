import * as core from '@actions/core';
import { BaseCommand } from '../base-command.js';
import { getGitHubClient, GitHubClient } from '../../libs/github/github-client.js';
import { sanitizeNonPrintableChars } from '../../libs/string-utils.js';

export interface CommitInfoArgs {
  sha?: string;
  repo?: string;
}

/**
 * Command to get information about a specific commit by SHA.
 * It fetches commit details including message, author, committer, and timestamp.
 * The results are set as outputs:
 * - message: The commit message
 * - author-name: The commit author's name
 * - author-email: The commit author's email
 * - author-date: The commit author's date
 * - committer-name: The committer's name
 * - committer-email: The committer's email
 * - committer-date: The committer's date
 * - sha: The commit SHA
 * - url: The commit URL
 */
export class CommitInfo extends BaseCommand<CommitInfoArgs> {
  constructor() {
    super('github', 'commit-info');
  }

  async execute(args: CommitInfoArgs): Promise<void> {
    const sha = args.sha ?? '';
    const repo = args.repo ?? process.env.GITHUB_REPOSITORY ?? '';

    if (!sha) {
      core.setFailed('Commit SHA is required');
      return;
    }

    if (!repo) {
      core.setFailed('Repository is required (either via args.repo or GITHUB_REPOSITORY env var)');
      return;
    }

    core.debug(`Fetching commit info for SHA: ${sha} in repo: ${repo}`);

    try {
      let client: ReturnType<typeof getGitHubClient>;
      let commitData;

      if (repo === process.env.GITHUB_REPOSITORY) {
        // Use default client for current repository
        client = getGitHubClient();
        commitData = await client.getCommit(sha);
      } else {
        // Parse external repository and get commit
        const { owner, repo: repoName } = GitHubClient.parseRepo(repo);
        client = getGitHubClient();
        commitData = await client.getCommit(sha, owner, repoName);
      }

      // Set outputs
      core.setOutput('message-original', commitData.commit.message);

      // Strip non-printable characters from the commit message
      const strippedMessage = sanitizeNonPrintableChars(commitData.commit.message, ' ');
      core.setOutput('message', strippedMessage);
      core.setOutput('author-name', commitData.commit.author?.name || '');
      core.setOutput('author-email', commitData.commit.author?.email || '');
      core.setOutput('author-date', commitData.commit.author?.date || '');
      core.setOutput('committer-name', commitData.commit.committer?.name || '');
      core.setOutput('committer-email', commitData.commit.committer?.email || '');
      core.setOutput('committer-date', commitData.commit.committer?.date || '');
      core.setOutput('sha', commitData.sha);
      core.setOutput('url', commitData.html_url);

      core.info(`Successfully retrieved commit info for ${sha}`);
      core.debug(`Commit message: ${commitData.commit.message}`);
      core.debug(`Author: ${commitData.commit.author?.name} <${commitData.commit.author?.email}>`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      core.setFailed(`Error fetching commit info: ${errorMessage}`);
    }
  }
}
