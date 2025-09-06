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

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[10000]">
        <div className="bg-background border rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-[10001]">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-foreground">ผลการทำนายทาโรต์</h1>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  พิมพ์
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="px-6 pb-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatTimestamp(readingResult.reading_timestamp)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
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
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="p-6">
              {/* AI Reading Result */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <div className="bg-purple-600 p-2 rounded-full">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    คำทำนายจาก AI
                  </h3>
                  <div className="prose prose-lg max-w-none text-foreground">
                    {readingResult.result ? (
                      <div className="whitespace-pre-wrap leading-relaxed text-base font-medium">
                        {readingResult.result}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground text-lg">
                          กำลังประมวลผลคำทำนาย...
                        </div>
                        <div className="mt-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cards Display */}
              <div className="space-y-6">
                {readingResult.card_data.map((card, index) => (
                  <div key={card.id} className="bg-card border rounded-lg p-6 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Card Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={card.img_url}
                          alt={card.name}
                          className="w-48 h-72 object-contain rounded-lg border mx-auto md:mx-0"
                        />
                      </div>
                      
                      {/* Card Details */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-foreground mb-4">
                          {card.name}
                        </h3>
                        
                        {/* Keywords */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-foreground mb-2">Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {card.keyword.map((keyword) => (
                              <span
                                key={keyword}
                                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Light Meaning */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-foreground mb-2">ความหมายด้านบวก</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {card.light_meaning.map((meaning, idx) => (
                              <li key={`light-${card.id}-${idx}`} className="flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                {meaning}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Shadow Meaning */}
                        <div className="mb-4">
                          <h4 className="font-semibold text-foreground mb-2">ความหมายด้านลบ</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {card.shadow_meaning.map((meaning, idx) => (
                              <li key={`shadow-${card.id}-${idx}`} className="flex items-start">
                                <span className="text-red-500 mr-2">•</span>
                                {meaning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-background/80 backdrop-blur-sm p-6">
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleNewReading}
                className="px-8 py-3 flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                ทำนายใหม่
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="px-8 py-3"
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
