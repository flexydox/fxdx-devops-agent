import * as github from '@actions/github';
import * as core from '@actions/core';

/**
 * Centralized GitHub API client using Octokit
 * This is the single source of truth for all GitHub API interactions
 */
export class GitHubClient {
  private static instance: GitHubClient;
  private octokit: ReturnType<typeof github.getOctokit>;
  private _owner: string;
  private _repo: string;

  private constructor() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

    this.octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;
    this._owner = owner;
    this._repo = repo;

    core.debug(`Initialized GitHub client for ${owner}/${repo}`);
  }

  /**
   * Get the singleton instance of GitHubClient
   */
  public static getInstance(): GitHubClient {
    if (!GitHubClient.instance) {
      GitHubClient.instance = new GitHubClient();
    }
    return GitHubClient.instance;
  }

  /**
   * Get repository owner
   */
  public get owner(): string {
    return this._owner;
  }

  /**
   * Get repository name
   */
  public get repo(): string {
    return this._repo;
  }

  /**
   * Get full repository name (owner/repo)
   */
  public get fullRepo(): string {
    return `${this._owner}/${this._repo}`;
  }

  /**
   * Get pull request information
   */
  public async getPullRequest(prNumber: number) {
    core.debug(`Fetching PR #${prNumber}`);

    const response = await this.octokit.rest.pulls.get({
      owner: this._owner,
      repo: this._repo,
      pull_number: prNumber
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch pull request #${prNumber}. Status: ${response.status}`);
    }

    return response.data;
  }

  /**
   * Get commits for a pull request
   */
  public async getPullRequestCommits(prNumber: number) {
    core.debug(`Fetching commits for PR #${prNumber}`);

    const commits = [];
    let page = 1;
    const per_page = 100; // Maximum allowed by GitHub API

    while (true) {
      const response = await this.octokit.rest.pulls.listCommits({
        owner: this._owner,
        repo: this._repo,
        pull_number: prNumber,
        page,
        per_page
      });

      if (response.status !== 200) {
        throw new Error(`Failed to fetch commits for PR #${prNumber}. Status: ${response.status}`);
      }

      commits.push(...response.data);

      // If we got fewer results than requested, we've reached the end
      if (response.data.length < per_page) {
        break;
      }

      page++;
    }

    core.debug(`Fetched ${commits.length} commits for PR #${prNumber}`);
    return commits;
  }

  /**
   * Get files changed in a pull request
   */
  public async getPullRequestFiles(prNumber: number) {
    core.debug(`Fetching files for PR #${prNumber}`);

    const response = await this.octokit.rest.pulls.listFiles({
      owner: this._owner,
      repo: this._repo,
      pull_number: prNumber
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch files for PR #${prNumber}. Status: ${response.status}`);
    }

    return response.data;
  }

  /**
   * Get commit information by SHA
   */
  public async getCommit(sha: string, repoOwner?: string, repoName?: string) {
    const owner = repoOwner || this._owner;
    const repo = repoName || this._repo;

    core.debug(`Fetching commit ${sha} from ${owner}/${repo}`);

    const response = await this.octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: sha
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch commit ${sha}. Status: ${response.status}`);
    }

    return response.data;
  }

  /**
   * Get comments for a pull request
   */
  public async getPullRequestComments(prNumber: number) {
    core.debug(`Fetching comments for PR #${prNumber}`);

    const response = await this.octokit.rest.issues.listComments({
      owner: this._owner,
      repo: this._repo,
      issue_number: prNumber
    });

    if (response.status !== 200) {
      throw new Error(`Failed to fetch comments for PR #${prNumber}. Status: ${response.status}`);
    }

    return response.data;
  }

  /**
   * Create a comment on a pull request
   */
  public async createPullRequestComment(prNumber: number, body: string) {
    core.debug(`Creating comment on PR #${prNumber}`);

    const response = await this.octokit.rest.issues.createComment({
      owner: this._owner,
      repo: this._repo,
      issue_number: prNumber,
      body
    });

    if (response.status !== 201) {
      throw new Error(`Failed to create comment on PR #${prNumber}. Status: ${response.status}`);
    }

    return response.data;
  }

  /**
   * Update an existing comment
   */
  public async updateComment(commentId: number, body: string) {
    core.debug(`Updating comment ${commentId}`);

    const response = await this.octokit.rest.issues.updateComment({
      owner: this._owner,
      repo: this._repo,
      comment_id: commentId,
      body
    });

    if (response.status !== 200) {
      throw new Error(`Failed to update comment ${commentId}. Status: ${response.status}`);
    }

    return response.data;
  }

  /**
   * Delete an existing comment
   */
  public async deleteComment(commentId: number) {
    core.debug(`Deleting comment ${commentId}`);

    const response = await this.octokit.rest.issues.deleteComment({
      owner: this._owner,
      repo: this._repo,
      comment_id: commentId
    });

    if (response.status > 299) {
      throw new Error(`Failed to delete comment ${commentId}. Status: ${response.status}`);
    }

    return response.data;
  }

  /**
   * Parse repository string (owner/repo) and return components
   */
  public static parseRepo(repoString: string): { owner: string; repo: string } {
    const parts = repoString.split('/');
    if (parts.length !== 2) {
      throw new Error(`Invalid repository format: ${repoString}. Expected format: owner/repo`);
    }
    return { owner: parts[0], repo: parts[1] };
  }
}

/**
 * Convenience function to get the GitHub client instance
 */
export function getGitHubClient(): GitHubClient {
  return GitHubClient.getInstance();
}
