"use client";

import { ShipScoreData } from "@/types";

interface ShipScoreProps {
  data: ShipScoreData;
}

export default function ShipScore({ data }: ShipScoreProps) {
  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-300">Ship Score</h3>
        <span className="text-lg">🚀</span>
      </div>

      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tabular-nums">
          {data.score}
        </div>
        <p className="text-xs text-zinc-500 mt-1">points today</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-zinc-200">{data.tasksCompleted}</div>
          <div className="text-xs text-zinc-500">Tasks shipped</div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-zinc-200">{data.taskPoints}</div>
          <div className="text-xs text-zinc-500">Task points</div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-emerald-400">+{data.healthBonus}</div>
          <div className="text-xs text-zinc-500">Health bonus</div>
        </div>
        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-amber-400">
            {data.streakDays > 0 ? `🔥 ${data.streakDays}d` : "—"}
          </div>
          <div className="text-xs text-zinc-500">Streak</div>
        </div>
      </div>
    </div>
  );
}
