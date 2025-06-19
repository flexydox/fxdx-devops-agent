import { SlackE2ENotification, SlackE2ENotificationArgs } from './slack-e2e-notification.js';
import * as core from '@actions/core';

// Mock @actions/core
jest.mock('@actions/core');
const mockCore = core as jest.Mocked<typeof core>;

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('SlackE2ENotification', () => {
  let command: SlackE2ENotification;

  beforeEach(() => {
    command = new SlackE2ENotification();
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('constructor', () => {
    it('should initialize with correct command and subcommand', () => {
      expect(command.command).toBe('slack');
      expect(command.subcommand).toBe('e2e-notification');
    });
  });

  describe('execute', () => {
    const validArgs: SlackE2ENotificationArgs = {
      testName: 'E2E Integration Tests',
      testResult: 'success',
      totalTests: 25,
      testResultUrl: 'https://example.com/test-results',
      dockerImage: 'my-app:latest',
      testFramework: 'Playwright',
      branch: 'main',
      commitMessage: 'Add new feature',
      author: 'John Doe',
      repository: 'my-org/my-app',
      version: '1.2.3',
      buildUrl: 'https://example.com/build/123',
      buildNumber: '123',
      sourceUrl: 'https://github.com/my-org/my-app',
      webhookUrl: 'https://hooks.slack.com/services/test/webhook',
      slackChannel: 'general',
      slackAlertChannel: 'alerts',
      slackAlertWebhookUrl: 'https://hooks.slack.com/services/test/alert-webhook'
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('ok')
      } as unknown as Response);
    });

    it('should successfully send notification with all fields', async () => {
      await command.execute(validArgs);

      expect(mockCore.setFailed).not.toHaveBeenCalled();
      expect(mockCore.setOutput).toHaveBeenCalledWith('notification-sent', 'true');
      expect(mockCore.setOutput).toHaveBeenCalledWith('test-result', 'success');
      expect(mockCore.info).toHaveBeenCalledWith(
        'Successfully sent Slack notification for E2E test: E2E Integration Tests'
      );
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should send notification with minimal required fields', async () => {
      const minimalArgs: SlackE2ENotificationArgs = {
        testName: 'Basic Test',
        testResult: 'failure',
        totalTests: 1,
        webhookUrl: 'https://hooks.slack.com/services/test/webhook'
      };

      await command.execute(minimalArgs);

      expect(mockCore.setFailed).not.toHaveBeenCalled();
      expect(mockCore.setOutput).toHaveBeenCalledWith('notification-sent', 'true');
      expect(mockCore.setOutput).toHaveBeenCalledWith('test-result', 'failure');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should fail when testName is missing', async () => {
      const argsWithoutTestName = { ...validArgs, testName: '' };

      await command.execute(argsWithoutTestName);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Test name is required');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fail when testResult is missing', async () => {
      const argsWithoutTestResult = { ...validArgs, testResult: '' as 'success' | 'failure' };

      await command.execute(argsWithoutTestResult);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Test result is required');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fail when testResult is invalid', async () => {
      const argsWithInvalidTestResult = { ...validArgs, testResult: 'invalid' as 'success' | 'failure' };

      await command.execute(argsWithInvalidTestResult);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Test result must be either "success" or "failure"');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fail when totalTests is not a number', async () => {
      const argsWithInvalidTotalTests = { ...validArgs, totalTests: 'invalid' as unknown as number };

      await command.execute(argsWithInvalidTotalTests);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Total tests must be a number');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fail when webhookUrl is missing', async () => {
      const argsWithoutWebhookUrl = { ...validArgs, webhookUrl: '' };

      await command.execute(argsWithoutWebhookUrl);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Slack webhook URL is required');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await command.execute(validArgs);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Error sending Slack notification: Network error');
      expect(mockCore.setOutput).toHaveBeenCalledWith('notification-sent', 'false');
    });

    it('should handle non-ok response from Slack', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('invalid_payload')
      } as unknown as Response);

      await command.execute(validArgs);

      expect(mockCore.setFailed).toHaveBeenCalledWith(
        'Error sending Slack notification: Slack webhook request failed: 400 Bad Request. Response: invalid_payload'
      );
      expect(mockCore.setOutput).toHaveBeenCalledWith('notification-sent', 'false');
    });

    it('should build correct Slack message for passed test', async () => {
      const passArgs = { ...validArgs, testResult: 'success' as const };

      await command.execute(passArgs);

      expect(mockFetch).toHaveBeenCalledWith(
        validArgs.webhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('✅ E2E Test PASSED: E2E Integration Tests')
        })
      );
    });

    it('should build correct Slack message for failed test', async () => {
      const failArgs = { ...validArgs, testResult: 'failure' as const };

      await command.execute(failArgs);

      expect(mockFetch).toHaveBeenCalledWith(
        validArgs.slackAlertWebhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('❌ E2E Test FAILED: E2E Integration Tests')
        })
      );
    });

    it('should include all provided fields in the message', async () => {
      await command.execute(validArgs);

      const fetchCall = mockFetch.mock.calls[0];
      const messageBody = JSON.parse(fetchCall[1]?.body as string);

      expect(messageBody.text).toContain('✅ E2E Test PASSED: E2E Integration Tests');
      expect(messageBody.blocks).toHaveLength(6); // header + section + commit + 3 action buttons

      // Check that fields are included
      const sectionBlock = messageBody.blocks[1];
      expect(sectionBlock.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ text: '*Test Result:*\nPASS' }),
          expect.objectContaining({ text: '*Total Tests:*\n25' }),
          expect.objectContaining({ text: '*Test Framework:*\nPlaywright' }),
          expect.objectContaining({ text: '*Branch:*\nmain' }),
          expect.objectContaining({ text: '*Author:*\nJohn Doe' }),
          expect.objectContaining({ text: '*Repository:*\nmy-org/my-app' }),
          expect.objectContaining({ text: '*Version:*\n1.2.3' }),
          expect.objectContaining({ text: '*Docker Image:*\nmy-app:latest' }),
          expect.objectContaining({ text: '*Build Number:*\n123' }),
          expect.objectContaining({ text: '*Slack Channel:*\n#general' }),
          expect.objectContaining({ text: '*Alert Channel:*\n#alerts' })
        ])
      );

      // Check action buttons
      const actionBlocks = messageBody.blocks.slice(3);
      expect(actionBlocks).toHaveLength(3);
      expect(actionBlocks[0].accessory.url).toBe(validArgs.testResultUrl);
      expect(actionBlocks[1].accessory.url).toBe(validArgs.buildUrl);
      expect(actionBlocks[2].accessory.url).toBe(validArgs.sourceUrl);
    });

    it('should use regular webhook for passed tests', async () => {
      const passArgs = { ...validArgs, testResult: 'success' as const };
      await command.execute(passArgs);

      expect(mockFetch).toHaveBeenCalledWith(
        validArgs.webhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(mockFetch).not.toHaveBeenCalledWith(validArgs.slackAlertWebhookUrl, expect.any(Object));
    });

    it('should use alert webhook for failed tests when provided', async () => {
      const failArgs = { ...validArgs, testResult: 'failure' as const };
      await command.execute(failArgs);

      expect(mockFetch).toHaveBeenCalledWith(
        validArgs.slackAlertWebhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(mockFetch).not.toHaveBeenCalledWith(validArgs.webhookUrl, expect.any(Object));
    });

    it('should use regular webhook for failed tests when alert webhook not provided', async () => {
      const failArgs = {
        ...validArgs,
        testResult: 'failure' as const,
        slackAlertWebhookUrl: undefined
      };
      await command.execute(failArgs);

      expect(mockFetch).toHaveBeenCalledWith(
        validArgs.webhookUrl,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should include channel names in message fields', async () => {
      const argsWithChannels = {
        ...validArgs,
        slackChannel: 'test-channel',
        slackAlertChannel: 'alert-channel'
      };

      await command.execute(argsWithChannels);

      const mockCall = mockFetch.mock.calls[0];
      const requestBody = mockCall[1] as RequestInit;
      const messageBody = JSON.parse(requestBody.body as string);

      const sectionBlock = messageBody.blocks[1];
      expect(sectionBlock.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ text: '*Slack Channel:*\n#test-channel' }),
          expect.objectContaining({ text: '*Alert Channel:*\n#alert-channel' })
        ])
      );
    });

    it('should handle channels with # prefix correctly', async () => {
      const argsWithHashChannels = {
        ...validArgs,
        slackChannel: '#prefixed-channel',
        slackAlertChannel: '#prefixed-alerts'
      };

      await command.execute(argsWithHashChannels);

      const mockCall = mockFetch.mock.calls[0];
      const requestBody = mockCall[1] as RequestInit;
      const messageBody = JSON.parse(requestBody.body as string);

      const sectionBlock = messageBody.blocks[1];
      expect(sectionBlock.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ text: '*Slack Channel:*\n#prefixed-channel' }),
          expect.objectContaining({ text: '*Alert Channel:*\n#prefixed-alerts' })
        ])
      );
    });
  });
});
