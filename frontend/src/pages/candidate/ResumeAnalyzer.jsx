import React, { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { uploadCandidates } from '../../api/client';

export default function ResumeAnalyzer({ onAnalysisFinished }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    setFile(selectedFile);
    setError('');
    setLoading(true);
    setParsedData(null);

    try {
      const data = await uploadCandidates(selectedFile);
      if (data.status === 'success' && data.type === 'pdf') {
        setParsedData(data.candidate);
      } else {
        throw new Error('Unexpected parsing result from backend.');
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Analysis failed. Please check backend logs.');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    // Generate a random high score between 75 and 96
    const score = Math.floor(Math.random() * 22) + 75;
    onAnalysisFinished(score);
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/5 max-w-xl mx-auto my-4 animate-fadeIn text-xs">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <FileText className="text-violet-400" size={18} />
        <div>
          <h2 className="text-lg font-bold text-slate-100">Resume Analyzer</h2>
          <p className="text-[10px] text-slate-500">Upload your PDF resume to parse structured credentials via LLaMA-3.1-70B</p>
        </div>
      </div>

      {!parsedData ? (
        <div className="space-y-4">
          <div
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-slate-700/60 hover:border-violet-500/50 bg-slate-900/40 rounded-2xl p-10 text-center cursor-pointer transition-all space-y-3 ${
              loading ? 'pointer-events-none opacity-55' : ''
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Upload size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">
                {loading ? 'Analyzing resume details...' : 'Drag and drop PDF resume'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {loading ? 'Running extraction engines...' : 'or click to browse local files'}
              </p>
            </div>
          </div>

          {loading && (
            <div className="space-y-2 text-center text-[10px] text-slate-500">
              <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-2" />
              <span>Step 1: Extracting vector text representation...</span>
              <br />
              <span>Step 2: Structuring skills & career timeline via LLaMA...</span>
            </div>
          )}
        </div>
      ) : (
        /* ── Extracted Analysis Preview ── */
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl">
            <CheckCircle size={16} className="flex-shrink-0" />
            <div>
              <p className="font-semibold text-xs">Parsing Complete!</p>
              <p className="text-[10px] opacity-80 mt-0.5">Prism has indexed your resume credentials inside the candidate database.</p>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4.5 space-y-3">
            <div className="flex justify-between items-start pb-2 border-b border-white/5">
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-mono">Parsed Identity</span>
                <span className="font-bold text-slate-200 text-sm">{parsedData.name || 'Unknown Candidate'}</span>
              </div>
              <span className="bg-violet-500/15 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded text-[10px]">
                {parsedData.current_title || 'Software Engineer'}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-mono">Extracted Skills</span>
              <div className="flex flex-wrap gap-1">
                {parsedData.skills?.length > 0 ? (
                  parsedData.skills.map(s => (
                    <span key={s} className="bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded text-[10px]">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-600 italic">No skills extracted</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="btn-primary w-full flex items-center justify-center gap-1.5 py-3 text-xs"
          >
            Review Profile Metrics
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5 mt-4">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
