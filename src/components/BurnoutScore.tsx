"use client";

import { BurnoutData } from "@/types";

interface BurnoutScoreProps {
  data: BurnoutData;
}

export default function BurnoutScore({ data }: BurnoutScoreProps) {
  const colorMap = {
    green: { stroke: "#10b981", text: "text-emerald-600", label: "Looking good" },
    yellow: { stroke: "#f59e0b", text: "text-amber-600", label: "Take it easy" },
    red: { stroke: "#ef4444", text: "text-red-600", label: "High risk" },
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
    <div className="bg-white rounded-2xl border border-[#e5e4e1] p-5">
      <h3 className="text-sm font-semibold text-[#111] mb-4">Burnout Risk</h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e4e1" strokeWidth="5" />
            <circle
              cx="50" cy="50" r={radius} fill="none"
              stroke={c.stroke} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${c.text}`}>{data.score}</span>
          </div>
        </div>
        <div>
          <p className={`text-sm font-medium ${c.text}`}>{c.label}</p>
          <p className="text-xs text-[#999] mt-0.5">out of 100</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="text-xs text-[#888] w-24 flex-shrink-0">{f.label}</span>
            <div className="flex-1 h-1.5 bg-[#f1f0ee] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(2, (f.value / f.max) * 100)}%`,
                  backgroundColor: f.value === 0 ? "#ddd" : f.value > f.max * 0.6 ? "#ef4444" : "#f59e0b",
                }}
              />
            </div>
            <span className="text-xs text-[#bbb] w-6 text-right">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
