'use client';

import { useEffect, useState } from 'react';

interface ShareModalProps {
  story: {
    id: string;
    shareCode: string;
  };
  inviterName?: string;
  onClose: () => void;
}

export default function ShareModal({ story, inviterName, onClose }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/join/${story.shareCode}`;
      setShareUrl(url);
    }
  }, [story.shareCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;

    setInviteStatus('sending');
    setInviteMessage('');
    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.id, email, inviterName }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Failed to send invite');

      setInviteStatus('sent');
      setInviteMessage(`Invite sent to ${email}!`);
      setInviteEmail('');
    } catch (err) {
      setInviteStatus('error');
      setInviteMessage((err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-purple-900 mb-4">🎉 Share Your Story</h2>

        <p className="text-lg text-gray-800 mb-6 font-semibold">
          Invite friends to join and create this story together!
        </p>

        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-4">
          <p className="text-sm font-bold text-purple-700 mb-2">Share Code:</p>
          <p className="text-2xl font-mono font-bold text-purple-900 break-all">{story.shareCode}</p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
          <p className="text-sm font-bold text-blue-700 mb-2">Share Link:</p>
          <p className="text-base font-mono text-blue-900 break-all">{shareUrl}</p>
        </div>

        <form
          onSubmit={handleSendInvite}
          className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6"
        >
          <label htmlFor="invite-email" className="block text-sm font-bold text-green-700 mb-2">
            ✉️ Invite by Email:
          </label>
          <div className="flex gap-2">
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@example.com"
              className="flex-1 min-w-0 px-3 py-2 border-2 border-green-300 rounded-lg text-gray-900 focus:outline-none focus:border-green-500"
              disabled={inviteStatus === 'sending'}
            />
            <button
              type="submit"
              disabled={!inviteEmail.trim() || inviteStatus === 'sending'}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-bold transition"
            >
              {inviteStatus === 'sending' ? 'Sending...' : 'Send'}
            </button>
          </div>
          {inviteMessage && (
            <p
              role="status"
              className={`mt-2 text-sm font-semibold ${
                inviteStatus === 'sent' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {inviteMessage}
            </p>
          )}
        </form>

        <div className="space-y-3">
          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-lg font-bold transition text-lg ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {copied ? '✓ Copied to Clipboard!' : '📋 Copy Link'}
          </button>

          <button
            onClick={() => {
              const text = `Join my Mad Libs story! ${shareUrl}`;
              if (navigator.share) {
                navigator.share({
                  title: 'Mad Libs Story',
                  text: text,
                });
              } else {
                handleCopy();
              }
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition text-lg"
          >
            📤 Share
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 py-3 rounded-lg font-bold transition text-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
