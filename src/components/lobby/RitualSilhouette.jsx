import React from 'react';
export default function RitualSilhouette() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
      <img
        src="/lobby/character/lobby-host-silhouette.svg"
        alt=""
        aria-hidden="true"
        className="h-[360px] w-[360px] object-contain sm:h-[420px] sm:w-[420px] lg:h-[500px] lg:w-[500px]"
      />
    </div>
  );
}
