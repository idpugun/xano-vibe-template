import type React from 'react';
import { useState } from 'react';

interface TarotCardProps {
  id: number;
  isFlipped: boolean;
  isSelected: boolean;
  onCardClick: (id: number) => void;
}

const TarotCard: React.FC<TarotCardProps> = ({ id, isFlipped, isSelected, onCardClick }) => {
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
        relative w-full h-32 min-w-[100px] cursor-pointer transition-all duration-300 ease-in-out
        ${isSelected ? 'scale-110 z-[1000]' : 'scale-100'}
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
      `}
      onClick={() => onCardClick(id)}
      onKeyDown={handleKeyDown}
      aria-label={`Tarot card ${id + 1}, ${isFlipped ? 'flipped' : 'not flipped'}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        zIndex: isSelected ? 1000 : id + 1
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

export const TarotCardSection: React.FC = () => {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const handleCardClick = (cardId: number) => {
    // If clicking the same card, flip it
    if (selectedCard === cardId) {
      setFlippedCards(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cardId)) {
          newSet.delete(cardId);
        } else {
          newSet.add(cardId);
        }
        return newSet;
      });
    } else {
      // Select new card and flip it
      setSelectedCard(cardId);
      setFlippedCards(new Set([cardId]));
    }
  };

  const generateCards = (startId: number, count: number) => {
    return Array.from({ length: count }, (_, index) => startId + index);
  };

  const row1Cards = generateCards(0, 20);
  const row2Cards = generateCards(20, 20);
  const row3Cards = generateCards(40, 20);

  return (
    <div className="w-full py-8">
      <div className="max-w-[800px] mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          ไพ่ทาโรต์แห่งดวงชะตา
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          คลิกที่ไพ่เพื่อเปิดดูคำทำนาย (คลิกได้ครั้งละ 1 ใบ)
        </p>
        
        {/* Row 1 */}
        <div className="flex justify-center mb-4">
          <div className="flex -space-x-2 sm:-space-x-3 md:-space-x-4 min-w-max">
            {row1Cards.map((cardId) => (
              <TarotCard
                key={cardId}
                id={cardId}
                isFlipped={flippedCards.has(cardId)}
                isSelected={selectedCard === cardId}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex justify-center mb-4">
          <div className="flex -space-x-2 sm:-space-x-3 md:-space-x-4 min-w-max">
            {row2Cards.map((cardId) => (
              <TarotCard
                key={cardId}
                id={cardId}
                isFlipped={flippedCards.has(cardId)}
                isSelected={selectedCard === cardId}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex justify-center mb-8">
          <div className="flex -space-x-2 sm:-space-x-3 md:-space-x-4 min-w-max">
            {row3Cards.map((cardId) => (
              <TarotCard
                key={cardId}
                id={cardId}
                isFlipped={flippedCards.has(cardId)}
                isSelected={selectedCard === cardId}
                onCardClick={handleCardClick}
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center">
          <div className="bg-secondary/20 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-foreground font-semibold mb-2">วิธีใช้งาน</h3>
            <p className="text-muted-foreground text-sm">
              คลิกที่ไพ่เพื่อเลือกและพลิกดูคำทำนาย 
              <br />
              สามารถเลือกได้ครั้งละ 1 ใบเท่านั้น
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
