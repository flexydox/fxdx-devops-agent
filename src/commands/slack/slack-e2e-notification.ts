import * as core from '@actions/core';
import { WebClient } from '@slack/web-api';
import { BaseCommand } from '../base-command.js';

export interface SlackE2ENotificationArgs {
  testName: string;
  testResult: 'success' | 'failure';
  totalTests: number;
  slackChannel: string;
  testResultUrl?: string;
  dockerImage?: string;
  testFramework?: string;
  branch?: string;
  commitMessage?: string;
  author?: string;
  repository?: string;
  version?: string;
  buildUrl?: string;
  buildNumber?: string;
  sourceUrl?: string;
  slackAlertChannel?: string;
}

interface SlackMessage {
  text: string;
  blocks: SlackBlock[];
}

interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  accessory?: {
    type: string;
    text: {
      type: string;
      text: string;
    };
    url: string;
  };
}

/**
 * Command to send Slack notifications after E2E test runs.
 * Sends a formatted message with test results and metadata to a Slack webhook.
 */
export class SlackE2ENotification extends BaseCommand<SlackE2ENotificationArgs> {
  constructor() {
    super('slack', 'e2e-notification');
  }

  async execute(args: SlackE2ENotificationArgs): Promise<void> {
    // Validate required fields
    if (!args.testName) {
      core.setFailed('Test name is required');
      return;
    }

    if (!args.testResult) {
      core.setFailed('Test result is required');
      return;
    }

    if (!['success', 'failure'].includes(args.testResult)) {
      core.setFailed('Test result must be either "success" or "failure"');
      return;
    }

    if (typeof args.totalTests !== 'number' && args.totalTests !== undefined) {
      core.setFailed('Total tests must be a number');
      return;
    }

    const botToken = process.env.SLACK_BOT_TOKEN;

    if (!botToken) {
      core.setFailed('SLACK_BOT_TOKEN environment variable is required');
      return;
    }
    if (!args.slackChannel) {
      core.setFailed('Slack channel is required');
      return;
    }

    core.debug(`Sending Slack notification for test: ${args.testName}`);
    core.debug(`Test result: ${args.testResult}`);
    core.debug(`Total tests: ${args.totalTests}`);

    try {
      const message = this.buildSlackMessage(args);
      if (args.testResult === 'failure' && args.slackAlertChannel) {
        core.debug(`Sending alert on failure to Slack channel: ${args.slackAlertChannel}`);
        await this.sendSlackMessage(botToken, message, args.slackAlertChannel);
      }
      core.debug(`Sending notification to Slack channel: ${args.slackChannel}`);
      await this.sendSlackMessage(botToken, message, args.slackChannel);

      core.info(`Successfully sent Slack notification for E2E test: ${args.testName}`);
      core.setOutput('notification-sent', 'true');
      core.setOutput('test-result', args.testResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      core.setFailed(`Error sending Slack notification: ${errorMessage}`);
      core.setOutput('notification-sent', 'false');
    }
  }

  private buildSlackMessage(args: SlackE2ENotificationArgs): SlackMessage {
    const emoji = args.testResult === 'success' ? '✅' : '❌';
    const status = args.testResult === 'success' ? 'PASSED' : 'FAILED';

    const headerText = `${emoji} E2E Test ${status}: ${args.testName}`;

    const fields: Array<{ type: string; text: string }> = [
      {
        type: 'mrkdwn',
        text: `*Test Result:*\n${args.testResult === 'success' ? 'PASS' : 'FAIL'}`
      }
    ];

    if (args.totalTests !== undefined) {
      fields.push({
        type: 'mrkdwn',
        text: `*Total Tests:*\n${args.totalTests}`
      });
    }

    if (args.testFramework) {
      fields.push({
        type: 'mrkdwn',
        text: `*Test Framework:*\n${args.testFramework}`
      });
    }

    if (args.branch) {
      fields.push({
        type: 'mrkdwn',
        text: `*Branch:*\n${args.branch}`
      });
    }

    if (args.author) {
      fields.push({
        type: 'mrkdwn',
        text: `*Author:*\n${args.author}`
      });
    }

    if (args.repository) {
      fields.push({
        type: 'mrkdwn',
        text: `*Repository:*\n${args.repository}`
      });
    }

    if (args.version) {
      fields.push({
        type: 'mrkdwn',
        text: `*Version:*\n${args.version}`
      });
    }

    if (args.dockerImage) {
      fields.push({
        type: 'mrkdwn',
        text: `*Docker Image:*\n${args.dockerImage}`
      });
    }

    if (args.buildNumber) {
      fields.push({
        type: 'mrkdwn',
        text: `*Build Number:*\n${args.buildNumber}`
      });
    }

    const blocks: SlackBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: headerText
        }
      },
      {
        type: 'section',
        fields: fields
      }
    ];

    // Add commit message if available
    if (args.commitMessage) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Commit Message:*\n${args.commitMessage}`
        }
      });
    }

    // Add action buttons for URLs
    const actionButtons: SlackBlock[] = [];

    if (args.testResultUrl) {
      actionButtons.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ' '
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Test Results'
          },
          url: args.testResultUrl
        }
      });
    }

    if (args.buildUrl) {
      actionButtons.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ' '
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Build'
          },
          url: args.buildUrl
        }
      });
    }

    if (args.sourceUrl) {
      actionButtons.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ' '
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Source'
          },
          url: args.sourceUrl
        }
      });
    }

    blocks.push(...actionButtons);

    return {
      text: headerText,
      blocks: blocks
    };
  }

  private async sendSlackMessage(botToken: string, message: SlackMessage, targetChannel: string): Promise<void> {
    const client = new WebClient(botToken);

    core.debug(`Sending message to Slack channel: ${targetChannel}`);
    core.debug(`Message preview: ${message.text}`);
    core.debug(`Blocks: ${JSON.stringify(message.blocks, null, 2)}`);
    const result = await client.chat.postMessage({
      channel: targetChannel,
      text: message.text,
      blocks: message.blocks
    });

    if (!result.ok) {
      throw new Error(`Slack API request failed: ${result.error}`);
    }

    core.debug('Slack message sent successfully');
  }
}
