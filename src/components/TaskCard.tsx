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
