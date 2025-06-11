import * as core from '@actions/core';
import { parseInputs } from './input-parser/parse-inputs.js';
import { getCommand } from './commands/command-lookup.js';
/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const { command, subcommand, args } = parseInputs();
    core.debug(`command: ${command}`);
    core.debug(`subcommand: ${subcommand}`);
    core.debug(`args: ${JSON.stringify(args)}`);

    // Example: handle 'jira' command with 'issue-pr-commenter' subcommand for backward compatibility
    // Create command/subcommand lookup with execute method

    const handler = getCommand(command, subcommand);
    if (handler) {
      await handler.execute(args);
    } else {
      core.warning(`No handler found for command "${command}" and subcommand "${subcommand}".`);
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('Unknown error');
    }
  }
}
