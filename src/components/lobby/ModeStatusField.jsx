import React from 'react';

export default function ModeStatusField() {
  return (
    <div className="border border-[rgba(127,29,29,0.28)] bg-black/35 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.9)]" />
        <span className="text-xs font-black uppercase tracking-[0.1em] text-bone">
          Single Player
        </span>
      </div>
    </div>
  );
}
