import React from 'react';

const variantMap = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  hard: 'bg-rose-50 text-rose-700 border-rose-200',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  gray: 'bg-slate-100 text-slate-700 border-slate-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs font-medium',
  md: 'px-2.5 py-1 text-xs font-semibold',
  lg: 'px-3 py-1.5 text-sm font-semibold',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  rounded = 'full',
  withDot = false,
  className = '',
}) {
  const variantClass = variantMap[variant] || variantMap.default;
  const sizeClass = sizeMap[size] || sizeMap.sm;
  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-md';

  return (
    <span
      className={`inline-flex items-center gap-1.5 border leading-none ${sizeClass} ${roundedClass} ${variantClass} ${className}`}
    >
      {withDot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current opacity-80"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
