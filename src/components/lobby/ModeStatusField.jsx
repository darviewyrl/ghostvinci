import React from 'react';
export default function ModeStatusField() {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-bone/45">
        Mode
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
        <span className="text-sm font-black uppercase tracking-[0.12em] text-bone">
          Single Player
        </span>
      </div>
    </div>
  );
}
