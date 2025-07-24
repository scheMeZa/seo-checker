import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/reports`)
      .then(res => res.json())
      .then(data => {
        // Sort by createdAt descending
        setReports(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch reports');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors py-16">
      <div className="w-full max-w-4xl">
        <div className="relative flex items-center justify-center mb-10 min-h-[3.5rem]">
          <Link
            to="/"
            className="absolute left-0 px-5 py-2 rounded-lg bg-primary dark:bg-blue-400 text-white dark:text-gray-900 font-semibold shadow hover:bg-primary/90 dark:hover:bg-blue-300 transition-colors text-base whitespace-nowrap"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            ← Home
          </Link>
          <h1 className="text-3xl font-bold text-primary dark:text-blue-400 text-center w-full">All SEO Reports</h1>
        </div>
        {error && <div className="text-red-600 dark:text-red-400 mt-4 text-center">{error}</div>}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <svg className="animate-spin h-16 w-16 text-primary dark:text-blue-400 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <div className="text-2xl font-extrabold text-primary dark:text-blue-400 animate-pulse mb-2 tracking-wide uppercase">Loading Reports...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reports.map((report) => {
              const total = report.pageReports?.length || 0;
              const complete = report.pageReports?.filter((p: any) => p.status === 'complete').length || 0;
              const avgSeo = total > 0 ? Math.round(report.pageReports.reduce((sum: number, p: any) => sum + (p.seoScore || 0), 0) / total) : null;
              return (
                <div
                  key={report._id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow flex flex-col gap-3 transition cursor-pointer hover:scale-[1.025] hover:ring-2 hover:ring-primary/60 dark:hover:ring-blue-400/60 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary/80"
                  onClick={() => navigate(`/reports/${report._id}`)}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') navigate(`/reports/${report._id}`); }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{new Date(report.createdAt).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      report.status === 'complete'
                        ? 'bg-green-500 text-white'
                        : report.status === 'in_progress' || report.status === 'pending'
                        ? 'bg-yellow-400 text-gray-900'
                        : report.status === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-400 text-white'
                    }`}>{report.status.replace('_', ' ')}</span>
                  </div>
                  <div className="text-primary dark:text-blue-400 font-bold text-lg truncate mb-1">{report.url}</div>
                  <div className="flex gap-4 text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <span>Pages: {total}</span>
                    {avgSeo !== null && <span>Avg SEO: {avgSeo}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Progress:</span>
                    <span className="font-semibold text-primary dark:text-blue-400 text-xs">{complete} / {total}</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-2">
                      <div
                        className="h-2 rounded-full bg-primary dark:bg-blue-400 transition-all"
                        style={{ width: total > 0 ? `${Math.round((complete / total) * 100)}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 