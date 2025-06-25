import { CommitInfo, CommitInfoArgs } from './commit-info.js';
import * as core from '@actions/core';
import { getGitHubClient } from '../../libs/github/github-client.js';

// Mock @actions/core
jest.mock('@actions/core');
const mockCore = core as jest.Mocked<typeof core>;

// Mock GitHub client
jest.mock('../../libs/github/github-client.js');
const mockGetGitHubClient = getGitHubClient as jest.MockedFunction<typeof getGitHubClient>;

describe('CommitInfo', () => {
  let command: CommitInfo;
  let mockClient: {
    getCommit: jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>;
  };

  beforeEach(() => {
    command = new CommitInfo();
    jest.clearAllMocks();

    mockClient = {
      getCommit: jest.fn()
    };
    mockGetGitHubClient.mockReturnValue(mockClient as any);

    // Set environment variables
    process.env.GITHUB_REPOSITORY = 'owner/repo';
  });

  afterEach(() => {
    delete process.env.GITHUB_REPOSITORY;
  });

  describe('execute', () => {
    it('should preserve Unicode characters in commit messages', async () => {
      const mockCommitData = {
        sha: 'abc123',
        html_url: 'https://github.com/owner/repo/commit/abc123',
        commit: {
          message: 'feat: add new feature 🚀 with café and naïve résumé テスト',
          author: {
            name: 'John Doe',
            email: 'john@example.com',
            date: '2023-01-01T00:00:00Z'
          },
          committer: {
            name: 'John Doe',
            email: 'john@example.com',
            date: '2023-01-01T00:00:00Z'
          }
        }
      };

      mockClient.getCommit.mockResolvedValue(mockCommitData);

      const args: CommitInfoArgs = {
        sha: 'abc123'
      };

      await command.execute(args);

      expect(mockCore.setOutput).toHaveBeenCalledWith(
        'message-original',
        'feat: add new feature 🚀 with café and naïve résumé テスト'
      );
      expect(mockCore.setOutput).toHaveBeenCalledWith(
        'message',
        'feat: add new feature 🚀 with café and naïve résumé テスト'
      );
      expect(mockCore.setFailed).not.toHaveBeenCalled();
    });

    it('should fail when SHA is missing', async () => {
      const args: CommitInfoArgs = {};

      await command.execute(args);

      expect(mockCore.setFailed).toHaveBeenCalledWith('Commit SHA is required');
      expect(mockClient.getCommit).not.toHaveBeenCalled();
    });

    it('should fail when repository is missing', async () => {
      delete process.env.GITHUB_REPOSITORY;

      const args: CommitInfoArgs = {
        sha: 'abc123'
      };

      await command.execute(args);

      expect(mockCore.setFailed).toHaveBeenCalledWith(
        'Repository is required (either via args.repo or GITHUB_REPOSITORY env var)'
      );
      expect(mockClient.getCommit).not.toHaveBeenCalled();
    });
  });
});
