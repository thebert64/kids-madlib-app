import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { storyId, playerId, content } = await request.json();

    // Get the current turn count
    const turnCount = await prisma.turn.count({
      where: { storyId },
    });

    const turn = await prisma.turn.create({
      data: {
        storyId,
        playerId,
        content,
        order: turnCount + 1,
      },
    });

    // Update story content
    const allTurns = await prisma.turn.findMany({
      where: { storyId },
      orderBy: { order: 'asc' },
    });

    const fullContent = allTurns.map(t => t.content).join(' ');

    await prisma.story.update({
      where: { id: storyId },
      data: { content: fullContent },
    });

    return NextResponse.json(turn);
  } catch (error) {
    console.error('Error adding turn:', error);
    return NextResponse.json(
      { error: 'Failed to add turn', details: String(error) },
      { status: 500 }
    );
  }
}
