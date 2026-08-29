"use client";

import { ShipScoreData } from "@/types";

interface ShipScoreProps {
  data: ShipScoreData;
}

export default function ShipScore({ data }: ShipScoreProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e4e1] p-5">
      <h3 className="text-sm font-semibold text-[#111] mb-4">Ship Score</h3>

      <div className="text-center mb-5">
        <div className="text-5xl font-bold text-[#111] tabular-nums">
          {data.score}
        </div>
        <p className="text-xs text-[#999] mt-1">points today</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#f9f8f6] rounded-xl p-3 text-center">
          <div className="text-lg font-semibold text-[#111]">{data.tasksCompleted}</div>
          <div className="text-xs text-[#999]">Tasks shipped</div>
        </div>
        <div className="bg-[#f9f8f6] rounded-xl p-3 text-center">
          <div className="text-lg font-semibold text-[#111]">{data.taskPoints}</div>
          <div className="text-xs text-[#999]">Task points</div>
        </div>
        <div className="bg-[#f9f8f6] rounded-xl p-3 text-center">
          <div className="text-lg font-semibold text-emerald-600">+{data.healthBonus}</div>
          <div className="text-xs text-[#999]">Health bonus</div>
        </div>
        <div className="bg-[#f9f8f6] rounded-xl p-3 text-center">
          <div className="text-lg font-semibold text-[#111]">
            {data.streakDays > 0 ? `${data.streakDays}d` : "—"}
          </div>
          <div className="text-xs text-[#999]">Streak</div>
        </div>
      </div>
    </div>
  );
}
