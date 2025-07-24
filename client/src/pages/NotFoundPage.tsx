import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-primary/10 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 py-16">
      <div className="flex flex-col items-center gap-6">
        <div className="text-[7rem] font-extrabold text-primary dark:text-blue-400 drop-shadow-lg flex items-center">
          4
          <span className="mx-2 animate-bounce">🕵️‍♂️</span>
          4
        </div>
        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">
          Oops! The page you’re looking for vanished into the internet ether.
        </div>
        <div className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-xl">
          Maybe you mistyped the address, or maybe this page never existed. Either way, let’s get you back on track!
        </div>
        <button
          className="mt-6 px-8 py-3 rounded-lg bg-primary dark:bg-blue-400 text-white dark:text-gray-900 font-semibold shadow hover:bg-primary/90 dark:hover:bg-blue-300 transition-colors text-lg"
          onClick={() => navigate('/')}
        >
          Go Home
        </button>
      </div>
    </div>
  );
} 