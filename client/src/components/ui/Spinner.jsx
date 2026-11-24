import React from 'react';

const sizeMap = {
  xs: 'w-3.5 h-3.5 border-2',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
};

const colorMap = {
  indigo: 'border-indigo-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-slate-500 border-t-transparent',
  current: 'border-current border-t-transparent',
};

export default function Spinner({
  size = 'md',
  color = 'indigo',
  className = '',
  label = 'Loading...',
}) {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const colorClass = colorMap[color] || colorMap.indigo;

  return (
    <div
      role="status"
      className={`inline-flex items-center justify-center ${className}`}
      aria-label={label}
    >
      <div
        className={`animate-spin rounded-full ${sizeClass} ${colorClass}`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
