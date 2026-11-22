import prisma from '@/lib/db';
import { normalizeEmail } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { shareCode, playerName, playerEmail } = await request.json();

    const story = await prisma.story.findUnique({
      where: { shareCode },
      include: {
        players: true,
        turns: { orderBy: { order: 'asc' } },
      },
    });

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Add player to story
    const player = await prisma.player.create({
      data: {
        storyId: story.id,
        name: playerName || `Player ${Math.floor(Math.random() * 1000)}`,
        email: normalizeEmail(playerEmail),
      },
    });

    return NextResponse.json({ story, player });
  } catch (error) {
    console.error('Error joining story:', error);
    return NextResponse.json(
      { error: 'Failed to join story', details: String(error) },
      { status: 500 }
    );
  }
}
