
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile && !disabled) {
      onFileUpload(selectedFile);
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        className={`w-full p-8 border-2 border-dashed rounded-xl transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*"
          className="hidden"
          disabled={disabled}
        />
        <div className="flex flex-col items-center text-center cursor-pointer">
          <UploadIcon className="w-12 h-12 text-slate-400 mb-4" />
          <p className="text-slate-700 font-semibold">
            ลากและวางไฟล์เสียงที่นี่ หรือ <span className="text-blue-600">คลิกเพื่อเลือกไฟล์</span>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            รองรับไฟล์ MP3, WAV, M4A และอื่นๆ
          </p>
        </div>
      </div>
      
      {selectedFile && (
        <div className="mt-6 w-full text-center">
            <p className="text-slate-700">ไฟล์ที่เลือก: <span className="font-semibold text-slate-900">{selectedFile.name}</span></p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedFile || disabled}
        className="mt-6 w-full md:w-auto px-12 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md
                   hover:bg-blue-700 transition-all duration-300
                   disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
      >
        ประมวลผลไฟล์เสียง
      </button>
    </div>
  );
};
