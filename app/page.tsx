'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TemplateSummary {
  id: string;
  title: string;
  blurb: string;
  blankCount: number;
}

export default function Home() {
  const [stories, setStories] = useState<Array<{ id: string; title: string }>>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'madlibs' | 'freeform'>('madlibs');
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => (res.ok ? res.json() : []))
      .then((list: TemplateSummary[]) => {
        setTemplates(list);
        setTemplateId((current) => current ?? list[0]?.id ?? null);
      })
      .catch(() => setTemplates([]));
  }, []);

  const isMadLibs = mode === 'madlibs';
  const canCreate = playerName.trim() && (isMadLibs ? templateId : title.trim());

  const createStory = async () => {
    if (!canCreate) {
      setError(isMadLibs ? 'Please enter your name and pick a story' : 'Please enter both your name and a story title');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isMadLibs ? { title: title.trim(), mode, templateId } : { title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create story');
      }

      const story = await response.json();
      
      // Create initial player
      const playerResponse = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: story.id,
          name: playerName,
          email: playerEmail.trim() || undefined,
        }),
      });

      if (!playerResponse.ok) {
        throw new Error('Failed to create player');
      }

      const player = await playerResponse.json();

      // Redirect to story editor
      window.location.href = `/stories/${story.id}?playerId=${encodeURIComponent(player.id)}`;
    } catch (error) {
      console.error('Error creating story:', error);
      setError((error as Error).message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-7xl md:text-8xl font-bold mb-4 text-purple-700">
            🎨 Mad Libs Stories
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-gray-700">Create collaborative stories with friends!</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Create Story Card */}
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-purple-300">
            <h2 className="text-4xl font-bold text-purple-900 mb-6">📝 Create New Story</h2>

            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg mb-6 text-lg">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-lg text-gray-800 font-bold mb-3">Your Name:</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 text-lg text-gray-900 font-semibold bg-white border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-lg text-gray-800 font-bold mb-3">
                  Your Email <span className="font-normal text-gray-500">(optional)</span>:
                </label>
                <input
                  type="email"
                  value={playerEmail}
                  onChange={(e) => setPlayerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 text-lg text-gray-900 font-semibold bg-white border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-400"
                />
              </div>

              <div>
                <span className="block text-lg text-gray-800 font-bold mb-3">Game Type:</span>
                <div className="grid grid-cols-2 gap-3">
                  {(['madlibs', 'freeform'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      aria-pressed={mode === m}
                      className={`py-3 rounded-lg font-bold text-lg border-2 transition ${
                        mode === m
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-purple-900 border-purple-300 hover:border-purple-500'
                      }`}
                    >
                      {m === 'madlibs' ? '🎭 Mad Libs' : '✍️ Free Write'}
                    </button>
                  ))}
                </div>
                <p className="text-base text-gray-700 mt-2">
                  {isMadLibs
                    ? 'Everyone fills in silly words without seeing the story, then you read it together!'
                    : 'Take turns writing the story one part at a time.'}
                </p>
              </div>

              {isMadLibs && (
                <div>
                  <span className="block text-lg text-gray-800 font-bold mb-3">Pick a Story:</span>
                  <div className="space-y-2">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplateId(t.id)}
                        aria-pressed={templateId === t.id}
                        className={`w-full text-left p-3 rounded-lg border-2 transition ${
                          templateId === t.id
                            ? 'bg-purple-50 border-purple-500'
                            : 'bg-white border-purple-200 hover:border-purple-400'
                        }`}
                      >
                        <span className="block font-bold text-purple-900">{t.title}</span>
                        <span className="block text-sm text-gray-700">
                          {t.blurb} · {t.blankCount} words
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-lg text-gray-800 font-bold mb-3">
                  Story Title{isMadLibs && ' (optional)'}:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isMadLibs ? "Leave blank to use the story's name" : "Enter story title"}
                  className="w-full px-4 py-3 text-lg text-gray-900 font-semibold bg-white border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-400"
                />
              </div>

              <button
                onClick={createStory}
                disabled={!canCreate || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-lg transition text-xl"
              >
                {loading ? '⏳ Creating...' : '🚀 Start New Story'}
              </button>
            </div>
          </div>

          {/* Join Story Card */}
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-green-300">
            <h2 className="text-4xl font-bold text-green-900 mb-6">🔗 Join Story</h2>

            <div className="space-y-6 flex flex-col justify-center">
              <p className="text-lg text-gray-800 text-center font-semibold">
                Got a share code or link? Join an existing story and add your part to the adventure!
              </p>

              <Link
                href="/join"
                className="block text-center bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-4 rounded-lg transition text-xl"
              >
                🔗 Join Existing Story
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-yellow-300">
          <h2 className="text-4xl font-bold text-yellow-900 mb-8">❓ How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-7xl mb-4">📖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Create</h3>
              <p className="text-lg text-gray-800">Start a new story and invite friends</p>
            </div>

            <div className="text-center">
              <div className="text-7xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Collaborate</h3>
              <p className="text-lg text-gray-800">Take turns adding to the story</p>
            </div>

            <div className="text-center">
              <div className="text-7xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Share</h3>
              <p className="text-lg text-gray-800">Share your hilarious creation!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
