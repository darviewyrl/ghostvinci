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
    <div className="lobby-mechanics-panel mt-12 sm:mt-16 grid w-full max-w-[580px] sm:max-w-[680px] lg:max-w-[720px] xl:max-w-[760px] grid-cols-3 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 border-t border-white/10 pt-8 pb-4">
      {ITEMS.map(({ title, lines, emblem }) => (
        <div key={title} className="flex items-start gap-4 sm:gap-5">
          <div className="flex h-20 w-20 sm:h-22 sm:w-22 shrink-0 items-center justify-center rounded-full border border-[rgba(239,68,68,0.28)] bg-black/20 shadow-[0_0_24px_rgba(239,68,68,0.08)]">
            <img
              src={emblem}
              alt=""
              aria-hidden="true"
              className="h-[5.5rem] w-[5.5rem] sm:h-[6.25rem] sm:w-[6.25rem] max-w-none select-none object-contain"
              draggable="false"
            />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xl sm:text-2xl font-semibold text-[rgba(230,80,80,0.95)] tracking-wide">{title}</p>
            {lines.map((line) => (
              <p key={line} className="text-sm sm:text-[0.98rem] leading-relaxed text-bone/78 mt-0.5 whitespace-nowrap">
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
