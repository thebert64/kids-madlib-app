'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import StoryEditor from '@/app/components/StoryEditor';

interface Story {
  id: string;
  title: string;
  content: string;
  shareCode: string;
  template: string;
  blanks: string;
  players: Array<{ id: string; name: string; email?: string }>;
  turns: Array<{ id: string; content: string; order: number }>;
}

interface Player {
  id: string;
  name: string;
  email?: string;
  storyId: string;
}

export default function StoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storyId = params.id as string;
  const playerIdParam = searchParams.get('playerId');

  const [story, setStory] = useState<Story | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const resolvePlayer = useCallback(
    (data: Story): Player | null => {
      if (playerIdParam) {
        const found = data.players.find((p) => p.id === playerIdParam);
        if (found) return found as Player;
      }
      const stored = localStorage.getItem(`madlibs-player-${storyId}`);
      if (stored) {
        const cached = JSON.parse(stored);
        const found = data.players.find((p) => p.id === cached.id);
        if (found) return found as Player;
      }
      return (data.players[0] as Player) ?? null;
    },
    [playerIdParam, storyId]
  );

  const fetchStory = useCallback(async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}`);
      if (!response.ok) throw new Error('Story not found');
      const data: Story = await response.json();
      setStory(data);
      setPlayer((prev) => prev ?? resolvePlayer(data));
      return data;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [storyId, resolvePlayer]);

  // Initial load + polling
  useEffect(() => {
    fetchStory().then(async (data) => {
      // Trigger AI template generation if not yet done
      if (data && !data.template && !generating) {
        setGenerating(true);
        try {
          const res = await fetch(`/api/stories/${storyId}/generate`, { method: 'POST' });
          if (res.ok) {
            const updated: Story = await res.json();
            setStory(updated);
          }
        } catch (err) {
          console.error('Template generation failed:', err);
        } finally {
          setGenerating(false);
        }
      }
    });

    const interval = setInterval(fetchStory, 2500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  const handleFillBlank = async (blankIndex: number, value: string) => {
    if (!player || !story) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/fill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blankIndex, value, playerId: player.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit word');
      }

      const { story: updated } = await response.json();
      setStory(updated);
    } catch (err) {
      console.error('Error filling blank:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-2xl font-bold text-purple-900">Loading story…</p>
        </div>
      </div>
    );
  }

  if (error || !story || !player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-2xl font-bold text-red-900 mb-4">Error</p>
          <p className="text-gray-700 mb-6">{error || 'Could not load story'}</p>
          <a href="/" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-6">
      <StoryEditor
        story={story}
        currentPlayer={player}
        onFillBlank={handleFillBlank}
        isLoading={isSubmitting}
      />
    </div>
  );
}
