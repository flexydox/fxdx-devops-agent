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
  // Remove control characters that can cause issues in Slack/display
  // - Remove NULL, SOH-BS (0x00-0x08)
  // - Remove VT, FF (0x0B, 0x0C) - vertical tab, form feed
  // - Remove SO-US (0x0E-0x1F) - various control characters
  // - Remove DEL and C1 controls (0x7F-0x9F)
  // - Convert CR and LF to space (0x0D, 0x0A) for consistent line endings
  // - Preserve TAB (0x09) as it's useful for formatting
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C-\x1F\x7F-\x9F]+/g, replaceWith);
}
