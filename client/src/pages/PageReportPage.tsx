import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

export default function PageReportPage() {
  const { reportId, pageReportId } = useParams<{ reportId: string; pageReportId: string }>();
  const [pageReport, setPageReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showAllIssues, setShowAllIssues] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/page-reports/${pageReportId}`)
      .then(res => res.json())
      .then(data => {
        setPageReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch page report');
        setLoading(false);
      });
  }, [pageReportId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors py-16">
      <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-2xl w-full max-w-5xl border border-gray-200 dark:border-gray-700 flex flex-col items-center relative">
        <button
          onClick={() => navigate(`/reports/${reportId}`)}
          className="absolute left-8 top-8 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-blue-400/20 border border-gray-300 dark:border-gray-600 transition-colors text-sm font-semibold z-10"
        >
          &larr; Back to Report
        </button>
        <h1 className="text-2xl font-bold mb-4 text-primary dark:text-blue-400">Page Report</h1>
        {error && <div className="text-red-600 dark:text-red-400 mt-4">{error}</div>}
        {loading && <div className="mt-4 text-primary dark:text-blue-400 animate-pulse">Loading...</div>}
        {pageReport && (
          <div className="flex flex-col gap-6 items-center w-full">
            {/* URL and Status */}
            <div className="font-mono text-xs break-all text-gray-700 dark:text-gray-200 mb-1">{pageReport.url}</div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-gray-700 dark:text-gray-300">Status:</span> {renderStatusBadge(pageReport.status)}
              {pageReport.seoScore !== undefined && (
                <span className="ml-4 text-sm font-semibold text-primary dark:text-blue-400">SEO Score: {pageReport.seoScore}</span>
              )}
              {pageReport.lighthouseResult && pageReport.lighthouseResult.fetchTime && (
                <span className="ml-4 text-xs text-gray-500 dark:text-gray-400">Audited: {new Date(pageReport.lighthouseResult.fetchTime).toLocaleString()}</span>
              )}
            </div>

            {/* Screenshot */}
            {pageReport.lighthouseResult && pageReport.lighthouseResult.audits && pageReport.lighthouseResult.audits['final-screenshot'] && pageReport.lighthouseResult.audits['final-screenshot'].details && pageReport.lighthouseResult.audits['final-screenshot'].details.data && (
              <img
                src={pageReport.lighthouseResult.audits['final-screenshot'].details.data}
                alt="Lighthouse screenshot"
                className="mt-2 rounded shadow w-32 h-auto aspect-video object-cover border border-gray-200 dark:border-gray-700"
              />
            )}

            {/* Lighthouse Scores Chart */}
            {pageReport.lighthouseResult && pageReport.lighthouseResult.categories && (
              <div className="w-full mb-8">
                <h2 className="text-xl font-bold mb-4 text-primary dark:text-blue-400 text-left">Lighthouse Scores Overview</h2>
                <div className="w-full h-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  {/* ResponsiveContainer ensures the chart fits the container */}
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(pageReport.lighthouseResult.categories).map(([key, cat]: any) => ({
                        name: cat.title,
                        score: cat.score !== null && cat.score !== undefined ? Math.round(cat.score * 100) : 0
                      }))}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 14 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 14 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#1169fe" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Category Scores */}
            {pageReport.lighthouseResult && pageReport.lighthouseResult.categories && (
              <div className="w-full">
                <h2 className="text-xl font-bold mb-4 text-primary dark:text-blue-400 text-left">Lighthouse Scores</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full">
                  {Object.entries(pageReport.lighthouseResult.categories).map(([key, cat]: any) => (
                    <div key={key} className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">{cat.title}</span>
                      <span className={`text-2xl font-bold ${cat.score >= 0.9 ? 'text-green-600 dark:text-green-400' : cat.score >= 0.5 ? 'text-yellow-500 dark:text-yellow-300' : 'text-red-500 dark:text-red-400'}`}>{cat.score !== null && cat.score !== undefined ? Math.round(cat.score * 100) : 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Metrics */}
            {pageReport.lighthouseResult && pageReport.lighthouseResult.audits && (
              <div className="w-full">
                <h2 className="text-xl font-bold mb-4 text-primary dark:text-blue-400 text-left">Key Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {['first-contentful-paint', 'largest-contentful-paint', 'speed-index', 'total-blocking-time', 'cumulative-layout-shift', 'interactive'].map((id) => {
                    const audit = pageReport.lighthouseResult.audits[id];
                    if (!audit) return null;
                    return (
                      <div key={id} className="flex flex-col bg-gray-50 dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-sm">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{audit.title}</span>
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{audit.displayValue || (audit.numericValue ? audit.numericValue : 'N/A')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top Failed Audits (especially SEO) */}
            {pageReport.lighthouseResult && pageReport.lighthouseResult.audits && (
              <div className="w-full">
                <h2 className="text-xl font-bold mb-4 text-primary dark:text-blue-400 text-left">Top Issues</h2>
                {(() => {
                  const allIssues = Object.values(pageReport.lighthouseResult.audits)
                    .filter((audit: any) => audit.score !== null && audit.score !== undefined && audit.score < 1 && audit.scoreDisplayMode !== 'notApplicable' && audit.scoreDisplayMode !== 'manual')
                    .sort((a: any, b: any) => (a.score ?? 1) - (b.score ?? 1));
                  const issuesToShow = showAllIssues ? allIssues : allIssues.slice(0, 5);
                  return <>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={showAllIssues ? 'all' : 'top5'}
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -32 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
                      >
                        {issuesToShow.map((audit: any) => (
                          <div key={audit.id} className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-5 text-left shadow-sm flex flex-col">
                            <div className="font-semibold text-red-700 dark:text-red-300 text-base mb-1">{audit.title}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">{audit.description}</div>
                            {audit.displayValue && <div className="text-xs text-gray-800 dark:text-gray-100">{audit.displayValue}</div>}
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                    {allIssues.length > 5 && (
                      <button
                        className="mt-6 px-6 py-2 rounded-lg bg-primary dark:bg-blue-400 text-white dark:text-gray-900 font-semibold shadow hover:bg-primary/90 dark:hover:bg-blue-300 transition-colors mx-auto block"
                        onClick={() => setShowAllIssues(v => !v)}
                      >
                        {showAllIssues ? 'Show Top 5 Issues' : `Show All ${allIssues.length} Issues`}
                      </button>
                    )}
                  </>;
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function renderStatusBadge(status: string) {
  let color = 'bg-gray-400 text-white';
  if (status === 'complete') color = 'bg-green-500 text-white';
  else if (status === 'in_progress' || status === 'pending' || status === 'crawling' || status === 'auditing') color = 'bg-yellow-400 text-gray-900';
  else if (status === 'error') color = 'bg-red-500 text-white';
  return <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>{status.replace('_', ' ')}</span>;
} 