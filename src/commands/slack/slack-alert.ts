import * as core from '@actions/core';
import { WebClient } from '@slack/web-api';
import { BaseCommand } from '../base-command.js';

export interface SlackAlertArgs {
  channel: string;
  title?: string;
  message: string;
}

/**
 * Command to send Slack notifications after E2E test runs.
 * Sends a formatted message with test results and metadata to a Slack webhook.
 */
export class SlackAlert extends BaseCommand<SlackAlertArgs> {
  constructor() {
    super('slack', 'alert');
  }

  async execute(args: SlackAlertArgs): Promise<void> {
    // Validate required fields

    const botToken = process.env.SLACK_BOT_TOKEN;
    if (!botToken) {
      core.setFailed('SLACK_BOT_TOKEN environment variable is required');
      return;
    }

    if (!args.channel) {
      core.setFailed('Slack channel is required');
      return;
    }

    if (!args.message) {
      core.setFailed('Slack alert message is required');
      return;
    }

    core.debug(`Sending Slack alert: ${args.title}`);
    core.debug(`Alert message: ${args.message}`);

    try {
      const body = `
      *${args.title}*

      ${args.message}
      `;

      await this.sendSlackMessage(botToken, body, args.channel);

      core.info(`Successfully sent Slack alert to channel: ${args.channel}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      core.setFailed(`Error sending Slack alert: ${errorMessage}`);
    }
  }

  private async sendSlackMessage(botToken: string, body: string, targetChannel: string): Promise<void> {
    const client = new WebClient(botToken);

    core.debug(`Sending message to Slack channel: ${targetChannel}`);
    core.debug(`Message preview: ${body}`);
    const result = await client.chat.postMessage({
      channel: targetChannel,
      text: body
    });

    if (!result.ok) {
      throw new Error(`Slack API request failed: ${result.error}`);
    }

    core.debug('Slack message sent successfully');
  }
}
