import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface BlankDef {
  type: string;
  prompt: string;
  hint: string;
  value: string | null;
  filledBy: string | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { blankIndex, value, playerId } = await request.json();

    if (!value?.trim()) {
      return NextResponse.json({ error: 'Value is required' }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id },
      include: { players: true, turns: { orderBy: { order: 'asc' } } },
    });

    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    const blanks: BlankDef[] = JSON.parse((story as any).blanks || '[]');
    const template: string = (story as any).template || '';

    if (blankIndex < 0 || blankIndex >= blanks.length) {
      return NextResponse.json({ error: 'Invalid blank index' }, { status: 400 });
    }

    if (blanks[blankIndex].value !== null) {
      return NextResponse.json({ error: 'Blank already filled' }, { status: 409 });
    }

    // Fill the blank
    blanks[blankIndex].value = value.trim();
    blanks[blankIndex].filledBy = playerId;

    // Check if all blanks are now filled
    const allFilled = blanks.every((b) => b.value !== null);

    // Assemble final story if complete
    let content = story.content;
    if (allFilled && template) {
      content = blanks.reduce(
        (text, blank, i) => text.replaceAll(`{{${i}}}`, blank.value!),
        template
      );
    }

    // Record as a turn for history
    await prisma.turn.create({
      data: {
        storyId: id,
        playerId,
        content: `[${blanks[blankIndex].type}] ${value.trim()}`,
        order: story.turns.length + 1,
      },
    });

    // Update story
    const updated = await prisma.story.update({
      where: { id },
      data: {
        blanks: JSON.stringify(blanks),
        ...(allFilled ? { content } : {}),
      } as any,
      include: { players: true, turns: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ story: updated, complete: allFilled });
  } catch (error) {
    console.error('Error filling blank:', error);
    return NextResponse.json({ error: 'Failed to fill blank' }, { status: 500 });
  }
}
