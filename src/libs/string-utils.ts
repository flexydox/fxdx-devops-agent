import { transliterate } from 'transliteration';

export function transliterateText(input: string): string {
  return transliterate(input);
}

export function normalizeString(input: string): string {
  return input.toLowerCase();
}

export function inferIssues(text: string, issuePattern: string): string[] {
  if (!text) {
    return [];
  }
  const issuesList: string[] = [];
  const issueMatches = text.match(new RegExp(issuePattern, 'g'));
  if (issueMatches) {
    for (const match of issueMatches) {
      issuesList.push(match);
    }
  }
  return issuesList;
}

export function sanitizeNonPrintableChars(input: string, replaceWith: string): string {
  if (!input) {
    return '';
  }
  return (
    input
      .replaceAll('\r', '')
      .replaceAll('\n', '|')
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C-\x1F\x7F-\x9F]+/g, replaceWith)
      .replace(/\s+/g, ' ')
      .replaceAll('"', '')
      .replace(/\|+/g, '|')
      .trim()
  );
}
