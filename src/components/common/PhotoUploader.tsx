import React, { useState, useRef } from 'react';
import { processAndOptimizeImage, formatFileSize } from '../../utils/imageUpload';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Check,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface PresetPhoto {
  label: string;
  url: string;
}

interface PhotoUploaderProps {
  currentUrl: string;
  onPhotoChange: (newUrl: string) => void;
  label?: string;
  description?: string;
  aspectRatio?: 'portrait' | 'square' | 'auto';
  showPresets?: boolean;
  presets?: PresetPhoto[];
  compact?: boolean;
  accentColor?: string;
  className?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  currentUrl,
  onPhotoChange,
  label,
  description,
  aspectRatio = 'portrait',
  showPresets = false,
  presets = [],
  compact = false,
  accentColor = '#C9A96A',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPEG, PNG, WebP, GIF)');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setSuccessInfo(null);

      const result = await processAndOptimizeImage(file, 1400, 0.88);
      onPhotoChange(result.dataUrl);

      const originalFormatted = formatFileSize(result.originalSize);
      const optimizedFormatted = formatFileSize(result.compressedSize);
      setSuccessInfo(
        result.originalSize > result.compressedSize
          ? `Uploaded & optimized (${originalFormatted} → ${optimizedFormatted})`
          : `Uploaded successfully (${optimizedFormatted})`
      );

      // Clear success notification after 4s
      setTimeout(() => setSuccessInfo(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process image';
      setError(msg);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onPhotoChange(customUrl.trim());
      setSuccessInfo('Image URL updated');
      setTimeout(() => setSuccessInfo(null), 3000);
    }
  };

  // Compact layout (ideal for gallery cards in sidebar)
  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="flex items-center gap-2">
          {/* Thumbnail preview with replace button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative group w-14 h-14 rounded-xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all shadow-xs ${
              isDragging
                ? 'border-amber-600 ring-4 ring-amber-500/30 scale-105'
                : 'border-stone-200 hover:border-amber-500'
            }`}
            title="Click or drop file to replace photo"
          >
            {currentUrl ? (
              <img
                src={currentUrl}
                alt=""
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
              <Camera className="w-4 h-4 mb-0.5" />
              <span className="text-[8px] font-bold uppercase tracking-wider">Replace</span>
            </div>

            {/* Processing spinner */}
            {isProcessing && (
              <div className="absolute inset-0 bg-stone-900/75 flex items-center justify-center text-white">
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              </div>
            )}
          </div>

          {/* Quick action button */}
          <div className="flex-1 min-w-0">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3 h-3 text-stone-600" />
                  <span>Upload &amp; Replace</span>
                </>
              )}
            </button>
            {successInfo && (
              <p className="text-[10px] text-emerald-600 font-medium truncate mt-0.5">
                ✓ Replaced!
              </p>
            )}
            {error && (
              <p className="text-[10px] text-rose-600 font-medium truncate mt-0.5">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full rich uploader (ideal for main baby portrait and prominent upload zones)
  return (
    <div className={`space-y-3 font-montserrat ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-stone-800">
            {label}
          </label>
          {description && (
            <span className="text-[10px] text-stone-400">{description}</span>
          )}
        </div>
      )}

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-4 transition-all duration-200 text-center flex flex-col items-center justify-center ${
          isDragging
            ? 'border-amber-600 bg-amber-50/60 ring-4 ring-amber-500/20 scale-[1.01]'
            : 'border-stone-200 bg-stone-50/70 hover:border-amber-500/60 hover:bg-amber-50/20'
        }`}
      >
        {/* Current Photo Preview & Action Trigger */}
        <div className="relative group mb-3">
          <div
            className={`overflow-hidden rounded-2xl shadow-sm border border-stone-200 bg-white ${
              aspectRatio === 'square'
                ? 'w-28 h-28'
                : 'w-24 h-32'
            }`}
          >
            {currentUrl ? (
              <img
                src={currentUrl}
                alt="Uploaded photo"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-[10px]">No photo</span>
              </div>
            )}
          </div>

          {/* Quick Click to Replace Overlay on Preview */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-2xl bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
          >
            <Camera className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Change</span>
          </button>

          {isProcessing && (
            <div className="absolute inset-0 rounded-2xl bg-stone-900/75 flex flex-col items-center justify-center text-white">
              <Loader2 className="w-6 h-6 animate-spin text-amber-300 mb-1" />
              <span className="text-[10px] font-medium">Compressing...</span>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="space-y-1.5 w-full max-w-xs">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-98 disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Optimizing &amp; Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload &amp; Replace Photo</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-stone-500">
            Click to browse or drag &amp; drop an image from your device
          </p>
          <p className="text-[9px] text-stone-400">
            Supports JPG, PNG, WebP (auto-optimized for fast loading)
          </p>
        </div>

        {/* Feedback messages */}
        {successInfo && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold animate-fade-in">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>{successInfo}</span>
          </div>
        )}

        {error && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-semibold">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Preset Samples (if available) */}
      {showPresets && presets.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Or Choose from Sample Milestones:</span>
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onPhotoChange(preset.url);
                  setSuccessInfo(`Selected ${preset.label}`);
                  setTimeout(() => setSuccessInfo(null), 3000);
                }}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  currentUrl === preset.url
                    ? 'border-amber-600 ring-2 ring-amber-500/30 shadow-xs'
                    : 'border-stone-200 opacity-75 hover:opacity-100 hover:border-stone-400'
                }`}
                title={preset.label}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-full h-full object-cover"
                />
                {currentUrl === preset.url && (
                  <div className="absolute inset-0 bg-amber-600/35 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* External URL option toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide custom URL input' : 'Or paste direct image URL'}</span>
        </button>

        {showUrlInput && (
          <form onSubmit={handleApplyUrl} className="mt-2 flex items-center gap-1.5">
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            >
              Apply
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
