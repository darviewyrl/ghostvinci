import React from 'react';
export default function RitualSilhouette() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
      <div className="relative h-[360px] w-[360px] sm:h-[420px] sm:w-[420px] lg:h-[500px] lg:w-[500px]">
        <div className="absolute inset-x-[8%] bottom-0 h-[82%] rounded-[48%_48%_24%_24%/42%_42%_18%_18%] bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),rgba(0,0,0,0)_26%),linear-gradient(180deg,rgba(42,11,11,0.95),rgba(5,5,7,0.98))] shadow-[0_0_50px_rgba(239,68,68,0.16)]" />
        <div className="absolute inset-x-[20%] top-[8%] h-[46%] rounded-[48%_48%_34%_34%/56%_56%_28%_28%] bg-[radial-gradient(circle_at_50%_30%,rgba(239,68,68,0.16),transparent_42%),linear-gradient(180deg,rgba(30,7,7,0.92),rgba(3,3,5,0.98))] blur-[1px] opacity-95" />
        <div className="absolute left-1/2 top-[18%] h-12 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.22),transparent_70%)] blur-xl" />
        <div className="absolute inset-x-[14%] bottom-[12%] h-[20%] rounded-[45%_45%_18%_18%/55%_55%_16%_16%] bg-black/85" />
      </div>
    </div>
  );
}
