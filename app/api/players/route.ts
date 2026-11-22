import prisma from '@/lib/db';
import { normalizeEmail } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { storyId, name, email } = await request.json();

    const player = await prisma.player.create({
      data: {
        storyId,
        name: name || `Player ${Math.floor(Math.random() * 1000)}`,
        email: normalizeEmail(email),
      },
    });

    return NextResponse.json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: 'Failed to join story', details: String(error) },
      { status: 500 }
    );
  }
}
