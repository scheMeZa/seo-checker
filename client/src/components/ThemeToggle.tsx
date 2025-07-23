import React from 'react';
// Heroicons v2 outline icons
const SunIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.25-9H21M3 12h2.25m12.364-6.364l-1.591 1.591M6.343 17.657l-1.591 1.591m12.364 0l-1.591-1.591M6.343 6.343L4.752 4.752M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
  </svg>
);

export default function ThemeToggle() {
  return (
    <button
      className="fixed top-6 right-8 z-50 p-2 rounded-full bg-white border border-primary shadow hover:bg-primary/10 transition-colors"
      aria-label="Theme toggle (light mode only)"
      type="button"
      disabled
    >
      {SunIcon}
    </button>
  );
} 