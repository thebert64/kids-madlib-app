'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import StoryDisplay from '@/app/components/StoryDisplay';

interface Story {
  id: string;
  title: string;
  content: string;
  shareCode: string;
  players: Array<{ id: string; name: string }>;
  turns: Array<{ id: string; content: string; order: number }>;
}

export default function JoinShareCodePage() {
  const params = useParams();
  const router = useRouter();
  const shareCode = params.shareCode as string;

  const [story, setStory] = useState<Story | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        // Try to find story by share code
        const allStoriesResponse = await fetch('/api/stories');
        if (!allStoriesResponse.ok) throw new Error('Failed to fetch stories');

        const allStories = await allStoriesResponse.json();
        const foundStory = allStories.find((s: Story) => s.shareCode === shareCode);

        if (!foundStory) throw new Error('Story not found');

        setStory(foundStory);

        // Email invite links carry ?email= so the invited player's email is prefilled.
        const invitedEmail = new URLSearchParams(window.location.search).get('email');
        if (invitedEmail) setPlayerEmail(invitedEmail);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [shareCode]);

  const handleJoin = async () => {
    if (!playerName.trim() || !story) return;

    setJoiningLoading(true);
    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareCode: story.shareCode,
          playerName: playerName.trim(),
          playerEmail: playerEmail.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to join story');

      const data = await response.json();
      setJoined(true);
      setTimeout(() => {
        router.push(`/stories/${story.id}?playerId=${encodeURIComponent(data.player.id)}`);
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setJoiningLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold text-blue-900">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-2xl font-bold text-red-900 mb-4">Oops!</p>
          <p className="text-gray-700 mb-6">{error || 'Could not find story'}</p>
          <a
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
      {!joined ? (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Story Preview */}
            <StoryDisplay story={story} />

            {/* Join Form */}
            <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-green-300 h-fit">
              <h2 className="text-3xl font-bold text-green-900 mb-6">🎉 Join the Story!</h2>

              <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <p className="text-gray-700">
                  <strong>Story:</strong> {story.title}
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Players:</strong> {story.players.length}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Your Name:</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500"
                    disabled={joiningLoading}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    Your Email <span className="font-normal text-gray-500">(optional)</span>:
                  </label>
                  <input
                    type="email"
                    value={playerEmail}
                    onChange={(e) => setPlayerEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500"
                    disabled={joiningLoading}
                  />
                </div>

                <button
                  onClick={handleJoin}
                  disabled={!playerName.trim() || joiningLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 rounded-lg transition text-lg"
                >
                  {joiningLoading ? '⏳ Joining...' : '✨ Join & Start Writing'}
                </button>

                <a
                  href="/"
                  className="block text-center bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg transition"
                >
                  ← Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-3xl font-bold text-green-900 mb-2">Welcome!</p>
            <p className="text-xl text-gray-700">Redirecting to the story...</p>
          </div>
        </div>
      )}
    </main>
  );
}
