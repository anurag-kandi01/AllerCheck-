import { useRef, useState, useEffect } from 'react';
import type { FC } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

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
        if (err instanceof Error) {
          setError('Could not access camera: ' + err.message);
        } else {
          setError('Could not access camera');
        }
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
      if (err instanceof Error) {
        setError('Could not access camera: ' + err.message);
      } else {
        setError('Could not access camera');
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-inner w-full transition-colors duration-200">
      {error ? (
        <div className="text-center text-red-600 dark:text-red-400 p-4">
          <p>{error}</p>
          <button onClick={retry} className="mt-4 flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors mx-auto">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      ) : (
        <div className="relative w-full max-w-sm rounded-lg overflow-hidden bg-black aspect-video shadow-md border border-slate-300 dark:border-slate-700">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex gap-4 mt-2">
        <button
          onClick={capture}
          disabled={!!error || !stream}
          className="flex items-center gap-2 bg-teal-600 dark:bg-teal-500 text-white px-6 py-2 rounded-full font-medium hover:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Camera size={20} /> Capture
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-full font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm border border-slate-200 dark:border-slate-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
