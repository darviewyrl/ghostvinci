import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function DailyQuestWidget() {
  return (
    <div className="rounded-sm border border-[rgba(127,29,29,0.28)] bg-black/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[rgba(230,80,80,0.9)]">
            <p className="text-xs font-black uppercase tracking-[0.2em]">
              ภารกิจประจำวัน
            </p>
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </div>
          <p className="mt-3 text-sm font-semibold text-bone">ชนะเกม 3 ครั้ง</p>
          <div className="mt-3 h-2 rounded-full bg-white/8">
            <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-rose-700 to-red-400" />
          </div>
          <p className="mt-2 text-xs text-bone/60">2 / 3</p>
        </div>
        <div className="w-[72px] shrink-0">
          <div className="aspect-[3/4] rounded-sm border border-[rgba(239,68,68,0.24)] bg-[linear-gradient(180deg,rgba(42,30,32,0.95),rgba(10,10,12,0.98))] shadow-[0_10px_24px_rgba(0,0,0,0.38)]" />
          <p className="mt-1 text-center text-xs font-bold text-bone/70">x1</p>
        </div>
      </div>
    </div>
  );
}
