import React from 'react';
import Badge from './Badge';

export default function DifficultyBadge({
  difficulty = 'Easy',
  size = 'sm',
  className = '',
}) {
  const normalized =
    typeof difficulty === 'string'
      ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
      : 'Easy';

  return (
    <Badge
      variant={normalized}
      size={size}
      withDot
      className={`capitalize font-semibold ${className}`}
    >
      {normalized}
    </Badge>
  );
}
