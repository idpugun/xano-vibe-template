import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Layers, Cross } from 'lucide-react';

export type ReadingMode = 'single' | 'three' | 'celtic';

interface ReadingModeSelectorProps {
  selectedMode: ReadingMode;
  onModeChange: (mode: ReadingMode) => void;
}

const readingModes = [
  {
    id: 'single' as ReadingMode,
    title: 'Single Card',
    description: 'Quick insight',
    icon: Sparkles,
    details: 'Perfect for daily guidance and quick answers to specific questions.',
    color: 'from-blue-500 to-cyan-500',
    hoverColor: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'three' as ReadingMode,
    title: 'Three Cards',
    description: 'Past / Present / Future OR Situation / Advice / Outcome',
    icon: Layers,
    details: 'Gain deeper understanding with three interconnected cards that tell a complete story.',
    color: 'from-purple-500 to-pink-500',
    hoverColor: 'from-purple-600 to-pink-600'
  },
  {
    id: 'celtic' as ReadingMode,
    title: 'Celtic Cross',
    description: 'Deeper reading with 10 cards',
    icon: Cross,
    details: 'The classic spread for complex issues, providing comprehensive insight into your situation.',
    color: 'from-amber-500 to-orange-500',
    hoverColor: 'from-amber-600 to-orange-600'
  }
];

export const ReadingModeSelector: React.FC<ReadingModeSelectorProps> = ({
  selectedMode,
  onModeChange
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          เลือกโหมดการทำนาย
        </h2>
        <p className="text-muted-foreground">
          เลือกโหมดการทำนายที่เหมาะสมกับคำถามของคุณ
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {readingModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <Card
              key={mode.id}
              className={`
                cursor-pointer transition-all duration-300 hover:shadow-lg
                ${isSelected 
                  ? 'ring-2 ring-primary shadow-lg scale-105' 
                  : 'hover:scale-102'
                }
              `}
              onClick={() => onModeChange(mode.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`
                  mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3
                  bg-gradient-to-br ${isSelected ? mode.color : 'from-muted to-muted-foreground/20'}
                  transition-all duration-300
                `}>
                  <Icon className={`h-8 w-8 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {mode.title}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-primary">
                  {mode.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {mode.details}
                </p>
                
                <Button
                  className={`
                    w-full transition-all duration-300
                    ${isSelected 
                      ? `bg-gradient-to-r ${mode.color} hover:bg-gradient-to-r ${mode.hoverColor} text-white` 
                      : 'bg-muted hover:bg-muted-foreground/20 text-muted-foreground'
                    }
                  `}
                  variant={isSelected ? 'default' : 'outline'}
                >
                  {isSelected ? 'เลือกแล้ว' : 'เลือกโหมดนี้'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
