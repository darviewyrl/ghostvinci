import React from 'react';
import { Skull } from 'lucide-react';

export default function PrimaryLobbyAction({ onStartGame }) {
  return (
    <button
      type="button"
      className="lobby-button-primary mt-2 w-full px-4 py-3.5 text-lg"
      onClick={onStartGame}
    >
      <Skull className="lobby-button-primary__icon h-5 w-5" />
      <span className="lobby-button-primary__label">เริ่มพิธีกรรม</span>
      <Skull className="lobby-button-primary__icon h-5 w-5" />
    </button>
  );
}
