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
      core.debug(`Raw args string: ${argsString}`);
      core.debug(`Command: ${command}`);
      core.debug(`Subcommand: ${subcommand}`);
      throw new Error('Invalid args format. Expected a JSON string.');
    }
  }
  return { command, subcommand, args };
}

export function parseIssuesString(issuesString: string): string[] {
  return issuesString
    .split(',')
    .map((issue) => issue.trim())
    .filter((issue) => issue.length > 0);
}

export function parseIssues(issues: string[] | string | undefined | null): string[] {
  const issuesString = typeof issues === 'string' ? issues : '';
  const issuesArray = Array.isArray(issues) ? issues : [];
  core.debug(`issuesString: ${issuesString}`);
  core.debug(`issuesArray: ${JSON.stringify(issuesArray)}`);

  const issuesNumbers = issuesArray.length > 0 ? issuesArray : parseIssuesString(issuesString);
  return issuesNumbers;
}
