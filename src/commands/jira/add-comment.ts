import { BaseCommand } from '../base-command.js';

export interface AddCommentArgs {
  issues?: string;
  prNumber?: string;
  prTitleRegex?: string;
  failWhenNoIssues?: boolean | string | number;
}

export class AddComment extends BaseCommand<AddCommentArgs> {
  constructor() {
    super('jira', 'add-comment');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_args: AddCommentArgs): Promise<void> {
    return;
  }
}
