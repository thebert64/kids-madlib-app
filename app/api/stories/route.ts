import prisma from '@/lib/db';
import { getTemplate } from '@/lib/madlibTemplates';
import { parseBlanks } from '@/lib/madlibs';
import { NextRequest, NextResponse } from 'next/server';

// GET all stories or create new
export async function GET(request: NextRequest) {
  try {
    const stories = await prisma.story.findMany({
      include: {
        players: true,
        turns: { orderBy: { order: 'asc' } },
      },
    });
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, mode, templateId } = await request.json();

    if (mode === 'madlibs') {
      const template = getTemplate(templateId);
      if (!template) {
        return NextResponse.json({ error: 'Unknown Mad Libs template' }, { status: 400 });
      }

      const story = await prisma.story.create({
        data: {
          title: title || template.title,
          mode: 'madlibs',
          templateId: template.id,
          blanks: {
            create: parseBlanks(template.text).map((kind, index) => ({ index, kind })),
          },
        },
      });

      return NextResponse.json(story);
    }

    const story = await prisma.story.create({
      data: {
        title: title || 'Untitled Story',
      },
      include: {
        players: true,
        turns: true,
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story', details: String(error) },
      { status: 500 }
    );
  }
}
