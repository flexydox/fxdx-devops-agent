import { parseVersion } from './parse-version.js';

describe('parseVersion', () => {
  it('should parse a valid version string', () => {
    const result = parseVersion('1.0.0');
    expect(result).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      build: undefined,
      pre: undefined
    });
  });
  it('should parse a version with pre-release identifiers', () => {
    const result = parseVersion('1.0.0-alpha.1');
    expect(result).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      build: undefined,
      pre: ['alpha', 1]
    });
  });
  it('should parse a version with build metadata', () => {
    const result = parseVersion('1.0.0+20130313144700');
    expect(result).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      build: '20130313144700',
      pre: undefined
    });
  });
  it('should parse a version with build metadata and pre-release identifiers', () => {
    const result = parseVersion('1.0.0-alpha.1+20130313144700');
    expect(result).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      build: '20130313144700',
      pre: ['alpha', 1]
    });
  });

  it('should parse a version with multiple build metadata  and pre-release identifiers', () => {
    const result = parseVersion('1.0.0-alpha.1+20130313144700.build.2.sha345');
    expect(result).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      build: '20130313144700.build.2.sha345',
      pre: ['alpha', 1]
    });
  });
});
