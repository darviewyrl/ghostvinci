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
        className="lobby-icon-button"
        onClick={handleOpenSettings}
      >
        <Settings className="h-6 w-6 text-rose-500" strokeWidth={2} />
      </button>
    </div>
  );
}
