"use client";

import { BurnoutData } from "@/types";

interface BurnoutScoreProps {
  data: BurnoutData;
}

export default function BurnoutScore({ data }: BurnoutScoreProps) {
  const colorMap = {
    green: {
      ring: "text-emerald-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      label: "Looking good",
      emoji: "😌",
    },
    yellow: {
      ring: "text-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      label: "Take it easy",
      emoji: "😐",
    },
    red: {
      ring: "text-red-500",
      bg: "bg-red-500/10",
      text: "text-red-400",
      label: "High risk",
      emoji: "🔥",
    },
  };

  const c = colorMap[data.level];
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.score / 100) * circumference;

  const factors = [
    { label: "Long sessions", value: data.factors.longSessions, max: 30 },
    { label: "Late nights", value: data.factors.lateNightWork, max: 25 },
    { label: "Skipped breaks", value: data.factors.skippedBreaks, max: 25 },
    { label: "No rest days", value: data.factors.consecutiveDays, max: 20 },
  ];

  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-300">Burnout Risk</h3>
        <span className="text-lg">{c.emoji}</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-zinc-800" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${c.ring} transition-all duration-1000`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${c.text}`}>{data.score}</span>
          </div>
        </div>
        <div>
          <p className={`text-sm font-medium ${c.text}`}>{c.label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">out of 100</p>
        </div>
      </div>

      <div className="space-y-2">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 w-24 flex-shrink-0">{f.label}</span>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  f.value === 0 ? "bg-zinc-700" : f.value > f.max * 0.6 ? "bg-red-500" : "bg-amber-500"
                }`}
                style={{ width: `${(f.value / f.max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-zinc-600 w-6 text-right">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
