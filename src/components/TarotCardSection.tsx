import type React from 'react';
import { useState, useEffect } from 'react';

interface TarotCardData {
  id: number;
  name: string;
  fortune_telling: string[];
  keyword: string[];
  light_meaning: string[];
  shadow_meaning: string[];
  img_url: string;
}

interface TarotCardProps {
  id: number;
  isFlipped: boolean;
  isSelected: boolean;
  onCardClick: (id: number) => void;
  cardData?: TarotCardData;
}

const TarotCard: React.FC<TarotCardProps> = ({ id, isFlipped, isSelected, onCardClick, cardData }) => {
  const cardName = cardData?.name || `Card ${id + 1}`;
  const cardImageUrl = cardData?.img_url || '/backside.png';

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
        relative w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 min-w-[64px] sm:min-w-[80px] md:min-w-[96px]
        cursor-pointer transition-all duration-300 ease-in-out
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
        {/* Card Front - Backside Image */}
        <div
          className="absolute inset-0 w-full h-full rounded-lg overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          <img
            src="/backside.png"
            alt="Tarot Card Back"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>

        {/* Card Back - Actual Card Image */}
        <div
          className="absolute inset-0 w-full h-full rounded-lg overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <img
            src={cardImageUrl}
            alt={`Tarot card: ${cardName}`}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      </div>
    </button>
  );
};

export const TarotCardSection: React.FC = () => {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [cardsData, setCardsData] = useState<TarotCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tarot cards data from API
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://xi5k-kqun-rjxc.n7e.xano.io/api:bhawqcMo/TarotCard');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCardsData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tarot cards:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch cards');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

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
    return Array.from({ length: count }, (_, index) => {
      const cardIndex = (startId + index) % cardsData.length;
      return {
        id: startId + index,
        cardData: cardsData[cardIndex]
      };
    });
  };

  console.log('row1Cards=============================');

  const row1Cards = generateCards(0, 20);
  const row2Cards = generateCards(20, 20);
  const row3Cards = generateCards(40, 20);

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            ไพ่ทาโรต์แห่งดวงชะตา
          </h2>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
            <span className="ml-4 text-muted-foreground">กำลังโหลดไพ่ทาโรต์...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-8">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            ไพ่ทาโรต์แห่งดวงชะตา
          </h2>
          <div className="text-red-500 mb-4">
            <p>เกิดข้อผิดพลาดในการโหลดไพ่ทาโรต์</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            type="button"
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

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
            {row1Cards.map((card) => (
              <TarotCard
                key={card.id}
                id={card.id}
                isFlipped={flippedCards.has(card.id)}
                isSelected={selectedCard === card.id}
                onCardClick={handleCardClick}
                cardData={card.cardData}
              />
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex justify-center mb-4">
          <div className="flex -space-x-2 sm:-space-x-3 md:-space-x-4 min-w-max">
            {row2Cards.map((card) => (
              <TarotCard
                key={card.id}
                id={card.id}
                isFlipped={flippedCards.has(card.id)}
                isSelected={selectedCard === card.id}
                onCardClick={handleCardClick}
                cardData={card.cardData}
              />
            ))}
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex justify-center mb-8">
          <div className="flex -space-x-2 sm:-space-x-3 md:-space-x-4 min-w-max">
            {row3Cards.map((card) => (
              <TarotCard
                key={card.id}
                id={card.id}
                isFlipped={flippedCards.has(card.id)}
                isSelected={selectedCard === card.id}
                onCardClick={handleCardClick}
                cardData={card.cardData}
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
