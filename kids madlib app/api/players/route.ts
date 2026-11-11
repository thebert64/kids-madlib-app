import prisma from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { storyId, name, email } = await request.json();

    if (!storyId) {
      return NextResponse.json({ error: 'storyId is required' }, { status: 400 });
    }

    // If email provided, upsert — so a player who closes and re-opens the app
    // gets their existing record back instead of creating a duplicate.
    if (email) {
      const existing = await prisma.player.findFirst({
        where: { storyId, email },
      });

      if (existing) {
        return NextResponse.json(existing);
      }
    }

    const player = await prisma.player.create({
      data: {
        storyId,
        name: name || `Player ${Math.floor(Math.random() * 1000)}`,
        email: email ?? null,
      },
    });

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to create player', details: String(error) },
      { status: 500 }
    );
  }
}
