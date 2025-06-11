import { CommandArgs } from '../types/command-types.js';

export abstract class BaseCommand<TArgs extends CommandArgs> {
  command: string;
  subcommand: string;

  constructor(command: string, subcommand: string) {
    this.command = command;
    this.subcommand = subcommand;
  }

  abstract execute(args: TArgs): Promise<void>;
}
