'use client';

import { useState } from 'react';
import Link from 'next/link';
import ShareModal from './ShareModal';
import { MAX_WORD_LENGTH, wordHint } from '@/lib/madlibs';
import type { StoryPlayer, StoryView } from '@/lib/storyTypes';

interface MadLibsBoardProps {
  story: StoryView;
  currentPlayer: StoryPlayer;
  onStoryChange: (story: StoryView) => void;
}

const WORD_COLORS = [
  'bg-pink-200 text-pink-900',
  'bg-yellow-200 text-yellow-900',
  'bg-green-200 text-green-900',
  'bg-blue-200 text-blue-900',
  'bg-purple-200 text-purple-900',
  'bg-orange-200 text-orange-900',
];

export default function MadLibsBoard({ story, currentPlayer, onStoryChange }: MadLibsBoardProps) {
  const [word, setWord] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);

  const total = story.blanks.length;
  const filledCount = story.blanks.filter((b) => b.filled).length;
  const nextBlank = story.blanks.find((b) => !b.filled);
  const hint = nextBlank ? wordHint(nextBlank.kind) : null;

  // Color each player's words the same way in the reveal.
  const playerColor = (playerId: string | null) => {
    const i = story.players.findIndex((p) => p.id === playerId);
    return WORD_COLORS[(i < 0 ? 0 : i) % WORD_COLORS.length];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextBlank || !word.trim()) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch('/api/blanks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: story.id,
          blankId: nextBlank.id,
          playerId: currentPlayer.id,
          word,
        }),
      });
      const data = await response.json();

      if (response.status === 409) {
        // Someone else grabbed this blank first; keep the word for the next one.
        setMessage('Someone just filled that one! Try your word on the next blank.');
        const refreshed = await fetch(`/api/stories/${story.id}`);
        if (refreshed.ok) onStoryChange(await refreshed.json());
        return;
      }
      if (!response.ok) throw new Error(data.error || 'Could not add your word');

      setWord('');
      onStoryChange(data);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
          <div>
            <p className="text-lg font-bold text-purple-700 mb-1">🎭 Mad Libs</p>
            <h1 className="text-5xl md:text-6xl font-bold text-purple-900">{story.title}</h1>
          </div>
          <button
            onClick={() => setShowShare(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition text-lg"
          >
            📤 Share Story
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-lg text-gray-800 font-semibold">
            <strong>👥 Players:</strong> {story.players.map((p) => p.name).join(', ')}
          </p>
          <p className="text-lg text-gray-800 font-semibold">
            <strong>Your Name:</strong> {currentPlayer.name}
          </p>
        </div>
      </div>

      {story.revealed ? (
        <div className="bg-white rounded-lg shadow-xl p-8 border-4 border-yellow-300 mb-6">
          <h2 className="text-4xl font-bold text-yellow-900 mb-6 text-center">🎉 The Big Reveal! 🎉</h2>
          <p className="text-2xl text-gray-900 leading-loose">
            {story.segments?.map((segment, i) =>
              segment.type === 'text' ? (
                <span key={i}>{segment.value}</span>
              ) : (
                <mark
                  key={i}
                  title={wordHint(segment.kind).label}
                  className={`px-2 py-0.5 rounded-md font-bold ${playerColor(
                    story.blanks[segment.index]?.playerId ?? null
                  )}`}
                >
                  {segment.value}
                </mark>
              )
            ) ?? story.content}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            {story.players.map((p) => (
              <span key={p.id} className={`px-3 py-1 rounded-full font-bold ${playerColor(p.id)}`}>
                {p.name}: {story.blanks.filter((b) => b.playerId === p.id).length} words
              </span>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl"
            >
              🚀 Play Another
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-blue-200">
              <div className="flex justify-between text-lg font-bold text-blue-900 mb-2">
                <span>🤫 The story is a secret until every blank is filled!</span>
                <span>
                  {filledCount} / {total}
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all"
                  style={{ width: `${total ? (filledCount / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {nextBlank && hint && (
              <form
                onSubmit={handleSubmit}
                className="bg-yellow-50 rounded-lg shadow-md p-6 border-2 border-yellow-200"
              >
                <p className="text-lg font-bold text-yellow-800 mb-1">Word #{nextBlank.index + 1}</p>
                <label htmlFor="madlib-word" className="block text-4xl font-bold text-yellow-900 mb-2">
                  Give me a {hint.label}!
                </label>
                <p className="text-lg text-gray-700 mb-4">
                  {hint.hint}
                  {hint.example && <span className="italic"> (like “{hint.example}”)</span>}
                </p>

                {message && (
                  <div className="bg-orange-100 border-2 border-orange-300 text-orange-900 px-4 py-3 rounded-lg mb-4">
                    {message}
                  </div>
                )}

                <input
                  id="madlib-word"
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  maxLength={MAX_WORD_LENGTH}
                  autoComplete="off"
                  placeholder={`Type a ${hint.label.toLowerCase()}...`}
                  className="w-full p-4 text-2xl text-gray-900 font-semibold bg-white border-2 border-yellow-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 mb-4 placeholder-gray-400"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!word.trim() || submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition text-lg"
                >
                  {submitting ? '⏳ Adding...' : '✨ Add My Word'}
                </button>
              </form>
            )}
          </div>

          <div className="bg-pink-50 rounded-lg shadow-md p-6 border-2 border-pink-200">
            <h2 className="text-3xl font-bold text-pink-900 mb-4">📝 Words</h2>
            <ol className="space-y-2 max-h-96 overflow-y-auto">
              {story.blanks.map((blank) => (
                <li
                  key={blank.id}
                  className={`p-3 rounded border-l-4 ${
                    blank.filled ? 'bg-white border-pink-500' : 'bg-pink-100 border-pink-200'
                  }`}
                >
                  <p className="text-sm font-bold text-pink-700">
                    #{blank.index + 1} {wordHint(blank.kind).label}
                  </p>
                  <p className="text-base text-gray-800">
                    {blank.filled ? `🤫 added by ${blank.playerName ?? 'someone'}` : 'Waiting...'}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {showShare && <ShareModal story={story} onClose={() => setShowShare(false)} />}
    </div>
  );
}
