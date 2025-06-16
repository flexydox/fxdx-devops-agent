import { inferIssues } from '../string-utils.js';
import { getGitHubClient } from './github-client.js';

export interface CommitData {
  sha: string;
  commit: {
    message: string;
  };
}

export interface FileData {
  filename: string;
  status: string;
  raw_url: string;
  patch: string;
  sha: string;
}

const SCALAR_SEPARATOR = ',';

export interface GetCommitsInput {
  repo: string;
  prNumber: string;
  dataSeparator: string;
  issuePattern?: string;
}

export interface GetCommitsOutput {
  filenames: string;
  commitMessages: string;
  issues: string;
}

export async function getCommits(data: GetCommitsInput): Promise<GetCommitsOutput> {
  const { prNumber, dataSeparator, issuePattern } = data;
  const prNumberInt = parseInt(prNumber, 10);

  // Get GitHub client instance
  const client = getGitHubClient();

  // Fetch all required data using Octokit
  const [prData, commits, files] = await Promise.all([
    client.getPullRequest(prNumberInt),
    client.getPullRequestCommits(prNumberInt),
    client.getPullRequestFiles(prNumberInt)
  ]);

  const commitMessages = commits.map((c) => `- ${c.commit.message}`).join(dataSeparator);

  const filenamesList = files.map((f) => f.filename);
  const issuesList: string[] = [];
  if (issuePattern) {
    issuesList.push(...inferIssues(prData.title || '', issuePattern));
    issuesList.push(...inferIssues(prData.body || '', issuePattern));
    issuesList.push(...inferIssues(commitMessages, issuePattern));
  }

  const uniqueIssues = Array.from(new Set(issuesList));

  return {
    filenames: filenamesList.join(SCALAR_SEPARATOR),
    commitMessages: commitMessages,
    issues: uniqueIssues.join(SCALAR_SEPARATOR)
  };
}
