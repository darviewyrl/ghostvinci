import React from 'react';

function HornedSkull({ accent = '#d8d2c0' }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-9 w-9">
      <path d="M19 17 9 12l7 14" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M45 17l10-5-7 14" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 12c10 0 18 8 18 18 0 8-5 13-8 17v7H22v-7c-3-4-8-9-8-17 0-10 8-18 18-18Z" fill="none" stroke={accent} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="25" cy="31" r="3" fill={accent} />
      <circle cx="39" cy="31" r="3" fill={accent} />
      <path d="M32 36l-4 7h8l-4-7Z" fill={accent} />
      <path d="M24 50h16M26 56h12" stroke={accent} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function DifficultyIcon({ variant, active }) {
  const accentMap = {
    easy: active ? '#ffb3b3' : '#c9c2b7',
    medium: active ? '#ff4d4d' : '#c9c2b7',
    hard: active ? '#ffd0d0' : '#c9c2b7',
  };

  return <HornedSkull accent={accentMap[variant]} />;
}
