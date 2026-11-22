// Shared Mad Libs helpers. Safe to import from client components: this file
// holds no story text, so players can't peek at a template before the reveal.

export const WORD_HINTS: Record<string, { label: string; hint: string; example: string }> = {
  noun: { label: 'Noun', hint: 'A person, place, or thing', example: 'trampoline' },
  'plural noun': { label: 'Plural Noun', hint: 'More than one thing', example: 'pancakes' },
  adjective: { label: 'Adjective', hint: 'A word that describes something', example: 'sparkly' },
  verb: { label: 'Verb', hint: 'An action word', example: 'jump' },
  'verb ending in ing': { label: 'Verb ending in "-ing"', hint: 'An action happening right now', example: 'wiggling' },
  'past tense verb': { label: 'Past Tense Verb', hint: 'An action that already happened', example: 'galloped' },
  adverb: { label: 'Adverb', hint: 'How something is done (often ends in -ly)', example: 'loudly' },
  animal: { label: 'Animal', hint: 'Any creature, real or made up', example: 'platypus' },
  food: { label: 'Food', hint: 'Something you can eat', example: 'spaghetti' },
  place: { label: 'Place', hint: 'Somewhere you could go', example: 'the moon' },
  color: { label: 'Color', hint: 'Any color at all', example: 'purple' },
  number: { label: 'Number', hint: 'Any number', example: '47' },
  'body part': { label: 'Body Part', hint: 'A part of your body', example: 'elbow' },
  'silly word': { label: 'Silly Word', hint: 'Make up a funny word!', example: 'flibbertigibbet' },
  name: { label: 'Name', hint: "Someone's name", example: 'Grandma Lou' },
  exclamation: { label: 'Exclamation', hint: 'Something you shout', example: 'Yikes' },
};

export function wordHint(kind: string) {
  return WORD_HINTS[kind] ?? { label: kind, hint: 'Any word you like', example: '' };
}

const BLANK_PATTERN = /\{([^{}]+)\}/g;

export type Segment = { type: 'text'; value: string } | { type: 'word'; value: string; kind: string; index: number };

/** The blank kinds in a template, in the order they appear. */
export function parseBlanks(template: string): string[] {
  return Array.from(template.matchAll(BLANK_PATTERN), (m) => m[1].trim().toLowerCase());
}

/** Split a template into text and filled-word segments for the reveal. */
export function fillTemplate(template: string, words: string[]): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  let i = 0;
  for (const match of template.matchAll(BLANK_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ type: 'text', value: template.slice(last, start) });
    segments.push({ type: 'word', value: words[i] ?? '___', kind: match[1].trim().toLowerCase(), index: i });
    last = start + match[0].length;
    i++;
  }
  if (last < template.length) segments.push({ type: 'text', value: template.slice(last) });
  return segments;
}

export function segmentsToText(segments: Segment[]): string {
  return segments.map((s) => s.value).join('');
}

export const MAX_WORD_LENGTH = 40;

/** Trim and validate a player's word. Returns null if it can't be used. */
export function cleanWord(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const word = raw.replace(/\s+/g, ' ').trim();
  if (!word || word.length > MAX_WORD_LENGTH) return null;
  return word;
}
