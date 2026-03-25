'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface StepInputProps {
  error: string | null;
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onAnalyze: () => void;
}

function validateFile(f: File): string | null {
  const ext = f.name.split('.').pop()?.toLowerCase();
  if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
    return 'PDF, DOC, DOCX 파일만 업로드 가능합니다.';
  }
  if (f.size > 10 * 1024 * 1024) {
    return '파일 크기는 10MB 이하여야 합니다.';
  }
  return null;
}

export function StepInput({
  error,
  file,
  onFileSelect,
  onFileRemove,
  onAnalyze,
}: StepInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (f: File) => {
    const validationError = validateFile(f);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    onFileSelect(f);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onFileSelect],
  );

  return (
    <>
      {/* Minimal page title */}
      <section className="max-w-[720px] mx-auto px-4 sm:px-8 pt-12 pb-6">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[13px] font-semibold mb-3">
          포텐 체커
        </span>
        <h1 className="text-2xl font-bold text-foreground">사업계획서 분석</h1>
      </section>

      {/* Upload Section */}
      <section className="max-w-[720px] mx-auto px-4 sm:px-8 pb-24">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* File Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-[#8B5CF6] bg-[#8B5CF6]/5'
              : file
                ? 'border-[#8B5CF6]/50 bg-[#8B5CF6]/5'
                : 'border-border hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
          />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{file.name}</p>
                <p className="text-sm text-muted mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove();
                }}
                className="mt-2 text-sm text-muted hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                파일 제거
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-card-secondary flex items-center justify-center">
                <Upload className="w-7 h-7 text-muted" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  사업계획서를 업로드하세요
                </p>
                <p className="text-sm text-muted mt-1">
                  PDF, DOC, DOCX (최대 10MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <Button
          onClick={onAnalyze}
          disabled={!file}
          className="w-full mt-8 h-14 rounded-2xl bg-[#8B5CF6] hover:bg-[#7c3aed] text-white shadow-lg hover:shadow-xl transition-all text-[16px] font-semibold disabled:opacity-50"
        >
          분석 시작
        </Button>
      </section>
    </>
  );
}
