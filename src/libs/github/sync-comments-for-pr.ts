import { IssueValidationResult } from '../../types/issue-validation-result.js';
import { getGitHubClient } from './github-client.js';

interface Comment {
  id: number;
  body?: string;
}

function getCommentMarker(issueKey: string): string {
  return `<!-- JIRA-ISSUES-VALIDATION-${issueKey} -->`;
}

async function getPullRequestComments(prNumber: string): Promise<Comment[]> {
  const client = getGitHubClient();
  const comments = await client.getPullRequestComments(parseInt(prNumber, 10));
  return comments.map((comment) => ({
    id: comment.id,
    body: comment.body || undefined
  }));
}

async function createComment(prNumber: string, body: string): Promise<void> {
  const client = getGitHubClient();
  await client.createPullRequestComment(parseInt(prNumber, 10), body);
}

async function updateComment(commentId: number, body: string): Promise<void> {
  const client = getGitHubClient();
  await client.updateComment(commentId, body);
}

function statusToEmoji(status: string): string {
  switch (status) {
    case 'ok':
      return '✅';
    case 'warn':
      return '⚠️';
    case 'error':
      return '❌';
    default:
      return '❓';
  }
}

function composeRecommendationBody(issueResult: IssueValidationResult): string {
  if (!issueResult.recommendations.summary && !issueResult.recommendations.description) {
    return '';
  }
  return `
<details>
<summary>Doporučení</summary>

| Atribut | Doporučení | 
| ------ | ------------- | 
| Název | ${issueResult.recommendations.summary} |
| Popis | ${issueResult.recommendations.description} |
</details>
`;
}

function composeSuggestionBody(issueResult: IssueValidationResult): string {
  if (!issueResult.suggestions.summary && !issueResult.suggestions.description) {
    return '';
  }
  return `
<details>
<summary>Návrh změn</summary>

#### Název:

\`\`\`
${issueResult.suggestions.summary}
\`\`\`

#### Popis:

\`\`\`
${issueResult.suggestions.description}
\`\`\`
</details>
`;
}

function composeCommentBody(issueResult: IssueValidationResult): string {
  return `
${getCommentMarker(issueResult.issue.key)}
### ${statusToEmoji(issueResult.status)} Validace zadání issue ${issueResult.issue.key} (${issueResult.issue.typeName}) ${statusToEmoji(issueResult.status)}
${composeRecommendationBody(issueResult)}
${composeSuggestionBody(issueResult)}
`;
}

async function syncCommentForPR(prNumber: string, issueResult: IssueValidationResult): Promise<void> {
  const comments = await getPullRequestComments(prNumber);
  const commentBody = await composeCommentBody(issueResult);
  const marker = getCommentMarker(issueResult.issue.key);

  const existingComment = comments.find((comment) => comment?.body?.includes(marker));

  if (existingComment) {
    await updateComment(existingComment.id, commentBody);
  } else {
    await createComment(prNumber, commentBody);
  }
}
export async function syncCommentsForPR(prNumber: string, issuesResults: IssueValidationResult[]): Promise<void> {
  await Promise.all(
    issuesResults.map((issueResult) => {
      return syncCommentForPR(prNumber, issueResult);
    })
  );
}
