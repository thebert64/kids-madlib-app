'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createStory = async () => {
    if (!title.trim() || !playerName.trim() || !playerEmail.trim()) {
      setError('Please fill in your name, email, and a story title');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(playerEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create story');
      }

      const story = await response.json();

      // Create initial player with email
      const playerResponse = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: story.id,
          name: playerName,
          email: playerEmail,
        }),
      });

      if (!playerResponse.ok) {
        throw new Error('Failed to create player');
      }

      const player = await playerResponse.json();

      // Store identity in localStorage for session recovery
      localStorage.setItem(
        `madlibs-player-${story.id}`,
        JSON.stringify({ id: player.id, name: player.name, email: player.email })
      );

      window.location.href = `/stories/${story.id}?playerId=${player.id}`;
    } catch (err) {
      console.error('Error creating story:', err);
      setError((err as Error).message || 'An error occurred. Please try again.');
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
                <label className="block text-lg text-gray-800 font-bold mb-3">Your Email:</label>
                <input
                  type="email"
                  value={playerEmail}
                  onChange={(e) => setPlayerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 text-lg text-gray-900 font-semibold bg-white border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-lg text-gray-800 font-bold mb-3">Story Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter story title"
                  className="w-full px-4 py-3 text-lg text-gray-900 font-semibold bg-white border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-400"
                />
              </div>

              <button
                onClick={createStory}
                disabled={!title.trim() || !playerName.trim() || !playerEmail.trim() || loading}
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
