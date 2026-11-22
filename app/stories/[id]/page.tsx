'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import StoryEditor from '@/app/components/StoryEditor';
import MadLibsBoard from '@/app/components/MadLibsBoard';
import { recallPlayer, rememberPlayer } from '@/lib/playerIdentity';
import type { StoryPlayer, StoryView } from '@/lib/storyTypes';

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = params.id as string;
  const playerIdParam = searchParams.get('playerId');

  const [story, setStory] = useState<StoryView | null>(null);
  const [player, setPlayer] = useState<StoryPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingTurn, setIsAddingTurn] = useState(false);
  const identityResolved = useRef(false);

  useEffect(() => {
    const fetchStory = async () => {
      let redirecting = false;
      try {
        const response = await fetch(`/api/stories/${storyId}`);
        if (!response.ok) throw new Error('Story not found');

        const data = await response.json();
        setStory(data);

        // Work out who "you" are once. Polling only refreshes the story.
        if (!identityResolved.current) {
          identityResolved.current = true;
          const playerId = playerIdParam ?? recallPlayer(storyId);
          const me = data.players.find((p: StoryPlayer) => p.id === playerId);

          if (me) {
            rememberPlayer(storyId, me.id);
            setPlayer(me);
            // Drop the id from the address bar so a copied link can't
            // make someone else this player.
            if (playerIdParam) router.replace(`/stories/${storyId}`);
          } else {
            // Unknown visitor: send them to pick a name instead of
            // letting them write as someone else.
            redirecting = true;
            router.replace(`/join/${data.shareCode}`);
          }
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        // Keep the loading screen up while an unknown visitor is redirected.
        if (!redirecting) setLoading(false);
      }
    };

    fetchStory();
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchStory, 2000);
    return () => clearInterval(interval);
  }, [storyId, playerIdParam, router]);

  const handleAddTurn = async (content: string) => {
    if (!player || !story) return;

    setIsAddingTurn(true);
    try {
      const response = await fetch('/api/turns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: story.id,
          playerId: player.id,
          content,
        }),
      });

      if (!response.ok) throw new Error('Failed to add turn');

      // Fetch updated story
      const storyResponse = await fetch(`/api/stories/${storyId}`);
      if (!storyResponse.ok) throw new Error('Failed to fetch story');

      const updatedStory = await storyResponse.json();
      setStory(updatedStory);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAddingTurn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-2xl font-bold text-purple-900">Loading story...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      {story.mode === 'madlibs' ? (
        <MadLibsBoard story={story} currentPlayer={player} onStoryChange={setStory} />
      ) : (
        <StoryEditor
          story={story}
          currentPlayer={player}
          onAddTurn={handleAddTurn}
          isLoading={isAddingTurn}
        />
      )}
    </div>
  );
}
