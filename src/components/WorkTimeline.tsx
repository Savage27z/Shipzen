"use client";

import { WorkSession } from "@/types";

interface WorkTimelineProps {
  sessions: WorkSession[];
}

export default function WorkTimeline({ sessions }: WorkTimelineProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-6 text-[#bbb]">
        <p className="text-xs">No sessions yet today. Start the timer to begin tracking!</p>
      </div>
    );
  }

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-[#888] mb-3">Today&apos;s Timeline</h4>
      <div className="flex gap-1 items-end h-16">
        {sessions.map((session) => {
          const height = Math.max(20, Math.min(100, (session.durationMinutes / 30) * 100));
          return (
            <div
              key={session.id}
              className="group relative flex-1 max-w-8"
              title={`${session.mode === "work" ? "Focus" : "Break"}: ${session.durationMinutes}min`}
            >
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${height}%`,
                  backgroundColor: session.mode === "work" ? "rgba(16,185,129,0.5)" : "rgba(59,130,246,0.35)",
                }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-[#111] text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {session.durationMinutes}m {session.mode}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-[#bbb] mt-1">
        <span>{sessions.length > 0 ? formatTime(sessions[0].startedAt) : ""}</span>
        <span>{formatTime(Date.now())}</span>
      </div>
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "rgba(16,185,129,0.5)" }} />
          <span className="text-xs text-[#999]">Focus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "rgba(59,130,246,0.35)" }} />
          <span className="text-xs text-[#999]">Break</span>
        </div>
      </div>
    </div>
  );
}
