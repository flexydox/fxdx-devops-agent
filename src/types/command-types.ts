export type CommandName = 'jira' | 'github' | 'version';
export type SubCommandJira = 'update-status' | 'add-comment' | 'assign-to-release' | 'update-labels';
export type SubCommandGithub = 'pr-commenter' | 'get-diff-data';
export type SubCommandVersion = 'parse';

export type SubCommandName = SubCommandJira | SubCommandGithub | SubCommandVersion;

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
