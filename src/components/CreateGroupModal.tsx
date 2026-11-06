import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Plus, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import { 
  CurrencyCode, 
  Group, 
  GroupCategory, 
  Member, 
  SUPPORTED_CURRENCIES 
} from '../types/index.ts';
import { generateJoinCode, getRandomColor } from '../utils/storage.ts';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (group: Group) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GroupCategory>('trip');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [memberNames, setMemberNames] = useState<string[]>(['Alex', 'Maya', 'Jordan']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddMemberField = () => {
    setMemberNames([...memberNames, '']);
  };

  const handleRemoveMemberField = (idx: number) => {
    setMemberNames(memberNames.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx: number, val: string) => {
    const updated = [...memberNames];
    updated[idx] = val;
    setMemberNames(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter a group name.');
      return;
    }

    const validNames = memberNames.map((n) => n.trim()).filter(Boolean);
    if (validNames.length === 0) {
      setErrorMessage('Please provide at least one group member name.');
      return;
    }

    const members: Member[] = [];
    for (const clean of validNames) {
      if (!members.some((m) => m.name.toLowerCase() === clean.toLowerCase())) {
        members.push({
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: clean,
          avatarColor: getRandomColor(),
          joinedAt: new Date().toISOString(),
        });
      }
    }

    const newGroup: Group = {
      id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      currency,
      joinCode: generateJoinCode(6),
      createdAt: new Date().toISOString(),
      createdBy: members[0]?.id || 'admin',
      members,
    };

    onCreateGroup(newGroup);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create a New Group</h3>
              <p className="text-xs text-slate-500">Organize shared expenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Group Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hawaii Vacation 2026, Sunset Apt, Road Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                aria-label="Group Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as GroupCategory)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
              >
                <option value="trip">Trip / Travel</option>
                <option value="home">Home / Apartment</option>
                <option value="couple">Couple</option>
                <option value="project">Project / Work</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <select
                aria-label="Group Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Shared expenses for hotel, rental car, meals"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Group Members List */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">
                Initial Members
              </span>
              <button
                type="button"
                onClick={handleAddMemberField}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add member</span>
              </button>
            </div>

            <div className="space-y-2">
              {memberNames.map((memName, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Member #${idx + 1} name`}
                    value={memName}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {memberNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMemberField(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Members can also self-add anytime using the shareable link or 6-digit Join Code!
            </p>
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
              Create Group
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
