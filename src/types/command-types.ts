export type CommandName = 'jira' | 'git';
export type SubCommandJira = 'issue-pr-commenter' | 'update-status' | 'add-comment';
export type SubCommandGit = 'get-diff-data';

export type SubCommandName = SubCommandJira | SubCommandGit;

export type CommandArgs = unknown;

export interface CommandHandler {
  command: CommandName;
  subcommand: SubCommandName;
  execute: (args: CommandArgs) => Promise<void>;
}
export interface CommandHandlers {
  [command: string]: {
    [subcommand: string]: CommandHandler;
  };
}
