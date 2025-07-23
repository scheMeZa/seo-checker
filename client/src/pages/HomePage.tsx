import React, { useState, ChangeEvent, FormEvent } from 'react';

// Paper Airplane icon from Heroicons (outline)
const PaperAirplaneIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.197-.12 1.197.488V7.5a.75.75 0 00.75.75h6.75a.75.75 0 01.53 1.28l-8.954 8.955c-.44.439-1.197.12-1.197-.488V16.5a.75.75 0 00-.75-.75H3.28a.75.75 0 01-.53-1.28z" />
  </svg>
);

export default function HomePage() {
  const [url, setUrl] = useState<string>('');
  const [crawl, setCrawl] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [report, setReport] = useState<{ _id: string } | null>(null);

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
      const res = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://' + url, crawl }),
      });
      if (!res.ok) throw new Error('Failed to create report');
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100 transition-colors">
      <h1 className="text-3xl font-bold mb-10 text-primary">SEO Checker</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-2xl"
      >
        <div className="flex w-full bg-white shadow-lg rounded-l-full rounded-r-full px-2 py-2 gap-2">
          <span className="flex items-center text-primary select-none font-medium pl-4">https://</span>
          <input
            type="text"
            className="flex-1 py-3 text-lg focus:outline-none bg-transparent border-none placeholder:text-primary/40 text-primary"
            placeholder="example.com"
            value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value.replace(/^https?:\/\//, ''))}
            required
            autoFocus
          />
          <button
            type="submit"
            className="rounded-r-full px-8 py-3 bg-primary text-white text-lg font-semibold hover:bg-primary/90 transition disabled:opacity-60 shadow-md flex items-center justify-center"
            disabled={loading}
          >
            {PaperAirplaneIcon}
          </button>
        </div>
        <label className="flex items-center mt-6 cursor-pointer group">
          <input
            type="checkbox"
            className="peer appearance-none w-5 h-5 border-2 border-primary rounded-md checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 transition-all mr-2"
            checked={crawl}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCrawl(e.target.checked)}
          />
          <span className="w-5 h-5 absolute flex items-center justify-center pointer-events-none">
            <svg
              className="hidden peer-checked:block text-white"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 8.5L7 11.5L12 6.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-primary ml-2">Crawl internal links</span>
        </label>
        {error && <div className="text-red-600 mt-4 text-center w-full">{error}</div>}
        {report && (
          <div className="mt-6 text-green-700 text-center w-full">
            Report created! ID: {report._id}
          </div>
        )}
      </form>
    </div>
  );
} 