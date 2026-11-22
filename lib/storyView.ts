import prisma from '@/lib/db';
import { getTemplate } from '@/lib/madlibTemplates';
import { fillTemplate } from '@/lib/madlibs';

/**
 * Load a story in the shape the story page expects. For Mad Libs stories the
 * words stay hidden until every blank is filled, then the full story is
 * returned as segments so the client can highlight each player's word.
 */
export async function loadStoryView(id: string) {
  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      players: true,
      turns: { orderBy: { order: 'asc' } },
      blanks: { orderBy: { index: 'asc' }, include: { player: true } },
    },
  });
  if (!story) return null;

  const { blanks, ...rest } = story;
  if (story.mode !== 'madlibs') return { ...rest, blanks: [], revealed: false, segments: null };

  const revealed = blanks.length > 0 && blanks.every((b) => b.word !== null);
  const template = getTemplate(story.templateId);

  return {
    ...rest,
    revealed,
    blanks: blanks.map((b) => ({
      id: b.id,
      index: b.index,
      kind: b.kind,
      filled: b.word !== null,
      word: revealed ? b.word : null,
      playerId: b.playerId,
      playerName: b.player?.name ?? null,
    })),
    segments:
      revealed && template ? fillTemplate(template.text, blanks.map((b) => b.word ?? '')) : null,
  };
}
