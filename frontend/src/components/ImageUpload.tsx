import React, { useRef, useState } from 'react';
import { Upload, Image } from 'lucide-react';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        id="image-upload-input"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-cyan-400 bg-cyan-500/10'
            : 'border-white/15 bg-white/3 hover:border-cyan-500/40 hover:bg-cyan-500/5'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragging ? 'bg-cyan-500/20' : 'bg-white/5'}`}>
            {dragging ? (
              <Image className="w-6 h-6 text-cyan-400" />
            ) : (
              <Upload className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-300 font-medium">
              {dragging ? 'Drop your image here' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP, GIF supported</p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ImageUpload;
