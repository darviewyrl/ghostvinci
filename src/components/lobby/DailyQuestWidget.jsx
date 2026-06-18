import React, { useState } from 'react';
import { Award, ChevronRight, RefreshCw, X } from 'lucide-react';

export default function DailyQuestWidget({ dailyQuest, onClaimReward, onResetQuest, playSFX }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const quest = dailyQuest || {
    title: 'ชนะเกม 3 ครั้ง',
    progress: 2,
    target: 3,
    claimed: false,
  };

  const isCompleted = quest.progress >= quest.target;
  const isClaimed = quest.claimed;
  const percent = Math.min((quest.progress / quest.target) * 100, 100);
  const missions = [
    'ชนะเกมให้ครบ 3 ครั้ง',
    'เดาไพ่ให้ถูกอย่างน้อย 5 ครั้ง',
    'จบเกมโดยใช้เหตุผลจากไพ่ที่เปิดเผย',
  ];

  const openModal = () => {
    if (playSFX) playSFX('flip');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (playSFX) playSFX('toggle');
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="ภารกิจประจำวัน"
        className={`lobby-panel lobby-daily-quest p-3.5 transition-all duration-300 ${isCompleted && !isClaimed ? 'border-red-600/40 bg-red-950/5' : ''}`}
        onClick={openModal}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openModal();
          }
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[rgba(230,80,80,0.9)]">
              <p className="text-xs font-black uppercase tracking-[0.18em]">
                ภารกิจประจำวัน
              </p>
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </div>
            <p className="mt-2 text-sm font-semibold text-bone">{quest.title}</p>

            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-rose-800 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)] transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="mt-2 flex min-h-[32px] items-center justify-between">
              {!isCompleted ? (
                <p className="text-xs text-bone/60">{quest.progress} / {quest.target}</p>
              ) : !isClaimed ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onClaimReward();
                  }}
                  className="flex items-center gap-1 rounded border border-red-500/50 bg-red-900 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-bone shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300 hover:bg-red-800 hover:text-white"
                >
                  <Award className="h-3 w-3" />
                  <span>รับรางวัล</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-500 filter drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]">สำเร็จแล้ว</span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onResetQuest();
                    }}
                    className="rounded p-1 text-bone/40 transition-colors hover:bg-white/5 hover:text-bone/80"
                    title="เริ่มภารกิจใหม่"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-[74px] shrink-0 text-center">
            <div className={`daily-quest-reward ${isCompleted && !isClaimed ? 'daily-quest-reward--ready' : ''}`}>
              <div className="daily-chest" aria-hidden="true">
                <span className="daily-chest__lid" />
                <span className="daily-chest__body" />
                <span className="daily-chest__lock" />
              </div>
            </div>
            <p className="mt-1 text-center text-xs font-bold text-bone/70">x1</p>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div
          className="daily-quest-modal-backdrop fixed inset-0 z-[130] flex items-center justify-center bg-black/78 p-4 backdrop-blur-[6px]"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="daily-quest-modal-title"
            className="daily-quest-modal lobby-panel w-full max-w-[26rem] p-5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.7rem] font-black uppercase tracking-[0.24em] text-[rgba(230,80,80,0.76)]">
                  Daily Rite
                </p>
                <h2 id="daily-quest-modal-title" className="mt-1 text-2xl font-semibold text-bone">
                  ภารกิจประจำวัน
                </h2>
              </div>
              <button
                type="button"
                aria-label="ปิดภารกิจประจำวัน"
                className="daily-quest-modal__close"
                onClick={closeModal}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-5 space-y-2.5 text-sm leading-7 text-bone/76">
              {missions.map((mission) => (
                <li key={mission} className="daily-quest-modal__mission">
                  {mission}
                </li>
              ))}
            </ul>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="daily-quest-modal__stat">
                <span>ความคืบหน้า</span>
                <strong>{quest.progress} / {quest.target}</strong>
              </div>
              <div className="daily-quest-modal__stat">
                <span>รางวัล</span>
                <strong>หีบพิธีกรรม x1</strong>
              </div>
            </div>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-800 via-red-500 to-red-300 shadow-[0_0_16px_rgba(239,68,68,0.44)] transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
