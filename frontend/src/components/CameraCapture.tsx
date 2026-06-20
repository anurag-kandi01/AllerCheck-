import { useRef, useState, useEffect } from 'react';
import type { FC } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

const CameraCapture: FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? 'Could not access camera: ' + err.message : 'Could not access camera');
      }
    };

    initCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capture = () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const retry = async () => {
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? 'Could not access camera: ' + err.message : 'Could not access camera');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {error ? (
        <div className="text-center p-6 glass rounded-xl border border-red-500/20 w-full">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={retry}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-slate-300 text-sm transition-all mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Camera
          </button>
        </div>
      ) : (
        <div className="relative w-full max-w-sm rounded-xl overflow-hidden bg-black aspect-video border border-white/10 shadow-xl">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-xl pointer-events-none" />
          {/* Corner markers */}
          <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-cyan-400/60 rounded-tl" />
          <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-cyan-400/60 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-cyan-400/60 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-cyan-400/60 rounded-br" />
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={capture}
          disabled={!!error || !stream}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 text-sm"
        >
          <Camera className="w-4 h-4" />
          Capture
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 glass border border-white/10 hover:border-white/20 rounded-xl text-slate-400 hover:text-white text-sm transition-all"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
