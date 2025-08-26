# DevOps Agent ![Marketplace](https://img.shields.io/badge/Marketplace-GitHub%20Actions-blue?logo=github) ![License](https://img.shields.io/github/license/flexydox/fxdx-devops-agent)

A powerful GitHub Action for automating your development workflow with Jira, GitHub, and versioning operations. Supports advanced PR validation, Jira issue management, and more.

## Overview

The DevOps Agent provides the following commands with their respective subcommands:

### `jira` - Jira Issue Management

- `add-comment` - Add comment to Jira issues
- `update-status` - Update Jira issue status with optional comment  
- `assign-to-release` - Assign Jira issues to a release version
- `update-labels` - Add/remove labels on Jira issues

| Subcommand | Description | Arguments | Outputs |
|------------|-------------|-----------|---------|
| `add-comment` | Add comment to Jira issues | `issues`, `comment`, `applyToParent`, `applyToSubtasks` | None |
| `update-status` | Update Jira issue status with optional comment | `issues`, `targetStatus`, `comment`, `applyToParent`, `applyToSubtasks` | None |
| `assign-to-release` | Assign Jira issues to a release version | `issues`, `version`, `applyToParent`, `applyToSubtasks` | None |
| `update-labels` | Add/remove labels on Jira issues | `issues`, `labelsToAdd`, `labelsToRemove`, `applyToParent`, `applyToSubtasks` | None |### `github` - GitHub Operations

- `pr-commenter` - Validate Jira issues on a PR and synchronize comments
- `get-diff-data` - Extract commit messages, files, and referenced issues from PR
- `commit-info` - Get detailed information about a specific commit

| Subcommand | Description | Arguments | Outputs |
|------------|-------------|-----------|---------|
| `pr-commenter` | Validate Jira issues on a PR and synchronize comments | `issues`, `prNumber`, `prTitleRegex`, `failWhenNoIssues`, `applyToParent`, `applyToSubtasks` | `commented`, `issuesFound` |
| `get-diff-data` | Extract commit messages, files, and referenced issues from PR | `prNumber`, `issuePattern`, `dataSeparator` | `commit-messages`, `files`, `issues` |
| `commit-info` | Get detailed information about a specific commit | `sha`, `repo` | `message`, `author-name`, `author-email`, `author-date`, `committer-name`, `committer-email`, `committer-date`, `sha`, `url` |

### `version` - Version Management

- `parse` - Parse and output semantic version components
- `create-date-version` - Create a date-based version string
- `extract` - Extract version from JSON/YAML files
- `update` - Update version in JSON/YAML files

| Subcommand | Description | Arguments | Outputs |
|------------|-------------|-----------|---------|
| `parse` | Parse and output semantic version components | `version` | `major`, `minor`, `patch`, `build`, `pre` |
| `create-date-version` | Create a date-based version string | None | `version`, `timeOfDay`, `year`, `month`, `day` |
| `extract` | Extract version from JSON/YAML files | `versionFile`, `versionAttribute` | `rawVersion`, `major`, `minor`, `patch`, `build`, `pre` |
| `update` | Update version in JSON/YAML files | `version`, `versionFile`, `versionAttribute` | None |

### `text` - Text Processing

- `get-issues` - Extract issue references from text using regex

| Subcommand | Description | Arguments | Outputs |
|------------|-------------|-----------|---------|
| `get-issues` | Extract issue references from text using regex | `text`, `issuePattern`, `failWhenNoIssues` | `issues` |

### `slack` - Slack Notifications

- `e2e-notification` - Send formatted E2E test results to Slack channels
- `alert` - Send custom alert messages to Slack channels

| Subcommand | Description | Arguments | Outputs |
|------------|-------------|-----------|---------|
| `e2e-notification` | Send formatted E2E test results to Slack channels | `testName`, `testResult`, `totalTests`, `botToken`, `channel`, `alertChannel`, `testResultUrl`, `dockerImage`, `testFramework`, `branch`, `commitMessage`, `author`, `repository`, `version`, `buildUrl`, `buildNumber`, `sourceUrl` | `notification-sent`, `test-result` |
| `alert` | Send custom alert messages to Slack channels | `slackChannel`, `title`, `message` | `notification-sent` |

## Environment Variables

### GitHub Related

- `GITHUB_REPOSITORY`: The repository in the format `owner/repo` (automatically set by GitHub Actions).
- `GITHUB_TOKEN`: The token used for GitHub API authentication (automatically set by GitHub Actions).
  - **Required for**: All GitHub commands (`github` command group)
  - **Default**: Automatically provided by GitHub Actions runtime

### Jira Related

- `ATLASSIAN_API_BASE_URL`: Base URL for Atlassian API (e.g., `https://your-domain.atlassian.net`).
  - **Required for**: All Jira commands (`jira` command group)
- `ATLASSIAN_API_USERNAME`: Username/email for Atlassian API authentication.
  - **Required for**: All Jira commands (`jira` command group)
- `ATLASSIAN_API_TOKEN`: API token for Atlassian API authentication.
  - **Required for**: All Jira commands (`jira` command group)
  - **How to get**: Generate from your Atlassian account settings

### AI Related

- `OPENAI_API_KEY`: OpenAI API key for AI-powered issue validation.
  - **Required for**: `github pr-commenter` command when using AI validation
  - **Optional**: Not needed for basic GitHub or Jira operations

### Slack Related

- `SLACK_BOT_TOKEN`: Slack bot token for sending notifications.
  - **Required for**: `slack` command group
  - **How to get**: Create a Slack app and install it to your workspace

---

## Table of Contents

- [Features](#features)
- [Overview](#overview)
- [Commands](#commands)
- [Usage](#usage)
- [Examples](#examples)
- [Development](#development)
- [License](#license)

---

## Features

- 🎯 Validate and synchronize Jira issues on PRs
- 🔄 Update Jira issue status, labels, comments, and releases from workflows
- 📦 Parse semantic versions, extract/update versions from files, and create date-based versions
- 📊 Extract commit data from PRs and manage version file updates
- 💬 Send Slack notifications for E2E test results
- 🔧 Modular command/subcommand structure for extensibility

---

## Commands

### Common Arguments

The following arguments are commonly used across multiple commands:

- `applyToParent` (boolean, optional)
  - Apply operation to parent issues, if actual issue is a subtask

- `applyToSubtasks` (boolean, optional)
  - Apply operation to subtask issue types, if actual issue is a subtask

- `failWhenNoIssues` (boolean, optional)
  - Fail the action if no issues are found

- `issues` (string, required)
  - Comma-separated list of Jira issues (e.g., "PROJ-1,PROJ-2")

- `prTitleRegex` (string, optional)
  - Regex pattern to match PR titles for issue validation

## Jira Commands

### `add-comment`

Add comment to Jira issues with optional parent/subtask handling.

**Arguments:**

- `issues` (string, required)
  - Comma-separated list of Jira issue keys
- `comment` (string, required)
  - Comment text to add to the issues
- `applyToParent` (boolean, optional)
  - Apply operation to parent issues
- `applyToSubtasks` (boolean, optional)
  - Apply operation to subtask issues

**Usage Example:**

```yaml
- name: Add Jira comment
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: jira
    subcommand: add-comment
    args: |
      {
        "issues": "PROJ-1,PROJ-2",
        "comment": "Deployed to staging."
      }
```

### `update-status`

Update Jira issue status and add an optional comment.

**Arguments:**

- `issues` (string, required)
  - Comma-separated list of Jira issue keys
- `targetStatus` (string, required)
  - Target status to transition issues to
- `comment` (string, optional)
  - Optional comment to add during transition
- `applyToParent` (boolean, optional)
  - Apply operation to parent issues
- `applyToSubtasks` (boolean, optional)
  - Apply operation to subtask issues

**Usage Example:**

```yaml
- name: Update Jira status
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: jira
    subcommand: update-status
    args: |
      {
        "issues": "PROJ-123",
        "targetStatus": "Done",
        "comment": "Automatically transitioned via CI."
      }
```

### `assign-to-release`

Assign Jira issues to a release version.

**Arguments:**

- `issues` (string, required)
  - Comma-separated list of Jira issue keys
- `version` (string, required)
  - Release version to assign issues to
- `applyToParent` (boolean, optional)
  - Apply operation to parent issues
- `applyToSubtasks` (boolean, optional)
  - Apply operation to subtask issues

**Usage Example:**

```yaml
- name: Assign to release
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: jira
    subcommand: assign-to-release
    args: |
      {
        "issues": "PROJ-1,PROJ-2",
        "version": "1.0.0"
      }
```

### `update-labels`

Add/remove labels on Jira issues.

**Arguments:**

- `issues` (string, required)
  - Comma-separated list of Jira issue keys
- `labelsToAdd` (string, optional)
  - Comma-separated list of labels to add
- `labelsToRemove` (string, optional)
  - Comma-separated list of labels to remove
- `applyToParent` (boolean, optional)
  - Apply operation to parent issues
- `applyToSubtasks` (boolean, optional)
  - Apply operation to subtask issues

**Usage Example:**

```yaml
- name: Update issue labels
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: jira
    subcommand: update-labels
    args: |
      {
        "issues": "PROJ-1",
        "labelsToAdd": "qa,prod",
        "labelsToRemove": "wip"
      }
```

## GitHub Commands

### `pr-commenter`

Validate Jira issues on a PR and synchronize comments.

**Arguments:**

- `issues` (string, required)
  - Comma-separated list of Jira issue keys
- `prNumber` (string, required)
  - Pull request number
- `prTitleRegex` (string, optional)
  - Regex pattern to match PR titles
- `failWhenNoIssues` (boolean, optional)
  - Fail the action if no issues are found
- `applyToParent` (boolean, optional)
  - Apply operation to parent issues
- `applyToSubtasks` (boolean, optional)
  - Apply operation to subtask issues

**Usage Example:**

```yaml
- name: PR Jira Validator
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: github
    subcommand: pr-commenter
    args: |
      {
        "issues": "PROJ-456",
        "prNumber": "${{ github.event.pull_request.number }}",
        "failWhenNoIssues": true
      }
```

### `get-diff-data`

Extract commit messages, files, and referenced issues from PR.

**Arguments:**

- `prNumber` (string, required)
  - Pull request number
- `issuePattern` (string, optional)
  - Regex pattern to extract issue references
- `dataSeparator` (string, optional)
  - Separator for output data

**Outputs:**

- `commit-messages` - Extracted commit messages
- `files` - Changed files
- `issues` - Found issue references

**Usage Example:**

```yaml
- name: Get PR Diff Data
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: github
    subcommand: get-diff-data
    args: |
      {
        "prNumber": "${{ github.event.pull_request.number }}",
        "issuePattern": "\\bFXDX-\\d+\\b",
        "dataSeparator": "\\n"
      }
```

### `commit-info`

Get detailed information about a specific commit.

**Arguments:**

- `sha` (string, required)
  - Git commit SHA
- `repo` (string, optional)
  - Repository in format "owner/repo"

**Outputs:**

- `message` - Commit message
- `author-name` - Author name
- `author-email` - Author email
- `author-date` - Author date
- `committer-name` - Committer name
- `committer-email` - Committer email
- `committer-date` - Committer date
- `sha` - Commit SHA
- `url` - Commit URL

**Usage Example:**

```yaml
- name: Get commit info
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: github
    subcommand: commit-info
    args: |
      {
        "sha": "abc123def456",
        "repo": "owner/repo"
      }
```

## Version Commands

### `parse`

Parse and output semantic version components.

**Arguments:**

- `version` (string, required)
  - Version string to parse

**Outputs:**

- `major` - Major version number
- `minor` - Minor version number
- `patch` - Patch version number
- `build` - Build metadata
- `pre` - Pre-release identifier

**Usage Example:**

```yaml
- name: Parse version
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: parse
    args: |
      {
        "version": "1.2.3-beta"
      }
```

### `create-date-version`

Create a date-based version string with time-of-day code (format: YYMMDDXXX).

**Arguments:**

- No arguments required

**Outputs:**

- `version` - Generated date version
- `timeOfDay` - Time of day code
- `year` - Year component
- `month` - Month component
- `day` - Day component

**Usage Example:**

```yaml
- name: Create date version
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: create-date-version
    args: |
      {}
```

### `extract`

Extract and parse version from JSON/YAML files using dot notation for nested attributes.

**Arguments:**

- `versionFile` (string, required)
  - Path to file containing version
- `versionAttribute` (string, optional, default: "version")
  - Attribute path using dot notation

**Outputs:**

- `rawVersion` - Raw version string
- `major` - Major version number
- `minor` - Minor version number
- `patch` - Patch version number
- `build` - Build metadata
- `pre` - Pre-release identifier

**Usage Example:**

```yaml
- name: Extract version from package.json
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: extract
    args: |
      {
        "versionFile": "package.json",
        "versionAttribute": "version"
      }
```

### `update`

Update version in JSON/YAML files. Supports nested attributes with dot notation.

**Arguments:**

- `version` (string, required)
  - New version to set
- `versionFile` (string, required)
  - Path to file to update
- `versionAttribute` (string, optional, default: "version")
  - Attribute path using dot notation

**Usage Example:**

```yaml
- name: Update version in package.json
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: update
    args: |
      {
        "version": "1.2.3",
        "versionFile": "package.json",
        "versionAttribute": "version"
      }
```

## Text Commands

### `get-issues`

Extract issue references from text using a regular expression.

**Arguments:**

- `text` (string, required)
  - Text to extract issues from
- `issuePattern` (string, required)
  - Regex pattern to match issue references
- `failWhenNoIssues` (boolean, optional)
  - Fail the action if no issues are found

**Outputs:**

- `issues` - Found issue references

**Usage Example:**

```yaml
- name: Extract issues from text
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: text
    subcommand: get-issues
    args: |
      {
        "text": "Fix PROJ-123 and PROJ-456",
        "issuePattern": "[A-Z]+-\\d+"
      }
```

## Slack Commands

### `e2e-notification`

Send formatted E2E test results to a Slack channel via Slack App authentication. Supports different channels for alerts.

**Arguments:**

- `testName` (string, required)
  - Name of the test suite
- `testResult` (string, required)
  - Test result: "pass" or "fail"
- `totalTests` (number, required)
  - Total number of tests executed
- `botToken` (string, required)
  - Slack bot token
- `channel` (string, required)
  - Slack channel for success notifications
- `alertChannel` (string, optional)
  - Slack channel for failure notifications
- `testResultUrl` (string, optional)
  - URL to test results
- `dockerImage` (string, optional)
  - Docker image used for testing
- `testFramework` (string, optional)
  - Testing framework name
- `branch` (string, optional)
  - Git branch name
- `commitMessage` (string, optional)
  - Git commit message
- `author` (string, optional)
  - Commit author
- `repository` (string, optional)
  - Repository name
- `version` (string, optional)
  - Application version
- `buildUrl` (string, optional)
  - Build URL
- `buildNumber` (string, optional)
  - Build number
- `sourceUrl` (string, optional)
  - Source code URL

**Outputs:**

- `notification-sent` - Whether notification was sent
- `test-result` - Test result status

**Usage Example:**

````yaml
**Usage Example:**
```yaml
- name: Send E2E notification
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: slack
    subcommand: e2e-notification
    args: |
      {
        "testName": "E2E Tests",
        "testResult": "pass",
        "totalTests": 25,
        "botToken": "${{ secrets.SLACK_BOT_TOKEN }}",
        "channel": "qa-notifications",
        "alertChannel": "qa-alerts"
      }
````

### `alert`

Send custom alert messages to Slack channels with configurable title and message content.

**Arguments:**

- `slackChannel` (string, required)
  - Target Slack channel name or ID
- `title` (string, required)
  - Alert title/header message
- `message` (string, required)
  - Main alert message content (supports Slack markdown formatting)

**Outputs:**

- `notification-sent` - Whether notification was sent successfully

**Usage Example:**

```yaml
- name: Send custom alert
  uses: flexydox/fxdx-devops-agent@v1
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
  with:
    command: slack
    subcommand: alert
    args: |
      {
        "slackChannel": "alerts",
        "title": ":warning: Deployment Alert",
        "message": "Production deployment has *failed* on branch `main`. Please check the logs."
      }
```

````

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
      args: |
        {
          "key": "value"
        }
````

**Parameters:**

- **command** (string, required): One of `jira`, `github`, `version`, `text`, `slack`
- **subcommand** (string, required): See command documentation above for available subcommands
- **args** (string, required): JSON string with arguments for the command/subcommand

---

## Examples

> **Note**: Before using these examples, make sure to add the required environment variables as repository secrets in your GitHub repository settings:
>
> - `ATLASSIAN_API_BASE_URL`: Your Atlassian domain (e.g., `https://your-company.atlassian.net`)
> - `ATLASSIAN_API_USERNAME`: Your Atlassian username or email
> - `ATLASSIAN_API_TOKEN`: Your Atlassian API token (generate from account settings)
> - `OPENAI_API_KEY`: Your OpenAI API key (only if using AI features)
> - `SLACK_BOT_TOKEN`: Your Slack bot token (only if using Slack features)

### Jira Command Examples

#### Add Comment (`jira add-comment`)

Add comments to Jira issues with optional parent/subtask handling:

```yaml
# Basic comment addition
- name: Add Jira comment
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: add-comment
    args: |
      {
        "issues": "PROJ-1,PROJ-2",
        "comment": "Deployed to staging environment."
      }

# Comment with parent/subtask handling
- name: Add comment to parent issues
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: add-comment
    args: |
      {
        "issues": "PROJ-123",
        "comment": "All subtasks completed successfully.",
        "applyToParent": true,
        "applyToSubtasks": false
      }
```

#### Update Status (`jira update-status`)

Update Jira issue status with optional comments:

```yaml
# Basic status update
- name: Update Jira status
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: update-status
    args: |
      {
        "issues": "PROJ-123",
        "targetStatus": "Done",
        "comment": "Automatically transitioned via CI."
      }

# Status update with parent handling
- name: Update status for parent and subtasks
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: update-status
    args: |
      {
        "issues": "PROJ-456",
        "targetStatus": "In Testing",
        "comment": "Ready for QA testing",
        "applyToParent": true,
        "applyToSubtasks": true
      }
```

#### Assign to Release (`jira assign-to-release`)

Assign Jira issues to specific release versions:

```yaml
# Basic release assignment
- name: Assign to release
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: assign-to-release
    args: |
      {
        "issues": "PROJ-1,PROJ-2",
        "version": "v1.2.0"
      }

# Release assignment with dynamic version
- name: Assign to dynamic release version
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: assign-to-release
    args: |
      {
        "issues": "PROJ-789",
        "version": "${{ github.ref_name }}",
        "applyToParent": false,
        "applyToSubtasks": true
      }
```

#### Update Labels (`jira update-labels`)

Add or remove labels from Jira issues:

```yaml
# Basic label update
- name: Update issue labels
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: update-labels
    args: |
      {
        "issues": "PROJ-123",
        "labelsToAdd": "qa-approved,ready-for-prod",
        "labelsToRemove": "in-progress,needs-review"
      }

# Environment-specific label management
- name: Add production labels
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: update-labels
    args: |
      {
        "issues": "PROJ-456,PROJ-789",
        "labelsToAdd": "production,hotfix",
        "labelsToRemove": "staging,dev",
        "applyToParent": true
      }
```

### GitHub Command Examples

#### PR Commenter (`github pr-commenter`)

Validate Jira issues on PRs and synchronize comments:

```yaml
# Basic PR validation
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
    args: |
      {
        "issues": "PROJ-456",
        "prNumber": "${{ github.event.pull_request.number }}",
        "failWhenNoIssues": true
      }

# PR validation with regex pattern
- name: Validate PR with title pattern
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    command: github
    subcommand: pr-commenter
    args: |
      {
        "issues": "PROJ-123,PROJ-456",
        "prNumber": "${{ github.event.pull_request.number }}",
        "prTitleRegex": "^(feat|fix|docs|style|refactor|test|chore):",
        "failWhenNoIssues": false,
        "applyToParent": true
      }

- name: Echo PR validation results
  run: |
    echo "Commented: ${{ steps.pr-jira-validator.outputs.commented }}"
    echo "Issues Found: ${{ steps.pr-jira-validator.outputs.issuesFound }}"
```

#### Get Diff Data (`github get-diff-data`)

Extract commit messages, files, and issues from PR:

```yaml
# Basic PR diff extraction
- name: Get PR Diff Data
  id: pr-diff
  uses: flexydox/fxdx-devops-agent@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    command: github
    subcommand: get-diff-data
    args: |
      {
        "prNumber": "${{ github.event.pull_request.number }}"
      }

# Advanced diff extraction with custom patterns
- name: Extract PR data with custom issue pattern
  id: pr-diff-advanced
  uses: flexydox/fxdx-devops-agent@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    command: github
    subcommand: get-diff-data
    args: |
      {
        "prNumber": "${{ github.event.pull_request.number }}",
        "issuePattern": "\\b(PROJ|TASK|BUG)-\\d+\\b",
        "dataSeparator": " | "
      }

- name: Echo PR diff data
  run: |
    echo "Commit Messages: ${{ steps.pr-diff.outputs.commit-messages }}"
    echo "Files Changed: ${{ steps.pr-diff.outputs.files }}"
    echo "Issues Found: ${{ steps.pr-diff.outputs.issues }}"
```

#### Commit Info (`github commit-info`)

Get detailed information about specific commits:

```yaml
# Get current commit info
- name: Get commit info
  id: commit-info
  uses: flexydox/fxdx-devops-agent@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    command: github
    subcommand: commit-info
    args: |
      {
        "sha": "${{ github.sha }}"
      }

# Get commit info from different repository
- name: Get external commit info
  id: external-commit
  uses: flexydox/fxdx-devops-agent@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    command: github
    subcommand: commit-info
    args: |
      {
        "sha": "abc123def456",
        "repo": "owner/repository-name"
      }

- name: Echo commit information
  run: |
    echo "Message: ${{ steps.commit-info.outputs.message }}"
    echo "Author: ${{ steps.commit-info.outputs.author-name }} <${{ steps.commit-info.outputs.author-email }}>"
    echo "Author Date: ${{ steps.commit-info.outputs.author-date }}"
    echo "Committer: ${{ steps.commit-info.outputs.committer-name }} <${{ steps.commit-info.outputs.committer-email }}>"
    echo "Committer Date: ${{ steps.commit-info.outputs.committer-date }}"
    echo "SHA: ${{ steps.commit-info.outputs.sha }}"
    echo "URL: ${{ steps.commit-info.outputs.url }}"
```

## Version Command Examples

#### Parse Version (`version parse`)

Parse semantic version strings:

```yaml
# Basic version parsing
- name: Parse version
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: parse
    args: |
      {
        "version": "1.2.3-beta"
      }

# Parse complex version with build metadata
- name: Parse complex version
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: parse
    args: |
      {
        "version": "2.1.0-rc.1+build.123"
      }

- name: Echo version components
  run: |
    echo "Major: ${{ steps.parse-version.outputs.major }}"
    echo "Minor: ${{ steps.parse-version.outputs.minor }}"
    echo "Patch: ${{ steps.parse-version.outputs.patch }}"
    echo "Build: ${{ steps.parse-version.outputs.build }}"
    echo "Pre-release: ${{ steps.parse-version.outputs.pre }}"
```

#### Create Date Version (`version create-date-version`)

Generate date-based version strings:

```yaml
# Create date-based version
- name: Create date version
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: create-date-version
    args: |
      {}

- name: Use date version in deployment
  run: |
    echo "Generated Version: ${{ steps.create-date-version.outputs.version }}"
    echo "Time of Day Code: ${{ steps.create-date-version.outputs.timeOfDay }}"
    echo "Year: ${{ steps.create-date-version.outputs.year }}"
    echo "Month: ${{ steps.create-date-version.outputs.month }}"
    echo "Day: ${{ steps.create-date-version.outputs.day }}"

    # Use in Docker tag
    docker build -t myapp:${{ steps.create-date-version.outputs.version }} .
```

#### Extract Version (`version extract`)

Extract versions from files:

```yaml
# Extract from package.json
- name: Extract version from package.json
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: extract
    args: |
      {
        "versionFile": "package.json",
        "versionAttribute": "version"
      }

# Extract from nested YAML (Helm chart)
- name: Extract version from Helm chart
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: extract
    args: |
      {
        "versionFile": "Chart.yaml",
        "versionAttribute": "appVersion"
      }

# Extract from custom JSON structure
- name: Extract API version
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: extract
    args: |
      {
        "versionFile": "api-config.json",
        "versionAttribute": "api.v1.version"
      }

- name: Echo extracted versions
  run: |
    echo "Package Version: ${{ steps.extract-version.outputs.rawVersion }}"
    echo "Helm App Version: ${{ steps.extract-helm-version.outputs.rawVersion }}"
    echo "API Version: ${{ steps.extract-api-version.outputs.rawVersion }}"
```

#### Update Version (`version update`)

Update versions in files:

```yaml
# Update package.json version
- name: Update version in package.json
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: update
    args: |
      {
        "version": "1.2.4",
        "versionFile": "package.json",
        "versionAttribute": "version"
      }

# Update Docker image version in values.yaml
- name: Update Docker image version
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: update
    args: |
      {
        "version": "${{ steps.extract-version.outputs.rawVersion }}",
        "versionFile": "helm/values.yaml",
        "versionAttribute": "image.tag"
      }

# Update multiple version files
- name: Update API version
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: version
    subcommand: update
    args: |
      {
        "version": "2.1.0",
        "versionFile": "swagger.yaml",
        "versionAttribute": "info.version"
      }
```

## Text Command Examples

#### Get Issues (`text get-issues`)

Extract issue references from text:

```yaml
# Extract issues from commit message
- name: Extract issues from commit message
  id: extract-issues
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: text
    subcommand: get-issues
    args: |
      {
        "text": "Fixed PROJ-123 and resolved PROJ-456 issues",
        "issuePattern": "[A-Z]+-\\d+",
        "failWhenNoIssues": false
      }

# Extract issues from PR title
- name: Extract issues from PR title
  id: extract-pr-issues
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: text
    subcommand: get-issues
    args: |
      {
        "text": "${{ github.event.pull_request.title }}",
        "issuePattern": "\\b(TASK|BUG|FEATURE)-\\d+\\b",
        "failWhenNoIssues": true
      }

# Extract issues from release notes
- name: Extract issues from release notes
  id: extract-release-issues
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: text
    subcommand: get-issues
    args: |
      {
        "text": "${{ github.event.release.body }}",
        "issuePattern": "(?:fixes?|closes?|resolves?)\\s+#?(\\w+-\\d+)",
        "failWhenNoIssues": false
      }

- name: Echo extracted issues
  run: |
    echo "Commit Issues: ${{ steps.extract-issues.outputs.issues }}"
    echo "PR Issues: ${{ steps.extract-pr-issues.outputs.issues }}"
    echo "Release Issues: ${{ steps.extract-release-issues.outputs.issues }}"
```

### Slack Command Examples

#### E2E Notification (`slack e2e-notification`)

Send comprehensive E2E test notifications:

```yaml
# Basic E2E notification (success)
- name: Send E2E success notification
  uses: flexydox/fxdx-devops-agent@v1
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
  with:
    command: slack
    subcommand: e2e-notification
    args: |
      {
        "testName": "E2E Integration Tests",
        "testResult": "pass",
        "totalTests": 25,
        "botToken": "${{ secrets.SLACK_BOT_TOKEN }}",
        "channel": "qa-notifications"
      }

# Comprehensive E2E notification with all metadata
- name: Send comprehensive E2E notification
  uses: flexydox/fxdx-devops-agent@v1
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
  with:
    command: slack
    subcommand: e2e-notification
    args: |
      {
        "testName": "Full E2E Test Suite",
        "testResult": "fail",
        "totalTests": 50,
        "botToken": "${{ secrets.SLACK_BOT_TOKEN }}",
        "channel": "qa-notifications",
        "alertChannel": "qa-alerts",
        "testResultUrl": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
        "dockerImage": "myapp:${{ github.sha }}",
        "testFramework": "Playwright",
        "branch": "${{ github.ref_name }}",
        "commitMessage": "${{ github.event.head_commit.message }}",
        "author": "${{ github.actor }}",
        "repository": "${{ github.repository }}",
        "version": "${{ steps.extract-version.outputs.rawVersion }}",
        "buildUrl": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
        "buildNumber": "${{ github.run_number }}",
        "sourceUrl": "https://github.com/${{ github.repository }}/commit/${{ github.sha }}"
      }

# Environment-specific E2E notifications
- name: Send staging E2E notification
  if: github.ref == 'refs/heads/staging'
  uses: flexydox/fxdx-devops-agent@v1
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
  with:
    command: slack
    subcommand: e2e-notification
    args: |
      {
        "testName": "Staging E2E Tests",
        "testResult": "${{ steps.e2e-tests.outcome }}",
        "totalTests": 30,
        "botToken": "${{ secrets.SLACK_BOT_TOKEN }}",
        "channel": "staging-qa",
        "alertChannel": "staging-alerts",
        "testFramework": "Cypress",
        "branch": "staging",
        "repository": "${{ github.repository }}"
      }
```

#### Alert (`slack alert`)

Send custom alert messages to Slack channels:

```yaml
# Basic alert notification
- name: Send deployment alert
  uses: flexydox/fxdx-devops-agent@v1
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
  with:
    command: slack
    subcommand: alert
    args: |
      {
        "slackChannel": "alerts",
        "title": ":warning: Deployment Alert",
        "message": "Production deployment has *failed* on branch `main`. Please check the logs."
      }

# Critical system alert
- name: Send critical system alert
  uses: flexydox/fxdx-devops-agent@v1
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
  with:
    command: slack
    subcommand: alert
    args: |
      {
        "slackChannel": "critical-alerts",
        "title": ":fire: Critical System Alert :fire:",
        "message": "Database connection failure detected in production environment. Immediate action required!"
      }

# Success notification alert
- name: Send success alert
  uses: flexydox/fxdx-devops-agent@v1
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
  with:
    command: slack
    subcommand: alert
    args: |
      {
        "slackChannel": "deployments",
        "title": ":white_check_mark: Deployment Successful",
        "message": "Application version `${{ github.ref_name }}` has been successfully deployed to production."
      }

# Conditional alert based on workflow status
- name: Send failure alert
  if: failure()
  uses: flexydox/fxdx-devops-agent@v1
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
  with:
    command: slack
    subcommand: alert
    args: |
      {
        "slackChannel": "dev-alerts",
        "title": ":x: Workflow Failed",
        "message": "Workflow *${{ github.workflow }}* failed in repository `${{ github.repository }}` on branch `${{ github.ref_name }}`."
      }
```

### Complete Workflow Example

Here's a comprehensive workflow that demonstrates multiple commands working together:

```yaml
name: DevOps Workflow with Issue Management
on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches: [main, develop]
  release:
    types: [published]

jobs:
  validate-and-process:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Step 1: Extract issues from PR or commit
      - name: Get PR data
        id: pr-data
        if: github.event_name == 'pull_request'
        uses: flexydox/fxdx-devops-agent@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          command: github
          subcommand: get-diff-data
          args: |
            {
              "prNumber": "${{ github.event.pull_request.number }}",
              "issuePattern": "[A-Z]+-\\d+",
              "dataSeparator": "\\n"
            }

      # Step 2: Extract issues from commit message (for direct pushes)
      - name: Extract issues from commit message
        id: commit-issues
        if: github.event_name == 'push'
        uses: flexydox/fxdx-devops-agent@v1
        with:
          command: text
          subcommand: get-issues
          args: |
            {
              "text": "${{ github.event.head_commit.message }}",
              "issuePattern": "[A-Z]+-\\d+",
              "failWhenNoIssues": false
            }

      # Step 3: Get current version for tagging
      - name: Extract current version
        id: current-version
        uses: flexydox/fxdx-devops-agent@v1
        with:
          command: version
          subcommand: extract
          args: |
            {
              "versionFile": "package.json",
              "versionAttribute": "version"
            }

      # Step 4: Validate PR with Jira issues (PR only)
      - name: Validate PR with Jira
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
          args: |
            {
              "issues": "${{ steps.pr-data.outputs.issues }}",
              "prNumber": "${{ github.event.pull_request.number }}",
              "failWhenNoIssues": true
            }

      # Step 5: Update Jira issues when merging to main
      - name: Update Jira status to Done
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: flexydox/fxdx-devops-agent@v1
        env:
          ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
          ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
          ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
        with:
          command: jira
          subcommand: update-status
          args: |
            {
              "issues": "${{ steps.commit-issues.outputs.issues }}",
              "targetStatus": "Done",
              "comment": "Merged to main branch - Version ${{ steps.current-version.outputs.rawVersion }}"
            }

      # Step 6: Add production labels when pushing to main
      - name: Add production labels
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: flexydox/fxdx-devops-agent@v1
        env:
          ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
          ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
          ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
        with:
          command: jira
          subcommand: update-labels
          args: |
            {
              "issues": "${{ steps.commit-issues.outputs.issues }}",
              "labelsToAdd": "production,deployed",
              "labelsToRemove": "staging,in-progress"
            }

      # Step 7: Assign issues to release version
      - name: Assign to release version
        if: github.event_name == 'release'
        uses: flexydox/fxdx-devops-agent@v1
        env:
          ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
          ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
          ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
        with:
          command: jira
          subcommand: assign-to-release
          args: |
            {
              "issues": "${{ steps.extract-release-issues.outputs.issues }}",
              "version": "${{ github.event.release.tag_name }}"
            }

      # Step 8: Create date-based version for development builds
      - name: Create development version
        id: dev-version
        if: github.ref == 'refs/heads/develop'
        uses: flexydox/fxdx-devops-agent@v1
        with:
          command: version
          subcommand: create-date-version
          args: |
            {}

      # Step 9: Update version in package.json for development
      - name: Update development version
        if: github.ref == 'refs/heads/develop'
        uses: flexydox/fxdx-devops-agent@v1
        with:
          command: version
          subcommand: update
          args: |
            {
              "version": "${{ steps.dev-version.outputs.version }}",
              "versionFile": "package.json",
              "versionAttribute": "version"
            }

      # Step 10: Extract issues from release notes
      - name: Extract release issues
        id: extract-release-issues
        if: github.event_name == 'release'
        uses: flexydox/fxdx-devops-agent@v1
        with:
          command: text
          subcommand: get-issues
          args: |
            {
              "text": "${{ github.event.release.body }}",
              "issuePattern": "[A-Z]+-\\d+",
              "failWhenNoIssues": false
            }

  e2e-tests:
    runs-on: ubuntu-latest
    needs: validate-and-process
    if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Run your E2E tests here
      - name: Run E2E Tests
        id: e2e-tests
        run: |
          # Your E2E test commands
          echo "Running E2E tests..."
          # Set test result for demo
          echo "outcome=success" >> $GITHUB_OUTPUT

      # Step 11: Send Slack notification for E2E results
      - name: Send E2E notification to Slack
        if: always()
        uses: flexydox/fxdx-devops-agent@v1
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
        with:
          command: slack
          subcommand: e2e-notification
          args: |
            {
              "testName": "Full E2E Test Suite",
              "testResult": "${{ steps.e2e-tests.outcome }}",
              "totalTests": 50,
              "botToken": "${{ secrets.SLACK_BOT_TOKEN }}",
              "channel": "qa-notifications",
              "alertChannel": "qa-alerts",
              "testResultUrl": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
              "dockerImage": "myapp:${{ github.sha }}",
              "testFramework": "Playwright",
              "branch": "${{ github.ref_name }}",
              "commitMessage": "${{ github.event.head_commit.message }}",
              "author": "${{ github.actor }}",
              "repository": "${{ github.repository }}",
              "buildUrl": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
              "buildNumber": "${{ github.run_number }}",
              "sourceUrl": "https://github.com/${{ github.repository }}/commit/${{ github.sha }}"
            }
```

### Error Handling Examples

Handle common error scenarios:

```yaml
# Handle missing issues gracefully
- name: Extract issues with error handling
  id: extract-issues-safe
  uses: flexydox/fxdx-devops-agent@v1
  continue-on-error: true
  with:
    command: text
    subcommand: get-issues
    args: |
      {
        "text": "${{ github.event.pull_request.title }}",
        "issuePattern": "[A-Z]+-\\d+",
        "failWhenNoIssues": false
      }

# Conditional Jira operations based on issue existence
- name: Update Jira only if issues found
  if: steps.extract-issues-safe.outputs.issues != ''
  uses: flexydox/fxdx-devops-agent@v1
  env:
    ATLASSIAN_API_BASE_URL: ${{ secrets.ATLASSIAN_API_BASE_URL }}
    ATLASSIAN_API_USERNAME: ${{ secrets.ATLASSIAN_API_USERNAME }}
    ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  with:
    command: jira
    subcommand: add-comment
    args: |
      {
        "issues": "${{ steps.extract-issues-safe.outputs.issues }}",
        "comment": "PR validation completed successfully"
      }

# Fallback Slack notification on test failure
- name: Send failure notification
  if: failure()
  uses: flexydox/fxdx-devops-agent@v1
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
  with:
    command: slack
    subcommand: e2e-notification
    args: |
      {
        "testName": "Workflow Failure",
        "testResult": "fail",
        "totalTests": 0,
        "botToken": "${{ secrets.SLACK_BOT_TOKEN }}",
        "channel": "dev-alerts",
        "branch": "${{ github.ref_name }}",
        "author": "${{ github.actor }}",
        "repository": "${{ github.repository }}"
      }
```

**Slack App Authentication:**

- Uses Slack App Bot tokens instead of webhooks for authentication
- Requires a Slack App with `chat:write` permission
- Supports sending to specific channels based on test results:
  - Success: Uses the `channel` parameter
  - Failure: Uses the `alertChannel` parameter (if provided), otherwise falls back to the main channel
- Bot token should be stored as a repository secret

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
