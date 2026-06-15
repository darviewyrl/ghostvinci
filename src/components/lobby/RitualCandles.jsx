import React from 'react';

function CandleCluster({ side }) {
  const candles = side === 'left'
    ? [
      { height: 42, left: 0, delay: '0s' },
      { height: 58, left: 16, delay: '0.35s' },
      { height: 36, left: 34, delay: '0.7s' },
    ]
    : [
      { height: 34, left: 0, delay: '0.2s' },
      { height: 56, left: 18, delay: '0.55s' },
      { height: 44, left: 36, delay: '0.9s' },
    ];

  return (
    <div className={`ritual-candle-cluster ritual-candle-cluster--${side}`} aria-hidden="true">
      {candles.map((candle, index) => (
        <span
          key={`${side}-${index}`}
          className="ritual-candle"
          style={{
            height: `${candle.height}px`,
            left: `${candle.left}px`,
            animationDelay: candle.delay,
          }}
        >
          <span className="ritual-candle__flame" />
        </span>
      ))}
    </div>
  );
}

export default function RitualCandles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[3] hidden overflow-hidden lg:block">
      <CandleCluster side="left" />
      <CandleCluster side="right" />
    </div>
  );
}
