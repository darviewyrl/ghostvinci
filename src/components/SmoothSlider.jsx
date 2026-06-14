import React, { useState, useEffect } from 'react';

export default function SmoothSlider({ label, icon: Icon, volume, onChange, isMuted, onCommit }) {
  const [localVal, setLocalVal] = useState(volume);

  // Sync with outer volume changes (e.g. initial load or unmute)
  useEffect(() => {
    setLocalVal(volume);
  }, [volume]);

  const handleValueChange = (e) => {
    const val = parseFloat(e.target.value);
    setLocalVal(val);
    // Update the DOM audio element volume directly in real-time, but avoid updating React state
    onChange(val, false);
  };

  const commitValue = () => {
    // Commit the final volume value to React state (and write to localStorage)
    onChange(localVal, true);
    if (onCommit) {
      onCommit();
    }
  };

  return (
    <div
      className={`space-y-2 p-4 border rounded-2xl transition-[opacity,border-color,background-color] duration-500 ease-out ${
        isMuted
          ? 'bg-black/10 border-neutral-950 opacity-40 pointer-events-none'
          : 'bg-black/20 border-neutral-900/60 hover:border-red-900/40 hover:bg-black/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.05)]'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-rose-450" />}
          <span className="text-xs font-black uppercase tracking-wider text-bone">{label}</span>
        </div>
        <span className="text-xs font-black text-rose-500">{`${Math.round(localVal * 100)}%`}</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={localVal}
        onChange={handleValueChange}
        onMouseUp={commitValue}
        onTouchEnd={commitValue}
        onKeyUp={commitValue}
        className={`w-full h-1.5 bg-neutral-900 rounded-lg appearance-none cursor-pointer transition-[accent-color] duration-300 ${
          isMuted ? 'accent-neutral-600' : 'accent-rose-600 hover:accent-rose-500'
        }`}
      />
    </div>
  );
}
