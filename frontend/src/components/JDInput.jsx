import React, { useRef, useState } from 'react';
import { Sparkles, AlertCircle, FileText, Upload, Check, Trash2, HelpCircle } from 'lucide-react';
import { analyzeJd, analyzeJdFile, scanJdBias } from '../api/client';

const PLACEHOLDER = `Paste a job description here. Prism will understand the role, extract required skills, detect seniority and domain, then rank candidates intelligently.

Example:
We are looking for a Senior Backend Engineer with 4+ years of experience in Python, FastAPI, PostgreSQL, and Docker. You will be building our fintech payment processing platform...`;

export default function JDInput({ value, onChange, onJdAnalyzed, parsedJd, onClearParsedJd, isLoading, disabled }) {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'file'
  const [file, setFile] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  
  const [biasResult, setBiasResult] = useState(null);
  const [scanningBias, setScanningBias] = useState(false);

  const charCount = value.length;
  const isValid = charCount >= 50;

  const handleTextAnalyze = async () => {
    if (!isValid || localLoading) return;
    setLocalLoading(true);
    setError('');
    try {
      const data = await analyzeJd(value);
      onJdAnalyzed(data, value);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Analysis failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    setFile(selectedFile);
    setError('');
    setLocalLoading(true);

    try {
      const data = await analyzeJdFile(selectedFile);
      // Backend returns parsed analysis AND the full extracted text
      onJdAnalyzed(data, data.jd_text || '');
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'File parsing failed');
      setFile(null);
    } finally {
      setLocalLoading(false);
    }
  };

  const clearAll = () => {
    onChange('');
    setFile(null);
    setError('');
    onClearParsedJd();
  };

  const dragOver = (e) => e.preventDefault();
  const fileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const mockEvent = { target: { files: [droppedFile] } };
      handleFileChange(mockEvent);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
            <Sparkles size={15} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Job Description</h2>
            <p className="text-[10px] text-slate-500">Configure role requirements</p>
          </div>
        </div>
        
        {!parsedJd && activeTab === 'text' && (
          <div className={`text-[10px] font-mono px-2 py-0.5 rounded ${isValid ? 'text-teal-400 bg-teal-500/10' : 'text-slate-500 bg-slate-800'}`}>
            {charCount} / 50+
          </div>
        )}

        {parsedJd && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={11} /> Clear
          </button>
        )}
      </div>

      {/* Tabs - Only show when NOT analyzed */}
      {!parsedJd && (
        <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-0.5 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('text')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'text' ? 'bg-white/5 text-slate-200' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <FileText size={12} className="inline mr-1" /> Paste Text
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'file' ? 'bg-white/5 text-slate-200' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Upload size={12} className="inline mr-1" /> Upload PDF
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {parsedJd ? (
        /* ── Extracted Analysis Panel ── */
        <div className="space-y-4 bg-slate-950/30 border border-white/5 rounded-xl p-4 animate-fadeIn text-xs">
          <div className="flex justify-between items-start border-b border-white/5 pb-2">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Role Extracted</div>
              <h3 className="text-sm font-bold text-slate-200">{parsedJd.job_title}</h3>
            </div>
            <span className="bg-teal-500/15 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase">
              {parsedJd.seniority_level}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block">Domain</span>
              <span className="text-slate-300 font-medium">{parsedJd.domain}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Min Experience</span>
              <span className="text-slate-300 font-medium">{parsedJd.years_experience_min} yrs</span>
            </div>
          </div>

          {/* Required Skills */}
          {parsedJd.required_skills?.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 block">Required Skills</span>
              <div className="flex flex-wrap gap-1">
                {parsedJd.required_skills.map(s => (
                  <span key={s} className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-0.5 rounded text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Skills */}
          {parsedJd.preferred_skills?.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 block">Preferred Skills</span>
              <div className="flex flex-wrap gap-1">
                {parsedJd.preferred_skills.map(s => (
                  <span key={s} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Soft Skills */}
          {parsedJd.soft_skills?.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 block">Soft Skills</span>
              <div className="flex flex-wrap gap-1">
                {parsedJd.soft_skills.map(s => (
                  <span key={s} className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deal Breakers */}
          {parsedJd.deal_breakers?.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-red-400/80 block font-medium">Deal Breakers</span>
              <ul className="list-disc pl-4 text-slate-400 space-y-0.5 text-[11px]">
                {parsedJd.deal_breakers.map((db, idx) => (
                  <li key={idx}>{db}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* ── Input Mode Panels ── */
        <div>
          {activeTab === 'text' ? (
            <div className="relative">
              <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={PLACEHOLDER}
                rows={10}
                disabled={isLoading || localLoading || disabled}
                className="input-dark resize-none leading-relaxed font-mono text-xs"
                style={{ minHeight: '200px' }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-8 rounded-b-xl pointer-events-none"
                   style={{ background: 'linear-gradient(transparent, rgba(15,23,42,0.4))' }} />
            </div>
          ) : (
            <div
              onDragOver={dragOver}
              onDrop={fileDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700/60 hover:border-teal-500/50 bg-slate-900/40 rounded-xl p-8 text-center cursor-pointer transition-all space-y-3"
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
                <p className="text-xs font-semibold text-slate-300">Drag and drop JD PDF here</p>
                <p className="text-[10px] text-slate-500 mt-1">or click to browse local files</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      {!parsedJd && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleTextAnalyze}
            disabled={!isValid || isLoading || localLoading || disabled || scanningBias}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {localLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Parsing Requirements…
              </>
            ) : (
              <>
                <Sparkles size={14} /> Analyze Job Description
              </>
            )}
          </button>
          
          {activeTab === 'text' && !biasResult && (
            <button
              onClick={async () => {
                if (!isValid) return;
                setScanningBias(true);
                try {
                  const res = await scanJdBias(value);
                  setBiasResult(res);
                } catch (err) {
                  console.error(err);
                } finally {
                  setScanningBias(false);
                }
              }}
              disabled={!isValid || scanningBias || localLoading}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scanningBias ? 'Scanning...' : 'Scan for JD Bias & Exclusionary Language'}
            </button>
          )}
        </div>
      )}

      {/* Bias Scanner Results */}
      {biasResult && !parsedJd && (
        <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-4 mt-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <AlertCircle size={14} /> DEI Bias Scan Results
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${biasResult.score >= 90 ? 'bg-teal-500/20 text-teal-400' : biasResult.score >= 70 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
              Score: {biasResult.score}/100
            </span>
          </div>
          
          {biasResult.flags && biasResult.flags.length > 0 ? (
            <>
              <div className="space-y-3">
                {biasResult.flags.map((flag, idx) => (
                  <div key={idx} className="bg-slate-900/50 rounded-lg p-3 text-xs border border-rose-500/10">
                    <div className="flex gap-2 items-start mb-1">
                      <span className="text-rose-400 font-semibold line-through decoration-rose-500/50">"{flag.phrase}"</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-teal-400 font-semibold">{flag.suggestion}</span>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-1">{flag.reason}</p>
                  </div>
                ))}
              </div>
              
              {biasResult.fixed_jd && (
                <div className="mt-4 pt-4 border-t border-rose-500/20">
                  <h4 className="text-xs font-bold text-teal-400 mb-2 flex items-center gap-1.5">
                    <Sparkles size={14} /> Unbiased Version (Ready to use)
                  </h4>
                  <div className="relative group">
                    <textarea
                      readOnly
                      value={biasResult.fixed_jd}
                      className="w-full bg-slate-900/80 border border-teal-500/20 rounded-lg p-3 text-[10px] font-mono text-slate-300 resize-none h-32 focus:outline-none"
                    />
                    <button 
                      onClick={() => {
                        onChange(biasResult.fixed_jd);
                        setBiasResult(null);
                      }}
                      className="absolute top-2 right-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-1.5 rounded text-[10px] transition-colors shadow-lg opacity-0 group-hover:opacity-100 flex items-center gap-1"
                    >
                      <Check size={12} /> Replace & Use This
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-teal-400 bg-teal-500/10 p-2 rounded-lg border border-teal-500/20">
              <Check size={12} className="inline mr-1" />
              Great job! No biased or exclusionary language detected.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
