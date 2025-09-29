import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { Button } from '../ui/button';
import { JSX, useState } from 'react';


export const ThemeToggle = ({ onThemeChange }: { onThemeChange?: (theme: 'light' | 'dark') => void }): JSX.Element => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (onThemeChange) onThemeChange(newTheme);
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={toggleTheme}
    >
      {theme === 'light' ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;