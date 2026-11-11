import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Word type definitions with kid-friendly prompts
const WORD_TYPES = {
  NOUN:        { prompt: 'Name any person, place, or thing!',     hint: 'e.g. "banana", "robot", "teacher"' },
  VERB:        { prompt: 'Give us an action word (past tense)!',   hint: 'e.g. "jumped", "exploded", "wiggled"' },
  ADJECTIVE:   { prompt: 'Give us a describing word!',             hint: 'e.g. "slimy", "enormous", "sparkly"' },
  ADVERB:      { prompt: 'How did they do it? (-ly word)',         hint: 'e.g. "loudly", "sneakily", "wildly"' },
  ANIMAL:      { prompt: 'Name any animal!',                       hint: 'e.g. "penguin", "platypus", "llama"' },
  PLACE:       { prompt: 'Name a place!',                          hint: 'e.g. "moon", "library", "volcano"' },
  NAME:        { prompt: 'Make up a silly name!',                  hint: 'e.g. "Blobsworth", "Zinga McGee"' },
  NUMBER:      { prompt: 'Pick any number!',                       hint: 'e.g. "47", "1,000,000", "0.5"' },
  EXCLAMATION: { prompt: 'Give us an exclamation!',                hint: 'e.g. "Zoinks!", "Oh my pickles!"' },
  BODY_PART:   { prompt: 'Name a body part (keep it silly)!',      hint: 'e.g. "elbow", "earlobe", "kneecap"' },
  FOOD:        { prompt: 'Name any food!',                         hint: 'e.g. "spaghetti", "pickle", "waffle"' },
  COLOR:       { prompt: 'Name a color!',                          hint: 'e.g. "neon orange", "polka-dot purple"' },
};

type WordType = keyof typeof WORD_TYPES;

interface BlankDef {
  type: WordType;
  prompt: string;
  hint: string;
  value: string | null;
  filledBy: string | null;
}

// Fallback templates when no API key is configured
const FALLBACK_TEMPLATES: { template: string; blanks: Pick<BlankDef, 'type'>[] }[] = [
  {
    template: 'Once upon a time, a {{0}} {{1}} named {{2}} decided to {{3}} all the way to {{4}}. Along the way, they found a {{5}} {{6}} and shouted "{{7}}!" Then everything went {{8}} and they all lived {{9}} ever after.',
    blanks: [
      { type: 'ADJECTIVE' }, { type: 'ANIMAL' }, { type: 'NAME' }, { type: 'VERB' },
      { type: 'PLACE' }, { type: 'COLOR' }, { type: 'NOUN' }, { type: 'EXCLAMATION' },
      { type: 'ADVERB' }, { type: 'ADVERB' },
    ],
  },
  {
    template: 'The world\'s most {{0}} {{1}} woke up one morning and {{2}} out of bed. "{{3}}!" they cried, seeing {{4}} {{5}}s covering their {{6}}. They called their friend {{7}} and together they {{8}} to the {{9}} to fix the problem.',
    blanks: [
      { type: 'ADJECTIVE' }, { type: 'NOUN' }, { type: 'VERB' }, { type: 'EXCLAMATION' },
      { type: 'NUMBER' }, { type: 'ANIMAL' }, { type: 'BODY_PART' }, { type: 'NAME' },
      { type: 'VERB' }, { type: 'PLACE' },
    ],
  },
];

function buildBlanks(blankDefs: Pick<BlankDef, 'type'>[]): BlankDef[] {
  return blankDefs.map((b) => ({
    ...b,
    prompt: WORD_TYPES[b.type]?.prompt ?? 'Give us a word!',
    hint: WORD_TYPES[b.type]?.hint ?? '',
    value: null,
    filledBy: null,
  }));
}

function getFallbackTemplate(title: string) {
  // Pick a fallback based on title length as a cheap hash
  const index = title.length % FALLBACK_TEMPLATES.length;
  const { template, blanks } = FALLBACK_TEMPLATES[index];
  return { template, blanks: buildBlanks(blanks) };
}

function buildPrompt(title: string): string {
  return `You are a Mad Libs story generator for kids. Create a funny, kid-friendly Mad Libs template for a story titled "${title}".

Rules:
- Write a 3-5 sentence story with exactly 10 blanks
- Use {{0}} through {{9}} as placeholders in order
- Keep it silly, fun, and appropriate for children aged 6-12
- Make the story flow naturally so the filled-in words create hilarious results
- Use a mix of these word types: NOUN, VERB, ADJECTIVE, ADVERB, ANIMAL, PLACE, NAME, NUMBER, EXCLAMATION, BODY_PART, FOOD, COLOR

Respond with ONLY valid JSON in this exact format (no other text):
{
  "template": "The story text with {{0}} {{1}} ... {{9}} placeholders...",
  "types": ["ADJECTIVE", "NOUN", "VERB", "PLACE", "ANIMAL", "NAME", "NUMBER", "EXCLAMATION", "BODY_PART", "ADVERB"]
}`;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const story = await prisma.story.findUnique({
      where: { id },
      include: { players: true, turns: { orderBy: { order: 'asc' } } },
    });

    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    // Already generated — return as-is
    if ((story as any).template) return NextResponse.json(story);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let template: string;
    let blanks: BlankDef[];

    if (!apiKey) {
      // No API key — use a built-in template
      ({ template, blanks } = getFallbackTemplate(story.title));
    } else {
      try {
        // Dynamically import to avoid crashing if SDK not installed
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const client = new Anthropic({ apiKey });

        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{ role: 'user', content: buildPrompt(story.title) }],
        });

        const text =
          response.content[0].type === 'text' ? response.content[0].text : '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in response');

        const parsed = JSON.parse(jsonMatch[0]);
        template = parsed.template as string;
        const types: WordType[] = parsed.types;

        blanks = buildBlanks(types.map((t) => ({ type: t })));
      } catch (err) {
        console.error('AI generation failed, using fallback:', err);
        ({ template, blanks } = getFallbackTemplate(story.title));
      }
    }

    const updated = await prisma.story.update({
      where: { id },
      data: {
        template,
        blanks: JSON.stringify(blanks),
      } as any,
      include: { players: true, turns: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error generating story template:', error);
    return NextResponse.json({ error: 'Failed to generate story' }, { status: 500 });
  }
}
