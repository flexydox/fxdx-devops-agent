import { CommandArgs, CommandName, SubCommandName } from '../types/command-types.js';
import { BaseCommand } from './base-command.js';
import { GetDiffData } from './git/get-diff-data.js';
import { AddComment } from './jira/add-comment.js';
import { IssuePRCommenter } from './jira/issue-pr-commenter.js';
import { UpdateStatus } from './jira/update-status.js';

const commands: Record<CommandName, Partial<Record<SubCommandName, BaseCommand<CommandArgs>>>> = {
  jira: {
    'issue-pr-commenter': new IssuePRCommenter(),
    'add-comment': new AddComment(),
    'update-status': new UpdateStatus()
  },
  git: {
    'get-diff-data': new GetDiffData()
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
