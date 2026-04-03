'use client';

import { useCallback, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  compact?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUpload({ images, onChange, maxImages = 3, compact = false }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxImages - images.length;
      if (remaining <= 0) return;

      const validFiles = fileArray
        .filter((f) => f.type.startsWith('image/'))
        .filter((f) => f.size <= MAX_FILE_SIZE)
        .slice(0, remaining);

      if (validFiles.length === 0) return;

      Promise.all(
        validFiles.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            }),
        ),
      ).then((dataUris) => {
        onChange([...images, ...dataUris]);
      });
    },
    [images, maxImages, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {images.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative w-12 h-12 rounded-md overflow-hidden border border-border group">
                <img src={img} alt={`첨부 이미지 ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length < maxImages && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              flex items-center gap-2 p-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors
              ${dragOver ? 'border-sky-400 bg-sky-50 dark:bg-sky-500/10' : 'border-border hover:border-sky-300 hover:bg-muted/30'}
            `}
          >
            <ImagePlus className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">
                이미지 첨부 ({images.length}/{maxImages})
              </p>
              <p className="text-[9px] text-muted-foreground/60">
                클릭 또는 드래그 | 최대 5MB
              </p>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Thumbnail Grid */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group shadow-sm">
              <img src={img} alt={`첨부 이미지 ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop Zone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors
            ${dragOver ? 'border-sky-400 bg-sky-50 dark:bg-sky-500/10' : 'border-border hover:border-sky-300 hover:bg-muted/30'}
          `}
        >
          <ImagePlus className="w-5 h-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">
              와이어프레임, 목업, 스크린샷 첨부 (선택)
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
              최대 {maxImages}장, 각 5MB 이하 | 클릭 또는 드래그
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
