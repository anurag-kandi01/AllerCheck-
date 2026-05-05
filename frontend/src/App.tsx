import { useState, useEffect } from 'react';
import { analyzeImage } from './utils/api';
import type { AnalysisResponse } from './utils/api';
import ImageUpload from './components/ImageUpload';
import CameraCapture from './components/CameraCapture';
import ResultDisplay from './components/ResultDisplay';
import HistoryPanel from './components/HistoryPanel';
import type { HistoryItem } from './components/HistoryPanel';
import { Camera, Upload as UploadIcon, Stethoscope, AlertTriangle, Moon, Sun } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'upload' | 'camera' | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { theme, toggleTheme } = useTheme();

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
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
      
      // Add to history
      if (previewUrl) {
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          thumbnailUrl: previewUrl, // We reuse the object URL for the session
          result: res,
          date: new Date()
        };
        setHistory(prev => [newItem, ...prev].slice(0, 5)); // Keep last 5
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during analysis.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setResult(item.result);
    setPreviewUrl(item.thumbnailUrl);
    setSelectedFile(null); // Clear selected file so we don't accidentally re-analyze
    setError(null);
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen transition-colors duration-200 font-sans selection:bg-teal-200 dark:selection:bg-teal-900">
      <header className="bg-white/90 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 p-2 rounded-lg shadow-sm shadow-teal-500/20">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">AllerCheck:Skin Disease & Allergy Classification</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI-powered dermatological screening assistant</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!previewUrl && !mode && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => setMode('upload')}
              className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border-2 border-transparent dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 rounded-xl shadow-sm transition-all group"
            >
              <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-full mb-4 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                <UploadIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Upload Image</span>
            </button>
            
            <button
              onClick={() => setMode('camera')}
              className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border-2 border-transparent dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 rounded-xl shadow-sm transition-all group"
            >
              <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-full mb-4 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                <Camera className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Use Camera</span>
            </button>
          </div>
        )}

        {mode === 'upload' && (
          <div className="mb-8 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Upload Skin Image</h2>
              <button onClick={() => setMode(null)} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cancel</button>
            </div>
            <ImageUpload onFileSelect={handleFileSelect} />
          </div>
        )}

        {mode === 'camera' && (
          <div className="mb-8 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
             <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Capture Skin Image</h2>
            <CameraCapture onCapture={handleFileSelect} onCancel={() => setMode(null)} />
          </div>
        )}

        {previewUrl && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6 flex flex-col items-center transition-colors duration-200">
            <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 mb-6 border border-slate-200 dark:border-slate-700">
              <img src={previewUrl} alt="Selected skin area" className="w-full h-full object-contain" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                onClick={resetSelection}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Start Over
              </button>
              {selectedFile && !result && !loading && (
                <button
                  onClick={handleAnalyze}
                  className="flex-1 py-3 px-4 bg-teal-600 dark:bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors shadow-sm shadow-teal-500/30"
                >
                  Analyze Image
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-start gap-3 mb-6 transition-colors duration-200">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <ResultDisplay result={result} loading={loading} />

        <HistoryPanel history={history} onSelect={handleHistorySelect} />
      </main>
    </div>
  );
}

export default App;
