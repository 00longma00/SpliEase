import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  AlertCircle, 
  Users, 
  QrCode 
} from 'lucide-react';
import { Group, Member } from '../types/index.ts';
import { getRandomColor } from '../utils/storage.ts';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  activeGroup: Group | null;
  initialCode?: string;
  onJoinGroup: (group: Group, newMember: Member) => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  isOpen,
  onClose,
  groups,
  activeGroup,
  initialCode = '',
  onJoinGroup,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'join' | 'invite'>(initialCode ? 'join' : 'join');
  const [code, setCode] = useState(initialCode);
  const [userName, setUserName] = useState('');
  const [avatarColor, setAvatarColor] = useState(getRandomColor());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const targetGroup = activeGroup || groups[0];

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?code=${targetGroup?.joinCode || ''}`
    : '';

  const handleCopyCode = () => {
    if (!targetGroup) return;
    navigator.clipboard.writeText(targetGroup.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMessage('Please enter a 6-character group join code.');
      return;
    }

    if (!userName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    // Find group by join code or id
    const foundGroup = groups.find(
      (g) => g.joinCode.toUpperCase() === cleanCode || g.id === cleanCode
    );

    if (!foundGroup) {
      setErrorMessage(
        `Group code "${cleanCode}" was not found. Please verify the code with your group organizer.`
      );
      return;
    }

    // Check if already in group by name
    const existing = foundGroup.members.find(
      (m) => m.name.toLowerCase() === userName.trim().toLowerCase()
    );

    if (existing) {
      setErrorMessage(`You are already a member of "${foundGroup.name}" as ${existing.name}.`);
      return;
    }

    const newMember: Member = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: userName.trim(),
      avatarColor,
      joinedAt: new Date().toISOString(),
    };

    onJoinGroup(foundGroup, newMember);
    onClose();
  };

  const colorOptions = [
    '#059669', // Emerald
    '#2563eb', // Blue
    '#7c3aed', // Purple
    '#db2777', // Pink
    '#d97706', // Amber
    '#0891b2', // Cyan
    '#dc2626', // Red
    '#4f46e5', // Indigo
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header with Tabs */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">
              Group Access & Invitations
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'join'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Join with Code</span>
            </button>
            <button
              onClick={() => setActiveTab('invite')}
              className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'invite'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Invite Friends</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Join with Code */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                6-Digit Group Join Code
              </label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="e.g. TAHOE8 or PINES3"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full text-center tracking-widest font-mono text-lg font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 mt-1 block text-center">
                Ask the group creator for their 6-character code
              </span>
            </div>

            {/* Member Profile */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-900 block">
                Your Member Profile
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taylor Brooks"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Choose Avatar Color
                </label>
                <div className="flex items-center gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        avatarColor === c ? 'scale-125 ring-2 ring-slate-800 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors"
              >
                Join Group Now
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Invite Friends */}
        {activeTab === 'invite' && (
          <div className="p-6 space-y-5">
            {targetGroup ? (
              <>
                <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Join Code for {targetGroup.name}
                  </span>
                  <div className="font-mono text-3xl font-extrabold tracking-widest text-slate-900 my-2">
                    {targetGroup.joinCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Code Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy 6-Digit Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Shareable Link Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Direct Invite URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="w-full text-xs font-mono bg-slate-50 text-slate-600 px-3 py-2 rounded-xl border border-slate-200 select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shrink-0 transition-colors"
                    >
                      {copiedLink ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Friends can open this link to self-add themselves directly into {targetGroup.name}.
                  </p>
                </div>

                {/* How it works note */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Self-Join</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Members add themselves with their name. They can immediately log shared expenses, view everyone's balance, and record payments.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">No active group selected.</p>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
