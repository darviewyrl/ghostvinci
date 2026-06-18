import React from 'react';

export default function StackIcon({ active = false }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="lobby-stack-icon h-6 w-6"
      style={active ? { color: '#ff4d4d' } : undefined}
    >
      <path d="M32 12 15 20l17 8 17-8-17-8Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M18 29l14 7 14-7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 38l11 6 11-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
