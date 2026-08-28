"use client";

import { useEffect, useState } from "react";
import { Nudge } from "@/types";

interface AINudgeProps {
  nudges: Nudge[];
  onDismiss: (id: string) => void;
}

export default function AINudge({ nudges, onDismiss }: AINudgeProps) {
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    const newIds = nudges.map((n) => n.id).filter((id) => !visible.includes(id));
    if (newIds.length > 0) {
      setVisible((prev) => [...prev, ...newIds]);
    }
  }, [nudges, visible]);

  const typeStyles = {
    warning: "border-amber-500/30 bg-amber-500/5",
    celebration: "border-emerald-500/30 bg-emerald-500/5",
    suggestion: "border-blue-500/30 bg-blue-500/5",
  };

  const typeIcons = {
    warning: "⚠️",
    celebration: "🎉",
    suggestion: "💡",
  };

  if (nudges.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {nudges.slice(-3).map((nudge) => (
        <div
          key={nudge.id}
          className={`${typeStyles[nudge.type]} border rounded-xl p-4 shadow-2xl shadow-black/50 backdrop-blur-sm animate-in slide-in-from-right-5 fade-in duration-500`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">{typeIcons[nudge.type]}</span>
            <p className="text-sm text-zinc-200 flex-1">{nudge.message}</p>
            <button
              onClick={() => onDismiss(nudge.id)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">SZ</span>
            </div>
            <span className="text-xs text-zinc-600">ShipZen AI</span>
          </div>
        </div>
      ))}
    </div>
  );
}
