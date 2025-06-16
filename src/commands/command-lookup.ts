import { CommandArgs, CommandName, SubCommandName } from '../types/command-types.js';
import { BaseCommand } from './base-command.js';
import { GetDiffData } from './github/get-diff-data.js';
import { CommitInfo } from './github/commit-info.js';
import { JiraAddComment } from './jira/jira-add-comment.js';
import { GithubPRCommenter } from './github/github-pr-commenter.js';
import { JiraUpdateStatus } from './jira/jira-update-status.js';
import { VersionParse } from './version/version-parse.js';
import { JiraAssignToRelease } from './jira/jira-assign-to-release.js';
import { JiraUpdateLabels } from './jira/jira-update-labels.js';
import { TextGetIssues } from './text/text-get-issues.js';

const commands: Record<CommandName, Partial<Record<SubCommandName, BaseCommand<CommandArgs>>>> = {
  jira: {
    'add-comment': new JiraAddComment(),
    'update-status': new JiraUpdateStatus(),
    'assign-to-release': new JiraAssignToRelease(),
    'update-labels': new JiraUpdateLabels()
  },
  github: {
    'pr-commenter': new GithubPRCommenter(),
    'get-diff-data': new GetDiffData(),
    'commit-info': new CommitInfo()
  },
  version: {
    parse: new VersionParse()
  },
  text: {
    'get-issues': new TextGetIssues()
  }
};

export function getCommand<TCommand extends BaseCommand<CommandArgs>>(
  commandName: string,
  subCommandName: string
): TCommand | null {
  const cmd = commands[commandName as CommandName]?.[subCommandName as SubCommandName];
  if (cmd) {
    return cmd as TCommand;
  }
  return null;
}
