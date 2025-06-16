import { BaseCommand } from '../base-command.js';
import * as core from '@actions/core';
import { inferIssues } from '../../libs/string-utils.js';

export interface TextGetIssuesArgs {
  text?: string;
  issuePattern?: string;
  failWhenNoIssues?: boolean;
}

export class TextGetIssues extends BaseCommand<TextGetIssuesArgs> {
  constructor() {
    super('text', 'get-issues');
  }

  async execute(args: TextGetIssuesArgs): Promise<void> {
    const rawText = args.text;
    if (!rawText) {
      core.info('No text provided, skipping parsing.');
      return;
    }
    const issuePattern = args.issuePattern;
    if (!issuePattern) {
      core.setFailed('Issue pattern is required');
      return;
    }
    core.debug(`Using issue pattern: ${issuePattern}`);
    core.debug(`Raw text: ${rawText}`);
    const parsedIssues = inferIssues(rawText, issuePattern);
    if (!parsedIssues || parsedIssues.length === 0) {
      core.info('No issues found in the provided text.');
      if (args.failWhenNoIssues) {
        core.setFailed('No issues found and failWhenNoIssues is set to true.');
      }
      return;
    }
    core.setOutput('issues', parsedIssues.join(','));
  }
}
