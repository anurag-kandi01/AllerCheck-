import React from 'react';
import type { AnalysisResponse } from "../utils/api";  // or "../types"from '../utils/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResultDisplayProps {
  result: AnalysisResponse | null;
  loading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 mt-6 transition-colors duration-200">
        <div className="w-12 h-12 border-4 border-teal-200 dark:border-teal-900 border-t-teal-600 dark:border-t-teal-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400 animate-pulse">Analyzing image...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="flex flex-col gap-6 mt-6 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-start gap-4">
        {result.is_recognized ? (
          <CheckCircle2 className="w-8 h-8 text-teal-500 flex-shrink-0 mt-1" />
        ) : (
          <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
        )}
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {result.predicted_label_name}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
            Confidence: {(result.confidence * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {!result.is_recognized && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-md">
          <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
            The system cannot confidently match this image to Acne, Carcinoma, Eczema, Keratosis, Milia, or Rosacea. Please upload a clear image of the relevant skin area or consult a doctor.
          </p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Probability Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(result.class_probabilities)
            .sort(([, a], [, b]) => b - a)
            .map(([label, prob]) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className="w-24 truncate text-slate-600 dark:text-slate-400 font-medium">{label}</span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="bg-teal-500 dark:bg-teal-400 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(prob * 100, 1)}%` }}
                ></div>
              </div>
              <span className="w-12 text-right text-slate-500 dark:text-slate-400 font-medium">{(prob * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {result.explanation && (
        <div className="bg-teal-50 dark:bg-slate-800/80 p-5 rounded-lg border border-teal-100 dark:border-slate-700">
          <h3 className="text-md font-semibold text-teal-900 dark:text-teal-400 mb-2">AI Analysis</h3>
          <div className="text-sm text-teal-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {result.explanation}
          </div>
        </div>
      )}

      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-lg text-xs text-slate-500 dark:text-slate-400">
        <strong className="text-slate-700 dark:text-slate-300">Disclaimer: </strong>
        {result.disclaimer}
      </div>
    </div>
  );
};

export default ResultDisplay;
