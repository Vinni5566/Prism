import React, { useState } from 'react';
import { Download, Loader } from 'lucide-react';
import { downloadExport } from '../api/client';

export default function ExportButton({ runId, disabled }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!runId || loading) return;
    setLoading(true);
    try {
      downloadExport(runId);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <button
      id="export-csv-btn"
      onClick={handleExport}
      disabled={disabled || !runId || loading}
      className="btn-secondary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading
        ? <><Loader size={14} className="animate-spin"/> Preparing CSV…</>
        : <><Download size={14}/> Export CSV</>}
    </button>
  );
}
