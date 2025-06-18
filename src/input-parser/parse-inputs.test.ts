import { parseInputs, parseIssuesString } from './parse-inputs.js';

describe('parseInputs', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('parses command, subcommand, and args from environment variables', () => {
    process.env.INPUT_COMMAND = 'jira';
    process.env.INPUT_SUBCOMMAND = 'add-comment';
    process.env.INPUT_ARGS = '{"issues":"PROJ-1,PROJ-2","comment":"Test"}';
    const result = parseInputs();
    expect(result).toEqual({
      command: 'jira',
      subcommand: 'add-comment',
      args: { issues: 'PROJ-1,PROJ-2', comment: 'Test' }
    });
  });

  it('returns empty args if INPUT_ARGS is not set', () => {
    process.env.INPUT_COMMAND = 'github';
    process.env.INPUT_SUBCOMMAND = 'get-diff-data';
    delete process.env.INPUT_ARGS;
    const result = parseInputs();
    expect(result).toEqual({
      command: 'github',
      subcommand: 'get-diff-data',
      args: {}
    });
  });

  it('returns empty args if INPUT_ARGS is invalid JSON', () => {
    process.env.INPUT_COMMAND = 'github';
    process.env.INPUT_SUBCOMMAND = 'get-diff-data';
    process.env.INPUT_ARGS = '{invalid json}';
    const result = parseInputs();
    expect(result).toEqual({
      command: 'github',
      subcommand: 'get-diff-data',
      args: {}
    });
  });
});

it('returns one entry for a single issue', () => {
  process.env.INPUT_COMMAND = 'jira';
  process.env.INPUT_SUBCOMMAND = 'update-status';
  process.env.INPUT_ARGS = '{"issues":"DEV-1366","targetStatus":"In Progress"}';
  const result = parseInputs();
  expect(result).toEqual({
    command: 'jira',
    subcommand: 'update-status',
    args: { issues: 'DEV-1366', targetStatus: 'In Progress' }
  });
});

describe('parseIssuesString', () => {
  it('splits and trims a comma-separated string', () => {
    expect(parseIssuesString('PROJ-1, PROJ-2,PROJ-3')).toEqual(['PROJ-1', 'PROJ-2', 'PROJ-3']);
  });

  it('filters out empty entries', () => {
    expect(parseIssuesString('PROJ-1, , ,PROJ-2,,')).toEqual(['PROJ-1', 'PROJ-2']);
  });

  it('returns an empty array for an empty string', () => {
    expect(parseIssuesString('')).toEqual([]);
  });
  it('returns one entry for a single issue', () => {
    expect(parseIssuesString('DEV-1366')).toEqual(['DEV-1366']);
  });
});
