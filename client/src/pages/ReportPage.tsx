import React from 'react';
import { useParams } from 'react-router-dom';

export default function ReportPage() {
  const { reportId } = useParams<{ reportId: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Report Page</h1>
        <p>Report ID: <span className="font-mono">{reportId}</span></p>
        {/* TODO: Fetch and display report details */}
      </div>
    </div>
  );
} 