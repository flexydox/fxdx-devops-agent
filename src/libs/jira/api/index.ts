import { JiraIssue, JiraIssueFields, JiraIssuePatch } from '../types/jira-issue.js';
import { guardEnvVars } from '../../guard-env-vars.js';
import { getAuthHeaders } from './auth.js';
import * as core from '@actions/core';
import { IssueTransition } from '../../../types/issue-transition.js';
import { JiraIssueTransition } from '../types/jira-issue-transition.js';
import { compose } from '../../fn-utils.js';
import { normalizeString, transliterateText } from '../../string-utils.js';
import { markdownToAdf } from '../adf-converter.js';
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

async function jiraApiFetch(url: string, options: JiraFetchOptions): Promise<Response> {
  const { requestOptions, searchParams } = options;
  const baseUrl = getApiBaseUrl() + JIRA_API_PREFIX;
  const fullUrl = new URL(baseUrl + url);
  if (searchParams) {
    fullUrl.search = new URLSearchParams(searchParams).toString();
  }
  core.debug(`Fetching Jira API:`);
  core.debug(`Full URL: ${fullUrl.toString()}, base URL: ${baseUrl}`);
  core.debug(`Fetching Jira API URL: ${fullUrl.toString()}`);
  if (requestOptions) {
    core.debug(`Request options: ${JSON.stringify(requestOptions)}`);
  }
  const response = await fetch(fullUrl.toString(), {
    method: 'GET',
    ...requestOptions,

    headers: {
      ...requestOptions?.headers,
      ...getAuthHeaders()
    }
  });
  if (!response.ok) {
    core.warning(`Jira API fetch failed with status: ${response.status}`);
    const respText = await response.text();
    core.warning(`Response body text: ${respText}`);
  }
  return response;
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

export async function updateJiraStatus(issueKey: string, targetStatus: string): Promise<void> {
  const transitions = await getJiraIssueTransitions(issueKey);
  const normalize = compose(transliterateText, normalizeString);
  const transition = transitions.find((t) => normalize(t.name) === normalize(targetStatus));
  if (!transition) {
    core.debug(`Available transitions for issue ${issueKey}: ${transitions.map((t) => t.name).join(', ')}`);
    core.setFailed(`Transition to status "${targetStatus}" not found for issue ${issueKey}`);
    throw new Error(`Transition to status "${targetStatus}" not found for issue ${issueKey}`);
  }
  const response = await jiraApiFetch(`/issue/${issueKey}/transitions`, {
    requestOptions: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transition: { id: transition.id }
      })
    }
  });
  if (!response.ok) {
    throw new Error(`Error updating issue ${issueKey} status to ${targetStatus}: ${response.statusText}\n`);
  }
  core.info(`Issue ${issueKey} status updated to '${transition.name}'`);
}

export async function addJiraComment(issueNumber: string, comment: string): Promise<void> {
  if (!comment) {
    throw new Error('Comment cannot be empty');
  }
  const adfComment = markdownToAdf(comment);
  const response = await jiraApiFetch(`/issue/${issueNumber}/comment`, {
    requestOptions: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        body: adfComment
      })
    }
  });
  if (!response.ok) {
    throw new Error(`Error adding comment to issue ${issueNumber}: ${response.statusText}\n`);
  }
  core.info(`Comment added to issue ${issueNumber}`);
}

async function updateIssue(
  issueNumber: string,
  body: { fields?: Partial<JiraIssueFields>; update?: JiraIssuePatch }
): Promise<void> {
  if (!body.fields && !body.update) {
    throw new Error('Body must contain either fields or update');
  }

  const response = await jiraApiFetch(`/issue/${issueNumber}`, {
    requestOptions: {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  });
  if (!response.ok) {
    core.debug(`Failed to update issue ${issueNumber}. Body: ${JSON.stringify(body)}`);
    throw new Error(`Error updating issue ${issueNumber}: ${response.status}\n`);
  }
  core.info(`Issue ${issueNumber} updated successfully`);
}

export async function updateIssueFields(issueNumber: string, fields: Partial<JiraIssueFields>): Promise<void> {
  if (!fields || Object.keys(fields).length === 0) {
    throw new Error('Fields cannot be empty');
  }
  const body: { fields: Partial<JiraIssueFields> } = { fields };
  await updateIssue(issueNumber, body);
}

export async function updateIssueByPatch(issueNumber: string, patchData: JiraIssuePatch): Promise<void> {
  if (!patchData || Object.keys(patchData).length === 0) {
    throw new Error('Patch data cannot be empty');
  }
  const body: { update: JiraIssuePatch } = { update: patchData };
  await updateIssue(issueNumber, body);
}

async function getJiraIssue(issueNumber: string, searchParams: Record<string, string>): Promise<JiraIssue> {
  const response = await jiraApiFetch(`/issue/${issueNumber}`, {
    searchParams
  });
  if (!response.ok) {
    throw new Error(`Error fetching issue ${issueNumber}: ${response.statusText}\n`);
  }
  const jiraIssue = (await response.json()) as JiraIssue;
  return jiraIssue;
}

async function getParentIssue(issueNumber: string, searchParams: Record<string, string>): Promise<JiraIssue> {
  let jiraIssue = await getJiraIssue(issueNumber, searchParams);

  if (jiraIssue?.fields?.parent?.key && jiraIssue?.fields?.issuetype?.subtask) {
    console.log(`Fetching parent issue ${jiraIssue.fields.parent.key} for subtask ${issueNumber}`);
    jiraIssue = await getJiraIssue(jiraIssue.fields.parent.key, searchParams);
  }

  return jiraIssue;
}

type GetIssuesOptions = {
  loadParent?: boolean;
  skipSubtasks?: boolean;
  searchParams?: Record<string, string>;
};

export async function getIssues(issues: string[], options: GetIssuesOptions): Promise<JiraIssue[]> {
  core.debug(`Getting issues: ${issues.join(', ')}`);
  core.debug(`Options: ${JSON.stringify(options)}`);
  const { loadParent = false, skipSubtasks = false, searchParams = {} } = options;
  if (issues.length === 0) {
    return [];
  }
  const jiraIssues: Set<JiraIssue> = new Set();
  for (const issueNumber of issues) {
    try {
      const jiraIssue = await getJiraIssue(issueNumber, searchParams);
      let parentIssue: JiraIssue | null = null;
      if (loadParent) {
        core.debug(`Loading parent issue for ${issueNumber}`);
        parentIssue = await getParentIssue(issueNumber, searchParams);
      }
      const isSubtask = jiraIssue?.fields?.issuetype?.subtask;
      core.debug(`Issue ${issueNumber} is subtask: ${isSubtask}`);

      if (parentIssue && loadParent) {
        jiraIssues.add(parentIssue);
      }
      if (skipSubtasks && isSubtask) {
        core.debug(`Skipping subtask ${issueNumber}`);
        continue;
      }
      jiraIssues.add(jiraIssue);
    } catch (error) {
      core.warning(`Error fetching issue ${issueNumber}: ${error}`);
      continue;
    }
  }
  return Array.from(jiraIssues);
}
