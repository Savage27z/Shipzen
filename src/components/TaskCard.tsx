"use client";

import { SubTask } from "@/types";

interface TaskCardProps {
  task: SubTask;
  onToggle: (id: string) => void;
}

export default function TaskCard({ task, onToggle }: TaskCardProps) {
  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${
        task.completed ? "opacity-60" : "hover:bg-black/[0.02]"
      }`}
      style={{ background: task.completed ? "rgba(16,185,129,0.04)" : "transparent" }}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-md border-[1.5px] flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
          task.completed
            ? "bg-emerald-500 border-emerald-500"
            : "border-gray-300 hover:border-emerald-500/60 group-hover:border-gray-400"
        }`}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium transition-all ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
          {task.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
          task.completed ? "bg-emerald-50 text-emerald-400" : "bg-gray-100 text-gray-400"
        }`}
      >
        {task.estimatedMinutes}m
      </span>
    </div>
  );
}
