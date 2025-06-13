import { transliterate } from 'transliteration';

export function transliterateText(input: string): string {
  return transliterate(input);
}

export function normalizeString(input: string): string {
  return input.toLowerCase();
}
