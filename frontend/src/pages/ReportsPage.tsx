import React, { useState } from 'react';
import type { HistoryItem } from '../components/HistoryPanel';
import { ClipboardList, ScanLine, Leaf, Download, Eye, Trash2, PlusCircle } from 'lucide-react';
import type { PageKey } from '../components/Sidebar';

interface ReportsPageProps {
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  onNavigate: (page: PageKey) => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ history, setHistory, onNavigate }) => {
  const [tab, setTab] = useState<'skin' | 'allergy'>('skin');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const clearHistory = () => {
    if (confirm('Clear all scan history?')) setHistory([]);
  };

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-emerald-400 font-semibold tracking-widest uppercase mb-1">Electronic Dossier System</div>
        <h1 className="text-3xl font-bold text-white mb-2">Reports & History Logs</h1>
        <p className="text-slate-400 text-sm">Review, print, or download biometric records organized by screening type.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setTab('skin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            tab === 'skin'
              ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
              : 'glass border-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ScanLine className="w-4 h-4" />
          Skin Classification ({history.length})
        </button>
        <button
          onClick={() => setTab('allergy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            tab === 'allergy'
              ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
              : 'glass border-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Leaf className="w-4 h-4" />
          Allergy Advisor (0)
        </button>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="ml-auto flex items-center gap-2 text-xs text-red-400 hover:text-red-300 glass border border-red-500/20 hover:border-red-500/40 px-3 py-2 rounded-xl transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Content */}
      {tab === 'skin' && (
        <>
          {history.length === 0 ? (
            <div className="glass rounded-2xl p-16 border border-white/5 text-center">
              <ClipboardList className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-400 mb-2 uppercase tracking-wider">No Dossier Logs Indexed</h3>
              <p className="text-slate-500 text-sm mb-6">Generate an early-stage skin analysis to index report files.</p>
              <button
                onClick={() => onNavigate('skin-analysis')}
                className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                Create Assessment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div
                  key={item.id}
                  className="glass rounded-2xl p-4 border border-white/5 hover:border-cyan-500/20 transition-all card-hover"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/30 flex-shrink-0 border border-white/5">
                      <img src={item.thumbnailUrl} alt="Scan" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5 font-medium">
                        Report #{history.length - idx} · {item.date.toLocaleDateString()}
                      </div>
                      <h3 className="font-semibold text-white truncate">{item.result.predicted_label_name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-cyan-400 font-medium">
                          {(item.result.confidence * 100).toFixed(1)}% Confidence
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          item.result.is_recognized
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {item.result.is_recognized ? 'Recognized' : 'Uncertain'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                        className="text-xs flex items-center gap-1.5 glass border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {selectedItem?.id === item.id ? 'Hide' : 'View'}
                      </button>
                      <button className="text-xs flex items-center gap-1.5 glass border border-white/10 hover:border-white/20 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-all">
                        <Download className="w-3.5 h-3.5" />
                        Export
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedItem?.id === item.id && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider">Probability Breakdown</div>
                      <div className="space-y-2">
                        {Object.entries(item.result.class_probabilities)
                          .sort(([, a], [, b]) => b - a)
                          .map(([label, prob]) => (
                            <div key={label} className="flex items-center gap-3 text-xs">
                              <span className="w-20 text-slate-400 truncate">{label}</span>
                              <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                                  style={{ width: `${prob * 100}%` }}
                                />
                              </div>
                              <span className="w-10 text-right text-slate-500">{(prob * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                      </div>
                      {item.result.explanation && (
                        <div className="mt-3 bg-white/3 rounded-xl p-3 text-xs text-slate-400 leading-relaxed">
                          {item.result.explanation.substring(0, 200)}...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'allergy' && (
        <div className="glass rounded-2xl p-16 border border-white/5 text-center">
          <Leaf className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2 uppercase tracking-wider">No Allergy Reports Yet</h3>
          <p className="text-slate-500 text-sm mb-6">Use the Allergy Predictor to generate allergy reports.</p>
          <button
            onClick={() => onNavigate('allergy-predictor')}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl text-sm transition-all"
          >
            <Leaf className="w-4 h-4" />
            Start Allergy Check
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
