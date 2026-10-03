import React, { useState, useEffect } from 'react';
import { X, Check, FileText, Sparkles, CheckCircle2, Coffee, UtensilsCrossed, Flame } from 'lucide-react';

export const QUICK_NOTE_CATEGORIES = {
  DESSERT_DRINKS: {
    id: 'DESSERT_DRINKS',
    label: 'Ice Cream & Drinks',
    icon: '🍨',
    notes: [
      { label: 'Low sugar', emoji: '🍨', desc: 'Reduced sugar' },
      { label: 'No sugar', emoji: '🚫', desc: 'Zero added sugar' },
      { label: 'Less sweet', emoji: '🍯', desc: 'Mild sweetness' },
      { label: 'Less ice', emoji: '🧊', desc: 'Cold with little ice' },
      { label: 'No ice', emoji: '🧊❌', desc: 'Serve without ice' },
      { label: 'With Ice Cream', emoji: '🍦', desc: 'Include scoop of ice cream' },
      { label: 'Extra scoop', emoji: '🍨', desc: 'Extra scoop' },
      { label: 'No nuts', emoji: '🥜❌', desc: 'Allergy: No nuts / peanuts' },
      { label: 'With honey', emoji: '🍯', desc: 'Add honey' },
      { label: 'Separately packed', emoji: '📦', desc: 'Pack separately' },
    ],
  },
  BUN_BAKERY: {
    id: 'BUN_BAKERY',
    label: 'Buns & Bakery',
    icon: '🥖',
    notes: [
      { label: 'Warm / Heat', emoji: '🔥', desc: 'Warm up bun before serving' },
      { label: 'Extra spicy', emoji: '🌶️🔥', desc: 'Extra spicy filling' },
      { label: 'Mild / Less spicy', emoji: '🌶️', desc: 'Low spice' },
      { label: 'No spicy', emoji: '🟢', desc: 'Non-spicy' },
      { label: 'Extra sauce', emoji: '🍅', desc: 'Extra ketchup / chili sauce' },
      { label: 'No sauce', emoji: '🚫', desc: 'Without sauce' },
      { label: 'No onion', emoji: '🧅❌', desc: 'Without onions' },
      { label: 'Extra cheese', emoji: '🧀', desc: 'Add cheese' },
      { label: 'Cut into 2', emoji: '✂️', desc: 'Cut into half' },
      { label: 'Takeaway pack', emoji: '🥡', desc: 'Pack for takeaway' },
    ],
  },
  KITCHEN_MAINS: {
    id: 'KITCHEN_MAINS',
    label: 'Kitchen & Meals',
    icon: '🍳',
    notes: [
      { label: 'Low spicy', emoji: '🌶️', desc: 'Mild chili' },
      { label: 'Extra spicy', emoji: '🌶️🔥', desc: 'Very spicy' },
      { label: 'No spicy', emoji: '🟢', desc: 'Zero chili' },
      { label: 'Low oil', emoji: '💧', desc: 'Less oil prep' },
      { label: 'No beef', emoji: '🥩❌', desc: 'Exclude beef' },
      { label: 'Extra chicken', emoji: '🍗', desc: 'Extra chicken portion' },
      { label: 'Extra egg', emoji: '🥚', desc: 'Add fried/boiled egg' },
      { label: 'No cuttlefish', emoji: '🦑❌', desc: 'Exclude cuttlefish' },
      { label: 'No prawn', emoji: '🦐❌', desc: 'Exclude prawn' },
      { label: 'Extra gravy', emoji: '🍛', desc: 'Extra curry gravy' },
      { label: 'Less salt', emoji: '🧂', desc: 'Low sodium' },
    ],
  },
};

// Flattened list of all presets for backward compatibility
export const QUICK_NOTES = [
  ...QUICK_NOTE_CATEGORIES.DESSERT_DRINKS.notes,
  ...QUICK_NOTE_CATEGORIES.BUN_BAKERY.notes,
  ...QUICK_NOTE_CATEGORIES.KITCHEN_MAINS.notes,
];

/**
 * Automatically detects the best preset category based on item attributes.
 */
export const detectItemPresetCategory = (item) => {
  if (!item) return 'ALL';
  const text = `${item.name || ''} ${item.category || ''} ${item.department || ''}`.toLowerCase();

  if (
    item.department === 'JUICE' ||
    text.includes('ice cream') ||
    text.includes('icecream') ||
    text.includes('juice') ||
    text.includes('shake') ||
    text.includes('dessert') ||
    text.includes('faluda') ||
    text.includes('beverage') ||
    text.includes('drink') ||
    text.includes('soda') ||
    text.includes('mojito') ||
    text.includes('tea') ||
    text.includes('coffee') ||
    text.includes('smoothie') ||
    text.includes('sweet')
  ) {
    return 'DESSERT_DRINKS';
  }

  if (
    item.department === 'BUN' ||
    text.includes('bun') ||
    text.includes('bakery') ||
    text.includes('roll') ||
    text.includes('pastry') ||
    text.includes('samosa') ||
    text.includes('roti') ||
    text.includes('short eat') ||
    text.includes('puff') ||
    text.includes('sandwich') ||
    text.includes('burger') ||
    text.includes('cake')
  ) {
    return 'BUN_BAKERY';
  }

  return 'KITCHEN_MAINS';
};

/**
 * Reusable modal for adding/editing item-specific or order-wide quick notes.
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
  const [activeCategory, setActiveCategory] = useState('AUTO');

  useEffect(() => {
    if (isOpen) {
      setNoteText(initialNote || '');
      const detected = detectItemPresetCategory(item);
      setActiveCategory(detected);
    }
  }, [isOpen, initialNote, item]);

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

  // Determine which notes to display
  let currentNotes = [];
  if (activeCategory === 'ALL') {
    currentNotes = QUICK_NOTES;
  } else if (QUICK_NOTE_CATEGORIES[activeCategory]) {
    currentNotes = QUICK_NOTE_CATEGORIES[activeCategory].notes;
  } else {
    currentNotes = QUICK_NOTES;
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#141419] border border-[#2B2B38] rounded-2xl max-w-lg w-full p-4 sm:p-5 space-y-4 shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-[#24242E]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-[#FF6B00] border border-orange-500/20">
                <FileText className="w-4 h-4" />
              </span>
              <h3 className="font-black text-sm sm:text-base text-white">
                {title || (item ? `Special Note: ${item.name}` : 'Special Note for Order')}
              </h3>
            </div>
            {item && (
              <p className="text-[11px] text-neutral-400 mt-1 pl-8">
                {item.category || item.department} • Rs. {item.price?.toLocaleString()}
                {item.quantity ? ` • Qty: ${item.quantity}` : ''}
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

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#24242E]">
          <button
            type="button"
            onClick={() => setActiveCategory('DESSERT_DRINKS')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeCategory === 'DESSERT_DRINKS'
                ? 'bg-[#FF6B00] text-white shadow'
                : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2A2A38]'
            }`}
          >
            <span>🍨</span>
            <span>Ice Cream & Drinks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('BUN_BAKERY')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeCategory === 'BUN_BAKERY'
                ? 'bg-[#FF6B00] text-white shadow'
                : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2A2A38]'
            }`}
          >
            <span>🥖</span>
            <span>Buns & Bakery</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('KITCHEN_MAINS')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeCategory === 'KITCHEN_MAINS'
                ? 'bg-[#FF6B00] text-white shadow'
                : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2A2A38]'
            }`}
          >
            <span>🍳</span>
            <span>Kitchen & Food</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
              activeCategory === 'ALL'
                ? 'bg-[#FF6B00] text-white shadow'
                : 'bg-[#1C1C24] text-neutral-400 hover:text-white border border-[#2A2A38]'
            }`}
          >
            All
          </button>
        </div>

        {/* Quick Note Presets Grid */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Tap to Add / Remove:
            </label>
            <span className="text-[10px] text-neutral-500 font-medium">Multiple options allowed</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {currentNotes.map((qn) => {
              const active = isSelected(qn.label);
              return (
                <button
                  key={qn.label}
                  type="button"
                  onClick={() => handleToggleNote(qn.label)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between active:scale-95 ${
                    active
                      ? 'bg-gradient-to-br from-[#FF6B00] to-[#E05A00] text-white border-orange-400 shadow-md shadow-orange-500/25 ring-1 ring-white/30'
                      : 'bg-[#1C1C24] border-[#2A2A38] text-neutral-300 hover:border-neutral-500 hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-base">{qn.emoji}</span>
                    {active && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-xs font-bold mt-1.5 leading-tight block">
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
              Current Note (Will Print on KOT Slip):
            </label>
            {noteText && (
              <button
                type="button"
                onClick={() => setNoteText('')}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
              >
                Clear Note
              </button>
            )}
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Selected notes will appear here, or type custom instructions (e.g. Low sugar, warm up, extra spicy)..."
            rows={2}
            className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 outline-none resize-none font-medium"
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
            No Note (Clear)
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
export const QuickNotePills = ({ onAppendNote, selectedText = '', item = null }) => {
  const detected = item ? detectItemPresetCategory(item) : 'ALL';
  const notesToShow =
    detected !== 'ALL' && QUICK_NOTE_CATEGORIES[detected]
      ? QUICK_NOTE_CATEGORIES[detected].notes
      : QUICK_NOTES;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar items-center">
      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-0.5">
        <Sparkles className="w-3 h-3 text-[#FF6B00]" />
        Quick Notes:
      </span>
      {notesToShow.map((qn) => {
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
