import React from 'react';

export const SacredCrossIcon: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 24 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Elegant Latin cross with subtle flared terminals */}
    <path d="M12 2V30" />
    <path d="M5 10H19" />
    <circle cx="12" cy="10" r="1.5" fill={color} />
    <path d="M10 2H14" />
    <path d="M5 8V12" />
    <path d="M19 8V12" />
    <path d="M9 30H15" />
  </svg>
);

export const HolyDoveIcon: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-8 h-8',
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Peaceful holy dove with olive branch */}
    <path d="M18 10C21 8 26 8 29 11C28 15 25 18 20 19C16 20 12 21 8 26C7 24 7 21 9 18C5 18 3 15 4 12C7 13 10 15 13 15C13 12 14 10 18 10Z" />
    <path d="M19 14C23 13 26 14 28 17" />
    <path d="M29 11C31 10 32 9 31 7" />
    {/* Tiny olive leaf */}
    <path d="M29 8C27 7 28 6 30 6C31 7 30 8 29 8Z" fill={color} />
  </svg>
);

export const BirthdayCakeIcon: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* 1st birthday single candle with flame */}
    <path d="M12 2C11.5 3 11 4 12 5.5C13 4 12.5 3 12 2Z" fill={color} />
    <path d="M12 5.5V8" />
    {/* Cake tiers */}
    <rect x="5" y="8" width="14" height="5" rx="1.5" />
    <rect x="3" y="13" width="18" height="7" rx="2" />
    <path d="M5 11C7 12 9 12 11 11C13 12 15 12 17 11" strokeDasharray="1 1" />
    <path d="M3 16.5C6 18 9 18 12 16.5C15 18 18 18 21 16.5" strokeDasharray="1 1" />
    {/* Cake plate */}
    <path d="M2 21H22" />
  </svg>
);

export const NumberOneMilestoneIcon: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = 'currentColor',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
    strokeWidth="1.25"
  >
    {/* Number 1 surrounded by subtle laurel arc */}
    <path d="M10 7L13 5V19H11M13 19H15" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 7C5 10 5 15 7 18" strokeDasharray="1.5 1.5" strokeLinecap="round" />
    <path d="M18 7C19 10 19 15 17 18" strokeDasharray="1.5 1.5" strokeLinecap="round" />
  </svg>
);

export const FloralDivider: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-48 h-6',
  color = '#C9A96A',
}) => (
  <svg
    viewBox="0 0 240 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke={color}
  >
    <path d="M10 12H85" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.6" />
    <path d="M155 12H230" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.6" />
    {/* Center floral leaf ornament */}
    <circle cx="120" cy="12" r="3" fill={color} />
    <path d="M112 12C114 10 117 10 118 12C117 14 114 14 112 12Z" fill={color} opacity="0.75" />
    <path d="M128 12C126 10 123 10 122 12C123 14 126 14 128 12Z" fill={color} opacity="0.75" />
    <path d="M100 12C103 9 107 9 108 12" strokeWidth="0.8" strokeLinecap="round" />
    <path d="M140 12C137 9 133 9 132 12" strokeWidth="0.8" strokeLinecap="round" />
  </svg>
);

export const GoldSparkleIcon: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-4 h-4',
  color = '#C9A96A',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 0C12 7 15 11 22 12C15 13 12 17 12 24C12 17 9 13 2 12C9 11 12 7 12 0Z"
      fill={color}
    />
  </svg>
);
