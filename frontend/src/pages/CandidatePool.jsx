import React, { useState, useEffect } from 'react';
import {
  Users, Search, Briefcase, MapPin, Award, SortAsc, SortDesc,
  RefreshCw, Upload, X, CheckCircle, AlertTriangle, Layers,
  Filter, Heart, Star, BookOpen
} from 'lucide-react';
import { initials, formatYears } from '../utils/helpers';
import { uploadCandidates, searchCandidates } from '../api/client';

export default function CandidatePool({ candidates, onRefresh, isLoading }) {
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('keyword'); // 'keyword' | 'semantic'
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [expMin, setExpMin] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');

  // Upload modal states
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Search Results
  const [semanticResults, setSemanticResults] = useState([]);
  const [searchingSemantic, setSearchingSemantic] = useState(false);

  // Saved Searches
  const [savedSearches, setSavedSearches] = useState(() => {
    try {
      const stored = localStorage.getItem('prism_saved_searches');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (searchType === 'semantic' && search.trim()) {
      setSearchingSemantic(true);
      try {
        const results = await searchCandidates(search);
        setSemanticResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingSemantic(false);
      }
    } else {
      setSemanticResults([]);
    }
  };

  const saveCurrentSearch = () => {
    if (!search.trim()) return;
    const newSaved = [
      { q: search, type: searchType, timestamp: new Date().toISOString() },
      ...savedSearches.slice(0, 4) // keep last 5
    ];
    setSavedSearches(newSaved);
    localStorage.setItem('prism_saved_searches', JSON.stringify(newSaved));
  };

  const applySavedSearch = (saved) => {
    setSearch(saved.q);
    setSearchType(saved.type);
    if (saved.type === 'semantic') {
      setSearchingSemantic(true);
      searchCandidates(saved.q)
        .then(res => setSemanticResults(res))
        .catch(err => console.error(err))
        .finally(() => setSearchingSemantic(false));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadStatus(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      const res = await uploadCandidates(uploadFile);
      if (res.status === 'success') {
        if (res.type === 'csv') {
          setUploadStatus({
            type: 'success',
            message: `Successfully ingested CSV list! Added ${res.added_count} candidates to the pool (Total: ${res.total_count}).`
          });
        } else if (res.type === 'pdf') {
          setUploadStatus({
            type: 'success',
            message: `Successfully parsed resume for ${res.candidate.name || 'Unknown'}!`,
            details: res.candidate
          });
        }
        setUploadFile(null);
        onRefresh();
      } else {
        setUploadStatus({ type: 'error', message: res.detail || 'Ingestion failed.' });
      }
    } catch (e) {
      setUploadStatus({
        type: 'error',
        message: e?.response?.data?.detail || e.message || 'Failed to upload file.'
      });
    } finally {
      setUploading(false);
    }
  };

  const baseCandidates = searchType === 'semantic' && search.trim() ? semanticResults : candidates;

  const normalizedCandidates = (baseCandidates || []).map(c => ({
    ...c,
    current_role: c.current_role || c.current_title,
    company: c.company || c.current_company,
    experience_years: c.experience_years ?? c.years_experience,
  }));

  // Apply multiple filters
  const filtered = normalizedCandidates.filter(c => {
    // 1. Keyword search (if local keyword search is active)
    if (searchType === 'keyword' && search.trim()) {
      const match = [c.name, c.current_role, c.company, ...(c.skills || [])]
        .join(' ').toLowerCase().includes(search.toLowerCase());
      if (!match) return false;
    }

    // 2. Experience min
    if (expMin && (c.experience_years ?? 0) < parseFloat(expMin)) return false;

    // 3. Domain
    if (domainFilter && !String(c.domain || '').toLowerCase().includes(domainFilter.toLowerCase())) return false;

    // 4. Location
    if (locationFilter && !String(c.location || '').toLowerCase().includes(locationFilter.toLowerCase())) return false;

    // 5. Skills
    if (skillsFilter) {
      const targetSkills = skillsFilter.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
      const hasAll = targetSkills.every(ts => (c.skills || []).some(s => String(s).toLowerCase().includes(ts)));
      if (!hasAll) return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av, bv;
    if (sortBy === 'name')       { av = a.name || ''; bv = b.name || ''; }
    else if (sortBy === 'exp')   { av = a.experience_years ?? 0; bv = b.experience_years ?? 0; }
    else if (sortBy === 'role')  { av = a.current_role || ''; bv = b.current_role || ''; }
    else                         { av = a.name || ''; bv = b.name || ''; }
    return sortDir === 'asc'
      ? typeof av === 'string' ? av.localeCompare(bv) : av - bv
      : typeof av === 'string' ? bv.localeCompare(av) : bv - av;
  });

  const toggleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
  };

  return (
    <div className="space-y-4 text-xs animate-fadeIn">
      {/* Header Panel */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Users size={18} className="text-teal-400"/>
              Candidate Pool
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Showing {filtered.length} of {candidates?.length ?? 0} candidates
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Input with type toggle */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search size={13} className="absolute left-3 text-slate-500 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={searchType === 'semantic' ? 'Describe ideal candidate...' : 'Search name, role, skills…'}
                className="input-dark pl-8 pr-16 py-2 text-xs w-60"
              />
              <button
                type="button"
                onClick={() => setSearchType(t => t === 'keyword' ? 'semantic' : 'keyword')}
                className="absolute right-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200"
              >
                {searchType}
              </button>
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary p-2 flex items-center gap-1 ${showFilters ? 'border-teal-500/40 text-teal-400' : ''}`}
              title="Filters"
            >
              <Filter size={13} />
            </button>

            <button onClick={onRefresh} disabled={isLoading}
                    className="btn-secondary p-2 disabled:opacity-50"
                    title="Refresh Candidate Pool">
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            </button>
            
            <button onClick={() => setShowUpload(true)}
                    className="btn-primary flex items-center gap-1 px-3.5 py-2">
              <Upload size={13} />
              Upload Ingest
            </button>
          </div>
        </div>

        {/* Saved Search Hints */}
        {savedSearches.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1.5 border-t border-white/5">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Recent:</span>
            {savedSearches.map((s, idx) => (
              <button
                key={idx}
                onClick={() => applySavedSearch(s)}
                className="px-2 py-0.5 rounded bg-slate-800/40 border border-slate-700/50 text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                {s.q.slice(0, 15)}... ({s.type})
              </button>
            ))}
            {search.trim() && (
              <button
                onClick={saveCurrentSearch}
                className="text-[10px] text-teal-400 hover:underline font-bold ml-2"
              >
                + Save Search
              </button>
            )}
          </div>
        )}

        {/* Detailed Filters Dropdown */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 animate-fadeIn">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Min Experience (yrs)</label>
              <input
                type="number"
                value={expMin}
                onChange={e => setExpMin(e.target.value)}
                className="input-dark py-1.5"
                placeholder="e.g. 3"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Domain</label>
              <input
                type="text"
                value={domainFilter}
                onChange={e => setDomainFilter(e.target.value)}
                className="input-dark py-1.5"
                placeholder="e.g. fintech"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Location</label>
              <input
                type="text"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="input-dark py-1.5"
                placeholder="e.g. Bangalore"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Skills (comma sep.)</label>
              <input
                type="text"
                value={skillsFilter}
                onChange={e => setSkillsFilter(e.target.value)}
                className="input-dark py-1.5"
                placeholder="e.g. React, Python"
              />
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex gap-2">
          {[
            { key: 'name', label: 'Name' },
            { key: 'exp',  label: 'Experience' },
            { key: 'role', label: 'Role' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => toggleSort(key)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-semibold border transition-all duration-150
                      ${sortBy === key ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' : 'border-slate-700/40 text-slate-500 hover:text-slate-300'}`}>
              {label}
              {sortBy === key && (sortDir === 'asc' ? <SortAsc size={10}/> : <SortDesc size={10}/>)}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate List */}
      {isLoading || searchingSemantic ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 shimmer h-16" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-white/5">
          <Users size={36} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500">
            {search ? 'No candidates match your queries and filters.' : 'No candidates inside pool. Ingest database files.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 animate-fadeIn">
          {sorted.map(c => (
            <div key={c.id} className="glass bg-slate-900/10 hover:bg-slate-900/30 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-200"
                     style={{ background: `hsl(${((c.name?.charCodeAt(0) ?? 65) * 37) % 360}, 55%, 38%)` }}>
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200 text-xs">{c.name || 'Unknown'}</span>
                    {c.email && (
                      <span className="text-[10px] text-teal-400 font-mono">{c.email}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-slate-500 text-[10px]">
                    {c.current_role && (
                      <span className="flex items-center gap-1"><Briefcase size={9}/>{c.current_role}</span>
                    )}
                    {c.company && <span>@ {c.company}</span>}
                    {c.experience_years != null && (
                      <span className="flex items-center gap-1"><Award size={9}/>{formatYears(c.experience_years)}</span>
                    )}
                    {c.location && (
                      <span className="flex items-center gap-1"><MapPin size={9}/>{c.location}</span>
                    )}
                  </div>
                </div>
                <div className="hidden md:flex flex-wrap content-start gap-1 w-64 flex-shrink-0">
                  {(c.skills || []).slice(0, 4).map(s => (
                    <span key={s} className="skill-tag text-[9px] px-2 py-0.5">{s}</span>
                  ))}
                  {(c.skills || []).length > 4 && (
                    <span className="text-[9px] text-slate-600">+{c.skills.length - 4}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass max-w-md w-full rounded-2xl border border-slate-700/60 p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => { setShowUpload(false); setUploadFile(null); setUploadStatus(null); }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Upload size={16} className="text-teal-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Upload Candidates</h3>
                <p className="text-xs text-slate-500">Add profiles via CSV list or PDF resume</p>
              </div>
            </div>

            <div className="border border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-teal-500/50 transition-colors relative cursor-pointer group">
              <input
                type="file"
                accept=".csv,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <Upload size={24} className="mx-auto text-slate-500 group-hover:text-teal-400 transition-colors mb-2" />
              <p className="text-xs font-medium text-slate-300">
                {uploadFile ? uploadFile.name : 'Click to select or drag & drop'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Supports CSV or PDF resumes</p>
            </div>

            {uploadStatus && (
              <div className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed
                ${uploadStatus.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {uploadStatus.type === 'success' ? (
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{uploadStatus.type === 'success' ? 'Upload Successful' : 'Upload Failed'}</p>
                  <p className="mt-0.5">{uploadStatus.message}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => { setShowUpload(false); setUploadFile(null); setUploadStatus(null); }}
                className="btn-secondary text-xs px-4 py-2"
                disabled={uploading}
              >
                Close
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={!uploadFile || uploading}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
