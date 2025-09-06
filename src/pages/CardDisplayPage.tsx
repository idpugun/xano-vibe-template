import type React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BackToLanding } from '@/components/BackToLanding';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ArrowLeft, Calendar, User, Sparkles } from 'lucide-react';

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
}

export const CardDisplayPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [readingResult, setReadingResult] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get reading result from location state or fetch from API
    if (location.state?.readingResult) {
      setReadingResult(location.state.readingResult);
      setLoading(false);
    } else {
      // If no reading result in state, redirect back to dashboard
      navigate('/dashboard');
    }
  }, [location.state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!readingResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">ไม่พบผลการทำนาย</h1>
          <Button onClick={() => navigate('/dashboard')}>
            กลับไปหน้าแดชบอร์ด
          </Button>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับไปทำนายใหม่
            </Button>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Reading Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <h1 className="text-4xl font-bold text-foreground">ผลการทำนายทาโรต์</h1>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
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

          {/* Cards Display */}
          <div className="grid gap-8 mb-12">
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

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3"
            >
              ทำนายใหม่
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="px-8 py-3"
            >
              พิมพ์ผลการทำนาย
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
