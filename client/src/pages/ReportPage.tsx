import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @ts-ignore
import { io as socketIOClient } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = API_URL.replace(/\/api.*/, ''); // assumes API_URL ends with /api

export default function ReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let socket;
    let isMounted = true;
    async function fetchReport() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_URL}/api/reports/${reportId}`);
        if (!res.ok) throw new Error('Failed to fetch report');
        const data = await res.json();
        if (isMounted) setReport(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchReport();
    // Connect to socket
    // Use a single socket instance per page
    // If running locally, SOCKET_URL may be http://localhost:5000
    // If deployed, SOCKET_URL should match backend
    // You may need to adjust CORS settings on backend
    // @ts-ignore
    socket = socketIOClient(SOCKET_URL);
    // Listen for report updates
    socket.on('reportUpdated', (payload: { reportId: string, report: any }) => {
      if (payload.reportId === reportId) {
        setReport(payload.report);
      }
    });
    // Listen for page report updates
    socket.on('pageReportUpdated', (payload: { reportId: string, pageReport: any }) => {
      if (payload.reportId === reportId) {
        setReport((prev: any) => {
          if (!prev) return prev;
          let updatedPages;
          if (prev.pageReports.some((p: any) => p._id === payload.pageReport._id)) {
            updatedPages = prev.pageReports.map((p: any) =>
              p._id === payload.pageReport._id ? payload.pageReport : p
            );
          } else {
            updatedPages = [...prev.pageReports, payload.pageReport];
          }
          return { ...prev, pageReports: updatedPages };
        });
      }
    });
    return () => {
      isMounted = false;
      if (socket) socket.disconnect();
    };
  }, [reportId]);

  let progress = 0;
  let total = 0;
  let complete = 0;
  if (report && report.pageReports) {
    total = report.pageReports.length;
    complete = report.pageReports.filter((p: any) => p.status === 'complete').length;
    progress = total > 0 ? Math.round((complete / total) * 100) : 0;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors py-16">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-3xl text-center border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/')}
          className="mb-6 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-blue-400/20 border border-gray-300 dark:border-gray-600 transition-colors text-sm font-semibold float-left"
        >
          &larr; Back
        </button>
        <h1 className="text-3xl font-bold mb-4 text-primary dark:text-blue-400 clear-both">SEO Report</h1>
        <p className="mb-6 text-gray-700 dark:text-gray-300">Report ID: <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{reportId}</span></p>
        {error && <div className="text-red-600 dark:text-red-400 mt-4">{error}</div>}
        {(loading || (report && (report.status === 'pending' || report.status === 'in_progress'))) ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-16">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-16 w-16 text-primary dark:text-blue-400 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <div className="text-2xl font-extrabold text-primary dark:text-blue-400 animate-pulse mb-2 tracking-wide uppercase">Generating Report...</div>
              <div className="text-lg text-gray-700 dark:text-gray-300 animate-pulse mb-4">This may take up to a minute for large sites.</div>
            </div>
            {report && (
              <div className="flex flex-col items-center w-full">
                <div className="text-lg font-semibold text-primary dark:text-blue-400 mb-2">
                  {complete} / {total} pages complete
                </div>
                <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-5 shadow-inner mb-2">
                  <div
                    className="bg-primary dark:bg-blue-400 h-5 rounded-full transition-all shadow"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">Progress: {progress}%</div>
                {/* Recent Activity Events */}
                <RecentPageEvents pageReports={report.pageReports || []} />
              </div>
            )}
          </div>
        ) : report && report.status === 'complete' && (
          <>
            <div className="mt-4 mb-8">
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex flex-col items-center gap-2">
                <span>Status: {renderStatusBadge(report.status)}</span>
                {total > 0 && (
                  <span className="text-base text-gray-600 dark:text-gray-400">Progress: <span className="text-primary dark:text-blue-400 font-bold">{complete} / {total}</span> pages ({progress}%)</span>
                )}
              </div>
            </div>
            <div className="mt-8 text-left">
              <h2 className="text-xl font-bold mb-4 text-primary dark:text-blue-400">Page Results</h2>
              <ul className="flex flex-col gap-4">
                {report.pageReports.map((page: any) => (
                  <li
                    key={page._id}
                    className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm flex flex-col gap-2 cursor-pointer hover:bg-primary/10 dark:hover:bg-blue-400/10 transition-colors"
                    onClick={() => navigate(`/reports/${reportId}/page/${page._id}`)}
                  >
                    <div className="font-mono text-xs break-all text-gray-700 dark:text-gray-200 mb-1">{page.url}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-300">Status:</span> {renderStatusBadge(page.status)}
                      {page.seoScore !== undefined && (
                        <span className="ml-auto text-sm font-semibold text-primary dark:text-blue-400">SEO Score: {page.seoScore}</span>
                      )}
                      {page.lighthouseResult && page.lighthouseResult.categories && page.lighthouseResult.categories.performance && (
                        <span className="ml-4 text-sm font-semibold text-green-600 dark:text-green-400">Performance: {Math.round(page.lighthouseResult.categories.performance.score * 100)}</span>
                      )}
                    </div>
                    {page.lighthouseResult && page.lighthouseResult.audits && page.lighthouseResult.audits['final-screenshot'] && page.lighthouseResult.audits['final-screenshot'].details && page.lighthouseResult.audits['final-screenshot'].details.data && (
                      <img
                        src={page.lighthouseResult.audits['final-screenshot'].details.data}
                        alt="Lighthouse screenshot"
                        className="mt-2 rounded shadow w-24 h-auto aspect-video object-cover border border-gray-200 dark:border-gray-700"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Helper to render status badge
function renderStatusBadge(status: string) {
  let color = 'bg-gray-400 text-white';
  if (status === 'complete') color = 'bg-green-500 text-white';
  else if (status === 'in_progress' || status === 'pending') color = 'bg-yellow-400 text-gray-900';
  else if (status === 'error') color = 'bg-red-500 text-white';
  return <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>{status.replace('_', ' ')}</span>;
}

function RecentPageEvents({ pageReports }: { pageReports: any[] }) {
  // Sort by updatedAt/createdAt descending, fallback to createdAt if no updatedAt
  const sorted = [...pageReports]
    .filter(p => p.status !== 'pending')
    .sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    })
    .slice(0, 5);
  const opacities = ['opacity-100 scale-100', 'opacity-80 scale-95', 'opacity-60 scale-90', 'opacity-40 scale-85', 'opacity-20 scale-80'];
  return (
    <div className="w-full flex flex-col items-center mt-2">
      <h3 className="text-base font-semibold text-primary dark:text-blue-400 mb-2">Recent Activity</h3>
      <ul className="flex flex-col gap-2 w-full items-center">
        {sorted.length === 0 ? (
          <li className="text-xs text-gray-400">Waiting for pages to be scheduled...</li>
        ) : (
          sorted.map((p, idx) => (
            <li
              key={p._id}
              className={`transition-all duration-300 rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-700 flex items-center gap-3 w-11/12 ${opacities[idx]}`}
            >
              <span className="font-mono text-xs truncate max-w-[12rem] text-gray-700 dark:text-gray-200">{p.url}</span>
              {renderStatusBadge(p.status)}
            </li>
          ))
        )}
      </ul>
    </div>
  );
} 