import { NextResponse } from 'next/server';
import { MADLIB_TEMPLATES } from '@/lib/madlibTemplates';
import { parseBlanks } from '@/lib/madlibs';

// List Mad Libs templates without their story text, so nobody can peek.
export async function GET() {
  return NextResponse.json(
    MADLIB_TEMPLATES.map((t) => ({
      id: t.id,
      title: t.title,
      blurb: t.blurb,
      blankCount: parseBlanks(t.text).length,
    }))
  );
}
