export type CommandName = 'jira' | 'github' | 'version' | 'text' | 'slack';
export type SubCommandJira = 'update-status' | 'add-comment' | 'assign-to-release' | 'update-labels';
export type SubCommandGithub = 'pr-commenter' | 'get-diff-data' | 'commit-info';
export type SubCommandVersion = 'parse' | 'create-date-version' | 'extract' | 'update';
export type SubCommandText = 'get-issues';
export type SubCommandSlack = 'e2e-notification' | 'alert';

export type SubCommandName = SubCommandJira | SubCommandGithub | SubCommandVersion | SubCommandText | SubCommandSlack;

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
