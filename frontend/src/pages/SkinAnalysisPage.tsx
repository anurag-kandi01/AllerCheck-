import React, { useState, useEffect } from 'react';
import { analyzeImage } from '../utils/api';
import type { AnalysisResponse } from '../utils/api';
import ImageUpload from '../components/ImageUpload';
import CameraCapture from '../components/CameraCapture';
import type { HistoryItem } from '../components/HistoryPanel';
import {
  Camera,
  Upload as UploadIcon,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ScanLine,
  X,
  Info,
  Microscope,
  RotateCcw,
} from 'lucide-react';

interface SkinAnalysisPageProps {
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
}

const DISEASE_DETAILS: Record<string, { desc: string; symptoms: string[]; severity: 'low' | 'medium' | 'high'; action: string }> = {
  Acne: {
    desc: 'A common skin condition caused by clogged hair follicles from oil and dead skin cells.',
    symptoms: ['Whiteheads or blackheads', 'Red pimples or pustules', 'Cysts under skin', 'Oily skin'],
    severity: 'low',
    action: 'Usually manageable at home with gentle cleansing. See a dermatologist if severe.',
  },
  Eczema: {
    desc: 'An inflammatory condition causing itchy, red, cracked skin. Common in children but occurs at any age.',
    symptoms: ['Intense itching', 'Red or brownish patches', 'Small raised bumps', 'Thickened or cracked skin'],
    severity: 'medium',
    action: 'Moisturize regularly. Avoid triggers. Consult a doctor for prescription creams if needed.',
  },
  Psoriasis: {
    desc: 'A chronic autoimmune condition causing rapid skin cell buildup, resulting in scales and red patches.',
    symptoms: ['Red patches with silvery scales', 'Dry cracked skin', 'Itching or burning', 'Thickened nails'],
    severity: 'medium',
    action: 'Requires medical management. Seek dermatologist for treatment options.',
  },
  Ringworm: {
    desc: 'A contagious fungal infection causing circular, itchy patches. Despite the name, no worm is involved.',
    symptoms: ['Ring-shaped rash', 'Scaly or cracked skin', 'Itching at site', 'Hair loss in affected area'],
    severity: 'low',
    action: 'Antifungal medication usually effective. Avoid sharing personal items.',
  },
  Melanoma: {
    desc: 'The most serious type of skin cancer, developing in melanocytes. Early detection is critical.',
    symptoms: ['Asymmetric mole', 'Irregular border', 'Multiple colors in lesion', 'Diameter larger than 6mm'],
    severity: 'high',
    action: '⚠️ Seek immediate medical consultation. Do not delay if suspicious lesion detected.',
  },
  Vitiligo: {
    desc: 'A condition causing loss of skin pigmentation in patches due to melanocyte destruction.',
    symptoms: ['White patches on skin', 'Premature whitening of hair', 'Loss of color in mucous membranes', 'Patchy loss of skin color'],
    severity: 'low',
    action: 'Cosmetically manageable. Consult dermatologist for camouflage or repigmentation treatments.',
  },
  Warts: {
    desc: 'Small fleshy bumps caused by the human papillomavirus (HPV), appearing on skin or mucous membranes.',
    symptoms: ['Small flesh-colored bumps', 'Rough grainy texture', 'Clotted blood vessels visible', 'Pain when walking (plantar warts)'],
    severity: 'low',
    action: 'Usually harmless and may resolve on their own. OTC treatments available.',
  },
  Impetigo: {
    desc: 'A highly contagious bacterial skin infection causing red sores and honey-colored crusts.',
    symptoms: ['Red sores on face/hands', 'Fluid-filled blisters', 'Honey-colored crust after rupture', 'Itching and soreness'],
    severity: 'medium',
    action: 'Requires antibiotic treatment. Avoid contact with others until treated.',
  },
  Carcinoma: {
    desc: 'A type of cancer originating in epithelial tissue. Skin carcinomas include basal cell and squamous cell types.',
    symptoms: ['Pearly or waxy bump', 'Flat flesh-colored lesion', 'Bleeding or scabbing sore', 'Rough scaly patch'],
    severity: 'high',
    action: '⚠️ Immediate medical evaluation required. Early treatment is highly effective.',
  },
  Keratosis: {
    desc: 'A rough, scaly patch on the skin caused by years of sun exposure. Can develop into skin cancer.',
    symptoms: ['Rough scaly patch', 'Flat to slightly raised lesion', 'Pink, red, or brown color', 'Itching or burning'],
    severity: 'medium',
    action: 'Requires medical evaluation. Treatment can prevent progression to cancer.',
  },
  Milia: {
    desc: 'Small white cysts that appear when keratin becomes trapped beneath the skin surface.',
    symptoms: ['Tiny white or yellow bumps', 'Common on nose/cheeks/eyelids', 'No inflammation', 'Painless bumps'],
    severity: 'low',
    action: 'Usually harmless and self-resolving. Gentle exfoliation may help.',
  },
  Rosacea: {
    desc: 'A chronic skin condition causing redness and visible blood vessels in the face.',
    symptoms: ['Facial redness', 'Swollen red bumps', 'Eye problems (ocular rosacea)', 'Enlarged nose (rhinophyma)'],
    severity: 'medium',
    action: 'Manage triggers (sun, spicy food, alcohol). Consult dermatologist for long-term treatment.',
  },
};

const severityConfig = {
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Low Severity' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Moderate' },
  high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'High — Urgent' },
};

const DiseasePopup: React.FC<{ disease: string; onClose: () => void }> = ({ disease, onClose }) => {
  const details = DISEASE_DETAILS[disease];
  if (!details) return null;
  const sev = severityConfig[details.severity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div
        className="glass-strong rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 animate-in"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeInScale 0.25s ease-out' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sev.bg} ${sev.color} ${sev.border} border mb-2`}>
              <div className={`w-1.5 h-1.5 rounded-full ${details.severity === 'high' ? 'bg-red-400 animate-pulse' : details.severity === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {sev.label}
            </div>
            <h3 className="text-xl font-bold text-white">{disease}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-4 leading-relaxed">{details.desc}</p>

        <div className="mb-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Common Symptoms</h4>
          <ul className="space-y-1.5">
            {details.symptoms.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${sev.bg} ${sev.border} border rounded-xl p-3`}>
          <div className={`text-xs font-semibold ${sev.color} mb-1 flex items-center gap-1`}>
            <Info className="w-3 h-3" />
            Recommended Action
          </div>
          <p className="text-xs text-slate-300">{details.action}</p>
        </div>

        <p className="text-xs text-slate-600 mt-3 text-center">Not a medical diagnosis. Always consult a doctor.</p>
      </div>
    </div>
  );
};

const SkinAnalysisPage: React.FC<SkinAnalysisPageProps> = ({ setHistory }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'camera' | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [popupDisease, setPopupDisease] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setMode(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeImage(selectedFile);
      setResult(res);
      if (previewUrl) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          thumbnailUrl: previewUrl,
          result: res,
          date: new Date(),
        };
        setHistory(prev => [newItem, ...prev].slice(0, 10));
      }
      // Auto show disease info dialog when top disease has > 50% confidence
      const topDisease = Object.entries(res.class_probabilities).sort(([, a], [, b]) => b - a)[0];
      if (topDisease && topDisease[1] > 0.5 && DISEASE_DETAILS[topDisease[0]]) {
        setPopupDisease(topDisease[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const sortedProbs = result
    ? Object.entries(result.class_probabilities).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-1">AI Diagnostic Tool</div>
        <h1 className="text-3xl font-bold text-white mb-2">Skin Analysis</h1>
        <p className="text-slate-400 text-sm">Upload or capture a photo for AI-powered skin condition classification.</p>
      </div>

      {/* Mode Selection */}
      {!previewUrl && !mode && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setMode('upload')}
            className="flex-1 flex flex-col items-center justify-center p-8 glass rounded-2xl border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group card-hover"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
              <UploadIcon className="w-8 h-8 text-cyan-400" />
            </div>
            <span className="font-semibold text-white">Upload Image</span>
            <span className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP</span>
          </button>
          <button
            onClick={() => setMode('camera')}
            className="flex-1 flex flex-col items-center justify-center p-8 glass rounded-2xl border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group card-hover"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
              <Camera className="w-8 h-8 text-purple-400" />
            </div>
            <span className="font-semibold text-white">Use Camera</span>
            <span className="text-xs text-slate-500 mt-1">Live capture</span>
          </button>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div className="mb-6 glass rounded-2xl p-6 border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Upload Skin Image</h2>
            <button onClick={() => setMode(null)} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
          </div>
          <ImageUpload onFileSelect={handleFileSelect} />
        </div>
      )}

      {/* Camera Mode */}
      {mode === 'camera' && (
        <div className="mb-6 glass rounded-2xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-4">Capture Skin Image</h2>
          <CameraCapture onCapture={handleFileSelect} onCancel={() => setMode(null)} />
        </div>
      )}

      {/* Preview + Analyze */}
      {previewUrl && (
        <div className="glass rounded-2xl p-6 border border-white/5 mb-6 flex flex-col items-center">
          <div className="relative w-full max-w-sm aspect-square rounded-xl overflow-hidden bg-black/20 mb-6 border border-white/10">
            <img src={previewUrl} alt="Skin area" className="w-full h-full object-contain" />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="w-12 h-12 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-3" />
                <p className="text-cyan-400 text-sm font-medium animate-pulse">Analyzing...</p>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={resetSelection}
              className="flex items-center gap-2 px-5 py-2.5 glass border border-white/10 rounded-xl text-slate-300 hover:text-white hover:border-white/20 transition-all text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            {selectedFile && !result && !loading && (
              <button
                onClick={handleAnalyze}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20 text-sm"
              >
                <Microscope className="w-4 h-4" />
                Analyze Image
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Result Header */}
          <div className={`glass rounded-2xl p-5 border ${result.is_recognized ? 'border-cyan-500/20' : 'border-amber-500/20'}`}>
            <div className="flex items-start gap-4">
              {result.is_recognized ? (
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-medium">
                  {result.is_recognized ? 'Detected Condition' : 'Unrecognized'}
                </div>
                <h2 className="text-xl font-bold text-white truncate">{result.predicted_label_name}</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Confidence: <span className="text-cyan-400 font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                </p>
              </div>
              {result.is_recognized && DISEASE_DETAILS[result.predicted_label_name] && (
                <button
                  onClick={() => setPopupDisease(result.predicted_label_name)}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                >
                  <Info className="w-3.5 h-3.5" />
                  Disease Info
                </button>
              )}
            </div>

            {!result.is_recognized && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <p className="text-amber-300 text-xs">
                  The model could not confidently match this image. It may not match our supported conditions or image quality may be insufficient. Please upload a clear close-up of the skin area or consult a doctor.
                </p>
              </div>
            )}
          </div>

          {/* Probability Breakdown */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-cyan-400" />
                Probability Breakdown
              </h3>
              <span className="text-xs text-slate-500">Click a condition for details</span>
            </div>
            <div className="space-y-3">
              {sortedProbs.map(([label, prob], idx) => {
                const pct = prob * 100;
                const isTop = idx === 0;
                const hasInfo = DISEASE_DETAILS[label];
                return (
                  <div
                    key={label}
                    className={`flex items-center gap-3 text-sm group ${hasInfo ? 'cursor-pointer' : ''}`}
                    onClick={() => hasInfo && setPopupDisease(label)}
                  >
                    <span className={`w-24 truncate text-xs font-medium flex-shrink-0 ${isTop ? 'text-cyan-400' : 'text-slate-400'} group-hover:text-white transition-colors`}>
                      {label}
                    </span>
                    <div className="flex-1 bg-white/5 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out progress-bar-animated ${isTop ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-white/20'}`}
                        style={{ width: `${Math.max(pct, 0.5)}%` }}
                      />
                    </div>
                    <span className={`w-12 text-right text-xs flex-shrink-0 ${isTop ? 'text-cyan-400 font-semibold' : 'text-slate-500'}`}>
                      {pct.toFixed(1)}%
                    </span>
                    {hasInfo && (
                      <Info className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Explanation */}
          {result.explanation && (
            <div className="glass rounded-2xl p-5 border border-purple-500/10">
              <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <ScanLine className="w-4 h-4" />
                AI Analysis
              </h3>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{result.explanation}</div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="glass rounded-xl p-4 border border-white/5 text-xs text-slate-500">
            <strong className="text-slate-400">Disclaimer: </strong>{result.disclaimer}
          </div>
        </div>
      )}

      {/* Disease Popup */}
      {popupDisease && (
        <DiseasePopup disease={popupDisease} onClose={() => setPopupDisease(null)} />
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SkinAnalysisPage;
