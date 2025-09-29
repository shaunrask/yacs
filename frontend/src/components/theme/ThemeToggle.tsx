import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { Button } from '../ui/button';
import { JSX } from 'react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle = ({
  className,
}: { className?: string }): JSX.Element => {
  const { name, toggleTheme } = useTheme();
  const isDark = name === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 ${className ?? ''}`}
      onClick={toggleTheme}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <SunIcon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
