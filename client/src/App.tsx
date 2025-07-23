import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports/:reportId" element={<ReportPage />} />
        </Routes>
      </BrowserRouter>
      <ThemeToggle />
    </>
  );
} 