import React from 'react';
const SMOKE_PUFFS = [
  { id: 'left-top', className: 'left-[-4%] top-[14%] h-56 w-56' },
  { id: 'left-mid', className: 'left-[6%] top-[44%] h-72 w-72' },
  { id: 'right-top', className: 'right-[8%] top-[8%] h-64 w-64' },
  { id: 'right-mid', className: 'right-[2%] top-[32%] h-80 w-80' },
];

export default function RitualSmoke() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {SMOKE_PUFFS.map((puff, index) => (
        <div
          key={puff.id}
          className={`absolute bg-center bg-no-repeat bg-contain opacity-55 animate-fog ${puff.className}`}
          style={{
            backgroundImage: `url(${index % 2 === 0 ? '/lobby/fx/smoke-left.svg' : '/lobby/fx/smoke-right.svg'})`,
            filter: 'blur(22px)',
            '--duration': `${34 + index * 6}s`,
          }}
        />
      ))}
    </div>
  );
}
