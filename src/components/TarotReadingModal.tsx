import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Calendar, User, Sparkles, Printer, RotateCcw } from 'lucide-react';

interface ReadingResult {
  id: number;
  user_id: number;
  reading_mode: 'single' | 'three' | 'celtic';
  selected_cards: number[];
  card_data: Array<{
    id: number;
    name: string;
    fortune_telling: string[];
    keyword: string[];
    light_meaning: string[];
    shadow_meaning: string[];
    img_url: string;
  }>;
  reading_timestamp: number;
  created_at: string;
  result?: string; // AI reading result
}

interface TarotReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  readingResult: ReadingResult | null;
  onNewReading: () => void;
}

export const TarotReadingModal: React.FC<TarotReadingModalProps> = ({
  isOpen,
  onClose,
  readingResult,
  onNewReading
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Auto-select first card when modal opens
      if (readingResult?.card_data?.length && readingResult.card_data.length > 0) {
        setSelectedCard(readingResult.card_data[0].id);
      }
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
      // Reset selected card when modal closes
      setSelectedCard(null);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, readingResult]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewReading = () => {
    onNewReading();
    onClose();
  };

  if (!isOpen || !readingResult) return null;

  return (
    <div className={`fixed inset-0 z-[9999] ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={handleNewReading}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleNewReading();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-[10000]">
        <div className="bg-background border rounded-lg shadow-2xl w-full max-w-7xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-[10001]">
            <div className="flex items-center justify-between p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">ผลการทำนายทาโรต์</h1>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  className="hidden sm:flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  พิมพ์
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  className="sm:hidden h-8 w-8 p-0"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewReading}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="px-3 sm:px-6 pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">{formatTimestamp(readingResult.reading_timestamp)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>โหมด: {
                    readingResult.reading_mode === 'single' ? 'ดูดวงใบเดียว' :
                    readingResult.reading_mode === 'three' ? 'ดูดวง 3 ใบ' :
                    'ดูดวง Celtic Cross'
                  }</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Left Panel - Cards Grid and AI Reading */}
            <div className="flex-1 overflow-y-auto">
                {/* Selected Cards Grid */}
                <div className="p-3 sm:p-6">
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center justify-center gap-2 sm:gap-3">
                    <div className="bg-purple-600 p-1.5 sm:p-2 rounded-full">
                      <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                    การ์ดที่เลือก
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                    {readingResult.card_data.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        className={`bg-card border rounded-lg p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300 relative group text-left ${
                          selectedCard === card.id ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''
                        }`}
                        onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
                      >
                        {/* Card Image */}
                        <div className="aspect-[3/4] mb-2 sm:mb-3">
                          <img
                            src={card.img_url}
                            alt={card.name}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                        
                        {/* Card Name */}
                        <h4 className="text-xs sm:text-sm font-semibold text-foreground text-center mb-1 sm:mb-2 line-clamp-2">
                          {card.name}
                        </h4>
                        
                        {/* Keywords - Limited */}
                        <div className="mb-1 sm:mb-2">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {card.keyword.slice(0, 2).map((keyword) => (
                              <span
                                key={keyword}
                                className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary/10 text-primary text-xs rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                            {card.keyword.length > 2 && (
                              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted text-muted-foreground text-xs rounded-full">
                                +{card.keyword.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Quick Preview - Hidden on mobile */}
                        <div className="hidden sm:block text-xs text-muted-foreground text-center">
                          <div className="line-clamp-1 mb-1">
                            <span className="text-green-600">+</span> {card.light_meaning[0]}
                          </div>
                          <div className="line-clamp-1">
                            <span className="text-red-600">-</span> {card.shadow_meaning[0]}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Reading Result */}
                <div className="border-t bg-background/80 backdrop-blur-sm p-3 sm:p-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 sm:p-8 shadow-lg">
                    <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <div className="bg-purple-600 p-1.5 sm:p-2 rounded-full">
                        <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                      คำทำนายจาก AI
                    </h3>
                    <div className="prose prose-sm sm:prose-lg max-w-none text-foreground">
                      {readingResult.result ? (
                        <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-medium">
                          {readingResult.result}
                        </div>
                      ) : (
                        <div className="text-center py-4 sm:py-8">
                          <div className="text-muted-foreground text-base sm:text-lg">
                            กำลังประมวลผลคำทำนาย...
                          </div>
                          <div className="mt-4">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600 mx-auto" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>

            {/* Right Panel - Card Details */}
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-muted/30 overflow-y-auto max-h-96 lg:max-h-none">
                {selectedCard ? (
                  (() => {
                    const card = readingResult.card_data.find(c => c.id === selectedCard);
                    return card ? (
                      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg sm:text-xl font-bold text-foreground pr-2">{card.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCard(null)}
                            className="h-8 w-8 p-0 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Card Image */}
                        <div className="flex justify-center">
                          <img
                            src={card.img_url}
                            alt={card.name}
                            className="w-24 h-36 sm:w-32 sm:h-48 object-contain rounded-lg border"
                          />
                        </div>
                        
                        {/* Keywords */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Keywords</h4>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {card.keyword.map((keyword) => (
                              <span
                                key={keyword}
                                className="px-2 sm:px-3 py-1 bg-primary/10 text-primary text-xs sm:text-sm rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Light Meaning */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-green-600 text-sm sm:text-base">ความหมายด้านบวก</h4>
                          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2">
                            {card.light_meaning.map((meaning, idx) => (
                              <li key={`light-${card.id}-${idx}`} className="flex items-start">
                                <span className="text-green-500 mr-2 text-xs sm:text-sm flex-shrink-0">•</span>
                                <span>{meaning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Shadow Meaning */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-red-600 text-sm sm:text-base">ความหมายด้านลบ</h4>
                          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2">
                            {card.shadow_meaning.map((meaning, idx) => (
                              <li key={`shadow-${card.id}-${idx}`} className="flex items-start">
                                <span className="text-red-500 mr-2 text-xs sm:text-sm flex-shrink-0">•</span>
                                <span>{meaning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null;
                  })()
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-3 sm:p-6">
                    <div className="bg-muted rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
                      <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">เลือกการ์ดเพื่อดูรายละเอียด</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      คลิกที่การ์ดใดก็ได้เพื่อดูความหมายและรายละเอียดแบบเต็ม
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-background/80 backdrop-blur-sm p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <Button
                onClick={handleNewReading}
                className="px-6 sm:px-8 py-2.5 sm:py-3 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" />
                ทำนายใหม่
              </Button>
              <Button
                variant="outline"
                onClick={handleNewReading}
                className="px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto"
              >
                ปิด
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
