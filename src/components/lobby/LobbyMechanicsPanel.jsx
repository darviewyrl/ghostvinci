import React from 'react';
import { Eye, Hand, ShieldAlert } from 'lucide-react';

const ITEMS = [
  {
    title: 'อ่านใจ',
    lines: ['วิเคราะห์ข้อมูล', 'หลอกล่อคู่ต่อสู้'],
    Icon: Eye,
  },
  {
    title: 'ตรรกะ',
    lines: ['ใช้เหตุผล', 'เปิดเผยความจริง'],
    Icon: Hand,
  },
  {
    title: 'หักเหลี่ยม',
    lines: ['ทุกการเดา', 'คือการเสี่ยงชีวิต'],
    Icon: ShieldAlert,
  },
];

export default function LobbyMechanicsPanel() {
  return (
    <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
      {ITEMS.map(({ title, lines, Icon }) => (
        <div key={title} className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[rgba(239,68,68,0.28)] bg-black/35 shadow-[0_0_24px_rgba(239,68,68,0.08)]">
            <Icon className="h-6 w-6 text-[rgba(230,80,80,0.92)]" strokeWidth={1.8} />
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
