import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'text';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', variant = 'icon' }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (variant === 'text') {
    return (
      <Button
        variant="ghost"
        className={`w-full justify-start gap-3 text-muted-foreground hover:text-foreground ${className}`}
        onClick={toggleTheme}
      >
        {theme === 'dark' ? (
          <>
            <Sun className="h-5 w-5" />
            Light Mode
          </>
        ) : (
          <>
            <Moon className="h-5 w-5" />
            Dark Mode
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`rounded-xl transition-all hover:scale-105 ${className}`}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
};

export default ThemeToggle;
