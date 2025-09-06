import type React from 'react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  shuffleTrigger?: number; // When this changes, trigger shuffle
  onShuffle?: () => void; // Callback to trigger shuffle in parent
  cardsData: TarotCardData[];
  loading: boolean;
  error: string | null;
}

export const TarotCardSection: React.FC<TarotCardSectionProps> = ({ 
  readingMode, 
  selectedCards, 
  onSelectedCardsChange,
  shuffleTrigger,
  onShuffle,
  cardsData,
  loading,
  error
}) => {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
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

  // Generate full pile of cards (60 cards like before) - memoized to prevent re-renders
  const displayCards = useMemo(() => {
    return Array.from({ length: 60 }, (_, index) => {
      // Use shuffle trigger to create different random patterns (synchronized with parent)
      const randomSeed = ((shuffleTrigger || 0) * 1000) + index;
      const cardIndex = (randomSeed + index) % cardsData.length;
      return {
        id: index,
        cardData: cardsData[cardIndex]
      };
    });
  }, [shuffleTrigger, cardsData]);

  // Reset flipped cards when reading mode changes
  const prevReadingMode = useRef<ReadingMode>(readingMode);
  useEffect(() => {
    if (prevReadingMode.current !== readingMode) {
      console.log(`🔄 Reading mode changed from ${prevReadingMode.current} to ${readingMode} - resetting card selections`);
      setFlippedCards(new Set());
      prevReadingMode.current = readingMode;
    }
  }, [readingMode]);

  const handleShuffle = useCallback(() => {
    console.log('🔀 Shuffling cards - clearing all selections');
    if (selectedCards.size > 0) {
      console.log('📋 Previously selected cards:', Array.from(selectedCards).map(id => {
        const card = displayCards.find(c => c.id === id)?.cardData;
        return `${card?.name || `Card ${id + 1}`} (ID: ${id})`;
      }));
    }
    
    setIsShuffling(true);
    // Clear current selection and flipped cards
    onSelectedCardsChange(new Set());
    setFlippedCards(new Set());
    
    // Trigger shuffle in parent component
    if (onShuffle) {
      onShuffle();
    }
    
    // Reset shuffling state after animation
    setTimeout(() => {
      setIsShuffling(false);
    }, 1000);
  }, [onSelectedCardsChange, selectedCards, displayCards, onShuffle]);


  // Store the latest handleShuffle function in a ref to avoid circular dependencies
  const handleShuffleRef = useRef(handleShuffle);
  handleShuffleRef.current = handleShuffle;

  // Note: We removed the automatic shuffle trigger to prevent infinite loops
  // Shuffle is now only triggered by user clicking the shuffle button

  // Cards data is now provided as props from parent component

  const handleCardClick = (cardId: number) => {
    // Get card data for logging
    const cardData = displayCards.find(card => card.id === cardId)?.cardData;
    const cardName = cardData?.name || `Card ${cardId + 1}`;
    
    // If clicking a selected card, deselect it
    if (selectedCards.has(cardId)) {
      console.log(`🃏 Card deselected: ${cardName} (Display ID: ${cardId}, Database ID: ${cardData?.id})`);
      const newSelectedCards = new Set(selectedCards);
      newSelectedCards.delete(cardId);
      onSelectedCardsChange(newSelectedCards);
      
      setFlippedCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
      
      console.log('📋 Current selected cards:', Array.from(newSelectedCards).map(id => {
        const card = displayCards.find(c => c.id === id)?.cardData;
        return `${card?.name || `Card ${id + 1}`} (Display ID: ${id}, Database ID: ${card?.id})`;
      }));
    } else {
      // Check if we can select more cards
      if (selectedCards.size < selectionLimit) {
        console.log(`🃏 Card selected: ${cardName} (Display ID: ${cardId}, Database ID: ${cardData?.id})`);
        const newSelectedCards = new Set([...selectedCards, cardId]);
        onSelectedCardsChange(newSelectedCards);
        setFlippedCards(prev => new Set([...prev, cardId]));
        
        console.log('📋 Current selected cards:', Array.from(newSelectedCards).map(id => {
          const card = displayCards.find(c => c.id === id)?.cardData;
          return `${card?.name || `Card ${id + 1}`} (Display ID: ${id}, Database ID: ${card?.id})`;
        }));
      } else {
        // If at limit, replace the first selected card
        const firstSelected = Array.from(selectedCards)[0];
        const firstSelectedCard = displayCards.find(c => c.id === firstSelected)?.cardData;
        const firstSelectedName = firstSelectedCard?.name || `Card ${firstSelected + 1}`;
        
        console.log(`🔄 Replacing card: ${firstSelectedName} (Display ID: ${firstSelected}, Database ID: ${firstSelectedCard?.id}) with ${cardName} (Display ID: ${cardId}, Database ID: ${cardData?.id})`);
        
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
        
        console.log('📋 Current selected cards:', Array.from(newSelectedCards).map(id => {
          const card = displayCards.find(c => c.id === id)?.cardData;
          return `${card?.name || `Card ${id + 1}`} (Display ID: ${id}, Database ID: ${card?.id})`;
        }));
      }
    }
  };

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
            
            // Add shuffle trigger to create different patterns each time
            const seed = (card.id * 1.618) + ((shuffleTrigger || 0) * 100);
            const offsetX = (Math.sin(seed) * 8) + (Math.cos(seed * 1.3) * 4); // ±12px offset
            const offsetY = (Math.cos(seed * 1.7) * 8) + (Math.sin(seed * 2.1) * 4); // ±12px offset
            
            const x = Math.max(5, Math.min(95, baseX + offsetX)); // Clamp to 5-95%
            const y = Math.max(5, Math.min(95, baseY + offsetY)); // Clamp to 5-95%
            
            // Gentle rotation for natural look
            const rotation = (Math.sin(seed * 2.1) * 15) + (Math.cos(seed * 1.7) * 8); // ±23 degrees
            
            return (
              <div
                key={`${card.id}-${shuffleTrigger || 0}`}
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
