import type React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

interface BackToLandingProps {
  variant?: 'home' | 'arrow';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showText?: boolean;
}

export const BackToLanding: React.FC<BackToLandingProps> = ({
  variant = 'home',
  size = 'sm',
  className = '',
  showText = true
}) => {
  const Icon = variant === 'home' ? Home : ArrowLeft;
  const text = variant === 'home' ? 'หน้าแรก' : 'กลับหน้าแรก';

  return (
    <Button
      variant="ghost"
      size={size}
      asChild
      className={className}
    >
      <Link to="/">
        <Icon className="h-4 w-4 mr-2" />
        {showText && text}
      </Link>
    </Button>
  );
};
