# DevOps Agent ![Marketplace](https://img.shields.i### Environment Variables - Github related

- `GITHUB_REPOSITORY`: The repository in the format `owner/repo` (automatically set by GitHub Actions).
- `GITHUB_TOKEN`: The token used for GitHub API authentication (automatically set by GitHub Actions).
  - **Required for**: All GitHub commands (`github` command group)
  - **Default**: Automatically provided by GitHub Actions runtime

### Environment Variables - Jira related

- `ATLASSIAN_API_BASE_URL`: Base URL for Atlassian API (e.g., `https://your-domain.atlassian.net`).
  - **Required for**: All Jira commands (`jira` command group)
- `ATLASSIAN_API_USERNAME`: Username/email for Atlassian API authentication.
  - **Required for**: All Jira commands (`jira` command group)
- `ATLASSIAN_API_TOKEN`: API token for Atlassian API authentication.
  - **Required for**: All Jira commands (`jira` command group)
  - **How to get**: Generate from your Atlassian account settings

### Environment Variables - AI related

- `OPENAI_API_KEY`: OpenAI API key for AI-powered issue validation.
  - **Required for**: `github pr-commenter` command when using AI validation
  - **Optional**: Not needed for basic GitHub or Jira operationsketplace-GitHub%20Actions-blue?logo=github) ![License](https://img.shields.io/github/license/flexydox/fxdx-devops-agent)

A powerful GitHub Action for automating your development workflow with Jira, GitHub, and versioning operations. Supports advanced PR validation, Jira issue management, and more.

---

## Table of Contents

- [DevOps Agent !\[Marketplace\](https://img.shields.i### Environment Variables - Github related](#devops-agent-marketplacehttpsimgshieldsi-environment-variables---github-related)
  - [Environment Variables - Jira related](#environment-variables---jira-related)
  - [Environment Variables - AI related](#environment-variables---ai-related)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Commands \& Arguments](#commands--arguments)
    - [~Common Arguments](#common-arguments)
    - [Environment Variables - Github related](#environment-variables---github-related)
    - [Environment Variables - Jira related](#environment-variables---jira-related-1)
    - [Environment Variables - AI related](#environment-variables---ai-related-1)
    - [Jira Commands](#jira-commands)
    - [GitHub Commands](#github-commands)
    - [Version Commands](#version-commands)
    - [Text Commands](#text-commands)
    - [Slack Commands](#slack-commands)
  - [Usage](#usage)
  - [Examples](#examples)
    - [Add a comment to Jira issues](#add-a-comment-to-jira-issues)
    - [Update Jira status for issues](#update-jira-status-for-issues)
    - [Validate PR with Jira issues and comment](#validate-pr-with-jira-issues-and-comment)
    - [Get PR diff data](#get-pr-diff-data)
    - [Parse a version string](#parse-a-version-string)
    - [Extract issues from text](#extract-issues-from-text)
    - [Get commit information](#get-commit-information)
    - [Assign Jira issues to a release](#assign-jira-issues-to-a-release)
    - [Update Jira issue labels](#update-jira-issue-labels)
    - [Send Slack notification for E2E test results](#send-slack-notification-for-e2e-test-results)
    - [Complete workflow example](#complete-workflow-example)
  - [Development](#development)
  - [License](#license)

---

## Features

- Validate and synchronize Jira issues on PRs
- Update Jira issue status, labels, comments, and releases from workflows
- Parse semantic versions and extract commit data from PRs
- Send Slack notifications for E2E test results
- Modular command/subcommand structure for extensibility

---

## Commands & Arguments

### ~Common Arguments

- `applyToParent` (bool, optional): Apply operation to parent issues, if actual issue is a subtask.
- `applyToSubtasks` (bool, optional): Apply operation to subtask issue types, if actual issue is a subtask.
- `failWhenNoIssues` (bool, optional): Fail the action if no issues are found.
- issues (string): Comma-separated list of Jira issues (e.g., "PROJ-1,PROJ-2").
- prTitleRegex (string, optional): Regex to match PR titles for issue validation.

### Environment Variables - Github related

- `GITHUB_REPOSITORY`: The repository in the format `owner/repo` (automatically set by GitHub Actions).
- `GITHUB_TOKEN`: The token used for GitHub API authentication (automatically set by GitHub Actions).

### Environment Variables - Jira related

- `ATLASSIAN_API_BASE_URL`: Base URL for Atlassian API (default: `https://mycompany.atlassian.com`).
- `ATLASSIAN_API_USERNAME`: Username for Atlassian API authentication (optional).
- `ATLASSIAN_API_TOKEN`: Token for Atlassian API authentication (optional).

### Environment Variables - AI related

- `OPENAI_API_KEY`: OpenAI API key for AI-related operations (optional).

### Jira Commands

| Subcommand          | Arguments                                                                                                                                      | Description                                           | Example                                                                                                     | Outputs |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------- |
| `add-comment`       | `issues` (string), `comment` (string), `applyToParent` (bool, optional), `applyToSubtasks` (bool, optional)                                    | Add comment to Jira issues.                           | `args: '{ "issues": "PROJ-1,PROJ-2", "comment": "Deployed to staging." }'`                                  | None    |
| `update-status`     | `issues` (string), `targetStatus` (string), `comment` (string, optional), `applyToParent` (bool, optional), `applyToSubtasks` (bool, optional) | Update Jira issue status and add an optional comment. | `args: '{ "issues": "PROJ-123", "targetStatus": "Done", "comment": "Automatically transitioned via CI." }'` | None    |
| `assign-to-release` | `issues` (string), `version` (string), `applyToParent` (bool, optional), `applyToSubtasks` (bool, optional)                                    | Assign Jira issues to a release version.              | `args: '{ "issues": "PROJ-1,PROJ-2", "version": "1.0.0" }'`                                                 | None    |
| `update-labels`     | `issues` (string), `labelsToAdd` (string), `labelsToRemove` (string), `applyToParent` (bool, optional), `applyToSubtasks` (bool, optional)     | Add/remove labels on Jira issues.                     | `args: '{ "issues": "PROJ-1", "labelsToAdd": "qa,prod", "labelsToRemove": "wip" }'`                         | None    |

### GitHub Commands

| Subcommand      | Arguments                                                                                                                                                                            | Description                                            | Example                                                                                                                        | Outputs                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `pr-commenter`  | `issues` (string), `prNumber` (string), `prTitleRegex` (string, optional), `failWhenNoIssues` (bool, optional), `applyToParent` (bool, optional), `applyToSubtasks` (bool, optional) | Validate Jira issues on a PR and synchronize comments. | `args: '{ "issues": "PROJ-456", "prNumber": "${{ github.event.pull_request.number }}", "failWhenNoIssues": true }'`            | None                                                                                                                         |
| `get-diff-data` | `prNumber` (string), `issuePattern` (string, optional), `dataSeparator` (string, optional)                                                                                           | Extract commit messages, files, and referenced issues. | `args: '{ "prNumber": "${{ github.event.pull_request.number }}", "issuePattern": "\\bFXDX-\\d+\\b", "dataSeparator": "\\n" }'` | `commit-messages`, `files`, `issues`                                                                                         |
| `commit-info`   | `sha` (string), `repo` (string, optional)                                                                                                                                            | Get detailed information about a specific commit.      | `args: '{ "sha": "abc123def456", "repo": "owner/repo" }'`                                                                      | `message`, `author-name`, `author-email`, `author-date`, `committer-name`, `committer-email`, `committer-date`, `sha`, `url` |

### Version Commands

| Subcommand | Arguments          | Description                                           | Example                               | Outputs                          |
| ---------- | ------------------ | ----------------------------------------------------- | ------------------------------------- | -------------------------------- |
| `parse`    | `version` (string) | Parse and output the major, minor, patch, pre fields. | `args: '{ "version": "1.2.3-beta" }'` | `major`, `minor`, `patch`, `pre` |

### Text Commands

| Subcommand   | Arguments                                                                     | Description                                                    | Example                                                                          | Outputs  |
| ------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------- |
| `get-issues` | `text` (string), `issuePattern` (string), `failWhenNoIssues` (bool, optional) | Extract issue references from text using a regular expression. | `args: '{ "text": "Fix PROJ-123 and PROJ-456", "issuePattern": "[A-Z]+-\\d+" }'` | `issues` |

### Slack Commands

| Subcommand         | Arguments                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Description                                                                                             | Example                                                                                                                                                                         | Outputs                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `e2e-notification` | `testName` (string), `testResult` (string), `totalTests` (number), `botToken` (string), `channel` (string), `alertChannel` (string, optional), `testResultUrl` (string, optional), `dockerImage` (string, optional), `testFramework` (string, optional), `branch` (string, optional), `commitMessage` (string, optional), `author` (string, optional), `repository` (string, optional), `version` (string, optional), `buildUrl` (string, optional), `buildNumber` (string, optional), `sourceUrl` (string, optional), `slackChannel` (string, optional), `slackAlertChannel` (string, optional) | Send formatted E2E test results to a Slack channel via Slack App authentication. Supports different channels for alerts. | `args: '{ "testName": "E2E Tests", "testResult": "pass", "totalTests": 25, "botToken": "${{ secrets.SLACK_BOT_TOKEN }}", "channel": "qa-notifications", "alertChannel": "qa-alerts" }'` | `notification-sent`, `test-result` |

---

## Usage

Add this action to your workflow:

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@v4

  - name: Run DevOps Agent
    uses: flexydox/fxdx-devops-agent@v1
    with:
      command: <command>
      subcommand: <subcommand>
      args: '{ "key": "value", ... }' # JSON string with arguments for the operation
```

- **command**: One of `jira`, `github`, `version`, `text`, `slack`
- **subcommand**: See table above
- **args**: JSON string with arguments for the command/subcommand

---

## Examples

> **Note**: Before using these examples, make sure to add the required environment variables as repository secrets in your GitHub repository settings:
>
> - `ATLASSIAN_API_BASE_URL`: Your Atlassian domain (e.g., `https://your-company.atlassian.net`)
> - `ATLASSIAN_API_USERNAME`: Your Atlassian username or email
> - `ATLASSIAN_API_TOKEN`: Your Atlassian API token (generate from account settings)
> - `OPENAI_API_KEY`: Your OpenAI API key (only if using AI features)

### Add a comment to Jira issues

```yaml
- name: Add Jira comment
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: add-comment
    args: '{ "issues": "PROJ-1,PROJ-2", "comment": "Deployed to staging." }'
```

### Update Jira status for issues

```yaml
- name: Update Jira status
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: update-status
    args: '{ "issues": "PROJ-123", "targetStatus": "Done", "comment": "Automatically transitioned via CI." }'
```

### Validate PR with Jira issues and comment

```yaml
- name: PR Jira Validator
  id: pr-jira-validator
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    command: github
    subcommand: pr-commenter
    args: '{ "issues": "PROJ-456", "prNumber": "${{ github.event.pull_request.number }}", "failWhenNoIssues": true }'
- name: Echo PR Jira Validator outputs
  run: |
    echo "Commented: ${{ steps.pr-jira-validator.outputs.commented }}"
    echo "Issues Found: ${{ steps.pr-jira-validator.outputs.issuesFound }}"
```

### Get PR diff data

```yaml
- name: Get PR Diff Data
  id: pr-diff
  uses: flexydox/fxdx-devops-agent@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    command: github
    subcommand: get-diff-data
    args: '{ "prNumber": "${{ github.event.pull_request.number }}" }'
- name: Echo PR Diff Data outputs
  run: |
    echo "Commit Messages: ${{ steps.pr-diff.outputs.commit-messages }}"
    echo "Files: ${{ steps.pr-diff.outputs.files }}"
    echo "Issues: ${{ steps.pr-diff.outputs.issues }}"
```

### Parse a version string

```yaml
- name: Parse version
  id: parse-version
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: parse
    args: '{ "version": "1.2.3-beta" }'
- name: Echo version outputs
  run: |
    echo "Major: ${{ steps.parse-version.outputs.major }}"
    echo "Minor: ${{ steps.parse-version.outputs.minor }}"
    echo "Patch: ${{ steps.parse-version.outputs.patch }}"
    echo "Pre-release: ${{ steps.parse-version.outputs.pre }}"
```

### Extract issues from text

```yaml
- name: Extract issues from text
  id: extract-issues
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: text
    subcommand: get-issues
    args: '{ "text": "Fixed PROJ-123 and resolved PROJ-456 issues", "issuePattern": "[A-Z]+-\\d+", "failWhenNoIssues": false }'
- name: Echo extracted issues
  run: |
    echo "Found issues: ${{ steps.extract-issues.outputs.issues }}"
```

### Get commit information

```yaml
- name: Get commit info
  id: commit-info
  uses: flexydox/fxdx-devops-agent@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITHUB_REPOSITORY: ${{ github.repository }} # Optional, defaults to current repo
  with:
    command: github
    subcommand: commit-info
    args: '{ "sha": "${{ github.sha }}" }'
- name: Echo commit outputs
  run: |
    echo "Message: ${{ steps.commit-info.outputs.message }}"
    echo "Author: ${{ steps.commit-info.outputs.author-name }} <${{ steps.commit-info.outputs.author-email }}>"
    echo "Author Date: ${{ steps.commit-info.outputs.author-date }}"
    echo "Committer: ${{ steps.commit-info.outputs.committer-name }} <${{ steps.commit-info.outputs.committer-email }}>"
    echo "Committer Date: ${{ steps.commit-info.outputs.committer-date }}"
    echo "SHA: ${{ steps.commit-info.outputs.sha }}"
    echo "URL: ${{ steps.commit-info.outputs.url }}"
```

### Assign Jira issues to a release

```yaml
- name: Assign to release
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: assign-to-release
    args: '{ "issues": "PROJ-1,PROJ-2", "version": "v1.2.0" }'
```

### Update Jira issue labels

```yaml
- name: Update issue labels
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: update-labels
    args: '{ "issues": "PROJ-123", "labelsToAdd": "qa-approved,ready-for-prod", "labelsToRemove": "in-progress,needs-review" }'
```

### Complete workflow example

```yaml
name: DevOps Workflow
on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches: [main]

jobs:
  validate-and-process:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Extract issues from PR
      - name: Get PR data
        id: pr-data
        uses: flexydox/fxdx-devops-agent@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          command: github
          subcommand: get-diff-data
          args: '{ "prNumber": "${{ github.event.pull_request.number }}", "issuePattern": "[A-Z]+-\\d+" }'

      # Alternative: Extract issues from commit message or PR title
      - name: Extract issues from commit message
        id: commit-issues
        uses: flexydox/fxdx-devops-agent@v1
        with:
          command: text
          subcommand: get-issues
          args: '{ "text": "${{ github.event.head_commit.message }}", "issuePattern": "[A-Z]+-\\d+", "failWhenNoIssues": false }'

      # Validate PR with Jira issues
      - name: Validate PR
        if: github.event_name == 'pull_request'
        uses: flexydox/fxdx-devops-agent@v1
        env:
          ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
          ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
          ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          command: github
          subcommand: pr-commenter
          args: '{ "issues": "${{ steps.pr-data.outputs.issues }}", "prNumber": "${{ github.event.pull_request.number }}", "failWhenNoIssues": true }'

      # On merge to main, update Jira issues
      - name: Update issue status
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: flexydox/fxdx-devops-agent@v1
        env:
          ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
          ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
          ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
        with:
          command: jira
          subcommand: update-status
          args: '{ "issues": "${{ steps.pr-data.outputs.issues }}", "targetStatus": "Done", "comment": "Merged to main branch" }'
```

### Send Slack notification for E2E test results

```yaml
- name: Send E2E test notification to Slack
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: slack
    subcommand: e2e-notification
    args: '{
      "testName": "E2E Integration Tests",
      "testResult": "pass",
      "totalTests": 25,
      "testResultUrl": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
      "dockerImage": "my-app:${{ github.sha }}",
      "testFramework": "Playwright",
      "branch": "${{ github.ref_name }}",
      "commitMessage": "${{ github.event.head_commit.message }}",
      "author": "${{ github.actor }}",
      "repository": "${{ github.repository }}",
      "version": "${{ github.ref_name }}",
      "buildUrl": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
      "buildNumber": "${{ github.run_number }}",
      "sourceUrl": "https://github.com/${{ github.repository }}/commit/${{ github.sha }}",
      "slackChannel": "qa-notifications",
      "slackAlertChannel": "qa-alerts",
      "botToken": "${{ secrets.SLACK_BOT_TOKEN }}",
      "channel": "qa-notifications",
      "alertChannel": "qa-alerts"
    }'
```

**Slack App Authentication:**

- Uses Slack App Bot tokens instead of webhooks for authentication
- Requires a Slack App with `chat:write` permission
- Supports sending to specific channels based on test results:
  - Success: Uses the `channel` parameter
  - Failure: Uses the `alertChannel` parameter (if provided), otherwise falls back to the main channel
- `slackChannel` and `slackAlertChannel` are display-only fields shown in the notification message

---

## Development

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Build**
   ```bash
   npm run bundle
   ```
3. **Test**
   ```bash
   npm test
   ```

For local testing, see `.env.example` and use [`@github/local-action`](https://github.com/github/local-action).

---

## License

MIT
