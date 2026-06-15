import React from 'react';
import { Eye, Leaf, Skull } from 'lucide-react';

export default function DifficultyIcon({ variant, active }) {
  const Icon = {
    easy: Leaf,
    medium: Eye,
    hard: Skull,
  }[variant] || Skull;

  const accentMap = {
    easy: active ? '#ffd8c8' : '#c9c2b7',
    medium: active ? '#ff7a7a' : '#c9c2b7',
    hard: active ? '#ffe2e2' : '#c9c2b7',
  };

  return (
    <Icon
      aria-hidden="true"
      className="lobby-difficulty-icon h-8 w-8"
      color={accentMap[variant]}
      strokeWidth={variant === 'medium' ? 1.55 : 1.8}
    />
  );
}
