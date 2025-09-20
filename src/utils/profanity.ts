import filter from 'leo-profanity';
try {
  filter.loadDictionary('en');
  try {
    filter.loadDictionary('pt-br');
  } catch {}
} catch {}

export function hasProfanity(text: string): boolean {
  if (!text) return false;
  return filter.check(text);
}

export function cleanText(text: string): string {
  if (!text) return text;
  return filter.clean(text);
}
