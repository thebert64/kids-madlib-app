'use client';

import { useState } from 'react';
import ShareModal from './ShareModal';

interface BlankDef {
  type: string;
  prompt: string;
  hint: string;
  value: string | null;
  filledBy: string | null;
}

interface Story {
  id: string;
  title: string;
  content: string;
  shareCode: string;
  template: string;
  blanks: string; // JSON
  players: Array<{ id: string; name: string; email?: string }>;
  turns: Array<{ id: string; content: string; order: number }>;
}

interface Player {
  id: string;
  name: string;
  email?: string;
}

interface StoryEditorProps {
  story: Story;
  currentPlayer: Player;
  onFillBlank: (blankIndex: number, value: string) => Promise<void>;
  isLoading?: boolean;
}

// Render the template preview: filled blanks shown inline, unfilled shown as ____
function renderTemplate(template: string, blanks: BlankDef[]) {
  if (!template) return null;
  const parts = template.split(/({{[0-9]+}})/g);
  return parts.map((part, i) => {
    const match = part.match(/{{([0-9]+)}}/);
    if (!match) return <span key={i}>{part}</span>;
    const idx = parseInt(match[1]);
    const blank = blanks[idx];
    if (!blank) return <span key={i} className="text-gray-400">____</span>;
    if (blank.value) {
      return (
        <span key={i} className="font-bold text-purple-700 underline decoration-dotted">
          {blank.value}
        </span>
      );
    }
    return (
      <span key={i} className="inline-block bg-yellow-100 border-b-2 border-yellow-400 px-2 text-yellow-700 font-bold">
        [{blank.type}]
      </span>
    );
  });
}

const TYPE_EMOJI: Record<string, string> = {
  NOUN: '🧩', VERB: '⚡', ADJECTIVE: '🌈', ADVERB: '💨',
  ANIMAL: '🐾', PLACE: '📍', NAME: '✨', NUMBER: '🔢',
  EXCLAMATION: '💥', BODY_PART: '👁️', FOOD: '🍕', COLOR: '🎨',
};

export default function StoryEditor({
  story,
  currentPlayer,
  onFillBlank,
  isLoading = false,
}: StoryEditorProps) {
  const [input, setInput] = useState('');
  const [showShare, setShowShare] = useState(false);

  const blanks: BlankDef[] = (() => {
    try { return JSON.parse(story.blanks || '[]'); } catch { return []; }
  })();

  const filledCount = blanks.filter((b) => b.value !== null).length;
  const totalCount = blanks.length;
  const allFilled = totalCount > 0 && filledCount === totalCount;
  const activeBlankIndex = blanks.findIndex((b) => b.value === null);
  const activeBlank = activeBlankIndex >= 0 ? blanks[activeBlankIndex] : null;
  const activePlayer =
    activeBlankIndex >= 0 && story.players.length > 0
      ? story.players[activeBlankIndex % story.players.length]
      : null;
  const isMyTurn = activePlayer?.id === currentPlayer.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || activeBlankIndex < 0) return;
    await onFillBlank(activeBlankIndex, input.trim());
    setInput('');
  };

  // ── Generating state ──────────────────────────────────────────────────────
  if (!story.template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">✨</div>
          <p className="text-2xl font-bold text-purple-900 mb-2">Creating your story template…</p>
          <p className="text-gray-600">The AI is writing a hilarious Mad Libs just for you!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow-lg p-5 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-900">{story.title}</h1>
          <button
            onClick={() => setShowShare(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold transition text-base shrink-0"
          >
            📤 Invite Friends
          </button>
        </div>
        <p className="text-base text-gray-700 font-semibold">
          👥 {story.players.map((p) => p.name).join(', ')}
        </p>

        {/* Progress bar */}
        {!allFilled && totalCount > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-sm font-bold text-purple-700 mb-1">
              <span>Blanks filled</span>
              <span>{filledCount} / {totalCount}</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (filledCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Complete story reveal ── */}
      {allFilled ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-yellow-300 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-3xl font-bold text-yellow-900 mb-2">Story Complete!</h2>
            <p className="text-gray-600">All the blanks are filled — enjoy the hilarity!</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">📖 {story.title}</h2>
            <p className="text-lg text-gray-800 leading-relaxed">
              {renderTemplate(story.template, blanks)}
            </p>
          </div>

          {/* Word reveal list */}
          <div className="bg-pink-50 rounded-xl shadow p-5 border-2 border-pink-200">
            <h3 className="text-xl font-bold text-pink-900 mb-4">🃏 All the Words Used</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {blanks.map((b, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border border-pink-200 text-center">
                  <p className="text-xs font-bold text-pink-600 uppercase tracking-wide">
                    {TYPE_EMOJI[b.type] ?? '📝'} {b.type}
                  </p>
                  <p className="text-base font-bold text-gray-900 mt-1">{b.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Story preview */}
          <div className="bg-white rounded-xl shadow-md p-5 border-2 border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-3">📖 Story So Far</h2>
            <p className="text-base text-gray-800 leading-relaxed">
              {renderTemplate(story.template, blanks)}
            </p>
            <p className="text-xs text-gray-400 mt-3 italic">
              Filled words are shown in purple · unfilled blanks show the word type
            </p>
          </div>

          {/* Blank filling panel */}
          <div>
            {isMyTurn && activeBlank ? (
              <div className="bg-yellow-50 rounded-xl shadow-md p-5 border-4 border-yellow-300">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">
                    {TYPE_EMOJI[activeBlank.type] ?? '📝'}
                  </div>
                  <p className="text-sm font-bold text-yellow-700 uppercase tracking-widest mb-1">
                    Blank #{activeBlankIndex + 1} of {totalCount} — {activeBlank.type}
                  </p>
                  <h2 className="text-2xl font-bold text-yellow-900">{activeBlank.prompt}</h2>
                  <p className="text-sm text-gray-500 mt-1">{activeBlank.hint}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Type a ${activeBlank.type.toLowerCase()}…`}
                    className="w-full px-4 py-3 text-lg text-gray-900 font-semibold border-2 border-yellow-300 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 placeholder-gray-400"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-xl transition text-lg"
                  >
                    {isLoading ? '⏳ Submitting…' : '✅ Submit Word'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-xl shadow-md p-5 border-2 border-blue-200 text-center">
                <div className="text-4xl mb-3">⏳</div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">
                  Waiting for {activePlayer?.name ?? 'someone'}…
                </h2>
                {activeBlank && (
                  <p className="text-gray-600">
                    They need to give us a{' '}
                    <span className="font-bold text-blue-700">{activeBlank.type}</span>
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-3">
                  The page updates automatically every few seconds.
                </p>
              </div>
            )}

            {/* Blanks filled so far */}
            {filledCount > 0 && (
              <div className="mt-4 bg-white rounded-xl shadow-md p-4 border-2 border-purple-100">
                <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-3">
                  Words Submitted So Far
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blanks
                    .filter((b) => b.value !== null)
                    .map((b, i) => (
                      <span
                        key={i}
                        className="bg-purple-100 text-purple-800 text-sm font-bold px-3 py-1 rounded-full"
                      >
                        {TYPE_EMOJI[b.type] ?? '📝'} {b.value}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showShare && (
        <ShareModal story={story} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
