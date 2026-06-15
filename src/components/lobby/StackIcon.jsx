import React from 'react';

export default function StackIcon({ active = false }) {
  const stroke = active ? '#ff4d4d' : '#d8d2c0';

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-8 w-8">
      <path d="M32 12 15 20l17 8 17-8-17-8Z" fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      <path d="M18 29l14 7 14-7" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 38l11 6 11-6" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
