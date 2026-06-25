// ── Score helpers ──────────────────────────────────────────────────────────────

/**
 * Normalize a 0-1 score to 0-100 display value.
 * Handles both 0-1 and 0-100 ranges coming from backend.
 */
export const normalizeScore = (score) => {
  if (score == null) return 0;
  const n = parseFloat(score);
  if (isNaN(n)) return 0;
  return n > 1 ? Math.round(n * 10) / 10 : Math.round(n * 1000) / 10;
};

/** Get fit badge label based on composite score (0-100) */
export const getFitLabel = (score) => {
  const s = normalizeScore(score);
  if (s >= 75) return 'Excellent Fit';
  if (s >= 55) return 'Strong Fit';
  if (s >= 35) return 'Moderate Fit';
  return 'Weak Fit';
};

/** Get badge CSS class */
export const getFitClass = (score) => {
  const s = normalizeScore(score);
  if (s >= 75) return 'badge-excellent';
  if (s >= 55) return 'badge-strong';
  if (s >= 35) return 'badge-moderate';
  return 'badge-weak';
};

/** Score color for charts */
export const getScoreColor = (score) => {
  const s = normalizeScore(score);
  if (s >= 75) return '#10b981';
  if (s >= 55) return '#14b8a6';
  if (s >= 35) return '#f59e0b';
  return '#ef4444';
};

// ── Skill gap helpers ──────────────────────────────────────────────────────────
export const getSkillStatus = (item) => {
  if (!item) return 'missing';
  if (item.status) return item.status;
  if (item.match_level >= 0.8) return 'full';
  if (item.match_level >= 0.4) return 'partial';
  return 'missing';
};

// ── String helpers ─────────────────────────────────────────────────────────────
export const truncate = (str, len = 120) =>
  str && str.length > len ? str.slice(0, len) + '…' : str || '';

export const initials = (name) =>
  name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '??';

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
};

export const formatYears = (yrs) => {
  if (!yrs && yrs !== 0) return 'N/A';
  const n = parseFloat(yrs);
  return isNaN(n) ? 'N/A' : `${n % 1 === 0 ? n : n.toFixed(1)} yrs`;
};

// ── Copy to clipboard ──────────────────────────────────────────────────────────
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
};

// ── Weight normalization ────────────────────────────────────────────────────────
/** Normalize raw slider values (0-100) to sum-to-1 floats for backend */
export const normalizeWeights = (raw) => {
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  if (total === 0) return raw;
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, parseFloat((v / total).toFixed(4))])
  );
};
