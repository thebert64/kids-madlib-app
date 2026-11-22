import type { Segment } from '@/lib/madlibs';

export interface StoryPlayer {
  id: string;
  name: string;
}

export interface StoryBlank {
  id: string;
  index: number;
  kind: string;
  filled: boolean;
  word: string | null;
  playerId: string | null;
  playerName: string | null;
}

export interface StoryView {
  id: string;
  title: string;
  content: string;
  shareCode: string;
  mode: string;
  players: StoryPlayer[];
  turns: Array<{ id: string; content: string; order: number }>;
  blanks: StoryBlank[];
  revealed: boolean;
  segments: Segment[] | null;
}
