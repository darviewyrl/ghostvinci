import React from 'react';
export default function LobbySection({ title, helper, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[rgba(230,80,80,0.92)] sm:text-base">
          {title}
        </h3>
        {helper ? <p className="mt-1 text-xs text-bone/50">{helper}</p> : null}
      </div>
      {children}
    </section>
  );
}
