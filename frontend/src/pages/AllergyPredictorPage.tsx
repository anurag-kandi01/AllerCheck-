import React, { useState } from 'react';
import {
  ChevronRight, AlertTriangle, CheckCircle, Activity, Shield,
  RefreshCw, Loader2, Zap, Wind, Leaf, Pill, Bug, Utensils, Sparkles,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AllergyResult {
  allergy_type: string;
  confidence: number;
  secondary_type?: string | null;
  secondary_confidence?: number;
  reasoning: string;
  key_indicators: string[];
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
  disclaimer: string;
}

const urgencyConfig = {
  low:    { color: '#34d399', bg: 'rgba(52,211,153,0.08)',   border: 'rgba(52,211,153,0.25)',   label: 'Low Urgency',      dot: '#34d399', glow: 'rgba(52,211,153,0.15)' },
  medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)',   label: 'Moderate',         dot: '#fbbf24', glow: 'rgba(251,191,36,0.15)' },
  high:   { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.3)',   label: 'High — See Doctor', dot: '#f87171', glow: 'rgba(248,113,113,0.15)' },
};

const allergyMeta: Record<string, { icon: React.ReactNode; color: string }> = {
  'Food Allergy':               { icon: <Utensils className="w-5 h-5" />, color: '#f97316' },
  'Skin/Contact Allergy':       { icon: <Zap className="w-5 h-5" />,     color: '#a78bfa' },
  'Dust/Environmental Allergy': { icon: <Wind className="w-5 h-5" />,    color: '#60a5fa' },
  'Pollen/Seasonal Allergy':    { icon: <Leaf className="w-5 h-5" />,    color: '#34d399' },
  'Drug/Medication Allergy':    { icon: <Pill className="w-5 h-5" />,    color: '#fb7185' },
  'Insect Sting Allergy':       { icon: <Bug className="w-5 h-5" />,     color: '#fbbf24' },
  'Multiple/Mixed Allergies':   { icon: <Sparkles className="w-5 h-5" />,color: '#e879f9' },
};

const QUICK_SYMPTOMS = [
  'Sneezing', 'Itchy eyes', 'Skin rash', 'Hives', 'Runny nose',
  'Swelling', 'Stomach cramps', 'Difficulty breathing', 'Watery eyes', 'Coughing',
];

const QUICK_CONTEXTS = ['Spring season', 'Pet exposure', 'Outdoor walk', 'Dusty home', 'After meal'];
const QUICK_TRIGGERS = ['Peanuts', 'Shellfish', 'Antibiotics', 'Ibuprofen', 'Bee sting', 'Latex'];

const ChipSelector: React.FC<{
  options: string[];
  selected: string;
  onToggle: (val: string) => void;
  color?: string;
}> = ({ options, selected, onToggle, color = '#a78bfa' }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((opt) => {
      const active = selected.toLowerCase().includes(opt.toLowerCase());
      return (
        <button
          key={opt}
          onClick={() => onToggle(opt)}
          className="text-[11px] px-2.5 py-1 rounded-full font-medium transition-all duration-200"
          style={{
            background: active ? `${color}22` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${active ? color + '55' : 'rgba(255,255,255,0.08)'}`,
            color: active ? color : 'rgba(255,255,255,0.4)',
            transform: active ? 'scale(1.04)' : 'scale(1)',
          }}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

const InputField: React.FC<{
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  rows?: number;
}> = ({ label, required, value, onChange, placeholder, multiline, rows = 3 }) => {
  const [focused, setFocused] = useState(false);
  const base: React.CSSProperties = {
    background: focused ? 'rgba(167,139,250,0.04)' : 'rgba(255,255,255,0.02)',
    border: `1px solid ${focused ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: '12px',
    padding: '10px 14px',
    color: '#fff',
    width: '100%',
    fontSize: '13px',
    resize: 'none' as const,
    outline: 'none',
    transition: 'all 0.2s',
    boxShadow: focused ? '0 0 0 3px rgba(167,139,250,0.08)' : 'none',
  };
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
        {label}{required && <span style={{ color: '#a78bfa', marginLeft: 4 }}>*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ ...base, fontFamily: 'inherit' }}
          className="placeholder-slate-700 scrollbar-thin"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...base, fontFamily: 'inherit' }}
          className="placeholder-slate-700"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      )}
    </div>
  );
};

const AllergyPredictorPage: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [exposureContext, setExposureContext] = useState('');
  const [triggers, setTriggers] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AllergyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = symptoms.trim().length > 3 && !loading;

  const toggleChip = (field: 'symptoms' | 'context' | 'triggers', val: string) => {
    const setter = field === 'symptoms' ? setSymptoms : field === 'context' ? setExposureContext : setTriggers;
    const current = field === 'symptoms' ? symptoms : field === 'context' ? exposureContext : triggers;
    if (current.toLowerCase().includes(val.toLowerCase())) {
      setter(current.replace(new RegExp(`,?\\s*${val}`, 'i'), '').replace(/^,\s*/, '').trim());
    } else {
      setter(current ? `${current.trim()}, ${val}` : val);
    }
  };

  const handlePredict = async () => {
    if (!canSubmit) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/predict-allergy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptoms.trim(), exposure_context: exposureContext.trim(), triggers: triggers.trim() }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Server error: ${res.status}`); }
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get prediction.');
    } finally { setLoading(false); }
  };

  const handleReset = () => { setSymptoms(''); setExposureContext(''); setTriggers(''); setResult(null); setError(null); };

  const urg = result ? urgencyConfig[result.urgency] ?? urgencyConfig.medium : null;
  const meta = result ? allergyMeta[result.allergy_type] : null;

  return (
    <div style={{ padding: '28px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 6 }}>
          Diagnostic Module
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Space Grotesk', sans-serif" }}>
          Allergy Predictor
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
          Describe your symptoms for AI-powered allergy categorization.
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: 0 }}>

        {/* LEFT — Input Panel */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.6)' }}>
            Symptom Check-List
          </div>

          {/* Symptoms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <InputField
              label="Observable Symptoms" required
              value={symptoms} onChange={setSymptoms}
              placeholder="e.g., Sneezing, itchy eyes, skin rash, hives..."
              multiline rows={3}
            />
            <ChipSelector options={QUICK_SYMPTOMS} selected={symptoms} onToggle={(v) => toggleChip('symptoms', v)} />
          </div>

          {/* Exposure Context */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <InputField
              label="Exposure Context"
              value={exposureContext} onChange={setExposureContext}
              placeholder="e.g., Spring season, dust at home, after outdoor walk..."
            />
            <ChipSelector options={QUICK_CONTEXTS} selected={exposureContext} onToggle={(v) => toggleChip('context', v)} color="#60a5fa" />
          </div>

          {/* Triggers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <InputField
              label="Triggers (Food / Drug)"
              value={triggers} onChange={setTriggers}
              placeholder="e.g., Peanuts, antibiotics, shellfish..."
            />
            <ChipSelector options={QUICK_TRIGGERS} selected={triggers} onToggle={(v) => toggleChip('triggers', v)} color="#fb7185" />
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '10px 14px' }}>
              <AlertTriangle style={{ width: 14, height: 14, color: '#f87171', flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12, color: '#fca5a5' }}>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
            {result && (
              <button onClick={handleReset} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                <RefreshCw style={{ width: 13, height: 13 }} /> Reset
              </button>
            )}
            <button
              onClick={handlePredict}
              disabled={!canSubmit}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                background: canSubmit ? 'linear-gradient(135deg, rgba(139,92,246,0.95), rgba(109,40,217,0.85))' : 'rgba(255,255,255,0.04)',
                border: canSubmit ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.06)',
                color: canSubmit ? '#fff' : 'rgba(255,255,255,0.2)',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit ? '0 4px 24px rgba(139,92,246,0.25)' : 'none',
                transition: 'all 0.2s', letterSpacing: '0.03em',
              }}
            >
              {loading ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <>Generate Prediction <ChevronRight style={{ width: 14, height: 14 }} /></>}
            </button>
          </div>
        </div>

        {/* RIGHT — Results Panel */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>

          {/* Standby */}
          {!result && !loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', gap: 16 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles style={{ width: 28, height: 28, color: 'rgba(167,139,250,0.4)' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 6 }}>
                  Predictor Standby
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', lineHeight: 1.7, maxWidth: 200 }}>
                  Input patient details and symptoms to observe predictive distribution
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {['Food', 'Pollen', 'Dust', 'Drug'].map((t) => (
                  <div key={t} style={{
                    fontSize: 10, padding: '3px 10px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.2)',
                  }}>{t}</div>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                border: '2px solid rgba(167,139,250,0.12)',
                borderTopColor: 'rgba(167,139,250,0.8)',
                animation: 'spin 1s linear infinite',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(167,139,250,0.06)', borderBottomColor: 'rgba(167,139,250,0.5)', animation: 'spin 0.6s linear infinite reverse' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: 0 }}>AI Analysis in Progress</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Gemini is evaluating your symptoms…</p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && urg && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }} className="scrollbar-thin">

              {/* Primary Result Card */}
              <div style={{
                background: urg.bg, border: `1px solid ${urg.border}`,
                borderRadius: 16, padding: '18px',
                boxShadow: `0 0 32px ${urg.glow}`,
                animation: 'fadeInScale 0.35s ease-out',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${urg.color}18`, border: `1px solid ${urg.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: meta?.color || urg.color,
                  }}>
                    {meta?.icon || <Zap style={{ width: 20, height: 20 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '3px 10px', borderRadius: 999,
                        background: `${urg.color}18`, border: `1px solid ${urg.color}35`, color: urg.color,
                      }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: urg.dot, animation: 'pulse 2s infinite' }} />
                        {urg.label}
                      </div>
                    </div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 8px', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {result.allergy_type}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 999,
                          width: `${result.confidence}%`,
                          background: `linear-gradient(90deg, ${urg.color}, ${urg.dot})`,
                          transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: urg.color, flexShrink: 0 }}>{result.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary */}
              {result.secondary_type && result.secondary_confidence && result.secondary_confidence > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>
                    Secondary Possibility
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{allergyMeta[result.secondary_type]?.icon || '❓'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>{result.secondary_type}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}>
                          <div style={{ height: '100%', borderRadius: 999, background: 'rgba(255,255,255,0.2)', width: `${result.secondary_confidence}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{result.secondary_confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reasoning */}
              <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Activity style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.25)' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>AI Reasoning</span>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, margin: 0 }}>{result.reasoning}</p>
              </div>

              {/* Key Indicators */}
              {result.key_indicators?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
                    Key Indicators Detected
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.key_indicators.map((ind, i) => (
                      <span key={i} style={{
                        fontSize: 11, padding: '4px 11px', borderRadius: 999, fontWeight: 500,
                        background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: '#c4b5fd',
                      }}>{ind}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.12)', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Shield style={{ width: 11, height: 11, color: 'rgba(52,211,153,0.6)' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(52,211,153,0.6)' }}>Recommendations</span>
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {result.recommendations.map((rec, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                        <CheckCircle style={{ width: 12, height: 12, color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 14px', fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
                ⚕️ {result.disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default AllergyPredictorPage;
