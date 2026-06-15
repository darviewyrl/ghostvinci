import React from 'react';

export default function LobbySection({ title, helper, children }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-[1.05rem] font-semibold text-bone">
          {title}
        </h3>
        {helper ? <p className="mt-1 text-xs text-bone/50">{helper}</p> : null}
      </div>
      {children}
    </section>
  );
}
