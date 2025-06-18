import * as core from '@actions/core';
import { BaseCommand } from '../base-command.js';

export interface SlackE2ENotificationArgs {
  testName: string;
  testResult: 'pass' | 'fail';
  totalTests: number;
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
  webhookUrl: string;
  slackChannel?: string;
  slackAlertChannel?: string;
  slackAlertWebhookUrl?: string;
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

    if (!['pass', 'fail'].includes(args.testResult)) {
      core.setFailed('Test result must be either "pass" or "fail"');
      return;
    }

    if (typeof args.totalTests !== 'number' && args.totalTests !== undefined) {
      core.setFailed('Total tests must be a number');
      return;
    }

    if (!args.webhookUrl) {
      core.setFailed('Slack webhook URL is required');
      return;
    }

    core.debug(`Sending Slack notification for test: ${args.testName}`);
    core.debug(`Test result: ${args.testResult}`);
    core.debug(`Total tests: ${args.totalTests}`);

    try {
      // Choose the appropriate webhook URL based on test result and availability
      const webhookUrl = this.getWebhookUrl(args);
      const message = this.buildSlackMessage(args);
      await this.sendSlackMessage(webhookUrl, message);

      core.info(`Successfully sent Slack notification for E2E test: ${args.testName}`);
      core.setOutput('notification-sent', 'true');
      core.setOutput('test-result', args.testResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      core.setFailed(`Error sending Slack notification: ${errorMessage}`);
      core.setOutput('notification-sent', 'false');
    }
  }

  private getWebhookUrl(args: SlackE2ENotificationArgs): string {
    // If test failed and alert webhook URL is provided, use the alert webhook
    if (args.testResult === 'fail' && args.slackAlertWebhookUrl) {
      core.debug('Using alert webhook URL for failed test');
      return args.slackAlertWebhookUrl;
    }

    // Otherwise, use the default webhook URL
    return args.webhookUrl;
  }

  private buildSlackMessage(args: SlackE2ENotificationArgs): SlackMessage {
    const emoji = args.testResult === 'pass' ? '✅' : '❌';
    const status = args.testResult === 'pass' ? 'PASSED' : 'FAILED';

    const headerText = `${emoji} E2E Test ${status}: ${args.testName}`;

    const fields: Array<{ type: string; text: string }> = [
      {
        type: 'mrkdwn',
        text: `*Test Result:*\n${args.testResult.toUpperCase()}`
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

    if (args.slackChannel) {
      fields.push({
        type: 'mrkdwn',
        text: `*Slack Channel:*\n#${args.slackChannel.replace(/^#/, '')}`
      });
    }

    if (args.slackAlertChannel) {
      fields.push({
        type: 'mrkdwn',
        text: `*Alert Channel:*\n#${args.slackAlertChannel.replace(/^#/, '')}`
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

  private async sendSlackMessage(webhookUrl: string, message: SlackMessage): Promise<void> {
    core.debug(`Sending message to Slack webhook: ${webhookUrl.substring(0, 50)}...`);
    core.debug(`Message preview: ${message.text}`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(
        `Slack webhook request failed: ${response.status} ${response.statusText}. Response: ${responseText}`
      );
    }

    core.debug('Slack message sent successfully');
  }
}
