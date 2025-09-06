import type React from 'react';
import { useState } from 'react';

interface TarotCardProps {
  id: number;
  isFlipped: boolean;
  isSelected: boolean;
  onCardClick: (id: number) => void;
}

export const TarotCard: React.FC<TarotCardProps> = ({ 
  id, 
  isFlipped, 
  isSelected, 
  onCardClick 
}) => {
  const cardNames = [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
    'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
    'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
    'Judgement', 'The World', 'Ace of Wands', 'Two of Wands', 'Three of Wands',
    'Four of Wands', 'Five of Wands', 'Six of Wands', 'Seven of Wands', 'Eight of Wands',
    'Nine of Wands', 'Ten of Wands', 'Page of Wands', 'Knight of Wands', 'Queen of Wands',
    'King of Wands', 'Ace of Cups', 'Two of Cups', 'Three of Cups', 'Four of Cups',
    'Five of Cups', 'Six of Cups', 'Seven of Cups', 'Eight of Cups', 'Nine of Cups',
    'Ten of Cups', 'Page of Cups', 'Knight of Cups', 'Queen of Cups', 'King of Cups',
    'Ace of Swords', 'Two of Swords', 'Three of Swords', 'Four of Swords', 'Five of Swords',
    'Six of Swords', 'Seven of Swords', 'Eight of Swords', 'Nine of Swords', 'Ten of Swords',
    'Page of Swords', 'Knight of Swords', 'Queen of Swords', 'King of Swords', 'Ace of Pentacles',
    'Two of Pentacles', 'Three of Pentacles', 'Four of Pentacles', 'Five of Pentacles', 'Six of Pentacles',
    'Seven of Pentacles', 'Eight of Pentacles', 'Nine of Pentacles', 'Ten of Pentacles', 'Page of Pentacles',
    'Knight of Pentacles', 'Queen of Pentacles', 'King of Pentacles'
  ];

  const cardName = cardNames[id % cardNames.length] || `Card ${id + 1}`;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCardClick(id);
    }
  };

  return (
    <button
      type="button"
      className={`
        relative w-full h-32 min-w-[100px] sm:min-w-[90px] xs:min-w-[80px] 
        cursor-pointer transition-all duration-300 ease-in-out
        ${isSelected ? 'scale-110 z-20' : 'scale-100 z-10'}
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
      `}
      onClick={() => onCardClick(id)}
      onKeyDown={handleKeyDown}
      aria-label={`Tarot card ${id + 1}, ${isFlipped ? 'flipped' : 'not flipped'}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      <div
        className={`
          relative w-full h-full rounded-lg shadow-lg transition-transform duration-700 ease-in-out
          ${isFlipped ? 'rotate-y-180' : 'rotate-y-0'}
        `}
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Card Front */}
        <div
          className="absolute inset-0 w-full h-full rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white font-bold text-sm text-center p-2"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">🔮</div>
            <div className="text-xs leading-tight">Tarot</div>
          </div>
        </div>

        {/* Card Back */}
        <div
          className="absolute inset-0 w-full h-full rounded-lg bg-gradient-to-br from-amber-600 via-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm text-center p-2"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="text-center">
            <div className="text-lg mb-1">✨</div>
            <div className="text-xs leading-tight">{cardName}</div>
          </div>
        </div>
      </div>
    </button>
  );
};
