"use client";

import { useState } from "react";
import { TaskGroup } from "@/types";
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
  taskGroups, onToggleTask, onAddGroup, onRemoveGroup, remainingBreakdowns,
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
            placeholder='Paste a big task... e.g. "Build auth system"'
            className="w-full py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            style={{ background: "#f5f5f0", border: "1px solid #e8e8e3", color: "#1a1a1a", paddingLeft: 16, paddingRight: 130 }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#2bc4a8" }}
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
