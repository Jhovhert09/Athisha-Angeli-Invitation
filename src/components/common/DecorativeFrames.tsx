import React from 'react';
import { FrameShape } from '../../types/invitation';
import { GoldSparkleIcon } from './DecorativeIcons';

interface DecorativeFrameProps {
  photoUrl: string;
  altText: string;
  shape: FrameShape;
  accentColor: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DecorativeFrame: React.FC<DecorativeFrameProps> = ({
  photoUrl,
  altText,
  shape,
  accentColor,
  className = '',
  size = 'md',
}) => {
  const [hasError, setHasError] = React.useState(false);

  // Dimension classes based on size
  const sizeClasses = {
    sm: 'w-24 h-32',
    md: 'w-48 h-64 sm:w-52 sm:h-72',
    lg: 'w-56 h-76 sm:w-64 sm:h-84',
  }[size];

  const circleSizeClasses = {
    sm: 'w-28 h-28',
    md: 'w-52 h-52 sm:w-60 sm:h-60',
    lg: 'w-64 h-64 sm:w-72 sm:h-72',
  }[size];

  // Helper for image element with fallback
  const renderImage = (imgClasses: string) => {
    if (hasError || !photoUrl) {
      return (
        <div
          className={`${imgClasses} flex flex-col items-center justify-center p-4 text-center bg-amber-50/70 border border-amber-200/50`}
        >
          <span className="text-2xl mb-1">👶</span>
          <span className="text-xs font-serif text-stone-600 italic">
            {altText || 'Our Little Blessing'}
          </span>
        </div>
      );
    }

    return (
      <img
        src={photoUrl}
        alt={altText}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`${imgClasses} object-cover w-full h-full transition-transform duration-700 hover:scale-105`}
      />
    );
  };

  if (shape === 'circle') {
    return (
      <div className={`relative inline-block ${className}`}>
        {/* Outer subtle gold ring */}
        <div
          className={`relative p-2.5 rounded-full shadow-lg ${circleSizeClasses}`}
          style={{
            background: `radial-gradient(circle, #FFFFFF 60%, ${accentColor}15 100%)`,
            border: `1.5px solid ${accentColor}55`,
          }}
        >
          <div
            className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
            style={{
              border: `2px solid ${accentColor}90`,
            }}
          >
            {renderImage('rounded-full')}
          </div>
        </div>

        {/* Subtle corner sparkle */}
        <div className="absolute -top-1 -right-1 animate-sparkle">
          <GoldSparkleIcon color={accentColor} className="w-5 h-5" />
        </div>
      </div>
    );
  }

  if (shape === 'oval') {
    return (
      <div className={`relative inline-block ${className}`}>
        <div
          className={`relative p-2.5 rounded-[50%] shadow-lg ${sizeClasses}`}
          style={{
            background: `radial-gradient(ellipse at center, #FFFFFF 60%, ${accentColor}18 100%)`,
            border: `1.5px solid ${accentColor}55`,
          }}
        >
          <div
            className="w-full h-full rounded-[50%] overflow-hidden relative shadow-inner"
            style={{
              border: `2px solid ${accentColor}85`,
            }}
          >
            {renderImage('rounded-[50%]')}
          </div>
        </div>
        <div className="absolute -bottom-1 -left-1 animate-sparkle">
          <GoldSparkleIcon color={accentColor} className="w-4 h-4" />
        </div>
      </div>
    );
  }

  if (shape === 'scalloped') {
    return (
      <div className={`relative inline-block ${className}`}>
        <div
          className={`relative p-2.5 rounded-3xl shadow-lg ${sizeClasses}`}
          style={{
            background: '#FFFFFF',
            border: `1.5px solid ${accentColor}60`,
            boxShadow: `0 10px 25px -5px ${accentColor}20`,
          }}
        >
          {/* Inner scalloped / fancy border */}
          <div
            className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner"
            style={{
              border: `1.5px dashed ${accentColor}80`,
            }}
          >
            {renderImage('rounded-2xl')}
          </div>
        </div>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <GoldSparkleIcon color={accentColor} className="w-4 h-4" />
        </div>
      </div>
    );
  }

  if (shape === 'floral') {
    return (
      <div className={`relative inline-block ${className}`}>
        {/* Subtle floral wreaths around arch */}
        <div
          className={`relative p-2.5 rounded-t-[100px] rounded-b-2xl shadow-lg ${sizeClasses}`}
          style={{
            background: '#FFFFFF',
            border: `1.5px solid ${accentColor}50`,
          }}
        >
          <div
            className="w-full h-full rounded-t-[92px] rounded-b-xl overflow-hidden relative"
            style={{
              border: `1.5px solid ${accentColor}80`,
            }}
          >
            {renderImage('rounded-t-[92px] rounded-b-xl')}
          </div>
        </div>

        {/* Floral corner vines */}
        <svg
          className="absolute -bottom-4 -left-4 w-12 h-12 pointer-events-none opacity-80"
          viewBox="0 0 40 40"
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
        >
          <path d="M10 35C15 28 20 20 28 12" strokeLinecap="round" />
          <path d="M14 30C12 28 12 25 15 25C18 25 17 29 14 30Z" fill={accentColor} fillOpacity="0.25" />
          <path d="M21 22C20 19 21 16 24 17C26 18 25 21 21 22Z" fill={accentColor} fillOpacity="0.25" />
          <circle cx="28" cy="12" r="1.5" fill={accentColor} />
        </svg>

        <svg
          className="absolute -top-3 -right-3 w-10 h-10 pointer-events-none opacity-80"
          viewBox="0 0 40 40"
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
        >
          <path d="M30 5C25 12 20 20 12 28" strokeLinecap="round" />
          <path d="M26 10C28 12 28 15 25 15C22 15 23 11 26 10Z" fill={accentColor} fillOpacity="0.25" />
          <circle cx="12" cy="28" r="1.5" fill={accentColor} />
        </svg>
      </div>
    );
  }

  // Default: Arch Frame (Cathedral Arch)
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Outer frame */}
      <div
        className={`relative p-2.5 rounded-t-[120px] rounded-b-2xl shadow-xl transition-all duration-300 ${sizeClasses}`}
        style={{
          background: 'radial-gradient(circle at top, #FFFFFF 60%, rgba(255,255,255,0.85) 100%)',
          border: `1.5px solid ${accentColor}60`,
          boxShadow: `0 12px 30px -8px ${accentColor}30`,
        }}
      >
        {/* Inner arch with double border */}
        <div
          className="w-full h-full rounded-t-[112px] rounded-b-xl overflow-hidden relative shadow-inner"
          style={{
            border: `2px solid ${accentColor}85`,
          }}
        >
          {renderImage('rounded-t-[112px] rounded-b-xl')}
        </div>
      </div>

      {/* Floating accent sparkle */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 animate-sparkle">
        <GoldSparkleIcon color={accentColor} className="w-5 h-5" />
      </div>
    </div>
  );
};
