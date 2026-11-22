import prisma from '@/lib/db';
import { isMailerConfigured, normalizeEmail, sendInviteEmail } from '@/lib/mailer';
import { NextRequest, NextResponse } from 'next/server';

// Simple per-IP limit so the endpoint can't be used to spam inboxes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_INVITES_PER_WINDOW = 10;
const recentInvites = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const timestamps = (recentInvites.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_INVITES_PER_WINDOW) {
    recentInvites.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  recentInvites.set(key, timestamps);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    if (!isMailerConfigured()) {
      return NextResponse.json(
        { error: "Email invites aren't set up on this server yet. Share the link instead!" },
        { status: 503 }
      );
    }

    const { storyId, email, inviterName } = await request.json();

    const to = normalizeEmail(email);
    if (!to) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }
    if (typeof storyId !== 'string' || !storyId) {
      return NextResponse.json({ error: 'Missing story' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many invites sent. Please wait a few minutes and try again.' },
        { status: 429 }
      );
    }

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const baseUrl = process.env.APP_URL || request.nextUrl.origin;
    const joinUrl = new URL(`/join/${story.shareCode}`, baseUrl);
    joinUrl.searchParams.set('email', to);

    await sendInviteEmail({
      to,
      storyTitle: story.title.slice(0, 100),
      inviterName: typeof inviterName === 'string' ? inviterName.trim().slice(0, 50) : undefined,
      joinUrl: joinUrl.toString(),
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}
