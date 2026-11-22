'use client';

import { useState } from 'react';
import ShareModal from './ShareModal';

interface Story {
  id: string;
  title: string;
  content: string;
  shareCode: string;
  players: Array<{ id: string; name: string }>;
  turns: Array<{ id: string; content: string; order: number }>;
}

interface Player {
  id: string;
  name: string;
}

interface StoryEditorProps {
  story: Story;
  currentPlayer: Player;
  onAddTurn: (content: string) => void;
  isLoading?: boolean;
}

export default function StoryEditor({
  story,
  currentPlayer,
  onAddTurn,
  isLoading = false,
}: StoryEditorProps) {
  const [input, setInput] = useState('');
  const [showShare, setShowShare] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAddTurn(input);
      setInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
          <h1 className="text-5xl md:text-6xl font-bold text-purple-900">{story.title}</h1>
          <button
            onClick={() => setShowShare(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition text-lg"
          >
            📤 Share Story
          </button>
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-lg text-gray-800 font-semibold">
            <strong>👥 Players:</strong> {story.players.map(p => p.name).join(', ')}
          </p>
          <p className="text-lg text-gray-800 font-semibold">
            <strong>Your Name:</strong> {currentPlayer.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Story Display */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 min-h-64 border-2 border-blue-200">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">📖 Story</h2>
            {story.content ? (
              <p className="text-xl text-gray-800 leading-relaxed">{story.content}</p>
            ) : (
              <p className="text-xl text-gray-400 italic">The story begins...</p>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="bg-yellow-50 rounded-lg shadow-md p-6 border-2 border-yellow-200">
            <label className="block text-2xl font-bold text-yellow-900 mb-3">
              ✏️ Add Your Part
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add to the story... (noun, verb, adjective, or continue the story)"
              className="w-full p-4 text-lg text-gray-900 font-semibold bg-white border-2 border-yellow-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 mb-4 resize-none placeholder-gray-400"
              rows={4}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition text-lg"
            >
              {isLoading ? '⏳ Adding...' : '✨ Add to Story'}
            </button>
          </form>
        </div>

        {/* Turns History */}
        <div className="bg-pink-50 rounded-lg shadow-md p-6 border-2 border-pink-200">
          <h2 className="text-3xl font-bold text-pink-900 mb-4">📝 Turns</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {story.turns.length > 0 ? (
              story.turns.map((turn, index) => (
                <div key={turn.id} className="bg-white p-4 rounded border-l-4 border-pink-500">
                  <p className="text-sm font-bold text-pink-700">Turn {index + 1}</p>
                  <p className="text-base text-gray-800 mt-2">{turn.content}</p>
                </div>
              ))
            ) : (
              <p className="text-lg text-gray-400 italic">No turns yet. Start the story!</p>
            )}
          </div>
        </div>
      </div>

      {showShare && (
        <ShareModal
          story={story}
          inviterName={currentPlayer.name}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
