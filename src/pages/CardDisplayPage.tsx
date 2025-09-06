import type React from 'react';
import { CardGrid } from '@/components/CardGrid';
import { BackToLanding } from '@/components/BackToLanding';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const CardDisplayPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <BackToLanding />
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <CardGrid />
      </main>
    </div>
  );
};
