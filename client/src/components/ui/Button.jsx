import React from 'react';
import Spinner from './Spinner';

const variantClasses = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus-visible:ring-indigo-500 shadow-sm shadow-indigo-200 disabled:bg-indigo-400',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400 border border-slate-200 disabled:bg-slate-50 disabled:text-slate-400',
  outline:
    'bg-transparent text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 border border-indigo-600 focus-visible:ring-indigo-500 disabled:border-slate-300 disabled:text-slate-400',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500 shadow-sm shadow-rose-200 disabled:bg-rose-400',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-slate-400 disabled:text-slate-300',
};

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs font-medium rounded-md gap-1.5',
  md: 'px-3.5 py-2 text-sm font-medium rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base font-medium rounded-lg gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const vClass = variantClasses[variant] || variantClasses.primary;
  const sClass = sizeClasses[size] || sizeClasses.md;

  const spinnerColor =
    variant === 'primary' || variant === 'danger' ? 'white' : 'indigo';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${vClass} ${sClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner
            size={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}
            color={spinnerColor}
          />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
          )}
        </>
      )}
    </button>
  );
}
