import React from 'react';
import { Settings } from 'lucide-react';

export default function LobbyTopBar({ playSFX, onOpenSettings }) {
  const handleOpenSettings = () => {
    if (playSFX) playSFX('flip');
    if (onOpenSettings) onOpenSettings();
  };

  return (
    <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
      <button
        type="button"
        aria-label="ตั้งค่าเสียง"
        className="rounded-xl border-2 border-[rgba(127,29,29,0.32)] bg-[rgba(10,10,12,0.9)] p-4 text-bone shadow-[0_0_15px_rgba(239,68,68,0.15)]"
        onClick={handleOpenSettings}
      >
        <Settings className="h-6 w-6 text-rose-500" strokeWidth={2} />
      </button>
    </div>
  );
}
