import { IssueInfo } from '../../types/issue-info.js';
import { adfToMarkdown } from '../adf-to-markdown.js';
import { issueTypeMapper } from './api/issue-type-mapper.js';
import { JiraIssue } from './types/jira-issue.js';

export function mapIssueInfo(jiraIssue: JiraIssue): IssueInfo {
  const issueInfo: IssueInfo = {
    key: jiraIssue.key,
    type: issueTypeMapper[jiraIssue.fields.issuetype.name] ?? jiraIssue.fields.issuetype.name,
    typeName: jiraIssue.fields.issuetype.name,
    summary: jiraIssue.fields.summary,
    description: adfToMarkdown(jiraIssue.fields.description),
    status: jiraIssue.fields.status.name,
    statusCategory: {
      key: jiraIssue.fields.status.statusCategory.key,
      name: jiraIssue.fields.status.statusCategory.name,
      colorName: jiraIssue.fields.status.statusCategory.colorName
    },
    labels: jiraIssue.fields.labels,
    components: jiraIssue.fields.components.map((component) => component.name)
  };
  return issueInfo;
}
