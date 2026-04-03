'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileText, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { BRAND_COLOR } from '@/lib/prd/constants';

interface StepUploadProps {
  onSubmit: (file: File, title?: string) => void;
  onBack: () => void;
}

export function StepUpload({ onSubmit, onBack }: StepUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      return 'PDF, DOC, DOCX 파일만 업로드 가능합니다.';
    }
    if (f.size > 10 * 1024 * 1024) {
      return '파일 크기는 10MB 이하여야 합니다.';
    }
    return null;
  };

  const handleFileSelect = (f: File) => {
    const error = validateFile(f);
    if (error) {
      toast.error(error);
      return;
    }
    setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        입력 방법 다시 선택
      </button>

      <h2 className="text-xl font-bold text-foreground mb-6">문서 업로드</h2>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-sky-500 bg-sky-500/5'
            : file
              ? 'border-sky-500/50 bg-sky-500/5'
              : 'border-border hover:border-sky-400 hover:bg-sky-500/5'
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
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${BRAND_COLOR}15` }}>
              <FileText className="w-7 h-7" style={{ color: BRAND_COLOR }} />
            </div>
            <div>
              <p className="font-semibold text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="mt-2 text-sm text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              파일 제거
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
              <Upload className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">기획서 또는 아이디어 문서를 업로드하세요</p>
              <p className="text-sm text-muted-foreground mt-1">PDF, DOCX (최대 10MB)</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            프로젝트 이름 (선택)
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: AI 기반 헬스케어 플랫폼"
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <Button
        onClick={() => file && onSubmit(file, title || undefined)}
        disabled={!file}
        className="w-full mt-8 h-14 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all text-[16px] font-semibold disabled:opacity-50"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        PRD 생성 시작
      </Button>
    </div>
  );
}
