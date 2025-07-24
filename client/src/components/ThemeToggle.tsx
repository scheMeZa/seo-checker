import React, { useEffect, useState } from 'react';

const SunIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.25-9H21M3 12h2.25m12.364-6.364l-1.591 1.591M6.343 17.657l-1.591 1.591m12.364 0l-1.591-1.591M6.343 6.343L4.752 4.752M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
  </svg>
);
const MoonIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0112 21.75c-5.385 0-9.75-4.365-9.75-9.75 0-4.136 2.652-7.64 6.393-9.09a.75.75 0 01.908.37.75.75 0 01-.082.98A7.501 7.501 0 0012 19.5c2.485 0 4.69-1.21 6.18-3.09a.75.75 0 01.98-.082.75.75 0 01.37.908z" />
  </svg>
);

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  if (localStorage.theme === 'dark') return 'dark';
  return 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      className="fixed top-6 right-8 z-50 p-2 rounded-full bg-white dark:bg-gray-900 border border-primary shadow hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
      aria-label="Toggle dark mode"
      type="button"
      onClick={toggleTheme}
    >
      {theme === 'dark' ? SunIcon : MoonIcon}
    </button>
  );
} 