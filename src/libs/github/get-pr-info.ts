import { getGitHubClient } from './github-client.js';

interface PRInfo {
  id: number;
  body?: string | null;
  title?: string | null;
}

export async function getPRInfo(prNumber: string): Promise<PRInfo> {
  const client = getGitHubClient();
  const prData = await client.getPullRequest(parseInt(prNumber, 10));

  return {
    id: prData.id,
    body: prData.body,
    title: prData.title
  };
}
