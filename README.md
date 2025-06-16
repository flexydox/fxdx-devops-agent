# DevOps Agent ![Marketplace](https://img.shields.io/badge/Marketplace-GitHub%20Actions-blue?logo=github) ![License](https://img.shields.io/github/license/flexydox/fxdx-devops-agent)

A powerful GitHub Action for automating your development workflow with Jira, GitHub, and versioning operations. Supports advanced PR validation, Jira issue management, and more.

---

## Table of Contents
- [DevOps Agent  ](#devops-agent--)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Commands \& Arguments](#commands--arguments)
    - [~Common Arguments](#common-arguments)
    - [Jira Commands](#jira-commands)
    - [GitHub Commands](#github-commands)
    - [Version Commands](#version-commands)
  - [Usage](#usage)
  - [Examples](#examples)
    - [Add a comment to Jira issues](#add-a-comment-to-jira-issues)
    - [Update Jira status for issues](#update-jira-status-for-issues)
    - [Validate PR with Jira issues and comment](#validate-pr-with-jira-issues-and-comment)
    - [Get PR diff data](#get-pr-diff-data)
    - [Parse a version string](#parse-a-version-string)
  - [Development](#development)
  - [License](#license)

---

## Features
- Validate and synchronize Jira issues on PRs
- Update Jira issue status, labels, comments, and releases from workflows
- Parse semantic versions and extract commit data from PRs
- Modular command/subcommand structure for extensibility

---

## Commands & Arguments

### ~Common Arguments
- `applyToParent` (bool, optional): Apply operation to parent issues, if actual issue is a subtask.
- `applyToSubtasks` (bool, optional): Apply operation to subtask issue types, if actual issue is a subtask.
- `failWhenNoIssues` (bool, optional): Fail the action if no issues are found.
- issues (string): Comma-separated list of Jira issues (e.g., "PROJ-1,PROJ-2").
- prTitleRegex (string, optional): Regex to match PR titles for issue validation.

### Jira Commands

| Subcommand         | Arguments                                                                                      | Description                                            | Example | Outputs |
|--------------------|-----------------------------------------------------------------------------------------------|--------------------------------------------------------|---------|---------|
| `add-comment`      | `issues` (string), `comment` (string), `applyToParent` (bool, optional), `applyToSubtasks` (bool, optional) | Add comment to Jira issues.                            | `args: '{ "issues": "PROJ-1,PROJ-2", "comment": "Deployed to staging." }'` | None |
| `update-status`    | `issues` (string), `targetStatus` (string), `comment` (string, optional), `applyToParent` (bool, optional), `applyToSubtasks` (bool, optional) | Update Jira issue status and add an optional comment.  | `args: '{ "issues": "PROJ-123", "targetStatus": "Done", "comment": "Automatically transitioned via CI." }'` | None |
| `assign-to-release`| `issues` (string), `version` (string), `applyToParent` (bool, optional), `applyToSubtasks` (bool, optional) | Assign Jira issues to a release version.               | `args: '{ "issues": "PROJ-1,PROJ-2", "version": "1.0.0" }'` | None |
| `update-labels`    | `issues` (string), `labelsToAdd` (string), `labelsToRemove` (string), `applyToParent` (bool, optional), `applyToSubtasks` (bool, optional) | Add/remove labels on Jira issues.                      | `args: '{ "issues": "PROJ-1", "labelsToAdd": "qa,prod", "labelsToRemove": "wip" }'` | None |

### GitHub Commands

| Subcommand         | Arguments                                                                                      | Description                                            | Example | Outputs |
|--------------------|-----------------------------------------------------------------------------------------------|--------------------------------------------------------|---------|---------|
| `pr-commenter`     | `issues` (string), `prNumber` (string), `prTitleRegex` (string, optional), `failWhenNoIssues` (bool, optional), `applyToParent` (bool, optional), `applyToSubtasks` (bool, optional) | Validate Jira issues on a PR and synchronize comments. | `args: '{ "issues": "PROJ-456", "prNumber": "${{ github.event.pull_request.number }}", "failWhenNoIssues": true }'` | None |
| `get-diff-data`    | `prNumber` (string), `issuePattern` (string, optional), `dataSeparator` (string, optional)    | Extract commit messages, files, and referenced issues. | `args: '{ "prNumber": "${{ github.event.pull_request.number }}" }'` | `commit-messages`, `files`, `issues` |

### Version Commands

| Subcommand         | Arguments                                                                                      | Description                                            | Example | Outputs |
|--------------------|-----------------------------------------------------------------------------------------------|--------------------------------------------------------|---------|---------|
| `parse`            | `version` (string)                                                                            | Parse and output the major, minor, patch, pre fields.  | `args: '{ "version": "1.2.3-beta" }'` | `major`, `minor`, `patch`, `pre` |

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

- **command**: One of `jira`, `github`, `version`
- **subcommand**: See table above
- **args**: JSON string with arguments for the command/subcommand

---

## Examples

### Add a comment to Jira issues
```yaml
- name: Add Jira comment
  uses: flexydox/fxdx-devops-agent@v1
  with:
    command: jira
    subcommand: add-comment
    args: '{ "issues": "PROJ-1,PROJ-2", "comment": "Deployed to staging." }'
```

### Update Jira status for issues
```yaml
- name: Update Jira status
  uses: flexydox/fxdx-devops-agent@v1
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
