"use client";

import { useState } from "react";
import { TaskGroup, SubTask } from "@/types";
import TaskCard from "./TaskCard";
import { trackEvent } from "@/lib/tiun";

interface TaskListProps {
  taskGroups: TaskGroup[];
  onToggleTask: (groupId: string, taskId: string) => void;
  onAddGroup: (task: string) => Promise<void>;
  onRemoveGroup: (groupId: string) => void;
  remainingBreakdowns: number;
}

export default function TaskList({
  taskGroups,
  onToggleTask,
  onAddGroup,
  onRemoveGroup,
  remainingBreakdowns,
}: TaskListProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (remainingBreakdowns <= 0) {
      setError("Daily breakdown limit reached. Upgrade to Pro for unlimited!");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onAddGroup(input.trim());
      trackEvent("task_breakdown_created", { taskLength: input.length });
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to break down task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a big task... e.g. &quot;Build user authentication system&quot;"
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm rounded-lg font-medium transition-all disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Breaking down...
              </span>
            ) : (
              "Break it down ⚡"
            )}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        {remainingBreakdowns <= 3 && remainingBreakdowns > 0 && (
          <p className="text-zinc-500 text-xs">
            {remainingBreakdowns} breakdown{remainingBreakdowns !== 1 ? "s" : ""} remaining today
          </p>
        )}
      </form>

      {/* Task groups */}
      <div className="flex flex-col gap-6">
        {taskGroups.map((group) => {
          const completed = group.subTasks.filter((t) => t.completed).length;
          const total = group.subTasks.length;
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div key={group.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-300 truncate">
                    {group.originalTask}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden max-w-[120px]">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">
                      {completed}/{total}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveGroup(group.id)}
                  className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                  title="Remove task group"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {group.subTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={(taskId) => onToggleTask(group.id, taskId)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {taskGroups.length === 0 && (
        <div className="text-center py-12 text-zinc-600">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-sm">Paste a task above and let AI break it down</p>
          <p className="text-xs mt-1">into bite-sized, shippable pieces</p>
        </div>
      )}
    </div>
  );
}
