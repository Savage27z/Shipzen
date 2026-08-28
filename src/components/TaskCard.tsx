"use client";

import { SubTask } from "@/types";

interface TaskCardProps {
  task: SubTask;
  onToggle: (id: string) => void;
}

export default function TaskCard({ task, onToggle }: TaskCardProps) {
  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
        task.completed
          ? "bg-emerald-500/5 opacity-60"
          : "bg-zinc-800/50 hover:bg-zinc-800"
      }`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
          task.completed
            ? "bg-emerald-500 border-emerald-500 scale-110"
            : "border-zinc-600 hover:border-emerald-500 group-hover:border-zinc-500"
        }`}
      >
        {task.completed && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium transition-all ${
            task.completed ? "line-through text-zinc-500" : "text-zinc-200"
          }`}
        >
          {task.title}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{task.description}</p>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
          task.completed
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-zinc-700/50 text-zinc-400"
        }`}
      >
        {task.estimatedMinutes}m
      </span>
    </div>
  );
}
