import React from 'react';

const verdictStyles = {
  // Accepted
  Accepted: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Accepted',
  },
  AC: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Accepted',
  },

  // Wrong Answer
  'Wrong Answer': {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    label: 'Wrong Answer',
  },
  WA: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    label: 'Wrong Answer',
  },

  // Time Limit Exceeded
  'Time Limit Exceeded': {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    label: 'Time Limit Exceeded',
  },
  TLE: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    label: 'Time Limit Exceeded',
  },

  // Memory Limit Exceeded
  'Memory Limit Exceeded': {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    label: 'Memory Limit Exceeded',
  },
  MLE: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    label: 'Memory Limit Exceeded',
  },

  // Compilation Error
  'Compilation Error': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'Compile Error',
  },
  CE: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'Compile Error',
  },

  // Runtime Error
  'Runtime Error': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    label: 'Runtime Error',
  },
  RE: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    label: 'Runtime Error',
  },

  // Internal Error
  'Internal Error': {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    label: 'Internal Error',
  },

  // Pending / Running states
  Queued: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    animate: true,
    label: 'Queued',
  },
  Processing: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    animate: true,
    label: 'Processing',
  },
  Running: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    animate: true,
    label: 'Running',
  },
  Pending: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    animate: true,
    label: 'Pending',
  },
};

export default function VerdictBadge({
  verdict = 'Pending',
  size = 'sm',
  className = '',
}) {
  const config = verdictStyles[verdict] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    label: verdict || 'Unknown',
  };

  const isAnimated = Boolean(config.animate);

  const sizeClasses =
    size === 'lg'
      ? 'px-3 py-1.5 text-sm'
      : size === 'md'
        ? 'px-2.5 py-1 text-xs'
        : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {isAnimated && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}
        />
      </span>
      <span>{config.label}</span>
    </span>
  );
}
