import React from 'react';
import { BookOpen } from 'lucide-react';
import LobbyMechanicsPanel from './LobbyMechanicsPanel';

export default function LobbyBrandBlock() {
  return (
    <div className="relative z-10 max-w-[900px] pb-4">
      <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[rgba(230,80,80,0.88)]">
        Ghostvinci
      </p>

      <div className="mt-3 flex items-center gap-4 text-[rgba(230,80,80,0.4)]">
        <span className="h-px w-24 bg-current" />
        <span className="h-px w-12 bg-current" />
      </div>

      <h1 className="mt-4 text-[4.6rem] font-black uppercase leading-[0.86] tracking-[0.06em] text-bone font-cinzel sm:text-[5.6rem] xl:text-[7rem]">
        Ghostvinci
      </h1>

      <div className="mt-3 flex items-center gap-4 text-[rgba(230,80,80,0.4)]">
        <span className="h-px w-12 bg-current" />
        <span className="h-px w-24 bg-current" />
      </div>

      <p className="mt-5 text-2xl font-medium text-[rgba(230,80,80,0.9)]">
        พิธีกรรมแห่งไพ่ต้องสาป
      </p>
      <p className="mt-5 max-w-xl text-lg leading-8 text-bone/78">
        คุณเห็นเลขของพวกเขา แต่พวกเขาก็เห็นคุณเช่นกัน
      </p>

      <div className="mt-8 inline-flex items-center gap-3 rounded-sm border border-[rgba(239,68,68,0.26)] bg-[rgba(19,8,9,0.45)] px-6 py-4 shadow-[0_0_30px_rgba(239,68,68,0.08)]">
        <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-[rgba(239,68,68,0.34)] text-[rgba(239,68,68,0.92)]">
          <BookOpen className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <span className="text-xl font-medium text-bone/92">คู่มือการเล่น</span>
      </div>

      <LobbyMechanicsPanel />
    </div>
  );
}
