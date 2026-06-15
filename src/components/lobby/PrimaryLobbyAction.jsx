import React from 'react';
import { Skull } from 'lucide-react';

export default function PrimaryLobbyAction({ onStartGame }) {
  return (
    <button
      type="button"
      className="lobby-button-primary mt-6 w-full px-4 py-4 text-lg"
      onClick={onStartGame}
    >
      <Skull className="h-5 w-5" />
      <span>เริ่มพิธีกรรม</span>
      <Skull className="h-5 w-5" />
    </button>
  );
}
