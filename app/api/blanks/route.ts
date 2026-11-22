import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getTemplate } from '@/lib/madlibTemplates';
import { cleanWord, fillTemplate, segmentsToText } from '@/lib/madlibs';
import { loadStoryView } from '@/lib/storyView';

// Fill in one Mad Libs blank. The last word in also writes the finished story.
export async function POST(request: NextRequest) {
  try {
    const { storyId, blankId, playerId, word } = await request.json();

    const cleaned = cleanWord(word);
    if (!cleaned) {
      return NextResponse.json({ error: 'Please enter a word (40 letters max)' }, { status: 400 });
    }

    const player = await prisma.player.findFirst({ where: { id: playerId, storyId } });
    if (!player) {
      return NextResponse.json({ error: 'Join the story before adding words' }, { status: 403 });
    }

    // Only fill the blank if nobody beat us to it.
    const { count } = await prisma.blank.updateMany({
      where: { id: blankId, storyId, word: null },
      data: { word: cleaned, playerId },
    });
    if (count === 0) {
      return NextResponse.json({ error: 'Someone already filled that blank' }, { status: 409 });
    }

    const remaining = await prisma.blank.count({ where: { storyId, word: null } });
    if (remaining === 0) {
      const story = await prisma.story.findUnique({ where: { id: storyId } });
      const template = getTemplate(story?.templateId);
      if (template) {
        const blanks = await prisma.blank.findMany({ where: { storyId }, orderBy: { index: 'asc' } });
        const content = segmentsToText(fillTemplate(template.text, blanks.map((b) => b.word ?? '')));
        await prisma.story.update({ where: { id: storyId }, data: { content } });
      }
    }

    return NextResponse.json(await loadStoryView(storyId));
  } catch (error) {
    console.error('Error filling blank:', error);
    return NextResponse.json(
      { error: 'Failed to add word', details: String(error) },
      { status: 500 }
    );
  }
}
