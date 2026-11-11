import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { shareCode, playerName, playerEmail } = await request.json();

    if (!shareCode) {
      return NextResponse.json({ error: 'shareCode is required' }, { status: 400 });
    }

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

    // If the player already joined with this email, return their existing record
    // so they can seamlessly rejoin without creating a duplicate.
    if (playerEmail) {
      const existing = await prisma.player.findFirst({
        where: { storyId: story.id, email: playerEmail },
      });

      if (existing) {
        return NextResponse.json({ story, player: existing });
      }
    }

    const player = await prisma.player.create({
      data: {
        storyId: story.id,
        name: playerName || `Player ${Math.floor(Math.random() * 1000)}`,
        email: playerEmail ?? null,
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
