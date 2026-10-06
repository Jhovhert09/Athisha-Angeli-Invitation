import React from 'react';
import { PhotoUploader } from './PhotoUploader';
import { X, Camera } from 'lucide-react';

interface PhotoReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onPhotoChange: (newUrl: string) => void;
  title?: string;
  description?: string;
  accentColor?: string;
  presets?: { label: string; url: string }[];
}

export const PhotoReplaceModal: React.FC<PhotoReplaceModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onPhotoChange,
  title = 'Replace Photo',
  description = 'Upload a new picture from your device or phone',
  accentColor = '#C9A96A',
  presets = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-montserrat animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}25` }}
            >
              <Camera className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">{title}</h3>
              <p className="text-[11px] text-stone-500">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <PhotoUploader
            currentUrl={currentUrl}
            onPhotoChange={(newUrl) => {
              onPhotoChange(newUrl);
            }}
            accentColor={accentColor}
            showPresets={presets.length > 0}
            presets={presets}
            aspectRatio="square"
          />
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
