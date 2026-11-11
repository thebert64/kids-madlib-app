'use client';

import { useEffect, useState } from 'react';

interface Story {
  id: string;
  title: string;
  content: string;
  shareCode: string;
  players: Array<{ id: string; name: string }>;
  turns: Array<{ id: string; content: string; order: number }>;
}

interface StoryDisplayProps {
  story: Story;
}

export default function StoryDisplay({ story }: StoryDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg shadow-lg p-8 mb-6">
        <h1 className="text-5xl md:text-6xl font-bold text-indigo-900 mb-4">{story.title}</h1>
        <p className="text-xl text-gray-800 font-semibold">
          Created by: {story.players[0]?.name || 'Unknown'} | {story.players.length} player{story.players.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 border-4 border-indigo-200">
        <h2 className="text-3xl font-bold text-indigo-900 mb-6">📖 The Story</h2>
        {story.content ? (
          <p className="text-2xl text-gray-800 leading-relaxed whitespace-pre-wrap">{story.content}</p>
        ) : (
          <p className="text-xl text-gray-400 italic">No content yet...</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
          <h3 className="text-3xl font-bold text-blue-900 mb-4">👥 Players</h3>
          <ul className="space-y-3">
            {story.players.map((player) => (
              <li key={player.id} className="text-xl text-gray-800 font-semibold">
                ✨ {player.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 rounded-lg shadow-md p-6 border-2 border-green-200">
          <h3 className="text-3xl font-bold text-green-900 mb-4">📊 Story Stats</h3>
          <p className="text-xl text-gray-800 mb-3 font-semibold">
            <strong>Turns:</strong> {story.turns.length}
          </p>
          <p className="text-xl text-gray-800 font-semibold">
            <strong>Words:</strong> {story.content.split(/\s+/).length}
          </p>
        </div>
      </div>
    </div>
  );
}
