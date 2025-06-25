import { SlackE2ENotification, SlackE2ENotificationArgs } from './slack-e2e-notification.js';
import * as core from '@actions/core';
import { WebClient } from '@slack/web-api';

process.env.SLACK_BOT_TOKEN = 'xoxb-test-slack-bot-token';

// Mock @actions/core
jest.mock('@actions/core');
const mockCore = core as jest.Mocked<typeof core>;

// Mock @slack/web-api
jest.mock('@slack/web-api');
const mockWebClient = WebClient as jest.MockedClass<typeof WebClient>;
const mockChatPostMessage = jest.fn();

// Mock the WebClient instance
mockWebClient.mockImplementation(
  () =>
    ({
      chat: {
        postMessage: mockChatPostMessage
      }
    }) as unknown as WebClient
);

describe('SlackE2ENotification', () => {
  let command: SlackE2ENotification;

  beforeEach(() => {
    command = new SlackE2ENotification();
    jest.clearAllMocks();
    mockChatPostMessage.mockClear();
    mockWebClient.mockClear();
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
      slackChannel: 'general',
      slackAlertChannel: 'alerts'
    };

    beforeEach(() => {
      mockChatPostMessage.mockResolvedValue({
        ok: true,
        channel: 'C1234567890',
        ts: '1234567890.123456'
      });
    });

    it('should successfully send notification with all fields', async () => {
      await command.execute(validArgs);

      expect(mockCore.setFailed).not.toHaveBeenCalled();
      expect(mockCore.setOutput).toHaveBeenCalledWith('notification-sent', 'true');
      expect(mockCore.setOutput).toHaveBeenCalledWith('test-result', 'success');
      expect(mockCore.info).toHaveBeenCalledWith(
        'Successfully sent Slack notification for E2E test: E2E Integration Tests'
      );
      expect(mockChatPostMessage).toHaveBeenCalledTimes(1);
    });

    it('should send notification with minimal required fields', async () => {
      const minimalArgs: SlackE2ENotificationArgs = {
        testName: 'Basic Test',
        testResult: 'failure',
        totalTests: 1,
        slackChannel: 'general'
      };

      await command.execute(minimalArgs);

      expect(mockCore.setFailed).not.toHaveBeenCalled();
      expect(mockCore.setOutput).toHaveBeenCalledWith('notification-sent', 'true');
      expect(mockCore.setOutput).toHaveBeenCalledWith('test-result', 'failure');
      expect(mockChatPostMessage).toHaveBeenCalledTimes(1);
    });

    it('should fail when testName is missing', async () => {
      const argsWithoutTestName = { ...validArgs, testName: '' };

      await command.execute(argsWithoutTestName);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Test name is required');
      expect(mockChatPostMessage).not.toHaveBeenCalled();
    });

    it('should fail when testResult is missing', async () => {
      const argsWithoutTestResult = { ...validArgs, testResult: '' as 'success' | 'failure' };

      await command.execute(argsWithoutTestResult);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Test result is required');
      expect(mockChatPostMessage).not.toHaveBeenCalled();
    });

    it('should fail when testResult is invalid', async () => {
      const argsWithInvalidTestResult = { ...validArgs, testResult: 'invalid' as 'success' | 'failure' };

      await command.execute(argsWithInvalidTestResult);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Test result must be either "success" or "failure"');
      expect(mockChatPostMessage).not.toHaveBeenCalled();
    });

    it('should handle Slack API errors gracefully', async () => {
      mockChatPostMessage.mockRejectedValue(new Error('Network error'));

      await command.execute(validArgs);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Error sending Slack notification: Network error');
      expect(mockCore.setOutput).toHaveBeenCalledWith('notification-sent', 'false');
    });

    it('should handle non-ok response from Slack API', async () => {
      mockChatPostMessage.mockResolvedValue({
        ok: false,
        error: 'channel_not_found'
      });

      await command.execute(validArgs);

      expect(mockCore.setFailed).toHaveBeenCalledWith(
        'Error sending Slack notification: Slack API request failed: channel_not_found'
      );
      expect(mockCore.setOutput).toHaveBeenCalledWith('notification-sent', 'false');
    });

    it('should build correct Slack message for passed test', async () => {
      const passArgs = { ...validArgs, testResult: 'success' as const };

      await command.execute(passArgs);

      expect(mockChatPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'general',
          text: '✅ E2E Test PASSED: E2E Integration Tests',
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: 'header',
              text: expect.objectContaining({
                text: '✅ E2E Test PASSED: E2E Integration Tests'
              })
            })
          ])
        })
      );
    });

    it('should build correct Slack message for failed test', async () => {
      const failArgs = { ...validArgs, testResult: 'failure' as const };

      await command.execute(failArgs);

      expect(mockChatPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'alerts',
          text: '❌ E2E Test FAILED: E2E Integration Tests',
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: 'header',
              text: expect.objectContaining({
                text: '❌ E2E Test FAILED: E2E Integration Tests'
              })
            })
          ])
        })
      );
    });

    it('should handle commit messages with Unicode characters correctly', async () => {
      const argsWithUnicode: SlackE2ENotificationArgs = {
        testName: 'Unicode Test',
        testResult: 'success',
        totalTests: 1,
        slackChannel: 'general',
        commitMessage: 'feat: add new feature 🚀 with café and naïve résumé テスト'
      };

      await command.execute(argsWithUnicode);

      expect(mockChatPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'general',
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: 'section',
              text: expect.objectContaining({
                text: '*Commit Message:*\nfeat: add new feature 🚀 with café and naïve résumé テスト'
              })
            })
          ])
        })
      );
    });

    it('should include all provided fields in the message', async () => {
      await command.execute(validArgs);

      const call = mockChatPostMessage.mock.calls[0][0];
      expect(call.text).toContain('✅ E2E Test PASSED: E2E Integration Tests');
      expect(call.blocks).toHaveLength(6); // header + section + commit + 3 action buttons

      // Check that fields are included
      const sectionBlock = call.blocks[1];
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
          expect.objectContaining({ text: '*Build Number:*\n123' })
        ])
      );

      // Check action buttons
      const actionBlocks = call.blocks.slice(3);
      expect(actionBlocks).toHaveLength(3);
      expect(actionBlocks[0].accessory.url).toBe(validArgs.testResultUrl);
      expect(actionBlocks[1].accessory.url).toBe(validArgs.buildUrl);
      expect(actionBlocks[2].accessory.url).toBe(validArgs.sourceUrl);
    });

    it('should use regular channel for passed tests', async () => {
      const passArgs = { ...validArgs, testResult: 'success' as const };
      await command.execute(passArgs);

      expect(mockChatPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'general'
        })
      );
    });

    it('should use alert channel for failed tests when provided', async () => {
      const failArgs = { ...validArgs, testResult: 'failure' as const };
      await command.execute(failArgs);

      expect(mockChatPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'alerts'
        })
      );
    });

    it('should use regular channel for failed tests when alert channel not provided', async () => {
      const failArgs = {
        ...validArgs,
        testResult: 'failure' as const,
        alertChannel: undefined
      };
      await command.execute(failArgs);

      expect(mockChatPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'general'
        })
      );
    });
  });
});
