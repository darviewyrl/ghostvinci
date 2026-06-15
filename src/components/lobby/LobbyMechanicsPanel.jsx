import React from 'react';
import emblemEye from '../../../img/emblem_eye.png';
import emblemHand from '../../../img/emblem_hand.png';
import emblemJoker from '../../../img/emblem_joker.png';

const ITEMS = [
  {
    title: 'อ่านใจ',
    lines: ['วิเคราะห์ข้อมูล', 'หลอกล่อคู่ต่อสู้'],
    emblem: emblemEye,
  },
  {
    title: 'ตรรกะ',
    lines: ['ใช้เหตุผล', 'เปิดเผยความจริง'],
    emblem: emblemHand,
  },
  {
    title: 'หักเหลี่ยม',
    lines: ['ทุกการเดา', 'คือการเสี่ยงชีวิต'],
    emblem: emblemJoker,
  },
];

export default function LobbyMechanicsPanel() {
  return (
    <div className="lobby-mechanics-panel mt-10 grid max-w-[640px] grid-cols-3 gap-6 border-t border-white/10 pt-6">
      {ITEMS.map(({ title, lines, emblem }) => (
        <div key={title} className="flex items-start gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[rgba(239,68,68,0.28)] bg-black/20 shadow-[0_0_24px_rgba(239,68,68,0.08)]">
            <img
              src={emblem}
              alt=""
              aria-hidden="true"
              className="h-[4.75rem] w-[4.75rem] max-w-none select-none object-contain drop-shadow-[0_0_9px_rgba(239,68,68,0.72)]"
              draggable="false"
            />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-[rgba(230,80,80,0.95)]">{title}</p>
            {lines.map((line) => (
              <p key={line} className="text-sm leading-6 text-bone/78">
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
