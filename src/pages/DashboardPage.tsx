import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { realtimeService, authService, tarotService } from '@/lib/xano';
import { LogOut, User, Activity, Database, Menu, X, Settings } from 'lucide-react';
import { TarotCardSection } from '@/components/TarotCardSection';
import { BackToLanding } from '@/components/BackToLanding';
import { ReadingModeSelector, type ReadingMode } from '@/components/ReadingModeSelector';
import { TarotReadingModal } from '@/components/TarotReadingModal';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [readingMode, setReadingMode] = useState<ReadingMode>('single');
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [isSubmittingReading, setIsSubmittingReading] = useState(false);
  const [shuffleTrigger, setShuffleTrigger] = useState(0);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [readingResult, setReadingResult] = useState<{
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
    result?: string;
  } | null>(null);
  const [tarotCards, setTarotCards] = useState<Array<{
    id: number;
    name: string;
    fortune_telling: string[];
    keyword: string[];
    light_meaning: string[];
    shadow_meaning: string[];
    img_url: string;
  }>>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);

  // Function to check if selection matches reading mode requirement
  const isSelectionValid = useCallback(() => {
    const requiredCards = readingMode === 'single' ? 1 : readingMode === 'three' ? 3 : 10;
    return selectedCards.size === requiredCards;
  }, [readingMode, selectedCards.size]);

  // Function to get selected card data from selectedCards
  const getSelectedCardData = useCallback(() => {
    // We need to recreate the displayCards mapping to find the actual card data
    // This matches the logic in TarotCardSection
    const displayCards = Array.from({ length: 60 }, (_, index) => {
      const randomSeed = (shuffleTrigger * 1000) + index;
      const cardIndex = (randomSeed + index) % tarotCards.length;
      return {
        id: index,
        cardData: tarotCards[cardIndex]
      };
    });

    return Array.from(selectedCards).map(cardId => {
      const displayCard = displayCards.find(card => card.id === cardId);
      return displayCard?.cardData;
    }).filter(Boolean) as Array<{
      id: number;
      name: string;
      fortune_telling: string[];
      keyword: string[];
      light_meaning: string[];
      shadow_meaning: string[];
      img_url: string;
    }>;
  }, [selectedCards, tarotCards, shuffleTrigger]);


  // Handle reading submission
  const handleSubmitReading = useCallback(async () => {
    if (!user || !isSelectionValid()) return;

    try {
      setIsSubmittingReading(true);

      // Get selected card data
      const cardData = getSelectedCardData();
      
      // Show modal immediately with loading state
      setReadingResult({
        id: Date.now(), // Generate a temporary ID
        user_id: user.id,
        reading_mode: readingMode,
        selected_cards: Array.from(selectedCards),
        card_data: cardData,
        reading_timestamp: Date.now(),
        created_at: new Date().toISOString(),
        result: undefined // Will be set after API call
      });
      setShowReadingModal(true);

      // Prepare reading data
      const readingData = {
        user,
        reading_mode: readingMode,
        selected_cards: Array.from(selectedCards),
        card_data: cardData,
        reading_timestamp: Date.now()
      };

      console.log('🔮 Submitting reading with data:', {
        selectedCards: Array.from(selectedCards),
        cardDataLength: cardData.length,
        cardData: cardData.map(card => ({ id: card.id, name: card.name }))
      });

      // Submit to API
      const result = await tarotService.submitReading(readingData);
      
      toast.success('การทำนายถูกบันทึกเรียบร้อยแล้ว!', {
        icon: '🔮',
        duration: 3000,
      });

      // Update modal with reading results
      setReadingResult(prev => prev ? {
        ...prev,
        result: result.result || result // Handle both possible result structures
      } : null);
      
    } catch (error) {
      console.error('Error submitting reading:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกการทำนาย', {
        icon: '❌',
        duration: 4000,
      });
      // Close modal on error
      setShowReadingModal(false);
      setReadingResult(null);
    } finally {
      setIsSubmittingReading(false);
    }
  }, [user, isSelectionValid, selectedCards, getSelectedCardData, readingMode]);

  // Reset selected cards when reading mode changes
  const prevReadingMode = useRef<ReadingMode>(readingMode);
  useEffect(() => {
    if (prevReadingMode.current !== readingMode) {
      setSelectedCards(new Set());
      prevReadingMode.current = readingMode;
      // Reset submitted selection when mode changes
      submittedSelectionRef.current = '';
    }
  }, [readingMode]);

  // Store the latest handleSubmitReading function in a ref to avoid circular dependencies
  const handleSubmitReadingRef = useRef(handleSubmitReading);
  handleSubmitReadingRef.current = handleSubmitReading;

  // Auto-trigger reading when selection is valid
  useEffect(() => {
    // Don't trigger reading if modal is open or if we're in the middle of closing it
    if (isSelectionValid() && !isSubmittingReading && selectedCards.size > 0 && !showReadingModal) {
      // Create a unique key for the current selection
      const selectionKey = `${readingMode}-${Array.from(selectedCards).sort().join(',')}`;
      
      // Only submit if this selection hasn't been submitted yet
      if (submittedSelectionRef.current !== selectionKey) {
        submittedSelectionRef.current = selectionKey;
        // Call the latest handleSubmitReading function from ref
        handleSubmitReadingRef.current();
      }
    }
  }, [isSelectionValid, isSubmittingReading, selectedCards, readingMode, showReadingModal]);

  // Refs to store subscription and interval for cleanup
  const realtimeSubscriptionRef = useRef<unknown>(null);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track processed messages to prevent duplicates
  const processedMessagesRef = useRef<Set<string>>(new Set());
  
  // Track if reading has been submitted for current selection to prevent loops
  const submittedSelectionRef = useRef<string>('');

  // Fetch tarot cards once on component mount
  useEffect(() => {
    const fetchTarotCards = async () => {
      try {
        console.log('🃏 Fetching tarot cards from API...');
        setCardsLoading(true);
        setCardsError(null);
        const cards = await tarotService.getTarotCards();
        console.log('✅ Tarot cards loaded successfully:', cards.length, 'cards');
        setTarotCards(cards);
      } catch (error) {
        console.error('❌ Error fetching tarot cards:', error);
        setCardsError(error instanceof Error ? error.message : 'Failed to fetch tarot cards');
      } finally {
        setCardsLoading(false);
      }
    };

    fetchTarotCards();
  }, []); // Empty dependency array - only run once on mount

  // Cleanup function for realtime connections
  const cleanupRealtime = useCallback(() => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    if (realtimeSubscriptionRef.current) {
      realtimeService.unsubscribe(realtimeSubscriptionRef.current);
      realtimeSubscriptionRef.current = null;
      toast('Disconnected from realtime service', {
        icon: '🔌',
        duration: 2000,
      });
    }
            // Clear processed messages
            processedMessagesRef.current.clear();
            setRealtimeConnected(false);
  }, []);

  useEffect(() => {
    // Don't try to setup realtime if auth is still loading
    if (isLoading) return;
    
    // Set up realtime connection if enabled and we're authenticated
    if (realtimeService.isEnabled() && authService.isAuthenticated()) {
      console.log('Setting up realtime connection...');
      setRealtimeLoading(true);
      
      const setupRealtime = async () => {
        try {
          let currentUser = user;
          
          // If user data isn't available yet, fetch it
          if (!currentUser) {
            console.log('User data not available, fetching...');
            currentUser = await authService.me();
          }
          
          // Use user's realtimeid if available, otherwise fall back to user id
          const realtimeId = currentUser.realtimeid || currentUser.id.toString();
          const channelName = `dashboard/${realtimeId}`;
          
          console.log(`Connecting to user-specific channel: ${channelName}`);
          
          const subscription = await realtimeService.subscribe(channelName, (data) => {
            
            // Create a unique message ID for deduplication
            const roughId = `${data.action || 'unknown'}-${JSON.stringify(data.payload || {})}`;
            
            // Check if we've already processed this message recently
            if (processedMessagesRef.current.has(roughId)) {
              console.log('Duplicate message detected, skipping:', roughId);
              return;
            }
            
            // Add to processed messages (keep only last 50 to prevent memory leak)
            processedMessagesRef.current.add(roughId);
            if (processedMessagesRef.current.size > 50) {
              const firstItem = processedMessagesRef.current.values().next().value;
              if (firstItem) {
                processedMessagesRef.current.delete(firstItem);
              }
            }
            
            // Update the UI data (removed for tarot card focus)
            
            // Handle different types of realtime messages
            if (data.action === 'connection_status' || data.action === 'join') {
              setRealtimeConnected(true);
              setRealtimeLoading(false);
              if (data.action === 'join') {
                console.log('Successfully joined realtime channel:', channelName);
                toast.success(`Connected to realtime channel: ${channelName}`, {
                  icon: '🔗',
                });
              }
            } else if (data.action === 'event' && data.payload) {
              // Handle Xano realtime events
              const message = data.payload.data || data.payload.message || 'New realtime event received';
              toast(`📡 ${message}`, {
                duration: 3000,
              });
            } else if (data.action === 'message' && data.payload) {
              // Handle direct messages
              toast(data.payload.message || 'New realtime message received', {
                icon: '📨',
                duration: 3000,
              });
            } else if (data.action && !['connection_status', 'join'].includes(data.action)) {
              // Handle other realtime actions (but skip demo data)
              if (!data.type || data.type !== 'user_activity') {
                toast(`⚡ Realtime ${data.action}`, {
                  duration: 2000,
                });
              }
            }
          });
          
          if (subscription) {
            realtimeSubscriptionRef.current = subscription;

            // Simulate some realtime data for demo
            const interval = setInterval(() => {
            // Demo data removed for tarot card focus
            }, 5000);
            demoIntervalRef.current = interval;
          }
        } catch (error) {
          console.error('Failed to setup realtime:', error);
          setRealtimeConnected(false);
          setRealtimeLoading(false);
          toast.error('Failed to connect to realtime service', {
            icon: '❌',
            duration: 4000,
          });
        }
      };

      setupRealtime();

      // Cleanup function
      return () => {
        console.log('Cleaning up realtime connection...');
        cleanupRealtime();
      };
    }
  }, [user, isLoading, cleanupRealtime]); // Re-setup realtime when user data or loading state changes


  // Enhanced logout function that cleans up realtime connections
  const handleLogout = () => {
    cleanupRealtime();
    // Reset the realtime connection for clean state
    realtimeService.resetConnection();
    logout();
  };

  // Handle new reading - reset selection and close modal
  const handleNewReading = () => {
    setSelectedCards(new Set());
    setShowReadingModal(false);
    setReadingResult(null);
    setShuffleTrigger(prev => prev + 1);
    // Reset submitted selection to allow new readings
    submittedSelectionRef.current = '';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-xl shadow-sm">
                <Database className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Xano Boilerplate</h1>
                <p className="text-xs text-muted-foreground">by Natt</p>
              </div>
            </div>

            {/* Realtime Status & Menu */}
            <div className="flex items-center space-x-4">
              {/* Home Button */}
              <BackToLanding />
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Realtime Status */}
              <div className="hidden md:flex items-center space-x-2 text-sm">
                {realtimeService.isEnabled() ? (
                  realtimeConnected ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-600 dark:text-green-400 font-medium">Live</span>
                    </>
                  ) : realtimeLoading ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Connecting</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-red-600 dark:text-red-400 font-medium">Disconnected</span>
                    </>
                  )
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground font-medium">Static</span>
                  </>
                )}
              </div>

              {/* Hamburger Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="h-9 w-9 p-0"
                >
                  {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-background border rounded-lg shadow-lg py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/settings"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 flex items-center space-x-2"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>การตั้งค่า</span>
                      </Link>
                      {realtimeService.isEnabled() && realtimeConnected && (
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 flex items-center space-x-2"
                          onClick={() => {
                            toast('🧪 Test notification triggered!', { duration: 2000 });
                            setMenuOpen(false);
                          }}
                        >
                          <Activity className="h-4 w-4" />
                          <span>Test Toast</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 flex items-center space-x-2 text-red-600 dark:text-red-400"
                        onClick={() => {
                          handleLogout();
                          setMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Reading Mode Selector */}
        <ReadingModeSelector 
          selectedMode={readingMode}
          onModeChange={setReadingMode}
        />
        
        <TarotCardSection 
          readingMode={readingMode} 
          selectedCards={selectedCards}
          onSelectedCardsChange={setSelectedCards}
          shuffleTrigger={shuffleTrigger}
          cardsData={tarotCards}
          loading={cardsLoading}
          error={cardsError}
        />
        
        {/* Selection Status */}
        <div className="flex flex-col items-center gap-6 mt-12">
          {!isSelectionValid() && (
            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                {readingMode === 'single' && 'กรุณาเลือกไพ่ 1 ใบเพื่อทำนาย'}
                {readingMode === 'three' && 'กรุณาเลือกไพ่ 3 ใบเพื่อทำนาย'}
                {readingMode === 'celtic' && 'กรุณาเลือกไพ่ 10 ใบเพื่อทำนาย'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                เลือกแล้ว: {selectedCards.size} / {readingMode === 'single' ? 1 : readingMode === 'three' ? 3 : 10}
              </p>
            </div>
          )}
          
          {isSelectionValid() && !isSubmittingReading && (
            <div className="text-center">
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                ✓ พร้อมทำนาย - กำลังประมวลผล...
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setMenuOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

      {/* Tarot Reading Modal */}
      <TarotReadingModal
        isOpen={showReadingModal}
        onClose={() => {
          setShowReadingModal(false);
          // Clear selected cards first to prevent useEffect from triggering
          setSelectedCards(new Set());
          // Reset everything and shuffle cards
          setShuffleTrigger(prev => prev + 1);
          // Reset submitted selection when modal is closed
          submittedSelectionRef.current = '';
        }}
        readingResult={readingResult}
        onNewReading={handleNewReading}
      />
    </div>
  );
};