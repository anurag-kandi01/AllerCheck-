import React from 'react';
import type { AnalysisResponse } from "../utils/api";  // or "../types"
export interface HistoryItem {
  id: string;
  thumbnailUrl: string;
  result: AnalysisResponse;
  date: Date;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Recent Analyses</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex flex-col items-center bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 hover:-translate-y-1 hover:shadow-md transition-all text-left w-full group"
          >
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-200 dark:border-slate-700 transition-colors">
              <img src={item.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="w-full">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={item.result.predicted_label_name}>
                {item.result.predicted_label_name}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                  {(item.result.confidence * 100).toFixed(0)}% Match
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
