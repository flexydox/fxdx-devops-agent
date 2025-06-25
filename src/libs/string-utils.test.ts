import { sanitizeNonPrintableChars, transliterateText } from './string-utils.js';

describe('sanitizeNonPrintableChars', () => {
  it('should preserve basic ASCII text', () => {
    const input = 'Hello World!';
    const result = sanitizeNonPrintableChars(input, ' ');
    expect(result).toBe('Hello World!');
  });

  it('should remove actual control characters', () => {
    const input = 'Hello\x00\x01\x02World';
    const result = sanitizeNonPrintableChars(input, ' ');
    expect(result).toBe('Hello World');
  });

  it('should preserve Unicode characters (emoji)', () => {
    const input = 'feat: add new feature 🚀';
    const result = sanitizeNonPrintableChars(input, ' ');
    // Currently this fails - the emoji gets replaced with space
    // After fix, this should preserve the emoji
    expect(result).toBe('feat: add new feature 🚀');
  });

  it('should preserve accented characters', () => {
    const input = 'café, naïve, résumé';
    const result = sanitizeNonPrintableChars(input, ' ');
    // Currently this fails - accented chars get replaced
    // After fix, this should preserve the accented characters
    expect(result).toBe('café, naïve, résumé');
  });

  it('should preserve Unicode symbols and punctuation', () => {
    const input = 'Price: $100 → €85 ± 5%';
    const result = sanitizeNonPrintableChars(input, ' ');
    expect(result).toBe('Price: $100 → €85 ± 5%');
  });

  it('should preserve CJK characters', () => {
    const input = 'テスト 测试 테스트';
    const result = sanitizeNonPrintableChars(input, ' ');
    expect(result).toBe('テスト 测试 테스트');
  });

  it('should replace newline characters with spaces', () => {
    const input = `
    line 1
    line 2

    line 3`;

    const result = sanitizeNonPrintableChars(input, ' ');
    expect(result).toBe('| line 1| line 2| line 3'); // newlines replaced with spaces
  });
});

describe('transliterateText', () => {
  it('should convert non-Latin characters to Latin equivalents', () => {
    const input = 'café';
    const result = transliterateText(input);
    expect(result).toBe('cafe');
  });
});
