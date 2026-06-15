import React from 'react';
import { Settings } from 'lucide-react';

export default function LobbyTopBar({ playSFX, onOpenSettings }) {
  const handleOpenSettings = () => {
    if (playSFX) playSFX('flip');
    if (onOpenSettings) onOpenSettings();
  };

  return (
    <div className="absolute right-10 top-5 z-20 flex items-center gap-2 sm:right-14 xl:right-20">
      <button
        type="button"
        aria-label="ตั้งค่าเสียง"
        className="lobby-settings-button"
        onClick={handleOpenSettings}
      >
        <Settings className="h-4 w-4" strokeWidth={2.2} />
        <span>การตั้งค่า</span>
      </button>
    </div>
  );
}
