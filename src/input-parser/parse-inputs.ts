import * as core from '@actions/core';

export interface ParsedInputs {
  command: string;
  subcommand: string;
  args: Record<string, unknown>;
}

export function parseInputs(): ParsedInputs {
  const command = process.env['INPUT_COMMAND'] ?? '';
  const subcommand = process.env['INPUT_SUBCOMMAND'] ?? '';
  const argsString = process.env['INPUT_ARGS'] ?? '';
  let args: Record<string, unknown> = {};
  if (argsString) {
    try {
      args = JSON.parse(argsString);
      core.debug(`Parsed args: ${JSON.stringify(args)}`);
    } catch {
      core.setFailed('Failed to parse args as JSON');
    }
  }
  return { command, subcommand, args };
}
