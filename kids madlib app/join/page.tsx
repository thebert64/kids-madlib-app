'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'code' | 'link' | null>(null);
  const [shareCode, setShareCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!shareCode.trim() || !playerName.trim() || !playerEmail.trim()) {
      setError('Please fill in your name, email, and the share code');
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
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareCode: shareCode.trim(),
          playerName: playerName.trim(),
          playerEmail: playerEmail.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join story');
      }

      const data = await response.json();

      // Store identity for session recovery
      localStorage.setItem(
        `madlibs-player-${data.story.id}`,
        JSON.stringify({ id: data.player.id, name: data.player.name, email: data.player.email })
      );

      router.push(`/stories/${data.story.id}?playerId=${data.player.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleJoin();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-7xl md:text-8xl font-bold text-green-700 mb-4">
            🔗 Join Story
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-gray-700">Enter the share code to join the fun!</p>
        </div>

        {/* Method Selection */}
        {method === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setMethod('code')}
              className="bg-white rounded-xl shadow-lg p-8 border-4 border-blue-300 hover:shadow-xl transition text-center"
            >
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-3xl font-bold text-blue-900 mb-3">Using Code</h2>
              <p className="text-lg text-gray-800">Enter a 6-character share code</p>
            </button>

            <button
              onClick={() => setMethod('link')}
              className="bg-white rounded-xl shadow-lg p-8 border-4 border-green-300 hover:shadow-xl transition text-center"
            >
              <div className="text-6xl mb-4">🔗</div>
              <h2 className="text-3xl font-bold text-green-900 mb-3">Using Link</h2>
              <p className="text-lg text-gray-800">Paste the share link directly</p>
            </button>
          </div>
        )}

        {/* Join Form */}
        {method && (
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-purple-300 mb-6">
            <button
              onClick={() => setMethod(null)}
              className="text-gray-700 hover:text-gray-900 mb-4 text-xl font-semibold"
            >
              ← Back
            </button>

            <h2 className="text-4xl font-bold text-purple-900 mb-6">Join the Story</h2>

            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg mb-6">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-lg text-gray-800 font-bold mb-3">Your Name:</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-lg text-gray-800 font-bold mb-3">Your Email:</label>
                <input
                  type="email"
                  value={playerEmail}
                  onChange={(e) => setPlayerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 text-lg border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-lg text-gray-800 font-bold mb-3">
                  {method === 'code' ? 'Share Code:' : 'Share Link:'}
                </label>
                <input
                  type={method === 'code' ? 'text' : 'url'}
                  value={shareCode}
                  onChange={(e) => {
                    if (method === 'link') {
                      const url = e.target.value;
                      const match = url.match(/\/join\/([a-zA-Z0-9]+)/);
                      setShareCode(match ? match[1] : url);
                    } else {
                      setShareCode(e.target.value);
                    }
                  }}
                  placeholder={method === 'code' ? 'Enter 6-character code' : 'Paste the share link'}
                  className="w-full px-4 py-3 text-lg text-gray-900 font-semibold bg-white border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-400"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={!shareCode.trim() || !playerName.trim() || !playerEmail.trim() || loading}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-lg transition text-lg"
              >
                {loading ? '⏳ Joining...' : '🎉 Join Story'}
              </button>
            </form>
          </div>
        )}

        {/* Back Button */}
        {method === null && (
          <div className="text-center">
            <a
              href="/"
              className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              ← Back to Home
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
