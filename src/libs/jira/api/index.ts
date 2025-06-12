import { JiraIssue } from '../types/jira-issue.js';
import { guardEnvVars } from '../../guard-env-vars.js';
import { getAuthHeaders } from './auth.js';
import * as core from '@actions/core';
import { IssueTransition } from '../../../types/issue-transition.js';
import { JiraIssueTransition } from '../types/jira-issue-transition.js';
const JIRA_API_PREFIX = '/rest/api/3';
function getApiBaseUrl(): string {
  guardEnvVars(['ATLASSIAN_API_BASE_URL']);
  const ATLASSIAN_API_BASE_URL = process.env.ATLASSIAN_API_BASE_URL ?? '';
  return ATLASSIAN_API_BASE_URL;
}

type JiraFetchOptions = {
  requestOptions?: RequestInit;
  searchParams?: Record<string, string>;
};

function jiraApiFetch(url: string, options: JiraFetchOptions): Promise<Response> {
  const { requestOptions, searchParams } = options;
  const baseUrl = getApiBaseUrl() + JIRA_API_PREFIX;
  const fullUrl = new URL(baseUrl + url);
  if (searchParams) {
    fullUrl.search = new URLSearchParams(searchParams).toString();
  }
  core.debug(`Fetching Jira API:`);
  core.debug(`Full URL: ${fullUrl.toString()}, base URL: ${baseUrl}`);
  core.debug(`Fetching Jira API URL: ${fullUrl.toString()}`);
  core.debug(`Request options: ${JSON.stringify(requestOptions)}`);
  return fetch(fullUrl.toString(), {
    method: 'GET',
    ...requestOptions,

    headers: {
      ...requestOptions?.headers,
      ...getAuthHeaders()
    }
  });
}

export async function getJiraIssueTransitions(issueNumber: string): Promise<IssueTransition[]> {
  const response = await jiraApiFetch(`/issue/${issueNumber}/transitions`, {});
  if (!response.ok) {
    throw new Error(`Error fetching issue ${issueNumber} transitions: ${response.statusText}\n`);
  }
  const result = (await response.json()) as { transitions: JiraIssueTransition[] };
  return result.transitions.map((transition: JiraIssueTransition) => ({
    id: transition.id,
    name: transition.name
  }));
}

export async function getJiraIssue(issueNumber: string, searchParams: Record<string, string>): Promise<JiraIssue> {
  const response = await jiraApiFetch(`/issue/${issueNumber}`, {
    searchParams
  });
  if (!response.ok) {
    throw new Error(`Error fetching issue ${issueNumber}: ${response.statusText}\n`);
  }
  const jiraIssue = (await response.json()) as JiraIssue;
  return jiraIssue;
}

/**
 * Gets a Jira issue or its parent if it is a subtask.
 */
export async function getParentIssue(issueNumber: string, searchParams: Record<string, string>): Promise<JiraIssue> {
  let jiraIssue = await getJiraIssue(issueNumber, searchParams);

  if (jiraIssue?.fields?.parent?.key && jiraIssue?.fields?.issuetype?.subtask) {
    console.log(`Fetching parent issue ${jiraIssue.fields.parent.key} for subtask ${issueNumber}`);
    jiraIssue = await getJiraIssue(jiraIssue.fields.parent.key, searchParams);
  }

  return jiraIssue;
}

export async function getIssues(
  issues: string[],
  loadParent: boolean,
  searchParams: Record<string, string>
): Promise<JiraIssue[]> {
  if (issues.length === 0) {
    return [];
  }
  const jiraIssues = await Promise.all(
    issues.map((issueNumber) =>
      loadParent ? getParentIssue(issueNumber, searchParams) : getJiraIssue(issueNumber, searchParams)
    )
  );

  return jiraIssues;
}
