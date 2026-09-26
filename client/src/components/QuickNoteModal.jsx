import React, { useState, useEffect } from 'react';
import { X, Check, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

export const QUICK_NOTES = [
  { label: 'Low spicy', emoji: '🌶️', desc: 'Mild chili' },
  { label: 'No beef', emoji: '🥩', desc: 'Exclude beef' },
  { label: 'Low oil', emoji: '💧', desc: 'Healthy prep' },
  { label: 'Extra chicken', emoji: '🍗', desc: 'Add chicken' },
  { label: 'Extra beef', emoji: '🥩', desc: 'Add beef' },
  { label: 'No cuttlefish', emoji: '🦑', desc: 'Exclude cuttlefish' },
  { label: 'No prawn', emoji: '🦐', desc: 'Exclude prawn' },
  { label: 'With Icecream', emoji: '🍨', desc: 'Include ice cream' },
  { label: 'Extra egg', emoji: '🥚', desc: 'Add fried/boiled egg' },
];

/**
 * Reusable modal for adding/editing quick notes on items or orders.
 */
export const QuickNoteModal = ({
  isOpen,
  onClose,
  item = null,
  initialNote = '',
  onSave,
  onSkip,
  title = '',
}) => {
  const [noteText, setNoteText] = useState(initialNote || '');

  useEffect(() => {
    if (isOpen) {
      setNoteText(initialNote || '');
    }
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

  // Toggle a quick note phrase in the current text
  const handleToggleNote = (phrase) => {
    const existingParts = noteText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const existsIndex = existingParts.findIndex(
      (p) => p.toLowerCase() === phrase.toLowerCase()
    );

    let updatedParts;
    if (existsIndex >= 0) {
      // Remove
      updatedParts = existingParts.filter((_, idx) => idx !== existsIndex);
    } else {
      // Add
      updatedParts = [...existingParts, phrase];
    }

    setNoteText(updatedParts.join(', '));
  };

  const isSelected = (phrase) => {
    const parts = noteText
      .split(',')
      .map((s) => s.trim().toLowerCase());
    return parts.includes(phrase.toLowerCase());
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    onSave(noteText.trim());
  };

  const handleSkipOrNoNote = () => {
    if (onSkip) {
      onSkip();
    } else {
      onSave('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#141419] border border-[#2B2B38] rounded-2xl max-w-md w-full p-4 sm:p-5 space-y-4 shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-[#24242E]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-[#FF6B00] border border-orange-500/20">
                <FileText className="w-4 h-4" />
              </span>
              <h3 className="font-black text-sm sm:text-base text-white">
                {title || (item ? `Quick Note: ${item.name}` : 'Order Quick Note')}
              </h3>
            </div>
            {item && (
              <p className="text-[11px] text-neutral-400 mt-1 pl-8">
                {item.category || item.department} • Rs. {item.price?.toLocaleString()}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Note Presets Grid */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
            Select Quick Notes:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_NOTES.map((qn) => {
              const active = isSelected(qn.label);
              return (
                <button
                  key={qn.label}
                  type="button"
                  onClick={() => handleToggleNote(qn.label)}
                  className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between active:scale-95 ${
                    active
                      ? 'bg-gradient-to-br from-[#FF6B00] to-[#E05A00] text-white border-orange-400 shadow-md shadow-orange-500/25 ring-1 ring-white/30'
                      : 'bg-[#1C1C24] border-[#2A2A38] text-neutral-300 hover:border-neutral-500 hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-base">{qn.emoji}</span>
                    {active && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-[11px] font-bold mt-1.5 leading-tight block">
                    {qn.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Note / Custom Textarea */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Note Preview / Custom Note:
            </label>
            {noteText && (
              <button
                type="button"
                onClick={() => setNoteText('')}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Tap options above or type custom special instructions (e.g. Less spicy, extra sauce)..."
            rows={2}
            className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 outline-none resize-none"
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-[#24242E]">
          <button
            type="button"
            onClick={handleSkipOrNoNote}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-neutral-300 hover:text-white border border-[#2B2B38] text-xs font-bold transition-all"
          >
            No Note (Skip)
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8A33] hover:from-[#E55A00] hover:to-[#FF6B00] text-white text-xs font-black shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Reusable horizontal chip bar for quick tapping notes into an existing input/textarea.
 */
export const QuickNotePills = ({ onAppendNote, selectedText = '' }) => {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar items-center">
      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-0.5">
        <Sparkles className="w-3 h-3 text-[#FF6B00]" />
        Quick Notes:
      </span>
      {QUICK_NOTES.map((qn) => {
        const isIncluded = selectedText
          .toLowerCase()
          .includes(qn.label.toLowerCase());

        return (
          <button
            key={qn.label}
            type="button"
            onClick={() => onAppendNote(qn.label)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1 active:scale-95 ${
              isIncluded
                ? 'bg-[#FF6B00] text-white border-orange-400 shadow-sm'
                : 'bg-[#1C1C24] text-neutral-300 border-[#2A2A38] hover:border-neutral-500 hover:text-white'
            }`}
          >
            <span>{qn.emoji}</span>
            <span>{qn.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickNoteModal;
