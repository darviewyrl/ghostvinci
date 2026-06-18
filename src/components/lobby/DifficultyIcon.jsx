import React from 'react';
import { Eye, Leaf, Skull } from 'lucide-react';

export default function DifficultyIcon({ variant, active }) {
  const Icon = {
    easy: Leaf,
    medium: Eye,
    hard: Skull,
  }[variant] || Skull;

  return (
    <Icon
      aria-hidden="true"
      className="lobby-difficulty-icon h-8 w-8"
      style={active ? { color: '#ff4d4d' } : undefined}
      strokeWidth={variant === 'medium' ? 1.55 : 1.8}
    />
  );
}
