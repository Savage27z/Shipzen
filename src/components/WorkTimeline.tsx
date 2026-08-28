"use client";

import { WorkSession } from "@/types";

interface WorkTimelineProps {
  sessions: WorkSession[];
}

export default function WorkTimeline({ sessions }: WorkTimelineProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-6 text-zinc-600">
        <p className="text-xs">No sessions yet today. Start the timer to begin tracking!</p>
      </div>
    );
  }

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Build hourly blocks for the timeline
  const now = new Date();
  const startHour = sessions.length > 0
    ? new Date(sessions[0].startedAt).getHours()
    : now.getHours();
  const endHour = now.getHours() + 1;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-zinc-500 mb-3">Today&apos;s Timeline</h4>
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
                className={`w-full rounded-t-md transition-all ${
                  session.mode === "work"
                    ? "bg-emerald-500/60 hover:bg-emerald-500/80"
                    : "bg-blue-500/40 hover:bg-blue-500/60"
                }`}
                style={{ height: `${height}%` }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded whitespace-nowrap">
                  {session.durationMinutes}m {session.mode}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-zinc-600 mt-1">
        <span>{sessions.length > 0 ? formatTime(sessions[0].startedAt) : ""}</span>
        <span>{formatTime(Date.now())}</span>
      </div>
      <div className="flex items-center gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
          <span className="text-xs text-zinc-500">Focus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/40" />
          <span className="text-xs text-zinc-500">Break</span>
        </div>
      </div>
    </div>
  );
}
