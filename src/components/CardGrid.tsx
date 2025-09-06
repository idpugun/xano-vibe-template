import type React from 'react';
import { useState } from 'react';
import { TarotCard } from './TarotCard';

export const CardGrid: React.FC = () => {
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
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-2 sm:p-4 overflow-hidden">
      <div className="max-w-full mx-auto">
        <h1 className="text-2xl sm:text-4xl font-bold text-white text-center mb-4 sm:mb-8 font-sans px-4">
          ไพ่ทาโรต์แห่งดวงชะตา
        </h1>
        <p className="text-white/80 text-center mb-6 sm:mb-12 font-sans text-sm sm:text-base px-4">
          คลิกที่ไพ่เพื่อเปิดดูคำทำนาย (คลิกได้ครั้งละ 1 ใบ)
        </p>
        
        {/* Row 1 */}
        <div className="flex justify-center mb-4 sm:mb-8 overflow-x-auto">
          <div className="flex -space-x-1 sm:-space-x-2 md:-space-x-4 min-w-max">
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
        <div className="flex justify-center mb-4 sm:mb-8 overflow-x-auto">
          <div className="flex -space-x-1 sm:-space-x-2 md:-space-x-4 min-w-max">
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
        <div className="flex justify-center mb-4 sm:mb-8 overflow-x-auto">
          <div className="flex -space-x-1 sm:-space-x-2 md:-space-x-4 min-w-max">
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
        <div className="text-center mt-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-white font-semibold mb-2 font-sans">วิธีใช้งาน</h3>
            <p className="text-white/80 text-sm font-sans">
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
