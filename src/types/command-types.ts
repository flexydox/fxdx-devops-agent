export type CommandName = 'jira' | 'github' | 'version' | 'text';
export type SubCommandJira = 'update-status' | 'add-comment' | 'assign-to-release' | 'update-labels';
export type SubCommandGithub = 'pr-commenter' | 'get-diff-data' | 'commit-info';
export type SubCommandVersion = 'parse';
export type SubCommandText = 'get-issues';

export type SubCommandName = SubCommandJira | SubCommandGithub | SubCommandVersion | SubCommandText;

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
