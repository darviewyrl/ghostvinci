export default function DailyQuestWidget() {
  return (
    <div className="rounded-2xl border border-[rgba(127,29,29,0.22)] bg-black/20 p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[rgba(230,80,80,0.9)]">
        ภารกิจประจำวัน
      </p>
      <p className="mt-2 text-sm font-semibold text-bone">ชนะเกม 3 ครั้ง</p>
      <div className="mt-3 h-2 rounded-full bg-white/8">
        <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-rose-700 to-red-400" />
      </div>
      <p className="mt-2 text-xs text-bone/60">2 / 3</p>
    </div>
  );
}
