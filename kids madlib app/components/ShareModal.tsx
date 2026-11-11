'use client';

import { useEffect, useState } from 'react';

interface ShareModalProps {
  story: {
    id: string;
    title: string;
    shareCode: string;
  };
  onClose: () => void;
}

type Tab = 'link' | 'email' | 'qr';

export default function ShareModal({ story, onClose }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('link');
  const [friendEmail, setFriendEmail] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/join/${story.shareCode}`);
    }
  }, [story.shareCode]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join my Mad Libs story: ${story.title}`,
        text: `Come add to our collaborative story! Use code: ${story.shareCode}`,
        url: shareUrl,
      });
    } else {
      handleCopy();
    }
  };

  // Opens the player's own email client with the invite pre-written — no server needed
  const handleEmailOpen = () => {
    const to = friendEmail.trim() ? encodeURIComponent(friendEmail.trim()) : '';
    const subject = encodeURIComponent(`Join my Mad Libs story: "${story.title}"! 🎨`);
    const body = encodeURIComponent(
      `Hey!\n\nI'm building a collaborative Mad Libs story and want you to join!\n\n` +
      `📖 Story: "${story.title}"\n` +
      `🔗 Join link: ${shareUrl}\n` +
      `🔑 Or use code: ${story.shareCode}\n\n` +
      `Just click the link, enter your name and email, and start writing! 🎉`
    );
    window.open(`mailto:${to}?subject=${subject}&body=${body}`, '_blank');
  };

  // SMS link — works on mobile, opens Messages app with invite pre-filled
  const handleSMS = () => {
    const body = encodeURIComponent(
      `Join my Mad Libs story "${story.title}"! 🎨\n${shareUrl}`
    );
    window.open(`sms:?body=${body}`, '_blank');
  };

  // QR code via free public API (no install needed)
  const qrUrl = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(shareUrl)}`
    : '';

  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=20&data=${encodeURIComponent(shareUrl)}`;
    a.download = `madlibs-invite-${story.shareCode}.png`;
    a.target = '_blank';
    a.click();
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'link', label: '🔗 Link' },
    { id: 'email', label: '✉️ Email' },
    { id: 'qr', label: '📱 QR Code' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border-4 border-purple-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-purple-900">🎉 Invite Friends</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="text-base text-gray-700 font-semibold mb-4">
          Share <span className="text-purple-700">"{story.title}"</span> and build it together!
        </p>

        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden border-2 border-purple-200 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 font-bold text-sm transition ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-700 hover:bg-purple-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Share Link Tab ── */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">
                Share Code
              </p>
              <p className="text-4xl font-mono font-bold text-purple-900 tracking-widest">
                {story.shareCode}
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Link</p>
              <p className="text-sm font-mono text-blue-800 break-all">{shareUrl}</p>
            </div>

            <button
              onClick={handleCopy}
              className={`w-full py-3 rounded-xl font-bold text-base transition ${
                copied ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </button>

            <button
              onClick={handleNativeShare}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-base transition"
            >
              📤 Share via Phone / App
            </button>
          </div>
        )}

        {/* ── Email Tab ── */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Opens <strong>your</strong> email app with the invite already written — just hit send!
            </p>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Friend's Email <span className="font-normal text-gray-500">(optional — pre-fills the To: field)</span>
              </label>
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder="friend@example.com"
                className="w-full px-4 py-3 text-base text-gray-900 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 placeholder-gray-400"
              />
            </div>

            <button
              onClick={handleEmailOpen}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition text-base"
            >
              ✉️ Open Email App
            </button>

            <button
              onClick={handleSMS}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 rounded-xl transition text-base"
            >
              💬 Send via SMS / iMessage
            </button>

            <p className="text-xs text-gray-400 text-center">
              Works with any email or messaging app on your device. No server required.
            </p>
          </div>
        )}

        {/* ── QR Code Tab ── */}
        {activeTab === 'qr' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Show this to a friend — they scan it with their phone camera to join instantly.
            </p>

            {qrUrl && (
              <div className="flex justify-center">
                <div className="bg-white border-4 border-purple-300 rounded-2xl p-3 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt="QR code to join story"
                    width={220}
                    height={220}
                    className="rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">
                Share Code
              </p>
              <p className="text-2xl font-mono font-bold text-purple-900 tracking-widest">
                {story.shareCode}
              </p>
            </div>

            <button
              onClick={handleDownloadQR}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition text-base"
            >
              ⬇️ Download QR Image
            </button>

            <p className="text-xs text-gray-400 text-center">
              Screenshot or download the QR to share in a group chat, text, or print it out!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
