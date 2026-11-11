import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Try to perform a simple query to check if the database is initialized
    const storyCount = await prisma.story.count();
    
    return NextResponse.json({
      status: 'Database is ready',
      stories: storyCount,
      initialized: true,
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    
    // Log the error details for debugging
    return NextResponse.json(
      {
        status: 'Database initialization',
        error: error.message,
        initialized: false,
      },
      { status: 200 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const storyCount = await prisma.story.count();
    
    return NextResponse.json({
      status: 'ok',
      stories: storyCount,
      initialized: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        initialized: false,
      },
      { status: 200 }
    );
  }
}
