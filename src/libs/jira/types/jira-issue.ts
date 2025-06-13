export interface JiraIssueFields {
  summary: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  description: any;
  components: {
    name: string;
    description: string;
  }[];
  status: {
    name: string;
    statusCategory: {
      key: string;
      name: string;
      colorName: string;
    };
  };
  issuetype: {
    name: string;
    description: string;
    iconUrl: string;
    subtask: boolean;
  };
  parent: {
    key: string;
  };
  labels: string[];
  fixVersions?: Array<{
    name: string;
  }>;
}

export interface JiraIssue {
  id: string;
  key: string;
  issueTypeCode: string;
  fields: JiraIssueFields;
}

export interface JiraIssuePatch {
  [field: string]: Array<{
    add?: string;
    remove?: string;
  }>;
}
