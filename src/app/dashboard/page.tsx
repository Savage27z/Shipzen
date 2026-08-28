"use client";

import { useState, useEffect, useCallback } from "react";
import { TaskGroup, SubTask, WorkSession, Nudge, TimerSettings } from "@/types";
import { calculateBurnoutScore, calculateShipScore, getNudgeContext } from "@/lib/scoring";
import {
  getTaskGroups,
  addTaskGroup,
  updateTaskGroup,
  removeTaskGroup,
  getSessions,
  addSession,
  getTodaySessions,
  getTimerSettings,
  setTimerSettings as saveTimerSettings,
  getBreakdownCount,
  incrementBreakdownCount,
  getStreak,
  recordActivity,
} from "@/lib/storage";
import { isPro, TIERS, trackEvent } from "@/lib/tiun";
import Sidebar from "@/components/Sidebar";
import FocusTimer from "@/components/FocusTimer";
import TaskList from "@/components/TaskList";
import BurnoutScore from "@/components/BurnoutScore";
import ShipScore from "@/components/ShipScore";
import AINudge from "@/components/AINudge";
import WorkTimeline from "@/components/WorkTimeline";

export default function DashboardPage() {
  const [activePage, setActivePage] = useState("dashboard");
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [todaySessions, setTodaySessions] = useState<WorkSession[]>([]);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [timerSettings, setTimerSettingsState] = useState<TimerSettings>({
    workMinutes: 25,
    breakMinutes: 5,
  });
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    setTaskGroups(getTaskGroups());
    setSessions(getSessions());
    setTodaySessions(getTodaySessions());
    setTimerSettingsState(getTimerSettings());
    setStreak(getStreak());
    setMounted(true);
  }, []);

  // Scoring
  const burnout = calculateBurnoutScore(todaySessions, streak);
  const shipScore = calculateShipScore(taskGroups, todaySessions, burnout, streak);

  // Remaining breakdowns
  const { count: breakdownCount } = getBreakdownCount();
  const maxBreakdowns = isPro() ? TIERS.pro.maxBreakdownsPerDay : TIERS.free.maxBreakdownsPerDay;
  const remainingBreakdowns = maxBreakdowns - breakdownCount;

  // Handle session completion
  const handleSessionComplete = useCallback((session: WorkSession) => {
    addSession(session);
    setSessions(getSessions());
    setTodaySessions(getTodaySessions());
    recordActivity();
    setStreak(getStreak());
    trackEvent("session_completed", { mode: session.mode, duration: session.durationMinutes });

    // Request AI nudge after session
    requestNudge();
  }, []);

  // Handle task toggle
  const handleToggleTask = useCallback((groupId: string, taskId: string) => {
    updateTaskGroup(groupId, (group) => ({
      ...group,
      subTasks: group.subTasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined }
          : t
      ),
    }));
    setTaskGroups(getTaskGroups());
    recordActivity();
    setStreak(getStreak());
    trackEvent("task_toggled");
  }, []);

  // Handle add group (Claude API breakdown)
  const handleAddGroup = useCallback(async (task: string) => {
    const response = await fetch("/api/breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to break down task");
    }

    const { subTasks } = await response.json();

    const group: TaskGroup = {
      id: crypto.randomUUID(),
      originalTask: task,
      subTasks: subTasks.map(
        (st: { title: string; description: string; estimatedMinutes: number }) => ({
          id: crypto.randomUUID(),
          title: st.title,
          description: st.description,
          estimatedMinutes: st.estimatedMinutes,
          completed: false,
        })
      ),
      createdAt: Date.now(),
    };

    addTaskGroup(group);
    incrementBreakdownCount();
    setTaskGroups(getTaskGroups());
  }, []);

  // Handle remove group
  const handleRemoveGroup = useCallback((groupId: string) => {
    removeTaskGroup(groupId);
    setTaskGroups(getTaskGroups());
  }, []);

  // Handle nudge dismiss
  const handleDismissNudge = useCallback((id: string) => {
    setNudges((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Request AI nudge
  const requestNudge = useCallback(async () => {
    try {
      const context = getNudgeContext(getSessions(), burnout, shipScore, getTaskGroups());
      const response = await fetch("/api/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });

      if (!response.ok) return;

      const data = await response.json();
      const nudge: Nudge = {
        id: crypto.randomUUID(),
        message: data.message,
        type: data.type,
        timestamp: Date.now(),
      };
      setNudges((prev) => [...prev, nudge]);

      // Auto-dismiss after 15s
      setTimeout(() => {
        setNudges((prev) => prev.filter((n) => n.id !== nudge.id));
      }, 15000);
    } catch {
      // Nudge failed silently
    }
  }, [burnout, shipScore]);

  // Timer settings update
  const handleSettingsUpdate = (newSettings: TimerSettings) => {
    setTimerSettingsState(newSettings);
    saveTimerSettings(newSettings);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="flex-1 min-h-screen overflow-y-auto">
        {activePage === "dashboard" && (
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
              <p className="text-sm text-zinc-500 mt-1">Ship smart. Stay zen. 🧘</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column: Timer + Timeline */}
              <div className="lg:col-span-2 space-y-6">
                {/* Focus Timer Card */}
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-6">
                  <FocusTimer
                    settings={timerSettings}
                    onSessionComplete={handleSessionComplete}
                  />
                </div>

                {/* Work Timeline */}
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-5">
                  <WorkTimeline sessions={todaySessions} />
                </div>

                {/* Task List */}
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-5">
                  <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                    <span>🎯</span> Task Breakdown
                  </h3>
                  <TaskList
                    taskGroups={taskGroups}
                    onToggleTask={handleToggleTask}
                    onAddGroup={handleAddGroup}
                    onRemoveGroup={handleRemoveGroup}
                    remainingBreakdowns={remainingBreakdowns}
                  />
                </div>
              </div>

              {/* Right column: Scores */}
              <div className="space-y-6">
                <BurnoutScore data={burnout} />
                <ShipScore data={shipScore} />

                {/* Quick stats */}
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-5">
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3">Today&apos;s Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Focus sessions</span>
                      <span className="text-sm font-medium text-zinc-300">
                        {todaySessions.filter((s) => s.mode === "work").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Total focus time</span>
                      <span className="text-sm font-medium text-zinc-300">
                        {todaySessions
                          .filter((s) => s.mode === "work")
                          .reduce((sum, s) => sum + s.durationMinutes, 0)}
                        m
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Breaks taken</span>
                      <span className="text-sm font-medium text-zinc-300">
                        {todaySessions.filter((s) => s.mode === "break").length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Nudge trigger */}
                <button
                  onClick={requestNudge}
                  className="w-full py-3 bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800/50 hover:border-zinc-700/50 rounded-2xl text-sm text-zinc-400 hover:text-zinc-300 transition-all flex items-center justify-center gap-2"
                >
                  <span>✨</span> Get AI Nudge
                </button>
              </div>
            </div>
          </div>
        )}

        {activePage === "tasks" && (
          <div className="max-w-3xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">Tasks</h1>
            <p className="text-sm text-zinc-500 mb-8">Break down big tasks into shippable pieces</p>
            <TaskList
              taskGroups={taskGroups}
              onToggleTask={handleToggleTask}
              onAddGroup={handleAddGroup}
              onRemoveGroup={handleRemoveGroup}
              remainingBreakdowns={remainingBreakdowns}
            />
          </div>
        )}

        {activePage === "history" && (
          <div className="max-w-3xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">History</h1>
            <p className="text-sm text-zinc-500 mb-8">Your work sessions over time</p>
            {sessions.length === 0 ? (
              <div className="text-center py-16 text-zinc-600">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-sm">No sessions recorded yet</p>
                <p className="text-xs mt-1">Start a focus session to begin tracking</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...sessions].reverse().slice(0, 50).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          session.mode === "work" ? "bg-emerald-500" : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-zinc-300 capitalize">{session.mode} session</p>
                        <p className="text-xs text-zinc-600">
                          {new Date(session.startedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-zinc-400">{session.durationMinutes}m</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activePage === "settings" && (
          <div className="max-w-lg mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">Settings</h1>
            <p className="text-sm text-zinc-500 mb-8">Customize your ShipZen experience</p>

            <div className="space-y-6">
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-zinc-300">Timer Settings</h3>

                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">
                    Focus duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={timerSettings.workMinutes}
                    onChange={(e) =>
                      handleSettingsUpdate({
                        ...timerSettings,
                        workMinutes: Math.max(1, Math.min(120, parseInt(e.target.value) || 25)),
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700/50 rounded-lg text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">
                    Break duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={timerSettings.breakMinutes}
                    onChange={(e) =>
                      handleSettingsUpdate({
                        ...timerSettings,
                        breakMinutes: Math.max(1, Math.min(30, parseInt(e.target.value) || 5)),
                      })
                    }
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700/50 rounded-lg text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-zinc-300">Plan</h3>
                <p className="text-sm text-zinc-400">
                  {isPro() ? "Pro — Unlimited breakdowns" : "Free — 3 AI breakdowns/day"}
                </p>
                {!isPro() && (
                  <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-sm rounded-xl font-medium transition-all">
                    Upgrade to Pro — $9/mo
                  </button>
                )}
              </div>

              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-zinc-300">Data</h3>
                <button
                  onClick={() => {
                    if (confirm("This will delete all your data. Are you sure?")) {
                      localStorage.removeItem("shipzen-state");
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-xl font-medium transition-all border border-red-500/20"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Nudge toasts */}
      <AINudge nudges={nudges} onDismiss={handleDismissNudge} />
    </div>
  );
}
