import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io as socketIOClient } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const BoltIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
    <path d="M13.28 2.217a.75.75 0 0 1 .72.933l-1.14 4.557h5.19a1.25 1.25 0 0 1 .97 2.06l-8.25 10a.75.75 0 0 1-1.32-.68l1.14-4.557h-5.19a1.25 1.25 0 0 1-.97-2.06l8.25-10a.75.75 0 0 1 .6-.253z" />
  </svg>
);

export default function HomePage() {
  const [url, setUrl] = useState<string>('');
  const [crawl, setCrawl] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [report, setReport] = useState<{ _id: string } | null>(null);
  const navigate = useNavigate();

  // Latest reports state
  const [latestReports, setLatestReports] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API_URL}/api/reports?limit=3`)
      .then(res => res.json())
      .then(data => setLatestReports(data))
      .catch(() => setLatestReports([]));

    // Real-time updates for recent reports
    const SOCKET_URL = API_URL.replace(/\/api.*/, '');
    // @ts-ignore
    const socket = socketIOClient(SOCKET_URL);
    socket.on('reportUpdated', (payload: { reportId: string, report: any }) => {
      setLatestReports((prev: any[]) => {
        const idx = prev.findIndex(r => r._id === payload.reportId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = payload.report;
        return updated;
      });
    });
    socket.on('pageReportUpdated', (payload: { reportId: string, pageReport: any }) => {
      setLatestReports((prev: any[]) => {
        const idx = prev.findIndex(r => r._id === payload.reportId);
        if (idx === -1) return prev;
        const updated = [...prev];
        if (updated[idx].pageReports) {
          updated[idx].pageReports = updated[idx].pageReports.map((p: any) =>
            p._id === payload.pageReport._id ? payload.pageReport : p
          );
        }
        return updated;
      });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const API_URL = import.meta.env.VITE_API_URL;
  const CLIENT_URL = import.meta.env.VITE_APP_CLIENT_URL;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReport(null);
    try {
      if (!/^https:\/\//.test('https://' + url)) {
        setError('Only HTTPS URLs are allowed.');
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://' + url, crawl }),
      });
      if (!res.ok) throw new Error('Failed to create report');
      const data = await res.json();
      setReport(data);
      navigate(`/reports/${data._id}`);
      return;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 transition-colors py-16 ${latestReports.length > 0 ? 'justify-start pt-16' : 'justify-center'}`}>
      <motion.h1
        className="text-3xl font-bold mb-10 text-primary dark:text-blue-400"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: latestReports.length > 0 ? -40 : 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      >
        SEO Checker
      </motion.h1>
      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-2xl mb-16"
        initial={{ y: 0 }}
        animate={{ y: latestReports.length > 0 ? -60 : 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      >
        <div className="flex w-full bg-white dark:bg-gray-800 shadow-lg rounded-l-full rounded-r-full px-2 py-2 gap-2">
          <span className="flex items-center text-primary dark:text-blue-400 select-none font-medium pl-4">https://</span>
          <input
            type="text"
            className="flex-1 py-3 text-lg focus:outline-none bg-transparent border-none placeholder:text-primary/40 dark:placeholder:text-blue-300 text-primary dark:text-blue-400"
            placeholder="example.com"
            value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value.replace(/^https?:\/\//, ''))}
            required
            autoFocus
          />
          <button
            type="submit"
            className="rounded-r-full px-8 py-3 bg-primary dark:bg-blue-400 text-white dark:text-gray-900 text-lg font-semibold hover:bg-primary/90 dark:hover:bg-blue-300 transition disabled:opacity-60 shadow-md flex items-center justify-center cursor-pointer"
            disabled={loading}
          >
            {BoltIcon}
          </button>
        </div>
        <label className="flex items-center gap-4 w-full max-w-lg mt-6 cursor-pointer select-none">
          <span className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={crawl}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCrawl(e.target.checked)}
              className="peer appearance-none w-6 h-6 rounded-md border-2 border-primary dark:border-blue-400 bg-white dark:bg-gray-800 checked:bg-primary dark:checked:bg-blue-400 checked:border-primary dark:checked:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 dark:focus:ring-blue-400/40"
            />
            <svg
              className="pointer-events-none absolute w-4 h-4 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 11 8 15 16 6" />
            </svg>
          </span>
          <span className="flex flex-col items-start">
            <span className="text-primary dark:text-blue-400 font-semibold">Crawl internal links</span>
            <span className="text-sm text-primary/70 dark:text-blue-300 mt-1">Crawling internal links gives a comprehensive report for your entire site, but it takes much longer to create.</span>
          </span>
        </label>
        {error && <div className="text-red-600 dark:text-red-400 mt-4 text-center w-full">{error}</div>}
        {report && (
          <div className="mt-6 text-green-700 dark:text-green-400 text-center w-full">
            Report created! ID: {report._id}
          </div>
        )}
      </motion.form>
      <AnimatePresence>
        {latestReports.length > 0 && (
          <motion.div
            key="latest-reports"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl flex flex-col items-center"
          >
            <h2 className="text-lg font-bold mb-4 text-primary dark:text-blue-400">Latest Reports</h2>
            <div className="flex flex-col gap-6 w-full items-center">
              {latestReports.map((report, idx) => {
                const total = report.pageReports?.length || 0;
                const complete = report.pageReports?.filter((p: any) => p.status === 'complete').length || 0;
                const avgSeo = total > 0 ? Math.round(report.pageReports.reduce((sum: number, p: any) => sum + (p.seoScore || 0), 0) / total) : null;
                // Opacity and scale for each
                const opacities = ["opacity-100", "opacity-70", "opacity-40"];
                const scales = ["scale-100", "scale-95", "scale-90"];
                return (
                  <div
                    key={report._id}
                    className={`w-full transition-all duration-300 transform ${opacities[idx]} ${scales[idx]} cursor-pointer hover:scale-[1.025] hover:ring-2 hover:ring-primary/60 dark:hover:ring-blue-400/60 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary/80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow flex flex-col gap-3`}
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
            <button
              onClick={() => navigate('/reports')}
              className="mt-8 px-6 py-2 rounded-lg bg-primary dark:bg-blue-400 text-white dark:text-gray-900 font-semibold shadow hover:bg-primary/90 dark:hover:bg-blue-300 transition-colors"
            >
              View All Reports
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 