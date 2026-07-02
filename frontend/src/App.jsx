import React, { useEffect, useState, useCallback, useRef, Component } from 'react'

// ── Error Boundary ─────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('[Prism ErrorBoundary]', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e', color: '#e2e8f0', flexDirection: 'column', gap: '16px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Something went wrong rendering this page</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '400px' }}>{this.state.error?.message || 'Unknown error'}</p>
          <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }} style={{ padding: '10px 24px', background: '#14b8a6', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { ClipboardList, Scale, Trophy } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import JDInput from './components/JDInput'
import WeightSliders, { DEFAULT_WEIGHTS } from './components/WeightSliders'
import CandidateCard from './components/CandidateCard'
import LoadingPipeline from './components/LoadingPipeline'
import SkillHeatmap from './components/SkillHeatmap'
import ExportButton from './components/ExportButton'
import CompareModal from './components/CompareModal'
import OutreachDrawer from './components/OutreachDrawer'
import CandidatePool from './pages/CandidatePool'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import RunHistory from './pages/RunHistory'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CandidateHome from './pages/candidate/CandidateHome'
import Integrations from './pages/Integrations'
import AboutPage from './pages/AboutPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import { getHealth, getStats, getCandidates, rankCandidates, getRunResults } from './api/client'
import { normalizeWeights } from './utils/helpers'

function MainApp() {
  const { user, isAuthenticated } = useAuth()
  const [backendStatus, setBackendStatus] = useState(null)
  const [stats, setStats] = useState(null)
  const [activePage, setActivePage] = useState('landing')
  const resultsRef = useRef(null)
  const [loginRolePreset, setLoginRolePreset] = useState(null)
  const [jdText, setJdText] = useState('')
  const [parsedJd, setParsedJd] = useState(null)
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [runId, setRunId] = useState(null)
  const [excludeRejected, setExcludeRejected] = useState(true)
  const [requiredSkills, setRequiredSkills] = useState([])
  const [candidates, setCandidates] = useState([])
  const [error, setError] = useState('')

  // Drawer / Compare states
  const [compareList, setCompareList] = useState([])
  const [showCompare, setShowCompare] = useState(false)
  const [outreachCandidate, setOutreachCandidate] = useState(null)

  const loadInitial = useCallback(async () => {
    try {
      const health = await getHealth()
      setBackendStatus(health)
    } catch {
      setBackendStatus({ status: 'offline' })
    }

    try {
      const s = await getStats()
      setStats(s)
    } catch {}

    try {
      const data = await getCandidates()
      setCandidates(Array.isArray(data) ? data : data.candidates || [])
    } catch {}
  }, [])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  useEffect(() => {
    if (isAuthenticated) {
      if (activePage === 'login' || activePage === 'register') {
        if (user.role === 'candidate') {
          setActivePage('candidate')
        } else {
          setActivePage('dashboard')
        }
      }
    } else {
      if (activePage !== 'login' && activePage !== 'register' && activePage !== 'about') {
        setActivePage('landing')
      }
    }
  }, [isAuthenticated, user, activePage])

  const handleJdChange = (val) => {
    setJdText(val)
    if (runId) setRunId(null)
  }

  const handleJdAnalyzed = (analysis, text) => {
    setParsedJd(analysis)
    setJdText(text)
    if (analysis.required_skills) {
      setRequiredSkills(analysis.required_skills)
    }
  };

  const handleWeightsChange = (newWeights) => {
    setWeights(newWeights);

    if (results.length > 0) {
      const normalized = normalizeWeights(newWeights);
      const reRanked = results.map(c => {
        const breakdown = c.score_breakdown || {};
        const semantic = parseFloat(breakdown.semantic || 0);
        const skill = parseFloat(breakdown.skill || 0);
        const trajectory = parseFloat(breakdown.trajectory || 0);
        const behavioral = parseFloat(breakdown.behavioral || 0);
        const domain = parseFloat(breakdown.domain || 0);

        const newScore = (
          semantic * (normalized.semantic || 0) +
          skill * (normalized.skill || 0) +
          trajectory * (normalized.trajectory || 0) +
          behavioral * (normalized.behavioral || 0) +
          domain * (normalized.domain || 0)
        );

        return {
          ...c,
          composite_score: newScore * 100,
        };
      });

      reRanked.sort((a, b) => b.composite_score - a.composite_score);
      
      const finalResults = reRanked.map((c, idx) => ({
        ...c,
        rank: idx + 1
      }));

      setResults(finalResults);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    setResults([])
    setCompareList([])

    try {
      const data = await rankCandidates({
        jd_text: jdText,
        weights: normalizeWeights(weights),
        previous_run_id: excludeRejected ? runId : null,
      })

      const ranked = data.results || data.candidates || data.ranked_candidates || []
      setResults(ranked)
      setRunId(data.run_id || data.id || null)

      const skills =
        data.required_skills ||
        data.parsed_jd?.required_skills ||
        data.jd_analysis?.required_skills ||
        []

      setRequiredSkills(skills)

      // Scroll down to show the ranked results directly on the dashboard
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Ranking failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackGiven = useCallback(async () => {
    if (runId) {
      try {
        const data = await getRunResults(runId)
        const ranked = data.results || []
        if (ranked.length > 0) setResults(ranked)
      } catch {}
    }
  }, [runId])

  const toggleCompare = useCallback((candidate) => {
    setCompareList(prev => {
      const exists = prev.find(c => c.candidate_id === candidate.candidate_id)
      if (exists) return prev.filter(c => c.candidate_id !== candidate.candidate_id)
      if (prev.length >= 3) return prev
      return [...prev, candidate]
    })
  }, [])

  const openCompare = () => {
    if (compareList.length >= 2) setShowCompare(true)
  }

  const navigateTo = (page, rolePreset = null) => {
    setActivePage(page)
    if (rolePreset) setLoginRolePreset(rolePreset)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageChange = (page) => {
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (activePage === 'login') {
    return (
      <LoginPage
        onBack={() => setActivePage('landing')}
        onSuccess={() => {}}
        defaultRole={loginRolePreset}
      />
    )
  }
  if (activePage === 'register') {
    return (
      <RegisterPage
        onBack={() => setActivePage('login')}
        onSuccess={() => {}}
      />
    )
  }
  if (activePage === 'about') {
    return <AboutPage onNavigate={navigateTo} isAuthenticated={isAuthenticated} user={user} />
  }
  if (activePage === 'landing' || (!isAuthenticated && activePage !== 'login' && activePage !== 'register' && activePage !== 'about')) {
    return <LandingPage onNavigate={navigateTo} isAuthenticated={isAuthenticated} user={user} />
  }

  const showSidebar = isAuthenticated && user.role === 'recruiter';

  return (
    <div className="min-h-screen flex">
      {showSidebar && (
        <Sidebar activePage={activePage} onPageChange={handlePageChange} onNavigate={navigateTo} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          backendStatus={backendStatus}
          stats={stats}
          activePage={activePage}
          onPageChange={handlePageChange}
        />

        {compareList.length >= 1 && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40
                          glass border border-purple-500/30 rounded-2xl px-5 py-3
                          flex items-center gap-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2">
              {compareList.map((c, i) => (
                <div key={c.candidate_id}
                     className="flex items-center gap-1.5 bg-purple-500/15 border border-purple-500/25 rounded-lg px-2.5 py-1">
                  <span className="text-xs font-medium text-purple-300">{c.name || `Candidate ${i+1}`}</span>
                  <button
                    onClick={() => toggleCompare(c)}
                    className="text-purple-400 hover:text-red-400 transition-colors text-xs ml-1">✕</button>
                </div>
              ))}
              {compareList.length < 3 && (
                <span className="text-xs text-slate-500 italic">+{3 - compareList.length} more</span>
              )}
            </div>
            <button
              onClick={openCompare}
              disabled={compareList.length < 2}
              className="btn-primary px-4 py-2 text-xs disabled:opacity-40">
              Compare {compareList.length}
            </button>
            <button
              onClick={() => setCompareList([])}
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
              Clear
            </button>
          </div>
        )}

        {showCompare && (
          <CompareModal
            candidates={compareList}
            onClose={() => setShowCompare(false)}
          />
        )}

        {outreachCandidate && (
          <OutreachDrawer
            candidate={outreachCandidate}
            onClose={() => setOutreachCandidate(null)}
          />
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          {activePage === 'candidate' ? (
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateHome />
            </ProtectedRoute>
          ) : activePage === 'pool' ? (
            <ProtectedRoute allowedRoles={['recruiter']}>
              <CandidatePool
                candidates={candidates}
                onRefresh={loadInitial}
                isLoading={false}
              />
            </ProtectedRoute>
          ) : activePage === 'analytics' ? (
            <ProtectedRoute allowedRoles={['recruiter']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          ) : activePage === 'integrations' ? (
            <ProtectedRoute allowedRoles={['recruiter']}>
              <Integrations />
            </ProtectedRoute>
          ) : activePage === 'history' ? (
            <ProtectedRoute allowedRoles={['recruiter']}>
              <RunHistory />
            </ProtectedRoute>
          ) : (
            <ProtectedRoute allowedRoles={['recruiter']}>
              <div className="space-y-6">
                
                {!loading && results.length === 0 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {/* Welcome Banner */}
                      <div className="glass rounded-2xl p-6 relative overflow-hidden flex items-center">
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 opacity-10 blur-3xl"
                               style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />
                        </div>
                        <div className="relative flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center">
                            <img src="/logo.jpg" alt="Prism Logo" className="w-full h-full object-cover rounded-xl" />
                          </div>
                          <div>
                            <h2 className="text-lg font-black text-slate-100">
                              Rank Your <span className="gradient-text">Candidate Pool</span>
                            </h2>
                            <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                              Paste a job description. Prism will analyze requirements, run semantic matching,
                              and surface your top candidates with explainable scores.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quick-tip cards */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { icon: <ClipboardList size={20} />, step: '1', title: 'Paste JD', desc: 'Add a JD or upload a PDF.' },
                          { icon: <Scale size={20} />, step: '2', title: 'Tune Weights', desc: 'Adjust 5 scoring dimensions.' },
                          { icon: <Trophy size={20} />, step: '3', title: 'Get Rankings', desc: 'Ranked with AI explanations.' },
                        ].map(tip => (
                          <div key={tip.step} className="glass rounded-xl p-3.5 text-center flex flex-col items-center justify-center">
                            <div className="mb-1.5 text-teal-400">{tip.icon}</div>
                            <div className="text-[9px] font-bold text-teal-400 uppercase tracking-wider mb-0.5">Step {tip.step}</div>
                            <h4 className="text-xs font-bold text-slate-200 mb-0.5">{tip.title}</h4>
                            <p className="text-[10px] text-slate-500 leading-snug">{tip.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {stats && (
                      <div className="glass rounded-2xl p-4 flex flex-wrap gap-8 justify-center lg:justify-around">
                        <div className="text-center">
                          <div className="text-xl font-black font-mono gradient-text-teal">{stats.total_candidates?.toLocaleString() ?? '—'}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Candidates Indexed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-black font-mono text-purple-400">{stats.vectors_indexed?.toLocaleString() ?? '—'}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Vectors Ready</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-black font-mono text-amber-400">5D</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Scoring Dimensions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-black font-mono text-pink-400">&lt; 2s</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Avg. Rank Time</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="glass rounded-xl p-4 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: JD Input */}
                  <div className="space-y-6 flex flex-col h-full">
                    <div className="flex-1">
                      <JDInput
                        value={jdText}
                        onChange={handleJdChange}
                        onJdAnalyzed={handleJdAnalyzed}
                        parsedJd={parsedJd}
                        onClearParsedJd={() => setParsedJd(null)}
                        onSubmit={handleAnalyze}
                        isLoading={loading}
                        disabled={false}
                      />
                    </div>
                    {parsedJd && (
                      <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 hover:scale-102 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Ranking Pool…</>
                        ) : (
                          <>🎯 Rank Candidates Now</>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Right Column: Weights */}
                  <div className="space-y-6 flex flex-col h-full">
                    <WeightSliders weights={weights} onChange={handleWeightsChange} />
                    
                    {runId && (
                      <div className="glass rounded-xl p-4 flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="exclude-rejected"
                          checked={excludeRejected}
                          onChange={(e) => setExcludeRejected(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500/20"
                        />
                        <div>
                          <label htmlFor="exclude-rejected" className="text-xs font-semibold text-slate-200 cursor-pointer">
                            Exclude Rejected Candidates
                          </label>
                          <p className="text-[10px] text-slate-500">
                            Do not show candidates marked 'Not a Fit' in subsequent runs.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {loading && <LoadingPipeline />}

                {!loading && results.length > 0 && (
                  <div className="space-y-6" ref={resultsRef}>
                    <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-slate-100">
                            Ranked Shortlist
                          </h2>
                          <p className="text-sm text-slate-500">
                            {results.length} candidates ranked
                            {compareList.length > 0 && ` · ${compareList.length} selected for comparison`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {compareList.length >= 2 && (
                            <button
                              onClick={openCompare}
                              className="btn-secondary text-xs px-3 py-1.5">
                              Compare ({compareList.length})
                            </button>
                          )}
                          <ExportButton runId={runId} disabled={!results.length} />
                        </div>
                      </div>

                      <SkillHeatmap results={results} requiredSkills={requiredSkills} />

                      <div className="space-y-4">
                        {results.map((candidate, index) => (
                          <CandidateCard
                            key={candidate.candidate_id || candidate.id || index}
                            candidate={{ ...candidate, rank: index + 1 }}
                            rank={index + 1}
                            runId={runId}
                            parsedJd={parsedJd}
                            onFeedbackGiven={handleFeedbackGiven}
                            isComparing={compareList.some(c => c.candidate_id === candidate.candidate_id)}
                            onToggleCompare={() => toggleCompare({ ...candidate, rank: index + 1 })}
                            onOpenOutreach={setOutreachCandidate}
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </ProtectedRoute>
          )}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  )
}