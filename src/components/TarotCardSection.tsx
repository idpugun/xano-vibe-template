import type React from 'react';
import { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';
import type { ReadingMode } from './ReadingModeSelector';

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

interface TarotCardSectionProps {
  readingMode: ReadingMode;
  selectedCards: Set<number>;
  onSelectedCardsChange: (cards: Set<number>) => void;
}

export const TarotCardSection: React.FC<TarotCardSectionProps> = ({ 
  readingMode, 
  selectedCards, 
  onSelectedCardsChange 
}) => {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [cardsData, setCardsData] = useState<TarotCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<TarotCardData | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);

  // Get selection limit based on reading mode
  const getSelectionLimit = () => {
    switch (readingMode) {
      case 'single':
        return 1;
      case 'three':
        return 3;
      case 'celtic':
        return 10;
      default:
        return 1;
    }
  };

  const selectionLimit = getSelectionLimit();

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
    // Find the card data
    const cardData = displayCards.find(card => card.id === cardId)?.cardData;
    
    // If clicking a selected card, deselect it
    if (selectedCards.has(cardId)) {
      const newSelectedCards = new Set(selectedCards);
      newSelectedCards.delete(cardId);
      onSelectedCardsChange(newSelectedCards);
      
      setFlippedCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
      setPreviewCard(null);
    } else {
      // Check if we can select more cards
      if (selectedCards.size < selectionLimit) {
        const newSelectedCards = new Set([...selectedCards, cardId]);
        onSelectedCardsChange(newSelectedCards);
        setFlippedCards(prev => new Set([...prev, cardId]));
        setPreviewCard(cardData || null);
      } else {
        // If at limit, replace the first selected card
        const firstSelected = Array.from(selectedCards)[0];
        const newSelectedCards = new Set(selectedCards);
        newSelectedCards.delete(firstSelected);
        newSelectedCards.add(cardId);
        onSelectedCardsChange(newSelectedCards);
        
        setFlippedCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(firstSelected);
          newSet.add(cardId);
          return newSet;
        });
        setPreviewCard(cardData || null);
      }
    }
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    // Clear current selection and flipped cards
    onSelectedCardsChange(new Set());
    setFlippedCards(new Set());
    setPreviewCard(null);
    
    // Trigger shuffle by updating the key
    setShuffleKey(prev => prev + 1);
    
    // Reset shuffling state after animation
    setTimeout(() => {
      setIsShuffling(false);
    }, 1000);
  };

  const generateCards = (count: number) => {
    return Array.from({ length: count }, (_, index) => {
      // Use shuffle key to create different random patterns
      const randomSeed = (shuffleKey * 1000) + index;
      const cardIndex = (randomSeed + index) % cardsData.length;
      return {
        id: index,
        cardData: cardsData[cardIndex]
      };
    });
  };

  // Generate full pile of cards (60 cards like before)
  const displayCards = generateCards(60);

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
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
          ไพ่ทาโรต์แห่งดวงชะตา
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          คลิกที่ไพ่เพื่อเปิดดูคำทำนาย (คลิกได้ครั้งละ 1 ใบ)
        </p>
        
        {/* Shuffle Button */}
        <div className="flex justify-center mb-8">
          <button
            type="button"
            onClick={handleShuffle}
            disabled={isShuffling}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300
              ${isShuffling 
                ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }
            `}
          >
            <Shuffle className={`h-5 w-5 ${isShuffling ? 'animate-spin' : ''}`} />
            {isShuffling ? 'กำลังสับไพ่...' : 'สับไพ่ใหม่'}
          </button>
        </div>
        
        <div className="flex gap-8">
          {/* Card Layout */}
          <div className="flex-1">
            {/* Selection Status */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-sm font-medium text-primary">
                  เลือกแล้ว: {selectedCards.size} / {selectionLimit}
                </span>
                {selectedCards.size === selectionLimit && (
                  <span className="text-xs text-green-600">✓ พร้อมทำนาย</span>
                )}
              </div>
            </div>

            {/* Scattered Card Layout - Full Pile */}
            <div className="relative w-full h-[600px] sm:h-[700px] md:h-[800px] mb-8">
              {/* All cards scattered with no overlap */}
              {displayCards.map((card, index) => {
                // Generate grid-based positions with slight offsets to avoid overlap
                const gridSize = 8; // 8x8 grid
                const gridX = index % gridSize;
                const gridY = Math.floor(index / gridSize);
                
                // Base position in grid
                const baseX = (gridX / (gridSize - 1)) * 80 + 10; // 10-90% range
                const baseY = (gridY / (gridSize - 1)) * 80 + 10; // 10-90% range
                
                // Add shuffle key to create different patterns each time
                const seed = (card.id * 1.618) + (shuffleKey * 100);
                const offsetX = (Math.sin(seed) * 8) + (Math.cos(seed * 1.3) * 4); // ±12px offset
                const offsetY = (Math.cos(seed * 1.7) * 8) + (Math.sin(seed * 2.1) * 4); // ±12px offset
                
                const x = Math.max(5, Math.min(95, baseX + offsetX)); // Clamp to 5-95%
                const y = Math.max(5, Math.min(95, baseY + offsetY)); // Clamp to 5-95%
                
                // Gentle rotation for natural look
                const rotation = (Math.sin(seed * 2.1) * 15) + (Math.cos(seed * 1.7) * 8); // ±23 degrees
                
                return (
                  <div
                    key={`${card.id}-${shuffleKey}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                      zIndex: selectedCards.has(card.id) ? 1000 : 60 - index
                    }}
                  >
                    <TarotCard
                      id={card.id}
                      isFlipped={flippedCards.has(card.id)}
                      isSelected={selectedCards.has(card.id)}
                      onCardClick={handleCardClick}
                      cardData={card.cardData}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Preview Panel */}
          <div className="w-80 flex-shrink-0">
            {previewCard ? (
              <div className="sticky top-8">
                <div className="bg-card border rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-foreground mb-4 text-center">
                    {previewCard.name}
                  </h3>
                  
                  {/* Large Card Image */}
                  <div className="mb-6">
                    <img
                      src={previewCard.img_url}
                      alt={previewCard.name}
                      className="w-full h-80 object-contain rounded-lg border"
                    />
                  </div>
                  
                  {/* Card Details */}
                  <div className="space-y-4">
                    {/* Keywords */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {previewCard.keyword.map((keyword) => (
                          <span
                            key={`keyword-${keyword}`}
                            className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Light Meaning */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Light Meaning</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {previewCard.light_meaning.slice(0, 3).map((meaning, index) => (
                          <li key={`light-${meaning.slice(0, 20)}-${index}`} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {meaning}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Shadow Meaning */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Shadow Meaning</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {previewCard.shadow_meaning.slice(0, 3).map((meaning, index) => (
                          <li key={`shadow-${meaning.slice(0, 20)}-${index}`} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {meaning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="sticky top-8">
                <div className="bg-card border rounded-lg p-6 shadow-lg text-center">
                  <div className="text-6xl mb-4">🔮</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    เลือกไพ่เพื่อดูคำทำนาย
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    คลิกที่ไพ่เพื่อเปิดดูรายละเอียดและคำทำนาย
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center">
          <div className="bg-secondary/20 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-foreground font-semibold mb-2">วิธีใช้งาน</h3>
            <p className="text-muted-foreground text-sm">
              {readingMode === 'single' && (
                <>
                  เลือกไพ่ 1 ใบจากกองเพื่อทำนาย
                  <br />
                  เหมาะสำหรับคำถามที่ต้องการคำตอบด่วน
                </>
              )}
              {readingMode === 'three' && (
                <>
                  เลือกไพ่ 3 ใบจากกองเพื่อทำนาย
                  <br />
                  อดีต / ปัจจุบัน / อนาคต
                </>
              )}
              {readingMode === 'celtic' && (
                <>
                  เลือกไพ่ 10 ใบจากกองเพื่อทำนาย
                  <br />
                  การทำนายแบบ Celtic Cross ครอบคลุมทุกด้าน
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
