import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import ReportsPage from './pages/ReportsPage';
import ThemeToggle from './components/ThemeToggle';
import PageReportPage from './pages/PageReportPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:reportId" element={<ReportPage />} />
          <Route path="/reports/:reportId/page/:pageReportId" element={<PageReportPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <ThemeToggle />
    </>
  );
} 