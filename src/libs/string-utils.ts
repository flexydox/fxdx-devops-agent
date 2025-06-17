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
  return input.replace(/[^\x20-\x7E]+/g, replaceWith);
}
