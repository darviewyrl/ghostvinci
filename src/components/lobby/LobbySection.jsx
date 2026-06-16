import React from 'react';

export default function LobbySection({ title, helper, tooltip, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-bone flex items-center gap-1.5">
          <span>{title}</span>
          {tooltip}
        </h3>
        {helper ? <p className="mt-1 text-xs text-bone/50">{helper}</p> : null}
      </div>
      {children}
    </section>
  );
}
