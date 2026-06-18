import React from 'react';
import logoImage from '../../../img/logo.png';
import { BookOpen } from 'lucide-react';
import LobbyMechanicsPanel from './LobbyMechanicsPanel';

export default function LobbyBrandBlock() {
  const scrollToGuide = () => {
    const guide = document.getElementById('ghostvinci-guide');
    if (!guide) return;

    const scrollContainer = document.getElementById('root');
    if (scrollContainer && typeof scrollContainer.scrollTo === 'function') {
      scrollContainer.scrollTo({ top: guide.offsetTop, behavior: 'smooth' });
      return;
    }

    window.scrollTo({ top: guide.offsetTop, behavior: 'smooth' });
  };

  return (
    <div className="relative z-10 max-w-[820px] pb-2 text-center lobby-brand-block-container">
      <p className="hidden text-sm font-semibold uppercase tracking-[0.38em] text-[rgba(230,80,80,0.88)]">
        Ghostvinci
      </p>

      <div className="hidden mt-3 items-center gap-4 text-[rgba(230,80,80,0.4)]">
        <span className="h-px w-24 bg-current" />
        <span className="h-px w-12 bg-current" />
      </div>

      <h1 className="relative leading-none pt-3 sm:pt-4 xl:pt-5 -mb-8 sm:-mb-10 xl:-mb-12">
        <img
          src={logoImage}
          alt="Ghostvinci"
          className="mx-auto block w-[min(45rem,78vw)] max-w-full translate-y-5 select-none object-contain drop-shadow-[0_5px_18px_rgba(0,0,0,0.95)] sm:translate-y-7 xl:w-[min(47rem,52vw)] xl:translate-y-9"
          draggable="false"
        />
      </h1>

      <div className="hidden mt-3 items-center gap-4 text-[rgba(230,80,80,0.4)]">
        <span className="h-px w-12 bg-current" />
        <span className="h-px w-24 bg-current" />
      </div>

      <p className="mx-auto mt-5 flex items-center justify-center gap-4 text-center text-[1.45rem] font-medium tracking-[0.16em] text-[rgba(229,62,62,0.9)] after:block after:h-px after:w-24 after:bg-[rgba(229,62,62,0.45)]">
        <span className="h-px w-24 bg-[rgba(229,62,62,0.45)]" />
        พิธีกรรมแห่งไพ่ต้องสาป
      </p>
      <p className="mx-auto mt-5 max-w-[540px] text-center text-[1.14rem] leading-8 text-bone/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
        คุณเห็นเลขของพวกเขา แต่พวกเขาก็เห็นคุณเช่นกัน
      </p>

      <button
        type="button"
        className="lobby-guide-btn mx-auto mt-8 flex min-w-[270px] items-center justify-center gap-3 border border-[rgba(239,68,68,0.38)] bg-[rgba(8,4,5,0.36)] px-8 py-4 shadow-[inset_0_0_18px_rgba(239,68,68,0.08),0_0_26px_rgba(0,0,0,0.5)] cursor-pointer select-none text-bone/92 hover:text-white"
        onClick={scrollToGuide}
      >
        <span className="flex h-8 w-8 items-center justify-center transition-colors duration-300">
          <BookOpen className="h-5 w-5 text-red-500 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.85)]" strokeWidth={1.8} />
        </span>
        <span className="text-[1.36rem] font-medium transition-colors duration-300">คู่มือการเล่น</span>
      </button>

      <LobbyMechanicsPanel />
    </div>
  );
}
