import github from '@actions/github';
import * as core from '@actions/core';

interface PRInfo {
  id: number;
  body?: string | null;
  title?: string | null;
}

function getOctokit() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? '';
  const octokit = github.getOctokit(GITHUB_TOKEN);
  return octokit;
}

export async function getPRInfo(prNumber: string): Promise<PRInfo> {
  const octokit = getOctokit();
  const { owner, repo } = github.context.repo;
  const response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: parseInt(prNumber, 10)
  });

  if (response.status !== 200) {
    core.debug(`Response: ${JSON.stringify(response.data)}`);
    throw new Error(`Failed to fetch pull request #${prNumber}. Status: ${response.status}`);
  }

  return response.data satisfies PRInfo;
}
